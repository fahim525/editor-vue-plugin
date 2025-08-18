<script setup lang="ts">
import { ref } from "vue";
import TiptapEditor from "@crafely/tiptap-vue/ui/TiptapEditor.vue";

const html = ref<string>("<p>Hello Tiptap!</p>");

async function upload(file: File) {
  return URL.createObjectURL(file);
}
</script>

<template>
  <main class="p-4 prose prose-neutral dark:prose-invert max-w-none">
    <TiptapEditor
      v-model="html"
      :on-upload-image="upload"
      variant="top-sticky"
      preset="notionLike"
      placeholder="Start typing…"
    />
    <pre class="mt-4 text-xs">{{ html }}</pre>
  </main>
</template>

<style>
html.dark body {
  background: #0a0a0a;
  color: #fafafa;
}

/* Customize the editor min-height using CSS variables */
:root {
  --tiptap-editor-min-height: 300px;
}

/* Example of responsive min-height */
@media (max-width: 768px) {
  :root {
    --tiptap-editor-min-height: 200px;
  }
}
</style>
