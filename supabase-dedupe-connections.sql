-- 既に増えてしまった同じ2人の pending / accepted つながりを1件に整理します。
-- IDは一番最初に作られた行を残し、状態・関係だけを使える内容に寄せます。
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

alter table public.connection_requests
  drop constraint if exists connection_requests_status_check;

alter table public.connection_requests
  add constraint connection_requests_status_check
  check (status in ('pending', 'accepted', 'rejected', 'removed'));

create unique index if not exists connection_requests_active_pair_unique
on public.connection_requests (
  least(requester_id, recipient_id),
  greatest(requester_id, recipient_id)
)
where status in ('pending', 'accepted');
