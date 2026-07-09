-- Real spaced-repetition scheduling: a 1-5 "star" level per question (Leitner
-- system), where each star maps to a fixed review interval:
--   1 star -> 1 day, 2 stars -> 3 days, 3 stars -> 7 days,
--   4 stars -> 15 days, 5 stars -> 30 days.
-- On successful recall the star increases (max 5); on a forgotten review it
-- decreases (min 1). next_revision_at is recomputed from last_revised_at +
-- the interval for the (possibly new) star on every recall/forget event.

alter table public.problems
  add column if not exists revision_star smallint not null default 1,
  add column if not exists last_revised_at timestamptz,
  add column if not exists next_revision_at timestamptz not null default (now() + interval '1 day');

alter table public.problems
  add constraint problems_revision_star_range check (revision_star between 1 and 5);

-- Existing rows never had a revision recorded; treat them as due now so
-- they surface immediately in the revision queue instead of the default
-- "due in 1 day" a brand-new row would get.
update public.problems
set next_revision_at = created_at
where last_revised_at is null;
