import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import SupabaseTodosClient from '@/components/SupabaseTodosClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching todos on server:', error.message);
  }

  return <SupabaseTodosClient initialTodos={todos || []} />;
}
