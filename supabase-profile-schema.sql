create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  handle text,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists handle text;
update public.profiles
set handle = nullif(profile->>'handle', '')
where handle is null;

create unique index if not exists profiles_handle_lower_unique
on public.profiles (lower(handle))
where handle is not null and handle <> '';

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Authenticated users can find profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Authenticated users can find profiles"
on public.profiles
for select
using (auth.role() = 'authenticated');

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete own profile"
on public.profiles
for delete
using (auth.uid() = id);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connection_requests_not_self check (requester_id <> recipient_id),
  constraint connection_requests_status_check check (status in ('pending', 'accepted', 'rejected', 'removed'))
);

create unique index if not exists connection_requests_pair_unique
on public.connection_requests (requester_id, recipient_id);

do $$
begin
  alter table public.connection_requests
    drop constraint if exists connection_requests_status_check;
  alter table public.connection_requests
    add constraint connection_requests_status_check
    check (status in ('pending', 'accepted', 'rejected', 'removed'));
end $$;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by created_at asc nulls first, id asc
    ) as keeper_id,
    first_value(status) over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by
        case status when 'accepted' then 0 when 'pending' then 1 else 2 end,
        updated_at desc nulls last,
        created_at desc nulls last,
        id desc
    ) as keeper_status,
    first_value(message) over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by
        case when message is null or message = '' then 1 else 0 end,
        case status when 'accepted' then 0 when 'pending' then 1 else 2 end,
        updated_at desc nulls last,
        created_at desc nulls last,
        id desc
    ) as keeper_message,
    max(updated_at) over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
    ) as keeper_updated_at,
    row_number() over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by created_at asc nulls first, id asc
    ) as rn
  from public.connection_requests
  where status in ('pending', 'accepted')
),
keepers as (
  select distinct keeper_id, keeper_status, keeper_message, keeper_updated_at
  from ranked
)
update public.connection_requests cr
set
  status = k.keeper_status,
  message = coalesce(nullif(k.keeper_message, ''), cr.message),
  updated_at = coalesce(k.keeper_updated_at, cr.updated_at)
from keepers k
where cr.id = k.keeper_id;

with ranked as (
  select
    id,
    row_number() over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by created_at asc nulls first, id asc
    ) as rn
  from public.connection_requests
  where status in ('pending', 'accepted')
)
delete from public.connection_requests cr
using ranked r
where cr.id = r.id
  and r.rn > 1;

create unique index if not exists connection_requests_active_pair_unique
on public.connection_requests (
  least(requester_id, recipient_id),
  greatest(requester_id, recipient_id)
)
where status in ('pending', 'accepted');

alter table public.connection_requests enable row level security;

drop policy if exists "Users can read related requests" on public.connection_requests;
drop policy if exists "Authenticated users can read accepted or related requests" on public.connection_requests;
drop policy if exists "Users can send requests" on public.connection_requests;
drop policy if exists "Recipients can update requests" on public.connection_requests;
drop policy if exists "Users can update related requests" on public.connection_requests;

create policy "Authenticated users can read accepted or related requests"
on public.connection_requests
for select
using (auth.uid() = requester_id or auth.uid() = recipient_id or status = 'accepted');

create policy "Users can send requests"
on public.connection_requests
for insert
with check (auth.uid() = requester_id and requester_id <> recipient_id);

create policy "Users can update related requests"
on public.connection_requests
for update
using (auth.uid() = requester_id or auth.uid() = recipient_id)
with check (auth.uid() = requester_id or auth.uid() = recipient_id);
