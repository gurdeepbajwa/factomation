# Questions

The user's questions and corrections are the most valuable input you get. A question shows an area that is unclear
or important. A correction shows where your map is wrong.

## When the user asks

1. Answer from your notes first. Then check the answer against the code before you reply. If the notes were wrong,
   fix them and log a correction.
2. Answer plainly: what it is, how it works, why it is like that. Start with the main point. Draw a small diagram
   only when it is faster than words.
3. Log the question in `log.md` with its type:
   - `start`: where does X begin, where is X implemented
   - `around`: what calls this, what does this call, what does it change
   - `flow`: how do these parts connect, what happens end to end
   - `system`: how does the whole behave, what breaks if X changes
4. If the answer came from the user, it is theory the code cannot give. Record it as a story in your notes with the
   source "user, session N".

## When the user corrects you

1. Log it as a `correction` with what you said and what is true.
2. Fix every note and report entry that depends on the wrong claim.
3. If a similar correction is already in `log.md`, run the [reflect](reflect.md) playbook.

## Reading the log

Many `start` questions on an area means its landmarks are weak: write better entry-point notes. Many `flow` or
`system` questions means its routes or its links to other areas are weak: trace more routes there. Use the counts
to pick the next area to explore.
