<script setup lang="ts">
import { computed, onBeforeUnmount, watch, toRef, ref } from "vue";
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
import TextAlign from "@tiptap/extension-text-align";

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
  Sun,
  Moon,
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

// Dark mode state
const isDarkMode = ref(false);

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark", isDarkMode.value);

  // Update editor content styling
  if (editor?.value) {
    const editorElement = editor.value.view.dom;
    if (isDarkMode.value) {
      editorElement.classList.add("dark");
    } else {
      editorElement.classList.remove("dark");
    }
  }
}

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
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
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

// Text alignment functions
function setTextAlign(align: "left" | "center" | "right" | "justify") {
  if (!editor?.value) return;

  // Use TipTap's built-in text alignment commands
  editor.value.chain().focus().setTextAlign(align).run();
}

function isTextAlignActive(align: "left" | "center" | "right" | "justify") {
  if (!editor?.value) return false;

  // Use TipTap's built-in text alignment check
  return editor.value.isActive({ textAlign: align });
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

// Helper functions to check active states
function isActive(name: string, attributes?: any) {
  return editor?.value?.isActive(name, attributes) ?? false;
}

const topToolbarButtons = computed(() => [
  {
    label: "Bold",
    icon: Bold,
    action: toggleBold,
    isActive: () => isActive("bold"),
  },
  {
    label: "Italic",
    icon: Italic,
    action: toggleItalic,
    isActive: () => isActive("italic"),
  },
  {
    label: "Underline",
    icon: UnderlineIcon,
    action: toggleUnderline,
    isActive: () => isActive("underline"),
  },
  {
    label: "Strikethrough",
    icon: Strikethrough,
    action: toggleStrike,
    isActive: () => isActive("strike"),
  },
  {
    label: "Code",
    icon: Code,
    action: toggleCode,
    isActive: () => isActive("code"),
  },
  {
    label: "Paragraph",
    icon: Type,
    action: setParagraph,
    isActive: () => isActive("paragraph"),
  },
  {
    label: "Heading 1",
    icon: Heading1,
    action: () => setHeading(1),
    isActive: () => isActive("heading", { level: 1 }),
  },
  {
    label: "Heading 2",
    icon: Heading2,
    action: () => setHeading(2),
    isActive: () => isActive("heading", { level: 2 }),
  },
  {
    label: "Heading 3",
    icon: Heading3,
    action: () => setHeading(3),
    isActive: () => isActive("heading", { level: 3 }),
  },
  {
    label: "Bullet List",
    icon: List,
    action: toggleBullet,
    isActive: () => isActive("bulletList"),
  },
  {
    label: "Ordered List",
    icon: ListOrdered,
    action: toggleOrdered,
    isActive: () => isActive("orderedList"),
  },
  {
    label: "Quote",
    icon: Quote,
    action: toggleBlockquote,
    isActive: () => isActive("blockquote"),
  },
  {
    label: "Code Block",
    icon: FileText,
    action: toggleCodeBlock,
    isActive: () => isActive("codeBlock"),
  },
  {
    label: "Horizontal Rule",
    icon: Minus,
    action: setHr,
    isActive: () => false,
  }, // HR doesn't have active state
]);

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
      class="sticky top-0 z-40 -mx-2 mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-white/95 p-2 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/90 shadow-sm"
    >
      <!-- 1. History Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Undo"
          class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="undo"
        >
          <Undo :size="16" />
        </button>
        <button
          title="Redo"
          class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          @click="redo"
        >
          <Redo :size="16" />
        </button>
      </div>

      <!-- Divider -->
      <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <!-- 2. Structure/Block Type Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Heading"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('heading')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="setHeading(1)"
        >
          <Heading1 :size="16" />
        </button>
        <button
          title="Bullet List"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('bulletList')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleBullet"
        >
          <List :size="16" />
        </button>
        <button
          title="Numbered List"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('orderedList')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleOrdered"
        >
          <ListOrdered :size="16" />
        </button>
      </div>

      <!-- Divider -->
      <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <!-- 3. Text Formatting Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Code Block"
          :class="[
            'rounded-full p-1.5 text-sm transition-colors border',
            isActive('codeBlock')
              ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent',
          ]"
          @click="toggleCodeBlock"
        >
          <Code :size="16" />
        </button>
        <button
          title="Bold"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('bold')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleBold"
        >
          <Bold :size="16" />
        </button>
        <button
          title="Italic"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('italic')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleItalic"
        >
          <Italic :size="16" />
        </button>
        <button
          title="Strikethrough"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('strike')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleStrike"
        >
          <Strikethrough :size="16" />
        </button>
        <button
          title="Code"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('code')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleCode"
        >
          <Code :size="16" />
        </button>
        <button
          title="Underline"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('underline')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleUnderline"
        >
          <UnderlineIcon :size="16" />
        </button>
      </div>

      <!-- Divider -->
      <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <!-- 4. Advanced Formatting/Insertion Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Link"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isActive('link')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="toggleLink"
        >
          <LinkIcon :size="16" />
        </button>
        <button
          title="Superscript"
          class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="() => {}"
        >
          <span class="text-xs font-bold">x²</span>
        </button>
        <button
          title="Subscript"
          class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="() => {}"
        >
          <span class="text-xs font-bold">x₂</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <!-- 5. Alignment Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Left Align"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isTextAlignActive('left')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="setTextAlign('left')"
        >
          <div class="flex flex-col gap-0.5">
            <div class="w-3 h-0.5 bg-current"></div>
            <div class="w-2 h-0.5 bg-current"></div>
            <div class="w-3 h-0.5 bg-current"></div>
          </div>
        </button>
        <button
          title="Center Align"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isTextAlignActive('center')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="setTextAlign('center')"
        >
          <div class="flex flex-col gap-0.5">
            <div class="w-3 h-0.5 bg-current mx-auto"></div>
            <div class="w-2 h-0.5 bg-current mx-auto"></div>
            <div class="w-3 h-0.5 bg-current mx-auto"></div>
          </div>
        </button>
        <button
          title="Right Align"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isTextAlignActive('right')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="setTextAlign('right')"
        >
          <div class="flex flex-col gap-0.5">
            <div class="w-3 h-0.5 bg-current ml-auto"></div>
            <div class="w-2 h-0.5 bg-current ml-auto"></div>
            <div class="w-3 h-0.5 bg-current ml-auto"></div>
          </div>
        </button>
        <button
          title="Justify"
          :class="[
            'rounded p-1.5 text-sm transition-colors',
            isTextAlignActive('justify')
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="setTextAlign('justify')"
        >
          <div class="flex flex-col gap-0.5">
            <div class="w-3 h-0.5 bg-current"></div>
            <div class="w-2 h-0.5 bg-current"></div>
            <div class="w-3 h-0.5 bg-current"></div>
          </div>
        </button>
      </div>

      <!-- Divider -->
      <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <!-- 6. Media/Utility Controls -->
      <div class="flex items-center gap-1">
        <button
          title="Add Image/Media"
          class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
          @click="() => {}"
        >
          <ImageIcon :size="16" />
          <span class="text-xs">Add</span>
        </button>
      </div>

      <!-- Spacer -->
      <div class="ml-auto" />

      <!-- Dark Mode Toggle -->
      <button
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        class="rounded p-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
        @click="toggleDarkMode"
      >
        <Sun v-if="isDarkMode" :size="16" />
        <Moon v-else :size="16" />
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
          :class="[
            'rounded p-2 transition-colors',
            isActive('bold')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleBold"
        >
          <Bold :size="16" />
        </button>
        <button
          title="Italic"
          :class="[
            'rounded p-2 transition-colors',
            isActive('italic')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleItalic"
        >
          <Italic :size="16" />
        </button>
        <button
          title="Underline"
          :class="[
            'rounded p-2 transition-colors',
            isActive('underline')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleUnderline"
        >
          <UnderlineIcon :size="16" />
        </button>
        <button
          title="Strikethrough"
          :class="[
            'rounded p-2 transition-colors',
            isActive('strike')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleStrike"
        >
          <Strikethrough :size="16" />
        </button>
        <button
          title="Link"
          :class="[
            'rounded p-2 transition-colors',
            isActive('link')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
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
          :class="[
            'rounded p-2 transition-colors',
            isActive('paragraph')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="setParagraph"
        >
          <Type :size="16" />
        </button>
        <button
          title="Heading 1"
          :class="[
            'rounded p-2 transition-colors',
            isActive('heading', { level: 1 })
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="() => setHeading(1)"
        >
          <Heading1 :size="16" />
        </button>
        <button
          title="Heading 2"
          :class="[
            'rounded p-2 transition-colors',
            isActive('heading', { level: 2 })
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="() => setHeading(2)"
        >
          <Heading2 :size="16" />
        </button>
        <button
          title="Bullet List"
          :class="[
            'rounded p-2 transition-colors',
            isActive('bulletList')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleBullet"
        >
          <List :size="16" />
        </button>
        <button
          title="Ordered List"
          :class="[
            'rounded p-2 transition-colors',
            isActive('orderedList')
              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          ]"
          @click="toggleOrdered"
        >
          <ListOrdered :size="16" />
        </button>
      </div>
    </FloatingMenu>

    <EditorContent
      :editor="editor"
      :class="[
        'prose prose-neutral dark:prose-invert max-w-none editor-content',
        'rounded-lg border border-gray-200 p-4 outline-none transition-all duration-200 focus-within:border-blue-400 focus-within:shadow-md focus-within:shadow-blue-100/50 dark:border-gray-600 dark:focus-within:border-blue-500 dark:focus-within:shadow-blue-900/20',
        'bg-white dark:bg-gray-900',
        'min-h-[200px]',
        editorClass,
      ]"
    />
  </div>
