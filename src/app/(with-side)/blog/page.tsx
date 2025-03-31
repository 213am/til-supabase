"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BlogRow, deleteBlog, getBlogs } from "@/app/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

function Page() {
  const [blogs, setBlogs] = useState<BlogRow[] | null>([]);
  const router = useRouter();

  const getBlogList = async () => {
    const { data, error, status } = await getBlogs();
    console.log("블로그 목록 : ", data);
    if (data) {
      setBlogs(data);
    }
  };

  // 내용 삭제 : 이미지도 같이 삭제
  const deleteContent = async (id: number) => {
    console.log("이미지 삭제 처리 필요");
    const { error, status } = await deleteBlog(id);
    if (!error) {
      getBlogList();
    }
  };

  useEffect(() => {
    getBlogList();
  }, []);

  return (
    <div className="flex w-[920px] h-dvh bg-[#f9f9f9] border-r border-[#d6d6d6] items-start justify-center">
      <div className="w-full p-5">
        <h1 className="w-full text-center items-center p-2 bg-slate-100 rounded-md shadow-md">
          Blog List
        </h1>
        <div className="flex flex-col w-full items-center justify-center p-2">
          {blogs?.map((item) => (
            <div
              key={item.id}
              className="flex w-full items-center justify-between gap-4 px-6 py-3 rounded-lg border border-gray-200 shadow-sm bg-white my-2"
            >
              <p className="text-sm font-medium">
                <Link href={`/blog/${item.id}`} className="cursor-pointer">
                  {item.title}
                </Link>
              </p>
              <div>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className="cursor-pointer"
                  onClick={() => deleteContent(item.id)}
                >
                  <Trash className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center">
          <Button
            variant={"outline"}
            onClick={() => router.push("/blog/create")}
          >
            생성
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Page;
