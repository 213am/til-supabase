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
