# Read

- `/src/app/actions/todos-actions.ts`

```ts
export async function getTodos() {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase.from("todos").select("*");
  return { data, error, status } as {
    data: TodoRow[] | null;
    error: Error | null;
    status: number;
  };
}
```

- `/src/components/common/navigation/SideNavigation.tsx`

```tsx
"use client";
import { getTodos, TodoRow } from "@/app/actions/todos-actions";
import styles from "@/components/common/navigation/SideNavigation.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dot, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function SideNavigation() {
  const [todos, setTodos] = useState<TodoRow[] | null>([]);

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
  }, []);

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
      {/* page 추가 버튼 */}
      <div className={styles.container_buttonBox}>
        <Button
          variant={"outline"}
          className="w-full text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
        >
          Add New Page
        </Button>
      </div>
      {/* 추가 항목 출력 영역 */}
      <div className={styles.container_todos}>
        <div className={styles.container_todos_label}>Your Todo</div>
        <div className={styles.container_todos_list}>
          {todos?.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
            >
              <Dot className="mr-1 text-green-400" />
              <span className="text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideNavigation;
```

- `/src/components/common/navigation/SideNavigation.module.scss`

```scss
&_list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
```

## DB Column 변경

- content => contents 로 이름 변경

  - type 은 text 에서 jsonb 로 변경

- start_date 추가

  - type 은 timestamptz : now( )

- end_date 추가

  - type 은 timestamptz

- `npm run generate-types` 실행해 새로 타입 생성

# DB 변경으로 인해 데이터 Create 부분 수정

- `.../todos-actions.ts`

```ts
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
```

- `.../SideNavigation.tsx`

```tsx
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
};
```

- `.../MarkDownDialod.tsx`

# 데이터 추가 후 할일 여러개 등록하는 페이지로 이동

- `http://localhost:3000/create/[id]` 로 이동처리
- app/create 파일들을 /app/create/[id] 폴더로 이동
- SideNavigation.tsx 에 라우터 추가

```tsx
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

  console.log("등록된 id", data.id);

  // 데이터 추가 성공시 할일 등록창으로 이동시킴
  // http://localhost:3000/create/[data.id] 로 이동
  router.push(`/create/${data.id}`);
};
```

# 상세페이지에서 params 알아내서 처리

- todos-actions.ts : id 에 해당하는 Row 데이터 가져오기

```ts
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
```

- `/src/app/create/[id]/page.tsx`

```tsx
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
};
useEffect(() => {
  fetchGetTodoId();
}, []);
```

- id 에 해당하는

```tsx
// contents 배열에 대한 타입 정의
interface BoardContents {
  boardId: string; // 랜덤한 id 를 생성할 예정
  title: string;
  content: string;
  isCompleted: boolean;
  startDate: string | Date;
  endDate: string | Date;
}
```

```tsx
// 데이터 출력 state
const [title, setTitle] = useState<string | null>("");
const [contents, setContents] = useState<BoardContents[]>();
const [startDate, setStartDate] = useState<string | Date>("");
const [endDate, setEndDate] = useState<string | Date>("");
```

## Page 에서 Add New Board 를 선택 시 할일을 여러개 추가

```tsx
// Content 추가하기
const onCreateContent = () => {
  // 기본으로 추가될 내용
  const addContent: BoardContents = {
    boardId: "1111",
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };
  const updateContent = [...contents, addContent];

  // 서버에 Row 를 업데이트
};
```

- todos-actions.ts : update 액션 추가

```ts
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
```

```tsx
// Content 추가하기
const onCreateContent = async () => {
  // 기본으로 추가될 내용
  const addContent: BoardContents = {
    boardId: "1111",
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };
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
```

# 목록 출력하기

```tsx
{
  /* 본문 */
}
<div className={styles.container_body}>
  {/* contents 배열의 개수 만큼 출력 */}
  {contents.length === 0 ? (
    <div>등록된 할일이 없습니다</div>
  ) : (
    <div>
      {contents.map((item) => (
        <BasicBoard key={item.boardId} />
      ))}
    </div>
  )}
</div>;
```

