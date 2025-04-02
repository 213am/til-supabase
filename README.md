# React Query

- v3, v4, v5 각 버전의 사용법이 다름
- 현재 우리는 `v5` 를 사용할 예정
- https://tanstack.com/query/v5
- https://tanstack.com/query/v5/docs/framework/react/overview
  >
- 참고블로그
  - https://velog.io/@kandy1002/React-Query-%ED%91%B9-%EC%B0%8D%EC%96%B4%EB%A8%B9%EA%B8%B0

<br/>

## 1. 설치

- React Query 설치

```bash
npm install @tanstack/react-query --legacy-peer-deps
```

- DevTool 설치

```bash
npm i @tanstack/react-query-devtools --legacy-peer-deps
```

<br/>

## 2. 개념

- 데이터를 쉽게 가져오고, 자동으로 업데이트해 주는 도구 라이브러리
- 서버 상태를 불러오고, 캐싱하고, 지속적으로 동기화하고 업데이트 도움 라이브러리
- 캐싱 기능과 Window Focus Refetching 등의 기능이 존재
  >
- `fresh` 한 데이터 : 최신 데이터
- `stale` 한 데이터 : 기존 데이터, 오래된(만료된) 상태의 데이터

<br/>

## 3. 환경설정

### 3.1. ReactQueryProvider 생성

- 이 파일의 용도는 App 전체에서 React Query 를 사용하기 위한 provider 역할
- `/src/providers` 폴더 생성
- `/src/providers/ReactQueryProvider.tsx` 파일 생성

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 개발자 도구
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient();

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev Tool : React Query Devtools 를 셋팅 */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
```

### 3.2. ReactQueryProvider 적용

- 앱 전체에서 활용할 것이므로
- `/src/app/layout.tsx` 에 설정

```tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
// shadcn/ui toast
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${roboto.variable}  antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

<br />

## 4. 기능 살펴보기 라우터 구성

- 간단한 Todo 로 실습

### 4.1. Server Action 생성

- `/src/app/actions/test-actions.ts` 파일 생성

```ts
"use server";
const TODOS: string[] = [];

// 할일 목록 가져오기
export const getTodos = async (): Promise<string[]> => {
  // 일부러 서버의 응답이 지연되는 것처럼 1초의 딜레이
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return TODOS;
};

// 할일 목록에 추가
export const createTodos = async (data: string): Promise<string[]> => {
  // 일부러 서버의 응답이 지연되는 것처럼 1초의 딜레이
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 새로운 todo 를 추가해서
  TODOS.push(data);
  return TODOS;
};
```

### 4.2. test 라우터를 생성

- http://localhost:3000/test 접근
- `/src/app/test` 폴더 생성
- `/src/app/test/page.tsx` 파일 생성

<br/>

## 5. useQuery( ) 살펴보기 : 데이터 가져오기

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { getTodos } from "../actions/test-actions";

const Page = () => {
  // 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unique"],
    queryFn: getTodos,
  });

  return (
    <div>
      <h1>Test Todo</h1>
      {isLoading && <div>데이터 불러오는 중...</div>}
      {error && <div>오류 발생 : {error.message}</div>}
      {data && (
        <div>
          {data.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
```

### 5.1. queryKey 옵션

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
});
```

- queryKey
  - 데이터를 구분하는 이름, 구분자 역할, 유일한 이름
  - 이름이 중복되면 요청은 한번만 하므로 의미없는 API 호출을 방지
    >

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique", userId],
  queryFn: getTodos,
});
```

- userId 가 1 이라는 값이라면 ["unique", 1]
- userId 가 2 라는 값이라면 ["unique", 2]
- 각 사용자별 목록을 별도로 관리 가능

> `const { data, isLoading, error, refetch, isFetching }`

- data : 요청이 성공했을 때 가져온 데이터
- isLoading : 초기 요청 중일 때 true
- error : 요청이 실패했을 때 에러 객체
- isFetching : 언제든 refetch 중이면 true (로딩과는 별도)
- refetch() : 쿼리를 수동으로 다시 요청하는 함수
  ```tsx
  <button onClick={() => refetch()}>다시 호출</button>
  ```

### 5.2. staleTime 옵션

- 일정한 시간만큼 새로운 데이터를 가져오지 않는다
- 일정한 시간만큼 캐싱이 되어 있는 데이터를 사용한다

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique", userId],
  queryFn: getTodos,
  staleTime: 3000,
});
```

### 5.3. refetchInterval 옵션

- 일정한 시간마다 새로운 데이터를 다시 가져오기

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique", userId],
  queryFn: getTodos,
  refetchInterval: 3000,
});
```

### 5.4. enabled 옵션

- 조건에 따라서 true 인 경우 데이터를 가져온다

```tsx
const [isFetch, setIsFetch] = useState<boolean>(false);
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  enabled: isFetch,
});
```

### 5.5. refetchOnWindowFocus 옵션

- 브라우저 창에 다시 포커스될 때, 자동으로 refetch할지 여부를 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnWindowFocus: true,
});
```

