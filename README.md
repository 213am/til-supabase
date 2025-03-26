# Create

## 실습 1.

- shadcn/ui Toast 컴포넌트 배치
- https://ui.shadcn.com/docs/components/toast 제거됨
- https://ui.shadcn.com/docs/components/sonner 사용

```bash
npx shadcn@latest add sonner
```

## 실습 2. Toast 적용하기

- `/src/app/layout.tsx` 에 적용

## 실습 3. Toast 출력시키기

- `/src/components/common/dialog/MarkdownDialog.tsx`

```tsx
const onSubmit = async () => {
  if (!title || !content) {
    toast.error("입력항목을 확인해주세요.", {
      description: "제목과 내용을 입력해주세요.",
      duration: 3000,
    });
    return;
  }
  // supabase 추가
  const data = await createTodo({ title, content });
  console.log(data);
  if (data.error) {
    toast.error("Error", {
      description: "Supabase에 등록 중 실패하였습니다.",
      duration: 3000,
    });
    return;
  }
  toast.success("Success", {
    description: "Supabase에 글이 등록되었습니다.",
    duration: 3000,
  });
  setOpen(false);
};
```

## 실습 4. Supabase 연동

### 1. Actions 생성

- `/src/app/actions` 폴더 생성
- `/src/app/actions/todos-actions.ts` 파일 생성

```ts
"use server";

import { createServerSideClient } from "@/lib/supabase/server";
import { Database } from "@/types/types_db";
export type TodoRow = Database["public"]["Tables"]["todos"]["Row"];
export type TodoRowInsert = Database["public"]["Tables"]["todos"]["Insert"];
export type TodoRowUpdate = Database["public"]["Tables"]["todos"]["Update"];

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
```

## 실습 5. 서버 액션 실행하기

- `/src/components/common/diaglog/MarkdownDialog.tsx`

```tsx
const onSubmit = async () => {
  if (!title || !content) {
    toast.error("입력항목을 확인해주세요.", {
      description: "제목과 내용을 입력해주세요.",
      duration: 3000,
    });
    return;
  }

  // 서버액션 실행
  const { data, error, status } = await createTodo({ title, content });
  console.log(data);
  console.log(error);
  console.log(status);

  if (error) {
    toast.error("등록 중 오류 발생", {
      description: `Error ${error.message}`,
      duration: 3000,
    });
    return;
  }
  toast.success("등록 성공!", {
    description: "Supabase에 글이 등록되었습니다.",
    duration: 3000,
  });
  setOpen(false);
};
```

## 실습 6. UI 수정

### 1. 창 닫기

- `/src/components/common/diaglog/MarkdownDialog.tsx`

```tsx
"use client";
import { useState } from "react";
import LabelCalendar from "../calendar/LabelCalendar";
import { createTodo } from "@/app/actions/todos-actions";
// css
import styles from "@/components/common/dialog/MarkdownDialog.module.scss";
// Markdown
import MDEditor from "@uiw/react-md-editor";
// shadcn/ui
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function MarkdownDialog() {
  //  Dialog Props
  const [open, setOpen] = useState<boolean>(false);
  //  Editor 의 제목
  const [title, setTitle] = useState<string | undefined>("");
  //  Editor 의 본문 내용
  const [content, setContent] = useState<string | undefined>("");

  // supabase 추가 버튼
  const onSubmit = async () => {
    if (!title || !content) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용을 입력해주세요.",
        duration: 3000,
      });
      return;
    }

    // 서버액션 실행
    const { data, error, status } = await createTodo({ title, content });
    console.log(data);
    console.log(error);
    console.log(status);

    if (error) {
      toast.error("등록 중 오류 발생", {
        description: `Error ${error.message}`,
        duration: 3000,
      });
      return;
    }
    toast.success("등록 성공!", {
      description: "Supabase에 글이 등록되었습니다.",
      duration: 3000,
    });
    setOpen(false); // 성공 후 창 닫기
    setTitle(""); // 성공 후 제목 인풋 초기화
    setContent(""); // 성공 후 내용 인풋 초기화
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="flex w-full justify-center font-normal text-gray-400 hover:text-gray-500 cursor-pointer">
          Add Content
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-fit min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className={styles.dialog_titleBox}>
              <Checkbox className="w-5 h-5" />
              <input
                type="text"
                placeholder="Write a title for your board"
                className={styles.dialog_titleBox_title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </DialogTitle>
          <div className={styles.dialog_calendarBox}>
            <LabelCalendar label="From" required={false} />
            <LabelCalendar label="To" required={false} />
          </div>
          <Separator />
          {/* 마크다운 입력 영역 */}
          <div className={styles.dialog_markdown}>
            <MDEditor height={"100%"} value={content} onChange={setContent} />
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className={styles.dialog_buttonBox}>
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="font-normal text-gray-400 hover:bg-gray-50 hover:text-gray-500"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="ghost"
              className="font-normal border-orange-500 bg-orange-400 text-white hover:bg-orange-500 hover:text-white"
              onClick={onSubmit}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MarkdownDialog;
```
