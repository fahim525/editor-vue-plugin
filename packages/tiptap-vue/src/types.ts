import type { Editor } from "@tiptap/core";
import type { EditorOptions, JSONContent } from "@tiptap/core";

export type EditorVariant = "balloon" | "balloon-block" | "top-sticky";
export type EditorPreset = "starter" | "notionLike";

export interface UploadImageHandler {
  (file: File): Promise<string>;
}

export interface TiptapVueOptions {
  variant?: EditorVariant;
  preset?: EditorPreset;
  placeholder?: string;
  extensions?: EditorOptions["extensions"];
  onUploadImage?: UploadImageHandler;
}

export interface EditorToolbarItem {
  name: string;
  icon?: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

export interface TiptapEditorProps {
  modelValue?: JSONContent | string | null;
  content?: JSONContent | string | null;
  editable?: boolean;
  autofocus?: boolean | "start" | "end" | "all";
  variant?: EditorVariant;
  preset?: EditorPreset;
  placeholder?: string;
  extensions?: EditorOptions["extensions"];
  onUploadImage?: UploadImageHandler;
  editorClass?: string;
}