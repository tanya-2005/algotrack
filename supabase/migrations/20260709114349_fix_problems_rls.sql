-- Fix Row Level Security on public.problems: the SELECT/INSERT/UPDATE policies
-- were unrestricted (USING/WITH CHECK true), meaning any client with the public
-- anon key could read every user's questions, and any authenticated user could
-- modify or overwrite rows belonging to other users. DELETE was already scoped
-- correctly to auth.uid() = user_id and is left as-is.

drop policy if exists "Enable read access for all users" on public.problems;
create policy "Users can view their own problems"
  on public.problems
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Enable insert for authenticated users only" on public.problems;
create policy "Users can insert their own problems"
  on public.problems
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Enable update for authenticated users" on public.problems;
create policy "Users can update their own problems"
  on public.problems
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
