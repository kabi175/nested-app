# SipOrderSchedulerService — Issues & Bottlenecks

## Performance Bottlenecks

### 1. N+1 queries — `SipCycleReconcilerProcessor` ~~`advanceStuckCycles`~~
`sip.getItems()` in `SipCycleReconcilerProcessor.process()` triggers a lazy-load SELECT per SIPOrder chunk item. Fix: fetch `items` eagerly via JOIN FETCH in the repo query used by `RepositoryItemReader`.

### 2. N+1 queries — `transitionDueOrdersToRunning` (line 139)
Same problem: `sip.getItems()` per due SIPOrder.

### 3. No batch writes ~~(partially resolved)~~
~~`sipOrderRepository.saveAll()` issues individual UPDATEs.~~ `JpaItemWriter` supports JDBC batching but requires `spring.jpa.properties.hibernate.jdbc.batch_size` to be set — without it, individual UPDATEs are still issued per chunk item.

### ~~4. Full item list in memory~~ **RESOLVED**
~~All due `OrderItems` across all SIPOrders loaded into a single list before the transaction commits.~~
`RepositoryItemReader` pages through `RUNNING` SIPOrders in chunks of 100, each committed in its own transaction. No full dataset held in memory.

---

## Correctness / Logic Bugs

### 5. Exception swallowing kills the `failed` counter (lines 153–164 vs 174–222)
`scheduleSipTransactionTrackerJob` has its own `try/catch` that swallows exceptions with `log.warn`. They never propagate, so `scheduleTrackerJobs`'s `failed` counter is **always 0** — silent failures look like successes.

### 6. Stuck-cycle safety net has a blind spot
`SipCycleReconcilerProcessor.process()` returns `null` (skips) when not all items are terminal. Items stuck in `PENDING` (because a tracker job failed to schedule from a prior run) block the advance forever — the order stays `RUNNING` indefinitely.

### 7. Stale items scheduled for tracking
`transitionDueOrdersToRunning` calls `sip.getItems()` which returns **all** OrderItems including those already `COMPLETED`/`FAILED` from prior cycles. If items aren't recreated each cycle, tracker jobs fire for already-terminal items.

### ~~8. Redundant `@Transactional` on `advanceStuckCycles`~~ **RESOLVED**
`SipCycleReconcilerService.advanceStuckCycles()` now only launches the Spring Batch job — no transaction annotation needed or present. Chunk-level transactions are managed by Spring Batch.

---

## Minor Issues

### 9. Dead code — `convertToLocal` (line 415)
Never called. Remove or wire it up.

### 10. Thundering herd mitigation doesn't scale
Stagger = `10 * (index + 1)` seconds. With 100 items, last job fires at ~16 min. With 500 items, ~83 min. No cap on spread.

### 11. Partial scheduling after commit is unrecoverable (line 74)
If `scheduleTrackerJobs` fails mid-way (or Quartz is down), some orders are `RUNNING` with no jobs. Phase A safety net rescues them only after all items turn terminal — which they never will.

---

## Priority Fix Order

| # | Issue | Impact |
|---|-------|--------|
| 5 | Silent exception swallow | High — data loss |
| 6 | Stuck PENDING blind spot | High — orders stuck forever |
| 1/2 | N+1 queries | Medium — perf at scale |
| 7 | Stale items re-tracked | Medium — wasted jobs |
| 3 | Batch writes need Hibernate config | Low-medium |
| 9 | Dead code `convertToLocal` | Low |
| 10 | Thundering herd cap | Low |
| 11 | Partial scheduling recovery | Medium |