## 랜덤한 boardId 생성하기 - 라이브러리 활용

```bash
npm i nanoid --legacy-peer-deps
```

```tsx
const addContent: BoardContents = {
  boardId: nanoid(),
  title: "",
  content: "",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  isCompleted: false,
};
```

## 목록이 없는 경우 추가

```tsx
<div className={styles.container_body}>
  {/* conents 배열의 개수 만큼 출력이 되어야 함. */}
  {contents.length == 0 ? (
    <div className={styles.container_body_infoBox}>
      <span className={styles.title}>There is no board yet. </span>
      <span className={styles.subTitle}>
        Click the button and start flashing!
      </span>
      <button className={styles.button} onClick={onCreateContent}>
        <Image
          src="/assets/images/round-button.svg"
          alt="add board"
          width={100}
          height={100}
        />
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-start w-full h-full gap-4">
      {contents.map((item) => (
        <BasicBoard key={item.boardId} />
      ))}
    </div>
  )}
</div>
```

# 첫 페이지에서 Row 추가하기

- `/src/app/page.tsx`

```tsx
"use client";
import styles from "@/app/page.module.scss";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createTodo } from "./actions/todos-actions";
import { toast } from "sonner";

function Home() {
  const router = useRouter();

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
  };
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
          onClick={onCreate}
        >
          Add New page
        </Button>
      </div>
    </div>
  );
}

export default Home;
```

# content 데이터 출력 및 수정

- props 로 모든 데이터를 전달

```tsx
<BasicBoard key={item.boardId} item={item} updateContent={updateContent} />
```

- BasicBoard.tsx : props 전달

```tsx
interface BasicBoardProps {
  item: BoardContents;
  updateContent: (newData: BoardContents) => void;
}

function BasicBoard({ item, updateContent }: BasicBoardProps) {}
```

```tsx
<MarkdownDialog item={item} updateContent={updateContent} />
```

- MarkDownDialog.tsx : props 전달

```tsx
import { BasicBoardProps } from "../board/BasicBoard";

function MarkdownDialog({ item, updateContent }: BasicBoardProps) {}
```

## Markdown 에 데이터 출력

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
import { BoardContents } from "@/app/create/[id]/page";
import { BasicBoardProps } from "../board/BasicBoard";

function MarkdownDialog({ item, updateContent }: BasicBoardProps) {
  //  Dialog Props
  const [open, setOpen] = useState<boolean>(false);
  //  Editor 의 제목
  const [title, setTitle] = useState<string | undefined>(
    item.title ? item.title : ""
  );
  //  Editor 의 본문 내용
  const [content, setContent] = useState<string | undefined>(
    item.content ? item.content : ""
  );
  const [startDate, setStartDate] = useState<Date | string>(
    item.startDate ? item.startDate : new Date()
  );
  const [endDate, setEndDate] = useState<Date | string>(
    item.endDate ? item.endDate : new Date()
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(
    item.isCompleted ? item.isCompleted : false
  );

  // supabase 추가 버튼
  const onSubmit = async () => {
    if (!title || !content || !startDate || !endDate) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용, 날짜를 입력해주세요.",
        duration: 3000,
      });
      return;
    }
    // 해당 Row 를 바로 업데이트 하는 것이 아니고
    // contents 칼럼의 [ ] 을 업데이트하고 실제 Row 를 업데이트 해야함
    const tempContent: BoardContents = {
      boardId: item.boardId,
      title: title,
      content: content,
      startDate: startDate,
      endDate: endDate,
      isCompleted: isCompleted,
    };
    console.log("업데이트 할 데이터 : ", tempContent);
    updateContent(tempContent);

    // 창닫기, 입력값 초기화
    setOpen(false);
    // setTitle("");
    // setContent("");
    // setStartDate("");
    // setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="flex w-full justify-center font-normal text-gray-400 hover:text-gray-500 cursor-pointer">
          {/* 현재 내용이 있는 경우와 내용이 없는 경우로 구분 */}
          {item.title ? "Modify Content" : "Add Content"}
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
            {/* 잠시 뒤 날짜 전달 */}
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

