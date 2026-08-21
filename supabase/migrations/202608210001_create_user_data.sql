create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  data_key text not null,
  data_value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, data_key)
);

alter table public.user_data enable row level security;

create policy "Users can read their own app data" on public.user_data
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own app data" on public.user_data
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own app data" on public.user_data
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete their own app data" on public.user_data
for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_user_data_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_user_data_updated_at on public.user_data;
create trigger set_user_data_updated_at before update on public.user_data
for each row execute function public.set_user_data_updated_at();
