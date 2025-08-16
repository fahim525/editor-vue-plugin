import { EditorOptions, Editor, JSONContent, Extension } from '@tiptap/core';

type EditorVariant = "balloon" | "balloon-block" | "top-sticky";
type EditorPreset = "starter" | "notionLike";
interface UploadImageHandler {
    (file: File): Promise<string>;
}
interface TiptapVueOptions {
    variant?: EditorVariant;
    preset?: EditorPreset;
    placeholder?: string;
    extensions?: EditorOptions["extensions"];
    onUploadImage?: UploadImageHandler;
}
interface EditorToolbarItem {
    name: string;
    icon?: string;
    action: (editor: Editor) => void;
    isActive?: (editor: Editor) => boolean;
    isDisabled?: (editor: Editor) => boolean;
}
interface TiptapEditorProps {
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

declare const setTiptapDefaults: (options: Partial<TiptapVueOptions>) => void;
declare const getTiptapDefaults: () => Required<Pick<TiptapVueOptions, "variant" | "preset" | "placeholder">> & Pick<TiptapVueOptions, "extensions" | "onUploadImage">;

interface SlashCommandItem {
    title: string;
    description: string;
    icon: string;
    category: string;
    searchTerms: string[];
    command: (props: {
        editor: any;
        range: {
            from: number;
            to: number;
        };
    }) => void;
}
interface SlashCommandOptions {
    suggestion?: any;
    items?: SlashCommandItem[];
}
declare const SlashCommand: Extension<SlashCommandOptions, any>;

export { type EditorPreset, type EditorToolbarItem, type EditorVariant, SlashCommand, type TiptapEditorProps, type TiptapVueOptions, type UploadImageHandler, getTiptapDefaults, setTiptapDefaults };
