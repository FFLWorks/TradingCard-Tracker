-- TradingCard Dashboard: private JSON backup storage
-- Supabase Dashboard > SQL Editor で一度だけ実行してください。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tc-backups', 'tc-backups', false, 52428800, array['application/json'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 各ログインユーザーは、自分の user_id フォルダだけ操作可能
create policy "tc backup select own"
on storage.objects for select
to authenticated
using (bucket_id = 'tc-backups' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "tc backup insert own"
on storage.objects for insert
to authenticated
with check (bucket_id = 'tc-backups' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "tc backup update own"
on storage.objects for update
to authenticated
using (bucket_id = 'tc-backups' and (storage.foldername(name))[1] = (select auth.uid()::text))
with check (bucket_id = 'tc-backups' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "tc backup delete own"
on storage.objects for delete
to authenticated
using (bucket_id = 'tc-backups' and (storage.foldername(name))[1] = (select auth.uid()::text));
