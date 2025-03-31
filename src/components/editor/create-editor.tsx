"use client";
import styles from "@/components/editor/editor.module.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Toolbar from "@/components/editor/Toolbar";
// extension : text align, color
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
// extension : code block, background color
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
// extension : Link
import Link from "@tiptap/extension-link";
// extension : Image
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { createBlog } from "@/app/actions/blog-actions";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteFile } from "@/app/actions/blog-storage-actions";

const CreateEditor = () => {
  // 제목과 내용 state
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  // 🔁 이전 이미지 URL 목록 저장용 Ref (렌더링과 무관하게 상태 유지)
  const prevImageUrlsRef = useRef<string[]>([]);
  const router = useRouter();
  // 배경색
  const lowlight = createLowlight(common);
  const CustomHighlight = Highlight.configure({
    multicolor: true,
  });
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
        alignments: ["left", "center", "right"],
      }),
      Color,
      TextStyle,
      CodeBlockLowlight.configure({
        lowlight: lowlight,
      }),
      CustomHighlight,
      Highlight,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "cursor-pointer text-blue-500 hover:underline",
        },
      }),
      Image,
    ],
    content: content, // 초기값
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setContent(html);

      // 현재 에디터에서 이미지 src 추출
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const imgTags = Array.from(tempDiv.getElementsByTagName("img"));
      const currentImageUrls = imgTags.map((img) => img.src);

      // 삭제된 이미지 URL만 필터링
      const deletedImages = prevImageUrlsRef.current.filter(
        (url) => !currentImageUrls.includes(url)
      );

      // Supabase에서 삭제
      deletedImages.forEach((url) => {
        if (url.includes("supabase")) {
          deleteImageFromSupabase(url);
        }
      });

      // 현재 이미지 목록을 Ref에 저장
      prevImageUrlsRef.current = currentImageUrls;
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        // blockquote empty 처리만 유지
        if (event.key === "Backspace") {
          const { selection } = view.state;
          const { empty, $anchor } = selection;
          const isBlockquote = $anchor.parent.type.name === "blockquote";

          if (empty && isBlockquote && $anchor.parent.content.size === 0) {
            editor?.commands.clearNodes();
            return true;
          }
        }
        return false;
      },
    },
  });

  const deleteImageFromSupabase = async (imageUrl: string) => {
    try {
      const bucket = process.env.NEXT_PUBLIC_STORAGE_BLOG_BUCKET as string;
      const prefix = `/storage/v1/object/public/${bucket}/`;

      const url = new URL(imageUrl);
      const pathname = decodeURIComponent(url.pathname);

      // 이미지 경로 추출
      const pathIndex = pathname.indexOf(prefix);
      if (pathIndex === -1) {
        console.warn("Supabase image URL 형식이 아닙니다:", imageUrl);
        return;
      }

      const filePath = pathname.slice(pathIndex + prefix.length);
      console.log("Supabase에서 삭제될 경로:", filePath);

      await deleteFile(filePath);
    } catch (error) {
      console.error("Error deleting image from Supabase:", error);
    }
  };

  const onSubmit = async () => {
    if (!title || !content) {
      toast.error("입력항목을 확인해주세요.", {
        description: "제목과 내용을 모두 입력해주세요.",
        duration: 3000,
      });
      return;
    }
    const { data, error, status } = await createBlog({
      title: title,
      content: content,
    });
    toast.success("게시글 작성완료!", {
      description: "새로운 게시글이 등록되었습니다.",
      duration: 3000,
    });

    setTitle("");
    setContent("");
    router.push("/");
  };

  return (
    <div className="flex flex-col w-[95%] bg-white my-5 p-4">
      <h3>게시글 제목</h3>
      <div className="flex flex-col w-full items-center justify-center">
        <div className="w-full my-2">
          <input
            type="text"
            className="w-full p-2 border-2 border-gray-300 rounded-sm"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
          />
        </div>
        <div
          className={styles.editor}
          onClick={(e) => {
            // 에디터가 정의되어 있고, 클릭한 대상이 에디터 내부가 아니면 포커스
            if (!editor) return;

            // editor.dom은 contenteditable 영역
            if (!editor.view.dom.contains(e.target as Node)) {
              editor.commands.focus("end"); // 포커스, 커서 맨 끝으로
            }
          }}
        >
          {editor && <Toolbar editor={editor} />}
          <EditorContent
            editor={editor}
            onClick={() => editor?.commands.focus()}
          />
        </div>
        <div className="flex w-full items-center justify-center p-2">
          <Button type="button" className="px-4 py-2" onClick={onSubmit}>
            Post Blog
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CreateEditor;
