"use client";
import { useState } from "react";
import LabelCalendar from "../calendar/LabelCalendar";
import { createTodo } from "@/app/actions/todos-actions";
// css
import styles from "@/components/common/dialog/MarkdownDialog.module.scss";
// Markdown
import MDEditor from "@uiw/react-md-editor";
// shadcn/ui
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function MarkdownDialog() {
  //  Dialog Props
  const [open, setOpen] = useState<boolean>(false);
  //  Editor 의 제목
  const [title, setTitle] = useState<string | undefined>("");
  //  Editor 의 본문 내용
  const [content, setContent] = useState<string | undefined>("");

  // supabase 추가 버튼
  const onSubmit = async () => {
    if (!title || !content) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용을 입력해주세요.",
        duration: 3000,
      });
      return;
    }

    // 서버액션 실행
    const { data, error, status } = await createTodo({ title, content });
    console.log(data);
    console.log(error);
    console.log(status);

    if (error) {
      toast.error("등록 중 오류 발생", {
        description: `Error ${error.message}`,
        duration: 3000,
      });
      return;
    }
    toast.success("등록 성공!", {
      description: "Supabase에 글이 등록되었습니다.",
      duration: 3000,
    });
    setOpen(false);
    setTitle("");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="flex w-full justify-center font-normal text-gray-400 hover:text-gray-500 cursor-pointer">
          Add Content
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-fit min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className={styles.dialog_titleBox}>
              <Checkbox className="w-5 h-5" />
              <input
                type="text"
                placeholder="Write a title for your board"
                className={styles.dialog_titleBox_title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </DialogTitle>
          <div className={styles.dialog_calendarBox}>
            <LabelCalendar label="From" required={false} />
            <LabelCalendar label="To" required={false} />
          </div>
          <Separator />
          {/* 마크다운 입력 영역 */}
          <div className={styles.dialog_markdown}>
            <MDEditor height={"100%"} value={content} onChange={setContent} />
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className={styles.dialog_buttonBox}>
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="font-normal text-gray-400 hover:bg-gray-50 hover:text-gray-500"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="ghost"
              className="font-normal border-orange-500 bg-orange-400 text-white hover:bg-orange-500 hover:text-white"
              onClick={onSubmit}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MarkdownDialog;
