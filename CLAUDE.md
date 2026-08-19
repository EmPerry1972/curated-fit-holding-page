# Curated Fit - working notes

## Writing style

- **Never use em dashes or en dashes** (— or –), in copy, in code, in commit
  messages or anywhere else. Use a hyphen (-). This applies to HTML entities
  too, so no `&mdash;` or `&ndash;`.
- Journal copy comes from Bright Digital briefs. Publish the PAGE COPY section
  only. The brief tables, TAPS notes and "Notes for Emma" are internal and
  never go on the site.
- The brand avoids "fitness" and "train" as verbs in body copy. Exercise
  professional, strength work, movement.

## The journal

Posts live in `app/curated-conversations/posts.ts`, one entry per piece,
newest first. Images go in `public/journal/<slug>.jpg`, cropped to 3:2.
Optional `sources` on a post renders a footnote list at the end of the
article; only cite details that have been verified, never filled in from
memory.