# Markdown 수정 내용을 Row 업데이트 실행하기

```tsx
"use client";
import { format } from "date-fns";
import { useState } from "react";
import LabelCalendar from "../calendar/LabelCalendar";

// css
import styles from "@/components/common/dialog/MarkdownDialog.module.scss";
// Markdown
import MDEditor from "@uiw/react-md-editor";
// shadcn/ui
import { BoardContents } from "@/app/create/[id]/page";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BasicBoardProps } from "../board/BasicBoard";

function MarkdownDialog({ item, updateContent }: BasicBoardProps) {
  //  Dialog Props
  const [open, setOpen] = useState<boolean>(false);
  //  Editor 의 제목
  const [title, setTitle] = useState<string | undefined>(
    item.title ? item.title : ""
  );
  //  Editor 의 본문 내용
  const [content, setContent] = useState<string | undefined>(
    item.content ? item.content : ""
  );
  const [startDate, setStartDate] = useState<Date | string>(
    item.startDate ? item.startDate : new Date()
  );
  const [endDate, setEndDate] = useState<Date | string>(
    item.endDate ? item.endDate : new Date()
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(
    item.isCompleted ? item.isCompleted : false
  );

  // supabase 추가 버튼
  const onSubmit = async () => {
    if (!title || !content || !startDate || !endDate) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용, 날짜를 입력해주세요.",
        duration: 3000,
      });
      return;
    }
    // 해당 Row 를 바로 업데이트 하는 것이 아니고
    // contents 칼럼의 [ ] 을 업데이트하고 실제 Row 를 업데이트 해야함
    const tempContent: BoardContents = {
      boardId: item.boardId,
      title: title,
      content: content,
      startDate: format(
        typeof startDate === "string" ? new Date(startDate) : startDate,
        "yyyy-MM-dd"
      ),
      endDate: format(
        typeof endDate === "string" ? new Date(endDate) : endDate,
        "yyyy-MM-dd"
      ),
      isCompleted: isCompleted,
    };
    console.log("업데이트 할 데이터 : ", tempContent);
    updateContent(tempContent);

    // 창닫기, 입력값 초기화
    setOpen(false);
    // setTitle("");
    // setContent("");
    // setStartDate("");
    // setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="flex w-full justify-center font-normal text-gray-400 hover:text-gray-500 cursor-pointer">
          {/* 현재 내용이 있는 경우와 내용이 없는 경우로 구분 */}
          {item.title ? "Modify Content" : "Add Content"}
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
            {/* 잠시 뒤 날짜 전달 */}
            <LabelCalendar
              label="From"
              required={false}
              selectedDate={
                typeof startDate === "string" ? new Date(startDate) : startDate
              }
              onDateChange={(date) => {
                if (date) setStartDate(date);
              }}
            />
            <LabelCalendar
              label="To"
              required={false}
              selectedDate={
                typeof endDate === "string" ? new Date(endDate) : endDate
              }
              onDateChange={(date) => {
                if (date) setEndDate(date);
              }}
            />
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

- LabelCalendar : 날짜 적용

```tsx
"use client";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import styles from "@/components/common/calendar/LabelCalendar.module.scss";
import { Dispatch, SetStateAction } from "react";

interface LabelCalendarProps {
  label: string;
  required: boolean;
  selectedDate: Date | string;
  // onDateChange: (date: Date | undefined) => void;
  onDateChange: Dispatch<SetStateAction<string | Date>>;
}
// required : true 면  날짜 선택 불가
// required : false 면  날짜 선택 가능
function LabelCalendar({
  label,
  required,
  selectedDate,
  onDateChange,
}: LabelCalendarProps) {
  return (
    <div className={styles.container}>
      <span className={styles.container_label}>{label}</span>
      {/* shadcn/ui Calendar 배치 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>

        {!required && (
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

export default LabelCalendar;
```

# 날짜가 1일 차이나는 문제

- 원인은 기준시 차이 때문에...

# Calendar 컴포넌트 Typescript
