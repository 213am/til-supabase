"use server";
const TODOS: string[] = [];

// 할일 목록 가져오기
export const getTodos = async (): Promise<string[]> => {
  // 일부러 서버의 응답이 지연되는 것처럼 1초의 딜레이
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return TODOS;
};

// 할일 목록에 추가
export const createTodos = async (data: string): Promise<string[]> => {
  // 일부러 서버의 응답이 지연되는 것처럼 1초의 딜레이
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 새로운 todo 를 추가해서
  TODOS.push(data);
  return TODOS;
};
