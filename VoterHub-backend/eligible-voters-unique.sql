-- Run this once in the Supabase SQL editor to harden the invite list.
-- Adds a unique constraint on eligible_voters(poll_id, email) so the same
-- person can never be invited twice to the same poll.
--
-- Why: the backend already dedupes in code (emails are lowercased/trimmed,
-- each batch is deduped, and addEligibleVoters filters out addresses that
-- are already invited before inserting). This constraint is the database
-- backstop for the one case code can't fully close: two invite requests
-- for the same poll landing at the same moment, both passing the
-- "already invited?" check before either insert lands.
--
-- Safe to run as-is, top to bottom:
--   step 1 only reports duplicates, step 2 removes them, step 3 re-syncs
--   each poll's stored invite count, step 4 adds the constraint.
-- Deleting duplicate eligible_voters rows cannot delete votes: the Votes
-- table's voter_id references profiles, not eligible_voters.

-- 1) Report: any (poll, email) pairs currently invited more than once.
--    If this returns no rows, steps 2-3 change nothing.
select poll_id, lower(email) as email, count(*) as invite_rows
from eligible_voters
group by poll_id, lower(email)
having count(*) > 1
order by invite_rows desc;

-- 2) Normalize + dedupe.
-- 2a) The backend stores emails lowercased/trimmed; normalize any rows
--     that were entered another way so case-only duplicates collapse.
update eligible_voters
set email = lower(trim(email))
where email <> lower(trim(email));

-- 2b) Keep exactly one row per (poll_id, email): a row that has already
--     voted wins (its has_voted flag is the vote state), then the
--     earliest-created row. created_at is nullable, so nulls sort last.
with ranked as (
  select
    id,
    row_number() over (
      partition by poll_id, email
      order by has_voted desc, created_at asc nulls last, id asc
    ) as rn
  from eligible_voters
)
delete from eligible_voters ev
using ranked r
where ev.id = r.id
  and r.rn > 1;

-- 3) Re-sync polls.eligible_voters_count with the real invite rows,
--    in case dedupe removed anything.
update polls p
set eligible_voters_count = (
  select count(*) from eligible_voters ev where ev.poll_id = p.id
)
where p.eligible_voters_count is distinct from (
  select count(*) from eligible_voters ev where ev.poll_id = p.id
);

-- 4) Add the constraint (idempotent: re-running this script is a no-op).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'eligible_voters_poll_email_unique'
  ) then
    alter table eligible_voters
      add constraint eligible_voters_poll_email_unique unique (poll_id, email);
  end if;
end $$;
