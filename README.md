# 추가 보완

- `src/app/actions/todos-actions.ts` 변경

```ts
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
```

- `src/app/create/[id]/page.tsx`

```tsx
// title 저장 함수
const saveTitleHandler = async () => {
  console.log(title);
  const { data, error, status } = await updateTodoTitle(
    Number(id),
    title,
    startDate,
    endDate
  );
};
```

```tsx
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
```

# jotai

- https://jotai.org/
- https://tutorial.jotai.org/quick-start/intro

```bash
npm i jotai --legacy-peer-deps
```

## Store 설정

- `/src/app/store` 폴더 생성

- `/src/app/store/index.ts` 파일 생성

```ts
import { atom } from "jotai";

// 상태값 저장 구분용 변수
export const sidbarStateAtom = atom<string>("");
```

- `src/components/common/navigation/SideNavigation.tsx`

```tsx
useEffect(() => {
  fetchGetTodos();
}, [sidebarState]);
```

```tsx
useEffect(() => {
  if (sidebarState !== "default") {
    fetchGetTodos();

    if (sidebarState === "delete") {
      router.push("/");
    }
  }
}, [sidebarState]);
```

## Store 갱신하기

- `src/app/actions/todos-actions.ts`

```ts
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
```

- `src/app/create/[id]/page.tsx`

```tsx
// jotai 상태 사용하기
const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);
```

```tsx
// Page 삭제 함수
const handleDeleteBoard = async () => {
  // console.log(id, "제거하라");
  const { error, status } = await deleteTodo(Number(id));
  if (!error) {
    setSideState("delete");
  }
};
```
