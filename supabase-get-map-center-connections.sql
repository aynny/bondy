create or replace function public.get_map_center_connections(center_id uuid)
returns table (
  id uuid,
  request_id uuid,
  requester_id uuid,
  recipient_id uuid,
  relationship text,
  updated_at timestamptz,
  created_at timestamptz,
  profile jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid := auth.uid();
begin
  if viewer_id is null then
    raise exception 'not authenticated';
  end if;

  if center_id <> viewer_id and not exists (
    select 1
    from public.connection_requests cr
    where cr.status = 'accepted'
      and (
        (cr.requester_id = viewer_id and cr.recipient_id = center_id)
        or
        (cr.requester_id = center_id and cr.recipient_id = viewer_id)
      )
  ) then
    raise exception 'center is not connected to viewer';
  end if;

  return query
  select
    case
      when cr.requester_id = center_id then cr.recipient_id
      else cr.requester_id
    end as id,
    cr.id as request_id,
    cr.requester_id,
    cr.recipient_id,
    cr.message as relationship,
    cr.updated_at,
    cr.created_at,
    jsonb_strip_nulls(jsonb_build_object(
      'name', p.profile->>'name',
      'handle', p.handle,
      'photo', p.profile->>'photo',
      'school', case when coalesce((p.profile->>'schoolPublic')::boolean, true) then p.profile->>'school' end,
      'highSchool', case when coalesce((p.profile->>'highSchoolPublic')::boolean, true) then p.profile->>'highSchool' end,
      'university', case when coalesce((p.profile->>'universityPublic')::boolean, true) then p.profile->>'university' end,
      'vocationalSchool', case when coalesce((p.profile->>'vocationalSchoolPublic')::boolean, true) then p.profile->>'vocationalSchool' end,
      'careers', case when coalesce((p.profile->>'companyPublic')::boolean, true) then p.profile->'careers' end,
      'company', case when coalesce((p.profile->>'companyPublic')::boolean, true) then p.profile->>'company' end,
      'location', case when coalesce((p.profile->>'locationPublic')::boolean, true) then p.profile->>'location' end,
      'birthday', case when coalesce((p.profile->>'birthdayPublic')::boolean, false) then p.profile->>'birthday' end,
      'sns', p.profile->'sns',
      'snsPublic', p.profile->'snsPublic',
      'schoolPublic', coalesce((p.profile->>'schoolPublic')::boolean, true),
      'highSchoolPublic', coalesce((p.profile->>'highSchoolPublic')::boolean, true),
      'universityPublic', coalesce((p.profile->>'universityPublic')::boolean, true),
      'vocationalSchoolPublic', coalesce((p.profile->>'vocationalSchoolPublic')::boolean, true),
      'companyPublic', coalesce((p.profile->>'companyPublic')::boolean, true),
      'locationPublic', coalesce((p.profile->>'locationPublic')::boolean, true),
      'birthdayPublic', coalesce((p.profile->>'birthdayPublic')::boolean, false)
    )) as profile
  from public.connection_requests cr
  join public.profiles p
    on p.id = case
      when cr.requester_id = center_id then cr.recipient_id
      else cr.requester_id
    end
  where cr.status = 'accepted'
    and (cr.requester_id = center_id or cr.recipient_id = center_id)
    and (
      center_id = viewer_id
      or exists (
        select 1
        from public.connection_requests viewer_link
        where viewer_link.status = 'accepted'
          and (
            (viewer_link.requester_id = viewer_id and viewer_link.recipient_id = center_id)
            or
            (viewer_link.requester_id = center_id and viewer_link.recipient_id = viewer_id)
          )
      )
    )
  order by cr.updated_at desc nulls last, cr.created_at desc;
end;
$$;

grant execute on function public.get_map_center_connections(uuid) to authenticated;
