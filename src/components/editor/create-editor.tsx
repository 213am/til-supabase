"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Toolbar from "./Toolbar";
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

const CreateEditor = () => {
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
    content: "<p>안녕하세요</p>",
  });

  return (
    <div className="flex flex-col w-full">
      <h3>블로그 작성하기</h3>
      <div>
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} className="p-5" />
      </div>
    </div>
  );
};
export default CreateEditor;
