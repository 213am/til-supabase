"use server";

import { createServerSideClient } from "@/lib/supabase/server";
import { Database } from "@/types/types_db";
export type BlogRow = Database["public"]["Tables"]["blog"]["Row"];
export type BlogRowInsert = Database["public"]["Tables"]["blog"]["Insert"];
export type BlogRowUpdate = Database["public"]["Tables"]["blog"]["Update"];

// Create
export async function createBlog(blog: BlogRowInsert): Promise<{
  data: BlogRow[] | null;
  error: Error | null;
  status: number;
}> {
  const supabase = await createServerSideClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not authenticated"),
      status: 401,
    };
  }

  const { data, error, status } = await supabase
    .from("blog")
    .insert([
      {
        title: blog.title,
        content: blog.content,
        user_id: user.id,
        user_email: user.email,
      },
    ])
    .eq("user_id", user.id) // 로그인 사용자 정보
    .select()
    .single();
  console.log(status);

  return { data, error, status };
}

// Read 전체
export async function getBlogs() {
  const supabase = await createServerSideClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not authenticated"),
      status: 401,
    };
  }

  const { data, error, status } = await supabase
    .from("blog")
    .select("*")
    .eq("user_id", user.id) // 로그인 사용자 정보
    .order("id", { ascending: false });
  return { data, error, status } as {
    data: BlogRow[] | null;
    error: Error | null;
    status: number;
  };
}

// Read 1개
export async function getBlogId(id: number) {
  const supabase = await createServerSideClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not authenticated"),
      status: 401,
    };
  }

  const { data, error, status } = await supabase
    .from("blog")
    .select()
    .eq("user_id", user.id) // 로그인 사용자 정보
    .eq("id", id)
    .single();
  return { data, error, status } as {
    data: BlogRow | null;
    error: Error | null;
    status: number;
  };
}

// Update
export async function updateBlog(id: number, title: string, content: string) {
  const supabase = await createServerSideClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not authenticated"),
      status: 401,
    };
  }

  const { data, error, status } = await supabase
    .from("blog")
    .update({ title: title, content: content })
    .eq("user_id", user.id) // 로그인 사용자 정보
    .eq("id", id)
    .select()
    .single();

  return { data, error, status } as {
    data: BlogRow | null;
    error: Error | null;
    status: number;
  };
}

// Delete
export async function deleteBlog(id: number) {
  const supabase = await createServerSideClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not authenticated"),
      status: 401,
    };
  }

  const { error, status } = await supabase
    .from("blog")
    .delete()
    .eq("user_id", user.id) // 로그인 사용자 정보
    .eq("id", id);

  return { error, status } as {
    error: Error | null;
    status: number;
  };
}
