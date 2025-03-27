"use client";
import { format } from "date-fns";
import { useState } from "react";
import LabelCalendar from "../calendar/LabelCalendar";

// css
import styles from "@/components/common/dialog/MarkdownDialog.module.scss";
// Markdown
import MDEditor from "@uiw/react-md-editor";
// shadcn/ui
import { BoardContents } from "@/app/create/[id]/page";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BasicBoardProps } from "../board/BasicBoard";

function MarkdownDialog({ item, updateContent }: BasicBoardProps) {
  //  Dialog Props
  const [open, setOpen] = useState<boolean>(false);
  //  Editor 의 제목
  const [title, setTitle] = useState<string | undefined>(
    item.title ? item.title : ""
  );
  //  Editor 의 본문 내용
  const [content, setContent] = useState<string | undefined>(
    item.content ? item.content : ""
  );
  const [startDate, setStartDate] = useState<Date | string>(
    item.startDate ? item.startDate : new Date()
  );
  const [endDate, setEndDate] = useState<Date | string>(
    item.endDate ? item.endDate : new Date()
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isCheckCompleted, setIsCheckCompleted] = useState<boolean>(
    item.isCompleted ? item.isCompleted : false
  );

  // supabase 추가 버튼
  const onSubmit = async () => {
    if (!title || !content || !startDate || !endDate) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용, 날짜를 입력해주세요.",
        duration: 3000,
      });
      return;
    }
    // 해당 Row 를 바로 업데이트 하는 것이 아니고
    // contents 칼럼의 [ ] 을 업데이트하고 실제 Row 를 업데이트 해야함
    const tempContent: BoardContents = {
      boardId: item.boardId,
      title: title,
      content: content,
      startDate: format(
        typeof startDate === "string" ? new Date(startDate) : startDate,
        "yyyy-MM-dd"
      ),
      endDate: format(
        typeof endDate === "string" ? new Date(endDate) : endDate,
        "yyyy-MM-dd"
      ),
      isCompleted: isCheckCompleted,
    };
    console.log("업데이트 할 데이터 : ", tempContent);
    updateContent(tempContent);

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="flex w-full justify-center font-normal text-gray-400 hover:text-gray-500 cursor-pointer">
          {/* 현재 내용이 있는 경우와 내용이 없는 경우로 구분 */}
          {item.title ? "Modify Content" : "Add Content"}
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-fit min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className={styles.dialog_titleBox}>
              <Checkbox
                className="w-5 h-5"
                checked={isCheckCompleted}
                onCheckedChange={() => {
                  setIsCompleted(!isCompleted);
                  setIsCheckCompleted(!isCompleted);
                }}
              />
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
            <LabelCalendar
              label="From"
              required={false}
              selectedDate={
                typeof startDate === "string" ? new Date(startDate) : startDate
              }
              onDateChange={(date) => {
                if (date) setStartDate(date);
              }}
            />
            <LabelCalendar
              label="To"
              required={false}
              selectedDate={
                typeof endDate === "string" ? new Date(endDate) : endDate
              }
              onDateChange={(date) => {
                if (date) setEndDate(date);
              }}
            />
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
