# 사용자 구분 필드 구성

- 각 테이블 column 추가

  - user_id(uuid)
  - user_email(text)

- 테이블 수정 후에는 꼭 실행

```bash
npm run generate-types
```

## 인증 관련 참조

- https://supabase.com/docs/reference/javascript/auth-signinwithpassword

## 할일 액션 수정

- `src/app/actions/todos-actions.ts`

```ts
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

// Create 기능
export async function createTodo(todo: TodoRowInsert) {
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
    .from("todos")
    .insert([
      {
        title: todo.title,
        contents: todo.contents,
        start_date: todo.start_date,
        end_date: todo.end_date,
        user_id: user.id,
        user_email: user.email,
      },
    ])
    .select()
    .single();

  return { data, error, status };
}

export async function getTodos() {
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
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
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
    .from("todos")
    .select()
    .eq("user_id", user.id) // 로그인 사용자 정보
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
    .from("todos")
    .update({ contents: contents })
    .eq("user_id", user.id) // 로그인 사용자 정보
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
    .from("todos")
    .update({
      title: title,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
    })
    .eq("user_id", user.id) // 로그인 사용자 정보
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
```

- `src/app/actions/blog-actions.ts`

```ts
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
        user_id: blog.user_id,
        user_email: blog.user_email,
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
```

- `src/app/actions/blog-storage-actions.ts`

```ts
"use server";

import { createServerSideClient } from "@/lib/supabase/server";

// 에러 타입에 대해서 파악하기
function handleError(error: unknown) {
  if (error) {
    console.error(error);
    throw error;
  }
}

// 파일 업로드
export async function uploadFile(formData: FormData): Promise<{
  id: string;
  path: string;
  fullPath: string;
} | null> {
  try {
    const supabase = await createServerSideClient();

    // getUser()를 사용하여 인증된 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("인증된 사용자가 아닙니다.");
      return null;
    }

    const file = formData.get("file") as File;

    const fileExt = file.name.split(".").pop();

    // 인증 과정을 거치고나면 사용자 ID 를 이용해서 고유성을 보장
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    // const fileName = `${"tester"}_${Date.now()}.${fileExt}`;

    // upsert : insert 와 update 를 동시에 처리할 수 있는 옵션
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string)
      .upload(fileName, file, { upsert: true });

    if (error) {
      handleError(error);
      return null; // 에러 발생 시 null 반환
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

// 파일 검색
export async function searchFiles(search: string = "") {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string)
    .list("", { search });

  if (error) {
    handleError(error);
    return null; // 에러 발생 시 null 반환
  }

  return data;
}

// supabas에서 파일 삭제
export async function deleteFile(fileName: string) {
  const supabase = await createServerSideClient();

  // getUser()를 사용하여 인증된 사용자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("인증된 사용자가 아닙니다.");
    return null;
  }

  // 파일 삭제시 파일명을 배열에 요소로 추가해서 삭제한다.
  const { data, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string)
    .remove([fileName]);

  handleError(error);

  return data;
}
```

- RLS 정책 설정
  - SQL Editor 에 설정
  - bucket_id 는 storage 의 버킷명과 같도록

```sql
-- ✅ RLS 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ✅ SELECT
CREATE POLICY "Authenticated users can read blog-data"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    bucket_id = 'blog-data'
  );

-- ✅ INSERT (※ WITH CHECK만 사용)
CREATE POLICY "Authenticated users can upload to blog-data"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    bucket_id = 'blog-data'
  );

-- ✅ UPDATE
CREATE POLICY "Authenticated users can update blog-data"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    bucket_id = 'blog-data'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    bucket_id = 'blog-data'
  );

-- ✅ DELETE
CREATE POLICY "Authenticated users can delete blog-data"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    bucket_id = 'blog-data'
  );
```
