"use server";

import { createServerSideClient } from "@/lib/supabase/server";
import { Database } from "@/types/types_db";
export type TodoRow = Database["public"]["Tables"]["todos"]["Row"];
export type TodoRowInsert = Database["public"]["Tables"]["todos"]["Insert"];
export type TodoRowUpdate = Database["public"]["Tables"]["todos"]["Update"];

function handleError(error: unknown): never {
  // console.error(error);
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error("An unknown error occurred");
}

export async function createTodo(todos: TodoRowInsert): Promise<{
  data: TodoRow[] | null;
  error: Error | null;
  status: number;
}> {
  const supabase = await createServerSideClient();

  const { data, error, status } = await supabase
    .from("todos")
    .insert([{ title: todos.title, content: todos.content }])
    .select();
  console.log(status);

  return { data, error, status };
}

export async function getTodos() {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase.from("todos").select("*");
  return { data, error, status } as {
    data: TodoRow[] | null;
    error: Error | null;
    status: number;
  };
}

export async function updateTodo({
  content,
  id,
}: {
  content: string;
  id: number;
}) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({ content: content }) // contents 는 배열로 들어온다.
    .eq("id", id)
    .select();
  return { data, error, status };
}