</template>

<style scoped>
/* Editor container with customizable min-height */
:deep(.ProseMirror) {
  min-height: var(--tiptap-editor-min-height, 200px);
  outline: none !important;
  border: none !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #374151;
  padding: 0;
}

:deep(.ProseMirror.dark) {
  color: #d1d5db;
}

/* Remove the hardcoded min-height from Tailwind and use CSS variable instead */
.editor-content {
  min-height: var(--tiptap-editor-min-height, 200px);
}

/* Enhanced prose styling - more compact */
:deep(.ProseMirror h1) {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

:deep(.ProseMirror p) {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.25rem;
}

:deep(.ProseMirror li) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

:deep(.ProseMirror blockquote) {
  border-left: 3px solid #3b82f6;
  padding-left: 0.75rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
}

:deep(.ProseMirror code) {
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas,
    "Courier New", monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

:deep(.ProseMirror pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 1rem 0;
}

:deep(.ProseMirror pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

:deep(.ProseMirror table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.ProseMirror th),
:deep(.ProseMirror td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

:deep(.ProseMirror th) {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

:deep(.ProseMirror td) {
  background: #ffffff;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

:deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

:deep(.ProseMirror a:hover) {
  color: #2563eb;
}

/* Dark mode adjustments */
:deep(.ProseMirror.dark h1) {
  color: #f9fafb;
}

:deep(.ProseMirror.dark h2) {
  color: #e5e7eb;
}

:deep(.ProseMirror.dark h3) {
  color: #d1d5db;
}

:deep(.ProseMirror.dark blockquote) {
  background: #1f2937;
  color: #9ca3af;
  border-left-color: #60a5fa;
}

:deep(.ProseMirror.dark code) {
  background: #374151;
  color: #fca5a5;
}

:deep(.ProseMirror.dark th) {
  background: #374151;
  color: #d1d5db;
}

:deep(.ProseMirror.dark td) {
  background: #1f2937;
}

/* basic prose resets to play nice with Tailwind typography if used */
.prose :where(table) {
  width: 100%;
}
.prose :where(th),
.prose :where(td) {
  border: 1px solid var(--tw-prose-borders, rgba(0, 0, 0, 0.1));
  padding: 0.25rem 0.5rem;
}

/* Text alignment classes */
:deep(.ProseMirror p[style*="text-align: left"]),
:deep(.ProseMirror h1[style*="text-align: left"]),
:deep(.ProseMirror h2[style*="text-align: left"]),
:deep(.ProseMirror h3[style*="text-align: left"]),
:deep(.ProseMirror h4[style*="text-align: left"]),
:deep(.ProseMirror h5[style*="text-align: left"]),
:deep(.ProseMirror h6[style*="text-align: left"]) {
  text-align: left;
}

:deep(.ProseMirror p[style*="text-align: center"]),
:deep(.ProseMirror h1[style*="text-align: center"]),
:deep(.ProseMirror h2[style*="text-align: center"]),
:deep(.ProseMirror h3[style*="text-align: center"]),
:deep(.ProseMirror h4[style*="text-align: center"]),
:deep(.ProseMirror h5[style*="text-align: center"]),
:deep(.ProseMirror h6[style*="text-align: center"]) {
  text-align: center;
}

:deep(.ProseMirror p[style*="text-align: right"]),
:deep(.ProseMirror h1[style*="text-align: right"]),
:deep(.ProseMirror h2[style*="text-align: right"]),
:deep(.ProseMirror h3[style*="text-align: right"]),
:deep(.ProseMirror h4[style*="text-align: right"]),
:deep(.ProseMirror h5[style*="text-align: right"]),
:deep(.ProseMirror h6[style*="text-align: right"]) {
  text-align: right;
}

:deep(.ProseMirror p[style*="text-align: justify"]),
:deep(.ProseMirror h1[style*="text-align: justify"]),
:deep(.ProseMirror h2[style*="text-align: justify"]),
:deep(.ProseMirror h3[style*="text-align: justify"]),
:deep(.ProseMirror h4[style*="text-align: justify"]),
:deep(.ProseMirror h5[style*="text-align: justify"]),
:deep(.ProseMirror h6[style*="text-align: justify"]) {
  text-align: justify;
}
</style>
