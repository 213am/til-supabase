# auth

- `/src/middleware.ts`
  - 약속된 파일명

## UI 환경설정

```bash
npm i react-hook-form --legacy-peer-deps
npm i zod --legacy-peer-deps
npm i @hookform/resolvers --legacy-peer-deps
```

```bash
npx shadcn@latest add card
npx shadcn@latest add form
```

- auth 관련 사항은 UI 참조

## 로그인 기능 설정하기

- `/src/lib/supabase/actions.ts` 파일 생성

```ts
"use server";

import { Provider } from "@supabase/supabase-js";
import { createServerSideClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const signInWith = (provider: Provider) => async () => {
  const supabase = await createServerSideClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  console.log(data);

  if (error) {
    console.log(error);
  }

  redirect(data.url as string);
};

const signInWithGoogle = signInWith("google");

export { signInWithGoogle };
```

- `/src/components/auth/loginform.tsx` 파일 수정

```tsx
"use client";

import { signInWithGoogle } from "@/lib/supabase/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "유효한 이메일을 입력해주세요.",
  }),
  password: z.string().min(6, {
    message: "비밀번호는 최소 6자 이상이어야 합니다.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      toast.success("로그인 성공!", {
        description: "메인 페이지로 이동합니다.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("로그인 실패", {
        description: "이메일과 비밀번호를 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast.success("로그인 성공!", {
        description: "메인 페이지로 이동합니다.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("로그인 실패", {
        description: "Google 로그인 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 서비스를 이용하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <Button
                    variant="link"
                    className="px-0 text-xs text-muted-foreground"
                    onClick={() => router.push("/auth/reset-password")}
                  >
                    비밀번호를 잊으셨나요?
                  </Button>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          Google로 계속하기
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Button
            variant="link"
            className="p-0 text-primary"
            onClick={() => router.push("/auth/signup")}
          >
            회원가입
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## callback 만들기

- `/app/auth/callback` 폴더 생성
- `/app/auth/callback/route.ts` 파일 생성

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("code", code);
  console.log("next", next);
  if (code) {
    const supabase = await createServerSideClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

## 로그아웃 구현하기

- /src/lib/supabase/actions.ts 추가

```ts
"use server";

import { Provider } from "@supabase/supabase-js";
import { createServerSideClient } from "./server";
import { redirect } from "next/navigation";

const signInWith = (provider: Provider) => async () => {
  const supabase = await createServerSideClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  console.log(data);

  if (error) {
    console.log(error);
  }

  redirect(data.url as string);
};

const signInWithGoogle = signInWith("google");

const signOut = async () => {
  const supabase = await createServerSideClient();
  await supabase.auth.signOut();
};

export { signInWithGoogle, signOut };
```

- SideNavigation.tsx

```tsx
"use client";
import { createTodo, getTodos, TodoRow } from "@/app/actions/todos-actions";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "@/app/store";
import styles from "@/components/common/navigation/SideNavigation.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dot, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/supabase/actions";

function SideNavigation() {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoRow[] | null>([]);
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);

  // Create
  const onCreate = async () => {
    const { data, error, status } = await createTodo({
      title: "",
      contents: JSON.stringify([]),
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    });

    if (error) {
      toast.error("데이터 추가 실패", {
        description: `데이터를 추가하는데 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    }
    toast.success("데이터 추가 성공!", {
      description: `새로운 할일이 등록 되었습니다.`,
      duration: 3000,
    });

    // 데이터 추가 성공시 할일 등록창으로 이동시킴
    // http://localhost:3000/create/[data.id] 로 이동
    router.push(`/create/${data?.id}`);
    setSidebarState("newPage");
  };

  // Read
  const fetchGetTodos = async () => {
    const { data, error, status } = await getTodos();
    console.log("할일 목록 가져오기 : ", data);
    // 에러 발생 시 처리
    if (error) {
      toast.error("데이터 조회 실패", {
        description: `데이터를 가져오는데 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }
    // 데이터 조회 성공 시 처리
    toast.success("데이터 조회 성공!", {
      description: `할일 목록을 확인해보세요.`,
      duration: 3000,
    });

    setTodos(data);
  };

  useEffect(() => {
    fetchGetTodos();
  }, []); // ← 초기 마운트에도 실행

  useEffect(() => {
    if (sidebarState !== "default") {
      fetchGetTodos();

      if (sidebarState === "Page Delete") {
        router.push("/");
      }
    }
  }, [sidebarState]);

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.container_searchBox}>
        <Input
          type="text"
          placeholder="검색어를 입력하세요."
          className="focus-visible:right"
        />
        <Button variant={"outline"} size={"icon"}>
          <Search className="w-4 h-4" />
        </Button>
      </div>
      <div className={styles.container_buttonBox}>
        <Button
          variant={"outline"}
          className="w-full text-gray-500 border-slate-600 hover:bg-slate-200 hover:text-gray-500"
          onClick={() => router.push("/blog")}
        >
          Move to Blog
        </Button>
        {/* page 추가 버튼 */}
        <Button
          variant={"outline"}
          className="w-full text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
          onClick={onCreate}
        >
          Add New Page
        </Button>
      </div>
      {/* 추가 항목 출력 영역 */}
      <div className={styles.container_todos}>
        <div className={styles.container_todos_label}>
          {/* 로그아웃 버튼 배치 */}
          {"홍길동"}님의 할일 목록
        </div>
        <div className={styles.container_todos_list}>
          {todos?.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
              onClick={() => router.push(`/create/${item.id}`)}
            >
              <Dot className="mr-1 text-green-400" />
              <span className="text-sm">
                {item.title ? item.title : "No title"}
              </span>
            </div>
          ))}
        </div>
        <div>
          <button
            className="border rounded px-2.5 py-2"
            type="submit"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideNavigation;
```
