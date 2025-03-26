"use client";
import styles from "@/app/create/page.module.scss";
import BasicBoard from "@/components/common/board/BasicBoard";
import LabelCalendar from "@/components/common/calendar/LabelCalendar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { createTodo } from "../actions/todos-actions";
import { toast } from "sonner";

function Page() {
  const router = useRouter();

  // create
  const onCreate = async () => {
    const { data, error, status } = await createTodo({
      title: "",
      contents: JSON.stringify([]),
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    });
    // 에러 발생시
    if (error) {
      toast.error("데이터 추가 실패", {
        description: `데이터 추가에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }
    // 최종 데이터
    toast.success("데이터 추가 성공", {
      description: "데이터 추가에 성공하였습니다",
      duration: 3000,
    });
    // 데이터 추가 성공시 할일 등록창으로 이동시킴
    // http://localhost:3000/create/ [data.id] 로 이동
    router.push(`/create/${data?.id}`);
  };

  return (
    <div className={styles.container}>
      {/* 상단 */}
      <header className={styles.container_header}>
        <div className={styles.container_header_contents}>
          <input
            type="text"
            placeholder="Enter Title Here"
            className={styles.input}
          />
          {/* 진행율 */}
          <div className={styles.progressBar}>
            <span className={styles.progressBar_status}>1/10 completed!</span>
            {/* Progress 컴포넌트 배치 */}
            <Progress
              value={33}
              className="w-[30%] h-2"
              indicateColor="bg-orange-500"
            />
          </div>
          {/* 캘린더 선택 추가 */}
          <div className={styles.calendarBox}>
            <div className={styles.calendarBox_calendar}>
              <LabelCalendar label="From" required={false} />
              <LabelCalendar label="To" required={true} />
            </div>
            <Button
              variant={"outline"}
              className="w-[15%] text-white bg-orange-400 border-orange-500 hover:bg-orange-400 hover:text-white cursor-pointer"
              onClick={onCreate}
            >
              Add New Board
            </Button>
          </div>
        </div>
      </header>
      {/* 본문 */}
      <div className={styles.container_body}>
        <BasicBoard />
      </div>
    </div>
  );
}

export default Page;
