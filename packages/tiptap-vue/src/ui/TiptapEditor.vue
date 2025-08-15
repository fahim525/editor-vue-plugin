<script setup lang="ts">
import { computed, onBeforeUnmount, watch, toRef } from "vue";
import {
  EditorContent,
  useEditor,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Typography from "@tiptap/extension-typography";

import { SlashCommand } from "../extensions/slash-command";
import type { JSONContent } from "@tiptap/core";
import type { TiptapEditorProps, EditorPreset, EditorVariant } from "../types";
import { getTiptapDefaults } from "../plugin";

// Lucide Icons
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileText,
  Minus,
  Table as TableIcon,
  Columns,
  Rows,
  Plus,
  Trash2,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-vue-next";

const props = withDefaults(defineProps<TiptapEditorProps>(), {
  modelValue: null,
  content: null,
  editable: true,
  autofocus: false,
  variant: undefined,
  preset: undefined,
  placeholder: undefined,
  extensions: undefined,
  onUploadImage: undefined,
  editorClass: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "create"): void;
  (e: "update"): void;
  (e: "destroy"): void;
  (e: "focus"): void;
  (e: "blur"): void;
  (e: "selectionUpdate"): void;
}>();

const resolvedVariant = computed<EditorVariant>(
  () => props.variant ?? getTiptapDefaults().variant
);
const resolvedPreset = computed<EditorPreset>(
  () => props.preset ?? getTiptapDefaults().preset
);
const resolvedPlaceholder = computed<string>(
  () => props.placeholder ?? getTiptapDefaults().placeholder
);

function buildPresetExtensions(preset: EditorPreset) {
  const common = [
    StarterKit.configure({
      history: true,
    }),
    Placeholder.configure({ placeholder: resolvedPlaceholder.value }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
    }),
    Underline,
    Highlight,
    TextStyle,
    Color,
    Image.configure({ inline: false, allowBase64: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Typography,
    SlashCommand,
  ];

  if (preset === "starter") {
    return [
      StarterKit.configure({ history: true }),
      Placeholder.configure({ placeholder: resolvedPlaceholder.value }),
    ];
  }

  // notionLike
  return common;
}

const providedExtensions = computed(() => {
  const base = buildPresetExtensions(resolvedPreset.value);
  if (props.extensions && Array.isArray(props.extensions)) {
    return [...base, ...props.extensions];
  }
  return base;
});

function resolveInitialContent(): JSONContent | string | null {
  if (props.modelValue != null) return props.modelValue;
  if (props.content != null) return props.content;
  return null;
}

const editor = useEditor({
  content: resolveInitialContent() ?? "<p></p>",
  editable: props.editable,
  autofocus: props.autofocus as any,
  extensions: providedExtensions.value,
  editorProps: {
    handlePaste(view, event) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (
        files.length &&
        (props.onUploadImage || getTiptapDefaults().onUploadImage)
      ) {
        const imageFile = files.find((f) => f.type.startsWith("image/"));
        if (imageFile) {
          event.preventDefault();
          uploadAndInsertImage(imageFile);
          return true;
        }
      }
      return false;
    },
    handleDrop(view, event, _slice, moved) {
      if (moved) return false;
      const dt = event.dataTransfer;
      if (!dt) return false;
      const files = Array.from(dt.files);
      if (!files.length) return false;
      const imageFile = files.find((f) => f.type.startsWith("image/"));
      if (
        imageFile &&
        (props.onUploadImage || getTiptapDefaults().onUploadImage)
      ) {
        event.preventDefault();
        uploadAndInsertImage(imageFile);
        return true;
      }
      return false;
    },
  },
  onCreate: () => emit("create"),
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
    emit("update");
  },
  onSelectionUpdate: () => emit("selectionUpdate"),
  onFocus: () => emit("focus"),
  onBlur: () => emit("blur"),
});

