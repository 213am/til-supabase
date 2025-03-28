"use client";
import { Editor } from "@tiptap/core";
import styles from "./icon.module.css";

// 공통 Heading 컴포넌트 생성기 (레벨별로)
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function Heading({ editor, level }: { editor: Editor; level: HeadingLevel }) {
  if (!editor) return null;
  const isActive = editor.isActive("heading", { level });
  const canToggle = editor.can().chain().focus().toggleHeading({ level }).run();
  const handleClick = () => {
    editor.chain().focus().toggleHeading({ level }).run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!canToggle}
      className={`${styles.toolbarBtn} ${styles[`h${level}`]} ${isActive ? styles.active : styles.none}`}
    />
  );
}

const H1 = (props: { editor: Editor }) => <Heading {...props} level={1} />;
const H2 = (props: { editor: Editor }) => <Heading {...props} level={2} />;
const H3 = (props: { editor: Editor }) => <Heading {...props} level={3} />;
const H4 = (props: { editor: Editor }) => <Heading {...props} level={4} />;
const H5 = (props: { editor: Editor }) => <Heading {...props} level={5} />;
const H6 = (props: { editor: Editor }) => <Heading {...props} level={6} />;

function Bold({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive("bold");
  const handleClick = () => {
    editor.chain().focus().toggleBold().run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().toggleBold().run()}
      className={`${styles.toolbarBtn} ${styles.bold} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function Italic({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive("italic");
  const handleClick = () => {
    editor.chain().focus().toggleItalic().run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().toggleItalic().run()}
      className={`${styles.toolbarBtn} ${styles.italic} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function Strikethrough({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive("strike");
  const handleClick = () => {
    editor.chain().focus().toggleStrike().run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().toggleStrike().run()}
      className={`${styles.toolbarBtn} ${styles.strike} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function Left({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive({ textAlign: "left" });
  const handleClick = () => {
    editor.chain().focus().setTextAlign("left").run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().setTextAlign("left").run()}
      className={`${styles.toolbarBtn} ${styles.left} ${isActive ? styles.active : styles.none}`}
    />
  );
}
function Center({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive({ textAlign: "center" });
  const handleClick = () => {
    editor.chain().focus().setTextAlign("center").run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().setTextAlign("center").run()}
      className={`${styles.toolbarBtn} ${styles.center} ${isActive ? styles.active : styles.none}`}
    />
  );
}
function Right({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const isActive = editor.isActive({ textAlign: "right" });
  const handleClick = () => {
    editor.chain().focus().setTextAlign("right").run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().setTextAlign("right").run()}
      className={`${styles.toolbarBtn} ${styles.right} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function TextColor({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#00FFFF",
    "#FFFF00",
    "#808080",
  ];

  return (
    <div className="relative group">
      <button
        className={`${styles.toolbarBtn} ${styles.textColor}`}
        title="글자 색상"
      />
      <div className="absolute hidden group-hover:flex flex-wrap w-32 p-2 bg-white border rounded-lg shadow-lg top-full left-0 z-50">
        {colors.map((color) => (
          <button
            key={color}
            className="w-6 h-6 m-1 border rounded-full"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}
        <button
          className="w-6 h-6 m-1 border rounded-full flex items-center justify-center text-xs"
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="색상 제거"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function BackgroundColor({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const colors = [
    "#FFEB3B",
    "#FFA726",
    "#EF5350",
    "#AB47BC",
    "#7E57C2",
    "#42A5F5",
    "#26A69A",
    "#66BB6A",
    "#FFFFFF",
    "#E0E0E0",
  ];

  return (
    <div className="relative group">
      <button
        className={`${styles.toolbarBtn} ${styles.backgroundColor}`}
        title="배경 색상"
      />
      <div className="absolute hidden group-hover:flex flex-wrap w-32 p-2 bg-white border rounded-lg shadow-lg top-full left-0 z-50">
        {colors.map((color) => (
          <button
            key={color}
            className="w-6 h-6 m-1 border rounded-full"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().setHighlight({ color }).run()}
          />
        ))}
        <button
          className="w-6 h-6 m-1 border rounded-full flex items-center justify-center text-xs"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          title="배경색 제거"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function Quote({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const isActive = editor.isActive("blockquote");
  const handleClick = () => {
    editor.chain().focus().toggleBlockquote().run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().toggleBlockquote().run()}
      className={`${styles.toolbarBtn} ${styles.quote} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function Code({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const isActive = editor.isActive("code");
  const handleClick = () => {
    editor.chain().focus().toggleCode().run();
  };
  return (
    <button
      onClick={handleClick}
      disabled={!editor.can().chain().focus().toggleCode().run()}
      className={`${styles.toolbarBtn} ${styles.code} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function Link({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const isActive = editor.isActive("link");

  const handleClick = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    try {
      new URL(url);
    } catch {
      alert("유효한 URL을 입력해주세요.");
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.toolbarBtn} ${styles.link} ${isActive ? styles.active : styles.none}`}
    />
  );
}

function AddPhoto({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const handleClick = () => {
    editor.chain().focus().setImage({ src: "https://i.pravatar.cc" }).run();
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.toolbarBtn} ${styles.image}`}
    />
  );
}

export const Icon = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Bold,
  Italic,
  Strikethrough,
  Left,
  Center,
  Right,
  TextColor,
  BackgroundColor,
  Quote,
  Code,
  Link,
  // AddPhoto,
};
