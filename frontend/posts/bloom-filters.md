---
title: Bloom Filters in Production with Java and Guava
date: 2026-05-02
excerpt: A practical walkthrough of bloom filters in Java. What they are, how to size them, and how to build a thread-safe production service with Guava.
tags: [java]
---


Bloom filters keep coming up a lot recently, but I haven't seen an article about using them in production so I decided to experiment a bit with them and write about it.

Instead of writing our own filter, a battle-tested implementation like the one from the **Guava** library is the wiser choice.

Before we do that though, I will explain why they matter and then cover the essentials below.

## Use case

Imagine a DB table holding millions of emails and many users trying to concurrently register. You'd have to query the table on every single request just to check if an email is taken. Under heavy traffic, your DB takes a hit on every single registration attempt. A bloom filter sits in front of the DB: for any email that definitely doesn't exist, it returns immediately without a DB hit. Only when the filter says "maybe", you go to the DB to confirm.

That's when bloom filters shine.

## What they are and how they work

A **bloom filter** is a data structure used to test whether an element is a member of a set. The key tradeoff: it can tell you with certainty that something is *not* in a set, but only *probably* that it is.

At its core, a bloom filter is just a **bit array** (all zeros initially) plus **multiple hash functions**.

**Adding an element:**
1. Hash it through each hash function
2. Each hash produces an index in the bit array
3. Set each of those indexes to 1

**Checking membership:**
1. Hash the element through all hash functions
2. Check each resulting index in the bit array:

- If **any bit is 0** → the element is *definitely **not*** in the set
- If **every bit is 1** → the element is *probably* in the set

## Figuring Out the Numbers

As a user, you decide on the **number of insertions** and the **false positive rate**, and then the **bit array size** and **number of hash functions** are calculated from those.

The bit array size increases linearly with the number of insertions: double the elements, double the array size.

| Insertions | False positive rate | Bit array size |                       |
|------------|---------------------|----------------|-----------------------|
| 1,000      | 1%                  | 9,585          |                       |
| 2,000      | 1%                  | 19,170         | 2x elements = 2x bits |

The bit array size increases exponentially as the false positive rate gets stricter, so lower false positive rates are expensive.

| Insertions | False positive rate | Bit array size |                           |
|------------|---------------------|----------------|---------------------------|
| 1,000      | 1%                  | 9,585          |                           |
| 1,000      | 0.1%                | 14,378         | 10x stricter = ~1.5x bits |

## What happens when deleting an element from the set

**You can't remove an element from a basic bloom filter.**

When you delete a user from the DB, the bits they set stay `1`, because other users may share those same bit positions. Clearing them would corrupt the filter for other entries.

The bloom filter keeps saying "maybe exists" for a deleted user, causing a DB query that returns nothing. This is a **false positive**, harmless correctness-wise (the DB returns empty), but wasteful since it defeats its purpose of *not* hitting the DB. The filter has become *stale*.

There are two ways to handle this:

### Option 1: Counting Bloom Filter

Instead of a bit array we use a **counter array**. Each position increments on `add` and decrements on `remove`. A slot is "set" if its count is greater than 0.

The tradeoff is that counters use **3-4x more memory** than bits (an `int[]` vs a `BitSet`).

Since Guava doesn't implement the counting bloom filter, I'll focus on the second solution.

### Option 2: Periodic Rebuild

If deletions are rare, we can skip the counting filter altogether and just **rebuild the bloom filter from the DB periodically** (e.g. every night or after every N deletions). It's simpler and has no memory overhead.

The tradeoff is that rebuilding is costly, so it should be done with caution.

### Example

I'll walk through an example that's as close to production as possible, with some extras at the end.

I'll split the code into four classes: a simulated database, a bloom filter service, a signup service, and a demo. Let's walk through each one.

### 1. The Database

```java
class EmailDatabase {

    private final Set<String> emails = new HashSet<>();
    public int queryCount = 0;

    public void insert(String email) {
        emails.add(email);
    }

    public void delete(String email) {
        emails.remove(email);
    }

    public boolean exists(String email) {
        queryCount++;
        return emails.contains(email);
    }

    public Set<String> findAllEmails() {
        return Collections.unmodifiableSet(emails);
    }

    public void resetQueryCount() {
         queryCount = 0;
    }
}
```

In production, this would use JPA or JDBC. `queryCount` tracks how many times we actually hit the database.

### 2. The Bloom Filter Service

