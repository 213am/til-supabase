# Delete

- `/src/app/create/[id]/page.tsx`

```tsx
// 컨텐츠 삭제 함수
const deleteContent = (deleteBoardId: string) => {
  console.log("삭제할 컨텐츠 boardId", deleteBoardId);
  const tempContent = contents.filter((item) => item.boardId !== deleteBoardId);
  setContents([...tempContent]);
};
```

- `src/components/common/board/BasicBoard.tsx`

```tsx
export interface BasicBoardProps {
  item: BoardContents;
  updateContent: (newData: BoardContents) => void;
  deleteContent: (boardId: string) => void;
}
```

```tsx
function BasicBoard({ item, updateContent, deleteContent }: BasicBoardProps) {}
```

```tsx
<Button
  variant={"ghost"}
  className="font-normal text-gray-400 hover:bg-red-500 hover:text-white"
  onClick={() => deleteContent(item.boardId)}
>
  Delete
</Button>
```

## 필터링 contents 를 업데이트 진행

- `src/app/create/[id]/page.tsx`

```tsx
// 컨텐츠 삭제 함수
const deleteContent = async (deleteBoardId: string) => {
  console.log("삭제할 컨텐츠 boardId", deleteBoardId);
  const tempContent = contents.filter((item) => item.boardId !== deleteBoardId);
  setContents([...tempContent]);

  const { data, error, status } = await updateTodo(
    Number(id),
    JSON.stringify(tempContent)
  );
};
```

# Home 버튼, page 수정 버튼, page 삭제 버튼 레이아웃 배치

- `src/app/create/[id]/page.tsx`

```tsx
{
  /* Board 메뉴 */
}
<div className="absolute top-0 left-0 flex w-full items-center justify-center p-6">
  <div className="flex-1">
    <Button variant={"outline"}>
      <ChevronLeftIcon className="w-4 h-4" />
    </Button>
  </div>
  <div className="flex gap-2">
    <Button variant={"outline"}>저장</Button>
    <Button variant={"destructive"}>삭제</Button>
  </div>
</div>;
```

## Home 버튼 기능

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

<Button variant={"outline"} onClick={() => router.push("/")}>
  <ChevronLeftIcon className="w-4 h-4" />
</Button>;
```

## 저장 버튼 기능

```tsx
<input
  type="text"
  placeholder="Enter Title Here"
  className={styles.input}
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

## Title 수정하는 서버 액션 함수 정의

- `src/app/actions/todos-actions.ts`

```ts
// Title 업데이트 함수
export async function updateTodoTitle(id: number, title: string) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({ title: title })
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

## Title 업데이트 함수 활용

```tsx
// title 저장 함수
const saveTitleHandler = async () => {
  console.log(title);
  const { data, error, status } = await updateTodoTitle(Number(id), title);
  console.log(data);
  console.log(error);
  console.log(status);
};
```

## Row 를 삭제하는 함수

- `src/app/actions/todos-actions.ts`

```ts
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

- `src/app/create/[id]/page.tsx`

```tsx
// Page 삭제 함수
const deleteBoardHandler = async () => {
  console.log(id, "삭제하기");
  const { error, status } = await deleteTodo(Number(id));

  console.log(error);
  console.log(status);

  router.push("/");
};
```

```tsx
<Button variant={"destructive"} onClick={deleteBoardHandler}>
  삭제
</Button>
```
