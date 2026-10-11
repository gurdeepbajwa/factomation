# Benchmark checklist

Answer each question with evidence from a run, not from reading the code. A number that fails a question is
inconclusive. Say which question it failed.

Before you run anything, write the sentence you expect to claim, for example "month-end is 70% faster at the median
on the 2,000-invoice fixture". The questions test that sentence.

1. **What is the limit?** Name what bounds the number now: CPU, IO, a lock, the network, one slow call. Profile in a
   run you do not report, because profilers slow the work down.
2. **Was it run like production?** Same build mode, flags, data size and cache state on both sides.
3. **Is it possible?** Do the arithmetic. Removing a step that takes 10% of the time cannot make the whole 50%
   faster.
4. **Did it error?** Count failures and check outputs are correct, not just present. Failures are often fast.
5. **Does it repeat?** At least five runs per side, alternating. Report the median and the range. A gap smaller
   than the range is no difference.
6. **Does it matter?** Measure the end-to-end path a user waits on as well, and report the micro result as a share
   of it.
7. **Did the work happen?** Confirm the timed code really ran: rows written, requests served, results used.

On a shared or busy machine, check the load first and alternate the sides so both see the same noise. Say so in
the report.