```java
class BloomFilterService {

    private static final int REBUILD_THRESHOLD  = 1_000;
    private static final int EXPECTED_INSERTIONS = 1_000_000;
    private static final double FALSE_POSITIVE_RATE = 0.01;

    private final AtomicReference<BloomFilter<String>> filterRef = new AtomicReference<>();
    private final AtomicInteger deletionCounter = new AtomicInteger(0);
    private final EmailDatabase db;

    public BloomFilterService(EmailDatabase db) {
        this.db = db;
        rebuildFilter();
    }

    public boolean mightContain(String email) {
        return filterRef.get().mightContain(email);
    }

    public void add(String email) {
        filterRef.get().put(email);
    }

    public void onDelete() {
        if (deletionCounter.incrementAndGet() >= REBUILD_THRESHOLD) {
            deletionCounter.set(0);
            rebuildFilter();
        }
    }

    public void scheduledRebuild() {
        deletionCounter.set(0);
        rebuildFilter();
    }

    private void rebuildFilter() {
        BloomFilter<String> newFilter = BloomFilter.create(
                        Funnels.stringFunnel(StandardCharsets.UTF_8),
                        EXPECTED_INSERTIONS,
                        FALSE_POSITIVE_RATE
        );

        Set<String> allEmails = db.findAllEmails();
        allEmails.forEach(newFilter::put);
        filterRef.set(newFilter);
    }
}
```

`BloomFilterService` builds on Guava's bloom filter implementation with a few essential additions.

An `AtomicReference` wraps the filter to guarantee that after **Thread A** updates the filter, **Thread B** always sees the new value. Moreover, the filter is always fully rebuilt in a local variable first, then reassigned to `filterRef` so no thread ever queries a half-built filter.

On every deletion, if the threshold is reached, the filter is rebuilt.

The filter also rebuilds periodically via a scheduler (not shown here, but straightforward to add).


### 3. The Signup Service

This is the service that uses the bloom filter service:

```java
class SignupService {

    private final EmailDatabase db;
    private final BloomFilterService bloomFilter;

    private int bloomBlocked = 0;

    public SignupService(EmailDatabase db, BloomFilterService bloomFilter) {
        this.db = db;
        this.bloomFilter = bloomFilter;
    }

    public void signup(String email) {
        if (!bloomFilter.mightContain(email)) {
            bloomBlocked++;
            registerUser(email);
            return;
        }

        if (!db.exists(email)) {
            registerUser(email);
        }
    }

    public void deleteUser(String email) {
        db.delete(email);
        bloomFilter.onDelete();
    }

    private void registerUser(String email) {
        db.insert(email);
        bloomFilter.add(email);
    }

    public void checkAvailability(String email) {
        if (!bloomFilter.mightContain(email)) {
            bloomBlocked++;
            System.out.printf("  ✔  %-20s → AVAILABLE  (no DB hit)%n", email);
            return;
        }

        boolean taken = db.exists(email);
        if (taken) {
            System.out.printf("  ✘  %-20s → TAKEN      (confirmed by DB)%n", email);
        } else {
            System.out.printf("  ✔  %-20s → AVAILABLE  (DB hit — probably stale filter or 0.01 chance of hash collision)%n", email);
        }
    }

    public void printStats(String phase) {
        int total = bloomBlocked + db.queryCount;
        System.out.printf("%n  ── Stats: %s%n", phase);
        System.out.printf("     Total checks     : %d%n", total);
        System.out.printf("     Bloom blocked     : %d  (no DB query fired)%n", bloomBlocked);
        System.out.printf("     Actual DB queries : %d%n", db.queryCount);
    }

    public void resetStats() {
        bloomBlocked = 0;
        db.resetQueryCount();
    }
}
```

`bloomBlocked` is the opposite of `queryCount`. It tracks how many times the filter saved a DB hit. `signup()` uses the filter to skip the DB check when registering a new user. `registerUser()` inserts the email into both the DB and the filter. `deleteUser()` deletes from the DB and then calls `onDelete()` to check whether the filter should be rebuilt.

### 4. The Demo

First, we seed some users into the DB and rebuild the filter:

```java
public class Main {

    public static void main(String[] args) {

        EmailDatabase db = new EmailDatabase();
        BloomFilterService bloom = new BloomFilterService(db);
        SignupService service  = new SignupService(db, bloom);

        List<String> existing = List.of(
                        "alice@example.com",  "bob@example.com",   "carol@example.com",
                        "dave@example.com",   "eve@example.com",   "frank@example.com",
                        "grace@example.com",  "heidi@example.com", "ivan@example.com",
                        "judy@example.com"
        );
        existing.forEach(db::insert);
        bloom.scheduledRebuild();
```

Then some new users try to sign up:

