"use client";
import { useState } from "react";
import { createTodos, getTodos } from "@/app/actions/test-actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/ReactQueryProvider";

const Page = () => {
  const [testInput, setTestInput] = useState<string>("");

  // 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unique"],
    queryFn: getTodos,
    retry: 3,
    retryDelay: 3000,
  });

  // 데이터 추가하기
  const createMutation = useMutation({
    mutationFn: async () => {
      if (testInput.trim() === "") {
        alert("할일을 등록해주세요");
        return;
      }
      await createTodos(testInput);
    },
    onSuccess: () => {
      setTestInput("");
      refetch();
    },
    onError: (error) => {
      console.log("Error : 데이터 추가 실패");
      console.log(error.message);
    },
    onSettled: () => {
      console.log("무조건 처리해야 하는 함수");
    },
  });

  // mutateAsync 비동기 실행 예제
  const mutation = useMutation({
    mutationFn: createTodos,
  });

  const handleAdd = async () => {
    try {
      const now = await mutation.mutateAsync("todo 등록");
      console.log("데이터 : ", now);
      queryClient.refetchQueries({ queryKey: ["unique"] });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Test Todo</h1>
      <div>
        <Button onClick={() => handleAdd()}>테스트</Button>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          className="border px-2"
        />
        <Button
          disabled={createMutation.isPending}
          onClick={() => {
            createMutation.mutate();
          }}
        >
          {createMutation.isPending ? "등록중..." : "추가"}
        </Button>
      </div>
      <div>
        <button onClick={() => refetch()}>다시 호출</button>
      </div>
      {isLoading && <div>데이터 불러오는 중...</div>}
      {error && <div>오류 발생 : {error.message}</div>}
      {data && (
        <div>
          {data.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
