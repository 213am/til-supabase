# React Query 적용

## 1. 설치

- 라이브러리

```bash
npm install @tanstack/react-query --legacy-peer-deps
```

- DevTool 설치

```bash
npm i @tanstack/react-query-devtools --legacy-peer-deps
```

## 2. 개념

- 데이터를 쉽게 가져오고, 자동으로 업데이트해 주는 도구 라이브러리입니다.
- `fresh` 한 데이터 : 최신 데이터
- `stale` 한 데이터 : 기존 데이터 (상해버린 데이터)
- 서버 상태를 불러오고, 캐싱하고, 지속적으로 동기화하고 업데이트 도움 라이브러리
- 캐싱기능과, Window Focus Reftching 등의 기능이 존재

## 3. 환경설정

### 3.1. ReactQueryProvider 생성

- 이 파일의 용도는 App 전체에서 React Query 를 사용하기 위한 provider 역할
- `/src/providers 폴더` 생성
- `/src/providers/ReactQueryProvider.tsx 파일` 생성

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 개발자 도구
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient();
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev Tool : React Query DevTools 를 셋팅 */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
```

### 3.2. ReactQueryProvider 적용

- 앱 전체에서 활용할 것이므로
- /src/app/layout.tsx 에 설정

```tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// shadcn/ui
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

## 4. 실전 예제

- `src/app/(with-side)/page.tsx`

```tsx
"use client";
import styles from "@/app/(with-side)/page.module.css";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createTodo, getTodos } from "@/app/actions/todos-actions";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "@/app/store/index";
// React Query
import { useMutation } from "@tanstack/react-query";

function Home() {
  const router = useRouter();
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);

  // Create
  const createMutation = useMutation({
    mutationFn: () =>
      createTodo({
        title: "",
        contents: JSON.stringify([]),
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      }),
    onSuccess: (data) => {
      toast.success("데이터 추가 성공!", {
        description: `새로운 할일이 등록 되었습니다.`,
        duration: 3000,
      });

      router.push(`/create/${data.data.id}`);
      setSidebarState("createTodo");
    },
    onError: (error) => {
      toast.error("데이터 추가 실패", {
        description: `데이터를 추가하는데 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    },
  });

  useEffect(() => {
    if (sidebarState !== "default") {
      getTodos();
      setSidebarState("default");
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.container_onBoarding}>
        <span className={styles.container_onBoarding_title}></span>
        <div className={styles.container_onBoarding_steps}>
          <span>1. Create a page</span>
          <span>2. Add boards to page</span>
        </div>
        {/* 페이지 추가 버튼 */}
        <Button
          variant={"outline"}
          className="w-full bg-transparent text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Add...." : " Add New page"}
        </Button>
      </div>
    </div>
  );
}

export default Home;
```

- `src/app/(with-side)/create/[id]/page.tsx`

```tsx
"use client";
import { useParams, useRouter } from "next/navigation";
// scss
import styles from "@/app/(with-side)/create/[id]/page.module.css";
// action
import {
  deleteTodo,
  getTodoId,
  updateTodo,
  updateTodoTitle,
} from "@/app/actions/todos-actions";
// component
import BasicBoard from "@/components/common/board/BasicBoard";
// shadcn/ui
import LabelCalendar from "@/components/common/calendar/LabelCalendar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import Image from "next/image";
import { ChevronLeftIcon } from "lucide-react";
import { sidebarStateAtom } from "@/app/store";
import { useAtom } from "jotai";
import { useMutation } from "@tanstack/react-query";

// contents 배열에 대한 타입 정의
export interface BoardContents {
  boardId: string; // 랜덤한 id 를 생성할 예정
  title: string;
  content: string;
  startDate: string | Date;
  endDate: string | Date;
  isCompleted: boolean;
}

