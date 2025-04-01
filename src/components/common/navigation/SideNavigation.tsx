"use client";
import { createTodo, getTodos, TodoRow } from "@/app/actions/todos-actions";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "@/app/store";
import styles from "@/components/common/navigation/SideNavigation.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dot, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/supabase/actions";
// zustand
import { useUserStore } from "@/app/store/useUserStore";

function SideNavigation({ user }: { user: any }) {
  console.log("props 로 받은 데이터 : ", user);
  const { name, email, setUser } = useUserStore();

  const router = useRouter();
  const [todos, setTodos] = useState<TodoRow[] | null>([]);
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);

  useEffect(() => {
    if (user) {
      setUser(
        user.user_metadata.user_name,
        user.email ? user.email : "",
        user.id
      );
    }
  }, []);
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
    setSidebarState("newPage");
  };

  // Read
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
  }, []); // ← 초기 마운트에도 실행

  useEffect(() => {
    if (sidebarState !== "default") {
      fetchGetTodos();

      if (sidebarState === "Page Delete") {
        router.push("/");
      }
    }
  }, [sidebarState]);

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
      <div className={styles.container_buttonBox}>
        <Button
          variant={"outline"}
          className="w-full text-gray-500 border-slate-600 hover:bg-slate-200 hover:text-gray-500"
          onClick={() => router.push("/blog")}
        >
          Move to Blog
        </Button>
        {/* page 추가 버튼 */}
        <Button
          variant={"outline"}
          className="w-full text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
          onClick={onCreate}
        >
          Add New Page
        </Button>
      </div>
      {/* 추가 항목 출력 영역 */}
      <div className={styles.container_todos}>
        <div className="flex w-full justify-center">
          <button
            className="border rounded px-5 py-2 bg-white text-gray-800 cursor-pointer hover:bg-gray-600 hover:text-white"
            type="submit"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
        <div className={styles.container_todos_label}>
          {/* 로그아웃 버튼 배치 */}
          {name}님의 할일 목록 {email}
        </div>
        <div className={styles.container_todos_list}>
          {todos?.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
              onClick={() => router.push(`/create/${item.id}`)}
            >
              <Dot className="mr-1 text-green-400" />
              <span className="text-sm">
                {item.title ? item.title : "No title"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideNavigation;
