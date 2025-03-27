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

export async function createTodo(todo: TodoRowInsert): Promise<{
  data: TodoRow[] | null;
  error: Error | null;
  status: number;
}> {
  const supabase = await createServerSideClient();

  const { data, error, status } = await supabase
    .from("todos")
    .insert([
      {
        title: todo.title,
        contents: todo.contents,
        start_date: todo.start_date,
        end_date: todo.end_date,
      },
    ])
    .select()
    .single();
  console.log(status);

  return { data, error, status };
}

export async function getTodos() {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .select("*")
    .order("id", { ascending: false });
  return { data, error, status } as {
    data: TodoRow[] | null;
    error: Error | null;
    status: number;
  };
}

// Read 기능 id 한개 가져오기
export async function getTodoId(id: number) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .select()
    .eq("id", id)
    .single();
  return { data, error, status } as {
    data: TodoRow | null;
    error: Error | null;
    status: number;
  };
}

// 업데이트 기능
export async function updateTodo(id: number, contents: string) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({ contents: contents })
    .eq("id", id)
    .select()
    .single();

  return { data, error, status } as {
    data: TodoRow | null;
    error: Error | null;
    status: number;
  };
}

// Title 업데이트 함수
export async function updateTodoTitle(
  id: number,
  title: string,
  startDate: Date | string,
  endDate: Date | string
) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({
      title: title,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error, status } as {
    data: TodoRow | null;
    error: Error | null;
    status: number;
  };
}

// Page 삭제 함수
export async function deleteTodo(id: number) {
  const supabase = await createServerSideClient();
  const { error, status } = await supabase.from("todos").delete().eq("id", id);

  return { error, status } as {
    error: Error | null;
    status: number;
  };
}