function Page() {
  const router = useRouter();
  const { id } = useParams();
  // 데이터 출력 state
  const [title, setTitle] = useState<string>("");
  const [contents, setContents] = useState<BoardContents[]>([]);
  const [startDate, setStartDate] = useState<string | Date>("");
  const [endDate, setEndDate] = useState<string | Date>("");
  // Progress Bar 처리
  const [completeCount, setCompleteCount] = useState<number>(0);
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);

  // Page 삭제 함수
  const deleteBoardMutation = useMutation({
    mutationFn: () => {
      return deleteTodo(Number(id));
    },
    onSuccess: () => {
      setSidebarState("Page Delete");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  // title 저장 함수
  const saveTitleMutation = useMutation({
    mutationFn: () => {
      return updateTodoTitle(Number(id), title, startDate, endDate);
    },
    onSuccess: () => {
      // jotai 의 state 갱신
      setSidebarState("Upadte Page");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  // 컨텐츠 삭제 함수
  const deleteContent = async (deleteBoardId: string) => {
    console.log("삭제할 컨텐츠 boardId", deleteBoardId);
    const tempContent = contents.filter(
      (item) => item.boardId !== deleteBoardId
    );

    const { data, error, status } = await updateTodo(
      Number(id),
      JSON.stringify(tempContent)
    );
    setContents([...tempContent]);
  };

  // 컨텐츠 데이터 업데이트 함수
  const updateContent = async (newData: BoardContents) => {
    console.log("최종전달 : ", newData);

    const newContentArr = contents.map((item) => {
      if (item.boardId === newData.boardId) {
        return newData;
      }
      return item;
    });

    // 서버에 Row 를 업데이트
    const { data, error, status } = await updateTodo(
      Number(id),
      JSON.stringify(newContentArr)
    );
    fetchGetTodoId();
  };

  // id 에 해당하는 Row 데이터를 읽어오기
  const fetchGetTodoId = async () => {
    const { data, error, status } = await getTodoId(Number(id));
    // 에러 발생시
    if (error) {
      toast.error("데이터 호출 실패", {
        description: `데이터 호출에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }
    // 최종 데이터
    toast.success("데이터 호출 성공", {
      description: "데이터 호출에 성공하였습니다",
      duration: 3000,
    });
    setTitle(data?.title ? data.title : "");
    setStartDate(data?.start_date ? data.start_date : new Date());
    setEndDate(data?.end_date ? data.end_date : new Date());
    const temp = data?.contents ? JSON.parse(data.contents as string) : [];
    setContents(temp);
  };

  // contents 의 isCompleted 가 true 인 갯수 파악하기
  const calcCompletedCount = () => {
    let count = 0;
    contents.map((item) => {
      if (item.isCompleted) {
        count++;
      }
    });
    setCompleteCount(count);
  };

  const initData: BoardContents = {
    boardId: nanoid(),
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };

  // Content 추가하기
  const onCreateContent = async (newData?: BoardContents) => {
    const addContent = newData ? { ...newData } : { ...initData };

    const updateContent = [...contents, addContent];

    // 서버에 Row 를 업데이트
    const { data, error, status } = await updateTodo(
      Number(id),
      JSON.stringify(updateContent)
    );
    // 에러 발생시
    if (error) {
      toast.error("데이터 컨텐츠 업데이트 실패", {
        description: `데이터 컨텐츠 업데이트에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }
    // 최종 데이터
    toast.success("데이터 컨텐츠 업데이트 성공", {
      description: "데이터 컨텐츠 업데이트에 성공하였습니다",
      duration: 3000,
    });

    // 자료 새로 추출
    fetchGetTodoId();
  };

  useEffect(() => {
    fetchGetTodoId();
  }, []);

  useEffect(() => {
    calcCompletedCount();
  }, [contents]);

  return (
    <div className={styles.container}>
      {/* Board 메뉴 */}
      <div className="absolute top-0 left-0 flex w-full items-center justify-center p-6">
        <div className="flex-1">
          <Button variant={"outline"} onClick={() => router.push("/")}>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            disabled={saveTitleMutation.isPending}
            onClick={() => saveTitleMutation.mutate()}
          >
            {saveTitleMutation.isPending ? "저장중..." : "저장"}
          </Button>
          <Button
            variant={"destructive"}
            disabled={deleteBoardMutation.isPending}
            onClick={() => deleteBoardMutation.mutate()}
          >
            {deleteBoardMutation.isPending ? "삭제중..." : "삭제"}
          </Button>
        </div>
      </div>
      {/* 상단 */}
      <header className={styles.container_header}>
        <div className={styles.container_header_contents}>
          <input
            type="text"
            placeholder="Enter Title Here"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* 진행율 */}
          <div className={styles.progressBar}>
            <span className={styles.progressBar_status}>
              {completeCount}/{contents.length} completed!
            </span>
            {/* Progress 컴포넌트 배치 */}
            <Progress
              value={
                contents.length > 0
                  ? (completeCount / contents.length) * 100
                  : 0
              }
              className="w-[30%] h-2"
              indicateColor="bg-orange-500"
            />
          </div>
          {/* 캘린더 선택 추가 */}
          <div className={styles.calendarBox}>
            <div className={styles.calendarBox_calendar}>
              <LabelCalendar
                label="From"
                required={false}
                selectedDate={startDate}
                onDateChange={setStartDate}
              />
              <LabelCalendar
                label="To"
                required={false}
                selectedDate={endDate}
                onDateChange={setEndDate}
              />
            </div>
            <Button
              variant={"outline"}
              className="w-[15%] text-white bg-orange-400 border-orange-500 hover:bg-orange-400 hover:text-white cursor-pointer"
              onClick={() => onCreateContent(initData)}
            >
              Add New Board
            </Button>
          </div>
        </div>
      </header>
      {/* 본문 */}
      <div className={styles.container_body}>
        {/* contents 배열의 개수 만큼 출력 */}
        {contents.length === 0 ? (
          <div className={styles.container_body_infoBox}>
            <span className={styles.title}>There is no Board yet.</span>
            <span className={styles.subTitle}>
              Click the button and start flashing!
            </span>
            <button
              className={styles.button}
              onClick={() => onCreateContent(initData)}
            >
              <Image
                src="/assets/images/round-button.svg"
                alt="add board"
                width={100}
                height={100}
              />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-start w-full h-full gap-4 overflow-y-auto">
            {contents.map((item) => (
              <BasicBoard
                key={item.boardId}
                item={item}
                updateContent={updateContent}
                deleteContent={deleteContent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
```
