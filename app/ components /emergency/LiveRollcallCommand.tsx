create table rollcall_entries (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id),
  name text not null,
  type text, -- worker, contractor, resident, etc.
  status text default 'pending',
  notes text,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- Enable realtime
alter publication supabase_realtime add table rollcall_entries;