```java
        service.signup("zara@example.com");      // new — filter blocks DB hit, put() called
        service.signup("xander@example.com");    // new — filter blocks DB hit, put() called
        service.signup("alice@example.com");     // exists — DB confirms, rejected
        service.signup("mallory@example.com");   // new — filter blocks DB hit, put() called
        service.signup("bob@example.com");       // exists — DB confirms, rejected
        service.signup("zara@example.com");      // duplicate signup attempt — rejected
        service.printStats("new signups — filter just uses put() per new email");
        service.resetStats();
```

As expected, Zara, Xander, and Mallory were blocked by the filter and no DB hit was needed.

```bash
     Total checks      : 6
     Bloom blocked     : 3  (no DB query fired)
     Actual DB queries : 3
```

Now three users are deleted, but the filter doesn't know that yet:

```java
        service.deleteUser("alice@example.com");
        service.deleteUser("bob@example.com");
        service.deleteUser("carol@example.com");

        service.checkAvailability("alice@example.com");   // deleted — stale filter → DB hit
        service.checkAvailability("bob@example.com");     // deleted — stale filter → DB hit
        service.checkAvailability("carol@example.com");   // deleted — stale filter → DB hit
        service.checkAvailability("ghost@example.com");   // never existed → filter blocks correctly
        service.checkAvailability("dave@example.com");    // still exists → DB confirms correctly
        service.checkAvailability("zara@example.com");    // signed up in phase 2 → DB confirms
        service.printStats("stale filter — deleted emails leak through to DB");
        service.resetStats();
```

The DB is still hit for Alice, Bob, and Carol even though they were deleted:

```bash
  ✔  alice@example.com    → AVAILABLE  (DB hit — stale filter)
  ✔  bob@example.com      → AVAILABLE  (DB hit — stale filter)
  ✔  carol@example.com    → AVAILABLE  (DB hit — stale filter)
  ✔  ghost@example.com    → AVAILABLE  (no DB hit)
  ✘  dave@example.com     → TAKEN      (confirmed by DB)
  ✘  zara@example.com     → TAKEN      (confirmed by DB)
```

Finally, we rebuild the filter and redo the same checks:

```java
        bloom.scheduledRebuild();

        service.checkAvailability("alice@example.com");   // deleted + rebuilt → filter blocks
        service.checkAvailability("bob@example.com");     // deleted + rebuilt → filter blocks
        service.checkAvailability("carol@example.com");   // deleted + rebuilt → filter blocks
        service.checkAvailability("ghost@example.com");   // never existed → still blocked
        service.checkAvailability("dave@example.com");    // still exists → DB confirms
        service.checkAvailability("zara@example.com");    // signed up in phase 2 → DB confirms
        service.printStats("after rebuild — deleted emails no longer leak to DB");
```

The filter is now consistent with the DB again:

```bash
  ✔  alice@example.com    → AVAILABLE  (no DB hit)
  ✔  bob@example.com      → AVAILABLE  (no DB hit)
  ✔  carol@example.com    → AVAILABLE  (no DB hit)
  ✔  ghost@example.com    → AVAILABLE  (no DB hit)
  ✘  dave@example.com     → TAKEN      (confirmed by DB)
  ✘  zara@example.com     → TAKEN      (confirmed by DB)

     Stats: after rebuild — deleted emails no longer leak to DB
     Total checks     : 6
     Bloom blocked     : 4  (no DB query fired)
     Actual DB queries : 2
```

### A few extras

#### 1. Persistence across restarts

To avoid rebuilding the filter on every restart, store it in Redis or S3.

Redis has native bloom filter support, so for multi-instance deployments I'd use it instead of Guava. That makes Redis the natural choice for persistence across restarts too.

The lifecycle would be as follows:

1. On first deploy, the filter is built from the DB and saved to Redis.
2. On subsequent restarts, the filter is loaded from Redis instead of being rebuilt.
3. After each rebuild, either from the scheduler or the deletion threshold, the Redis copy is updated too.

You can also start with an empty filter and add elements as they're naturally accessed. During the warm-up period you get more DB hits than usual, but the filter fills itself over time with zero startup cost and no dependency on external services.

#### 2. The expected insertions size would need a strategy

In the example, the insertion size is hardcoded to `1_000_000`. In production that number grows, and exceeding it degrades the false positive rate. Common strategies:

- Monitor current element count and trigger a rebuild + resize when you approach the limit
- Round up to the next order of magnitude (`1M`, `10M`, etc.) and accept the memory overhead

---

The full code for this example is available on [GitHub](https://github.com/NikosSyris/BloomFilters).