### 5.6. refetchOnMount 옵션

- 컴포넌트가 다시 마운트될 때, 자동으로 refetch할지 여부를 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnMount: true,
});
```

### 5.7. refetchOnReconnect 옵션

- 네트워크 연결이 끊겼다가 복구되었을 때, 자동으로 refetch할지 여부를 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnReconnect: true,
});
```

### 5.8. refetchIntervalInBackground 옵션

- 브라우저가 백그라운드 상태일 때도 refetchInterval로 설정한 주기적인 refetch를 계속 수행할지 여부를 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchInterval: 5000, // 5초마다 자동 refetch
  refetchIntervalInBackground: true, // 백그라운드에서도 refetch 수행
});
```

### 5.9. gcTime 옵션

- 컴포넌트가 언마운트된 이후에도, 쿼리 데이터를 캐시에 얼마나 오래 유지할지 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  gcTime: 1000 * 60 * 5, // 5분 동안
});
```

### 5.10. retry 옵션

- 쿼리 요청이 실패했을 때, 자동으로 다시 시도할 횟수를 지정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  retry: 3, // 최대 3번까지 재시도, false 로 설정하면 재시도 X
});
```

### 5.11. retryDelay 옵션

- 쿼리 요청이 실패했을 때, 재시도 간의 지연 시간(ms) 을 설정

```tsx
// 데이터 가져오기
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  retry: 3,
  retryDelay: 3000,
});
```

<br/>

## 6. useMutation( ) 살펴보기 : 데이터 조작하기

- 데이터를 생성, 수정, 삭제 등의 작업을 처리
- 데이터를 변경하는 작업
  >
- mutation.mutate(데이터) : 데이터를 서버로 보내는 경우

  - `onClick={() => createMutation.mutate()}`

- mutation.data : 성공시 반환되는 데이터
- mutation.isLoading : 서버 작업 요청중이면 true
- mutation.isError : 에러가 발생하면 true
- mutation.isSuccess : 성공하면 true
- mutation.isPending : 연결 시도중이면 true
  >
- `src/app/test/page.tsx`

```tsx
// 데이터 추가하기
const createMutation = useMutation({
  mutationFn: async () => {},
  onSuccess: () => {},
  onError: (error) => {
    console.log("Error : 데이터 추가 실패");
    console.log(error.message);
  },
});
```

### 6.1. onSuccess 옵션

- 성공 후 실행할 함수

```tsx
// 데이터 추가하기
const createMutation = useMutation({
  onSuccess: () => {
    setTestInput("");
    refetch();
  },
});
```

### 6.2. onError 옵션

- 실패시 실행할 함수

```tsx
// 데이터 추가하기
const createMutation = useMutation({
  onError: (error) => {
    console.log("Error : 데이터 추가 실패");
    console.log(error.message);
  },
});
```

### 6.3. onSettled 옵션

- 성공, 실패와 상관없이 무조건 실행

```tsx
// 데이터 추가하기
const createMutation = useMutation({
  onSettled: () => {
    console.log("무조건 처리해야 하는 함수");
  },
});
```

### 6.4. mutateAsync

- mutate()와 동일한 동작을 하지만, await 키워드로 비동기 흐름을 제어

```tsx
// mutateAsync 비동기 실행 예제
const mutation = useMutation({
  mutationFn: createTodos,
});
```

```tsx
// 함수 내부
const handleAdd = async () => {
  try {
    const result = await mutation.mutateAsync("todo 등록");
    console.log("서버 응답:", result);

    queryClient.refetchQueries({ queryKey: ["unique"] });
  } catch (error) {
    console.error("에러 발생:", (error as Error).message);
  }
};
```

```tsx
// JSX 내부
<div>
  <Button onClick={handleAdd}>테스트</Button>
</div>
```
