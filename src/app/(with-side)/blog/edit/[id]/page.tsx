"use client";
import { BlogRow, getBlogId } from "@/app/actions/blog-actions";
import EditEditor from "@/components/editor/edit-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState<BlogRow | null>(null);

  const getBlogOne = async (_id: string) => {
    const { data, error, status } = await getBlogId(Number(_id));
    if (data) {
      setBlogData(data);
    }
  };

  useEffect(() => {
    getBlogOne(id as string);
  }, []);

  return (
    <div className="flex w-[920px] h-dvh bg-[#f9f9f9] border-r border-[#d6d6d6] items-start justify-center">
      {blogData && <EditEditor blogData={blogData} />}
    </div>
  );
};
export default Page;