async function uploadAndInsertImage(file: File) {
  const handler = props.onUploadImage ?? getTiptapDefaults().onUploadImage;
  if (!handler || !editor?.value) return;
  try {
    const url = await handler(file);
    editor.value.chain().focus().setImage({ src: url }).run();
  } catch (e) {
    // swallow
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor?.value) return;
    const current = editor.value.getHTML();
    if (typeof value === "string" && value !== current) {
      editor.value.commands.setContent(value, false);
    }
  }
);

watch(toRef(props, "editable"), (val) => {
  editor?.value?.setEditable(!!val);
});

onBeforeUnmount(() => {
  editor?.value?.destroy();
  emit("destroy");
});

function toggleBold() {
  editor?.value?.chain().focus().toggleBold().run();
}
function toggleItalic() {
  editor?.value?.chain().focus().toggleItalic().run();
}
function toggleUnderline() {
  editor?.value?.chain().focus().toggleUnderline().run();
}
function toggleStrike() {
  editor?.value?.chain().focus().toggleStrike().run();
}
function toggleCode() {
  editor?.value?.chain().focus().toggleCode().run();
}
function setParagraph() {
  editor?.value?.chain().focus().setParagraph().run();
}
function setHeading(level: number) {
  editor?.value?.chain().focus().toggleHeading({ level }).run();
}
function toggleBullet() {
  editor?.value?.chain().focus().toggleBulletList().run();
}
function toggleOrdered() {
  editor?.value?.chain().focus().toggleOrderedList().run();
}
function toggleBlockquote() {
  editor?.value?.chain().focus().toggleBlockquote().run();
}
function toggleCodeBlock() {
  editor?.value?.chain().focus().toggleCodeBlock().run();
}
function setHr() {
  editor?.value?.chain().focus().setHorizontalRule().run();
}
function undo() {
  editor?.value?.chain().focus().undo().run();
}
function redo() {
  editor?.value?.chain().focus().redo().run();
}
function toggleLink() {
  const ed = editor?.value;
  if (!ed) return;
  if (ed.isActive("link")) {
    ed.chain().focus().unsetLink().run();
    return;
  }
  const url = window.prompt("URL");
  if (!url) return;
  ed.chain().focus().setLink({ href: url }).run();
}

function insertTable() {
  editor?.value
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}
function addColumnBefore() {
  editor?.value?.chain().focus().addColumnBefore().run();
}
function addColumnAfter() {
  editor?.value?.chain().focus().addColumnAfter().run();
}
function deleteColumn() {
  editor?.value?.chain().focus().deleteColumn().run();
}
function addRowBefore() {
  editor?.value?.chain().focus().addRowBefore().run();
}
function addRowAfter() {
  editor?.value?.chain().focus().addRowAfter().run();
}
function deleteRow() {
  editor?.value?.chain().focus().deleteRow().run();
}
function deleteTable() {
  editor?.value?.chain().focus().deleteTable().run();
}

const topToolbarButtons = [
  { label: "Bold", icon: Bold, action: toggleBold },
  { label: "Italic", icon: Italic, action: toggleItalic },
  { label: "Underline", icon: UnderlineIcon, action: toggleUnderline },
  { label: "Strikethrough", icon: Strikethrough, action: toggleStrike },
  { label: "Code", icon: Code, action: toggleCode },
  { label: "Paragraph", icon: Type, action: setParagraph },
  { label: "Heading 1", icon: Heading1, action: () => setHeading(1) },
  { label: "Heading 2", icon: Heading2, action: () => setHeading(2) },
  { label: "Heading 3", icon: Heading3, action: () => setHeading(3) },
  { label: "Bullet List", icon: List, action: toggleBullet },
  { label: "Ordered List", icon: ListOrdered, action: toggleOrdered },
  { label: "Quote", icon: Quote, action: toggleBlockquote },
  { label: "Code Block", icon: FileText, action: toggleCodeBlock },
  { label: "Horizontal Rule", icon: Minus, action: setHr },
];

