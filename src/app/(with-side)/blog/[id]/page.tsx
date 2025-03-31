"use client";
import { deleteBlog, getBlogId } from "@/app/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

const Page = () => {
  const { id } = useParams();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string | null>("");
  const [date, setDate] = useState<string>("");
  const router = useRouter();

  const getBlogOne = async () => {
    const { data, error, status } = await getBlogId(Number(id));
    console.log(data);
    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setDate(data.created_at);
    }
  };

  // 내용 삭제 : 이미지도 같이 삭제
  const deleteContent = async () => {
    console.log("이미지 삭제 처리 필요");
    const { error, status } = await deleteBlog(Number(id));
    if (!error) {
      router.push("/blog");
    }
  };

  useEffect(() => {
    getBlogOne();
  }, []);

  return (
    <div className="flex w-[920px] h-dvh bg-[#f9f9f9] border-r border-[#d6d6d6] items-start justify-center">
      <div className="flex flex-col w-full p-5 bg-white">
        <h1 className="w-full text-center text-xl mb-4 font-semibold">
          Blog Detail Page
        </h1>
        <div className="flex flex-col spa-y-4 mb-5">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-gray-600 text-sm mb-4">{date.split("T")[0]}</div>
          <div
            className="editor ProseMirror"
            dangerouslySetInnerHTML={{ __html: content || "" }}
          ></div>
        </div>
        <div className="flex w-full justify-end gap-4">
          <Button
            className="px-4 py-2 bg-blue-400 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors"
            onClick={() => router.push(`/blog/edit/${id}`)}
          >
            수정
          </Button>
          <Button
            className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => deleteContent()}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Page;
