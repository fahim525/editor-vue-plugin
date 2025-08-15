import type { App, Plugin } from "vue";
import type { TiptapVueOptions } from "./types";

let defaultOptions: Required<
  Pick<TiptapVueOptions, "variant" | "preset" | "placeholder">
> &
  Pick<TiptapVueOptions, "extensions" | "onUploadImage"> = {
  variant: "top-sticky",
  preset: "notionLike",
  placeholder: "Start typing…",
  extensions: undefined,
  onUploadImage: undefined,
};

export const setTiptapDefaults = (options: Partial<TiptapVueOptions>) => {
  defaultOptions = { ...defaultOptions, ...options };
};

export const getTiptapDefaults = () => defaultOptions;

const TiptapVuePlugin: Plugin = {
  install(app: App, options?: TiptapVueOptions) {
    if (options) setTiptapDefaults(options);
  },
};

export default TiptapVuePlugin;