const tableButtons = [
  { label: "Insert Table", icon: TableIcon, action: insertTable },
  { label: "Add Column", icon: Plus, action: addColumnAfter },
  { label: "Delete Column", icon: Columns, action: deleteColumn },
  { label: "Add Row", icon: Plus, action: addRowAfter },
  { label: "Delete Row", icon: Rows, action: deleteRow },
  { label: "Delete Table", icon: Trash2, action: deleteTable },
];
</script>

<template>
  <div class="relative w-full">
    <div
      v-if="resolvedVariant === 'top-sticky'"
      class="sticky top-0 z-40 -mx-2 mb-2 flex flex-wrap gap-1 rounded-md border bg-white/80 p-2 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-700 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/50"
    >
      <button
        v-for="(btn, i) in topToolbarButtons"
        :key="i"
        type="button"
        :title="btn.label"
        class="rounded p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        @click="btn.action()"
      >
        <component :is="btn.icon" :size="16" />
      </button>
      <span
        class="mx-2 inline-block h-5 w-px bg-neutral-200 dark:bg-neutral-700"
      />
      <button
        v-for="(btn, i) in tableButtons"
        :key="'t' + i"
        type="button"
        :title="btn.label"
        class="rounded p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        @click="btn.action()"
      >
        <component :is="btn.icon" :size="16" />
      </button>
      <span class="ml-auto" />
      <button
        title="Undo"
        class="rounded p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        @click="undo"
      >
        <Undo :size="16" />
      </button>
      <button
        title="Redo"
        class="rounded p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        @click="redo"
      >
        <Redo :size="16" />
      </button>
    </div>

    <BubbleMenu
      v-if="resolvedVariant === 'balloon' && editor?.value"
      v-slot="{ editor }"
      :editor="editor?.value"
      :tippy-options="{ duration: 150 }"
    >
      <div
        class="z-50 flex items-center gap-1 rounded-md border bg-white p-1 text-sm shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <button
          title="Bold"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleBold"
        >
          <Bold :size="16" />
        </button>
        <button
          title="Italic"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleItalic"
        >
          <Italic :size="16" />
        </button>
        <button
          title="Underline"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleUnderline"
        >
          <UnderlineIcon :size="16" />
        </button>
        <button
          title="Strikethrough"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleStrike"
        >
          <Strikethrough :size="16" />
        </button>
        <button
          title="Link"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleLink"
        >
          <LinkIcon :size="16" />
        </button>
      </div>
    </BubbleMenu>

    <FloatingMenu
      v-if="resolvedVariant === 'balloon-block' && editor?.value"
      :editor="editor?.value"
      :tippy-options="{ duration: 150 }"
    >
      <div
        class="z-50 flex items-center gap-1 rounded-md border bg-white p-1 text-sm shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <button
          title="Paragraph"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="setParagraph"
        >
          <Type :size="16" />
        </button>
        <button
          title="Heading 1"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="() => setHeading(1)"
        >
          <Heading1 :size="16" />
        </button>
        <button
          title="Heading 2"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="() => setHeading(2)"
        >
          <Heading2 :size="16" />
        </button>
        <button
          title="Bullet List"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleBullet"
        >
          <List :size="16" />
        </button>
        <button
          title="Ordered List"
          class="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="toggleOrdered"
        >
          <ListOrdered :size="16" />
        </button>
      </div>
    </FloatingMenu>

    <EditorContent
      :editor="editor"
      :class="[
        'prose prose-neutral dark:prose-invert max-w-none',
        'min-h-[220px] rounded-md border p-3 outline-none focus-within:ring-1 dark:border-neutral-700',
        editorClass,
      ]"
    />
  </div>
</template>

<style scoped>
/* basic prose resets to play nice with Tailwind typography if used */
.prose :where(table) {
  width: 100%;
}
.prose :where(th),
.prose :where(td) {
  border: 1px solid var(--tw-prose-borders, rgba(0, 0, 0, 0.1));
  padding: 0.25rem 0.5rem;
}
</style>