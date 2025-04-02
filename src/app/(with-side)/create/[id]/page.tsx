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
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/ReactQueryProvider";

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
  const deleteContentMutaion = useMutation({
    mutationFn: (deleteBoardId: string) => {
      const tempContent = contents.filter(
        (item) => item.boardId !== deleteBoardId
      );
      return updateTodo(Number(id), JSON.stringify(tempContent)).then(
        () => tempContent
      );
    },
    onSuccess: (updatedContent) => {
      setContents([...updatedContent]);
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

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
    queryClient.invalidateQueries({ queryKey: ["todos"] });
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

  // id 에 해당하는 Row 데이터를 읽어오기
  const { error, data: queryData } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodoId(Number(id)),
  });
  // 에러 발생 시
  if (error) {
    toast.error("데이터 호출 실패", {
      description: `데이터 호출에 실패하였습니다. ${error.message}`,
      duration: 3000,
    });
  }

  useEffect(() => {
    // 성공 시
    if (!queryData) return;

    setTitle(queryData.data?.title ?? "");
    setStartDate(queryData.data?.start_date ?? new Date());
    setEndDate(queryData.data?.end_date ?? new Date());

    const temp = queryData.data?.contents
      ? JSON.parse(queryData.data.contents as string)
      : [];

    setContents(temp);
  }, [queryData]);

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
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  };

  useEffect(() => {
    setSidebarState("add Page");
    queryClient.invalidateQueries({ queryKey: ["todos"] });
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
                deleteContent={() => deleteContentMutaion.mutate(item.boardId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
