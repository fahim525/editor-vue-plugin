declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@fahim525/tiptap-vue/TiptapEditor" {
  import type { DefineComponent } from "vue";
  const TiptapEditor: DefineComponent<{}, {}, any>;
  export default TiptapEditor;
}
