# Test

## 1. 목록에서 Page 이동하기

- `src/components/common/navigation/SideNavigation.tsx`

```tsx
{
  todos?.map((item) => (
    <div
      key={item.id}
      className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
      onClick={() => router.push(`/create/${item.id}`)}
    >
      <Dot className="mr-1 text-green-400" />
      <span className="text-sm">{item.title ? item.title : "No title"}</span>
    </div>
  ));
}
```

## 2. Page 에서 목록 스크롤 시키기

- `src/app/create/[id]/page.tsx`

```tsx
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
```

- `src/app/globals.css`

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scrollbar-width: none;  // 스크롤바 숨김
  }
  ::-webkit-scrollbar {
    display: none;  // 스크롤바 숨김
  }
  body {
    @apply bg-background text-foreground;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}
```

## 3. progress 정리하기

- `src/app/create/[id]/page.tsx`

```tsx
// Progress Bar 처리
const [completeCount, setCompleteCount] = useState<number>(0);
```

```tsx
{
  /* 진행율 */
}
<div className={styles.progressBar}>
  <span className={styles.progressBar_status}>
    {completeCount}/{contents.length} completed!
  </span>
  {/* Progress 컴포넌트 배치 */}
  <Progress value={33} className="w-[30%] h-2" indicateColor="bg-orange-500" />
</div>;
```

```tsx
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
```

## 4. checkbox 처리 필요

- `src/components/common/board/BasicBoard.tsx`

```tsx
const [isComplted, setIsCompleted] = useState<boolean>(item.isCompleted);
```

```tsx
<Checkbox
  className="w-5 h-5"
  checked={isComplted}
  onCheckedChange={() => {
    item.isCompleted = !item.isCompleted;
    updateContent(item);
    setIsCompleted(item.isCompleted);
  }}
/>
```

- `src/components/common/dialog/MarkdownDialog.tsx`

```tsx
const [isCheckComplted, setIsCheckCompleted] = useState<boolean>(
  item.isCompleted
);
```

```tsx
<Checkbox
  className="w-5 h-5"
  checked={isCheckComplted}
  onCheckedChange={() => {
    setIsCheckCompleted(!isCheckComplted);
  }}
/>
```

- onSubmit

```tsx
 isCompleted: isCheckComplted,
```

## 출력하기

```tsx
<span className={styles.progressBar_status}>
  {completeCount}/{contents.length} completed!
</span>
```

```tsx
<Progress
  value={contents.length > 0 ? (completeCount / contents.length) * 100 : 0}
  className="w-[30%] h-2"
  indicateColor="bg-orange-500"
/>
```
