import { BoardContents } from "@/app/(with-side)/create/[id]/page";
import styles from "@/components/common/board/BasicBoard.module.scss";
import MarkdownDialog from "@/components/common/dialog/MarkdownDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export interface BasicBoardProps {
  item: BoardContents;
  updateContent: (newData: BoardContents) => void;
  deleteContent?: (boardId: string) => void;
}

function BasicBoard({ item, updateContent, deleteContent }: BasicBoardProps) {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setIsCompleted(item.isCompleted);
  }, [item]);

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.container_header}>
        <div className={styles.container_header_titleBox}>
          <Checkbox
            className="w-5 h-5"
            checked={isCompleted}
            onCheckedChange={() => {
              item.isCompleted = !item.isCompleted;
              updateContent(item);
              setIsCompleted(item.isCompleted);
            }}
          />
          <span className={styles.title}>
            {item.title ? item.title : "Please enter a title for your board"}
          </span>
          <Button variant={"ghost"}>
            <ChevronUp calcMode="w-5 h-5" />
          </Button>
        </div>
      </div>
      {/* 본문 */}
      <div className={styles.container_body}>
        <div className={styles.container_body_calendarBox}>
          {/* <LabelCalendar label="From" required={false} />
          <LabelCalendar label="To" required={true} /> */}
          <div className="flex items-center gap-3">
            <span className="text-[#6d6d6d]">From</span>
            <Input value={item.startDate.toString().split("T")[0]} disabled />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#6d6d6d]">To</span>
            <Input value={item.endDate.toString().split("T")[0]} disabled />
          </div>
        </div>
        <div className={styles.container_body_buttonBox}>
          <Button
            variant={"ghost"}
            className="font-normal text-gray-400 hover:bg-green-500 hover:text-white"
          >
            Duplicate
          </Button>
          <Button
            variant={"ghost"}
            className="font-normal text-gray-400 hover:bg-red-500 hover:text-white"
            onClick={() => deleteContent!(item.boardId)}
          >
            Delete
          </Button>
        </div>
      </div>
      {/* 하단 */}
      <div className={styles.container_footer}>
        <MarkdownDialog item={item} updateContent={updateContent} />
      </div>
    </div>
  );
}

export default BasicBoard;
