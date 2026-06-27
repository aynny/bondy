-- 既に増えてしまった同じ2人の pending / accepted つながりを1件に整理します。
-- accepted を優先し、同じ状態なら更新日時が新しいものを残します。
with ranked as (
  select
    id,
    row_number() over (
      partition by least(requester_id, recipient_id), greatest(requester_id, recipient_id)
      order by
        case status when 'accepted' then 0 when 'pending' then 1 else 2 end,
        updated_at desc nulls last,
        created_at desc
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
