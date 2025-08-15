import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

// Debug function to check if suggestion is working
function debugLog(message: string, data?: any) {
  console.log(`[SlashCommand] ${message}`, data);
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  category: string;
  searchTerms: string[];
  command: (props: {
    editor: any;
    range: { from: number; to: number };
  }) => void;
}

export interface SlashCommandOptions {
  suggestion?: Partial<Parameters<(typeof Suggestion)["configure"]>[0]>;
  items?: SlashCommandItem[];
}

const defaultItems = (editor: any): SlashCommandItem[] => [
  // Basic Blocks
  {
    title: "Text",
    description: "Just start writing with plain text.",
    icon: "📝",
    category: "Basic blocks",
    searchTerms: ["p", "paragraph", "text"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    icon: "📰",
    category: "Basic blocks",
    searchTerms: ["h1", "heading", "title"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: "📄",
    category: "Basic blocks",
    searchTerms: ["h2", "heading", "subtitle"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: "📃",
    category: "Basic blocks",
    searchTerms: ["h3", "heading", "subheading"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 3 })
        .run();
    },
  },
  {
    title: "Bulleted list",
    description: "Create a simple bulleted list.",
    icon: "•",
    category: "Basic blocks",
    searchTerms: ["ul", "bullet", "list", "unordered"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered list",
    description: "Create a list with numbering.",
    icon: "🔢",
    category: "Basic blocks",
    searchTerms: ["ol", "numbered", "list", "ordered"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do list",
    description: "Track tasks with a to-do list.",
    icon: "☑️",
    category: "Basic blocks",
    searchTerms: ["todo", "task", "checklist", "check"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList?.().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    icon: "💬",
    category: "Basic blocks",
    searchTerms: ["quote", "blockquote", "citation"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    icon: "💻",
    category: "Basic blocks",
    searchTerms: ["code", "codeblock", "snippet"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Visually divide blocks.",
    icon: "➖",
    category: "Basic blocks",
    searchTerms: ["hr", "horizontal", "rule", "divider", "separator"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  // Advanced
  {
    title: "Table",
    description: "Add a table to organize data.",
    icon: "📊",
    category: "Advanced",
    searchTerms: ["table", "grid", "data"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
];

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    debugLog("SlashCommand created");
    return {
      suggestion: {},
      items: [],
    };
  },

  addProseMirrorPlugins() {
    debugLog("addProseMirrorPlugins called");
    const editor = this.editor;
    const items = (query: string = "") => {
      const allItems = [...defaultItems(editor), ...(this.options.items ?? [])];

      if (!query) return allItems;

      const searchQuery = query.toLowerCase();
      return allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery) ||
          item.searchTerms.some((term) =>
            term.toLowerCase().includes(searchQuery)
          )
      );
    };

    return [
      Suggestion({
        editor,
        char: "/",
        allow: ({ state, range }) => {
          debugLog("Allow function called", { state, range });
          // Temporarily allow everywhere for testing
          return true;
        },
        items: ({ query }) => {
          debugLog("Items function called", { query });
          const result = items(query);
          debugLog("Items result", result);
          return result;
        },
        render: () => {
          let component: HTMLElement | null = null;
          let list: HTMLElement | null = null;

          return {
            onStart: (props) => {
              debugLog("onStart called", props);
              component = document.createElement("div");
              component.className =
                "z-50 max-w-xs w-72 rounded-lg border bg-white text-gray-900 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

              // Add header
              const header = document.createElement("div");
              header.className = "px-3 py-2 border-b dark:border-neutral-700";
              const headerText = document.createElement("p");
              headerText.className =
                "text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wide";
              headerText.textContent = "Basic blocks";
              header.appendChild(headerText);
              component.appendChild(header);

              list = document.createElement("div");
              list.className = "p-1 max-h-80 overflow-y-auto";
              component.appendChild(list);
              document.body.appendChild(component);
              this.updateList(list!, props);
              this.setPosition(component!, props.clientRect);
            },
            onUpdate: (props) => {
              if (!list || !component) return;
              this.updateList(list, props);
              this.setPosition(component, props.clientRect);

              // Update header based on search
              const header = component.querySelector("p");
              if (header && props.query) {
                header.textContent = `Search: "${props.query}"`;
              } else if (header) {
                header.textContent = "Basic blocks";
              }
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                component?.remove();
                component = null;
                list = null;
                return true;
              }
              return false;
            },
            onExit: () => {
              component?.remove();
              component = null;
              list = null;
            },
          };
        },
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
        ...this.options.suggestion,
      } as any),
    ];
  },

  addStorage() {
    return {
      updateList: (container: HTMLElement, props: any) => {
        container.textContent = "";
        const options: SlashCommandItem[] = props.items;
        let currentCategory = "";

        options.forEach((opt: SlashCommandItem, index: number) => {
          // Add category header if it's a new category
          if (opt.category !== currentCategory) {
            currentCategory = opt.category;
            if (index > 0) {
              const spacer = document.createElement("div");
              spacer.className = "h-1";
              container.appendChild(spacer);
            }
          }

          const item = document.createElement("button");
          item.type = "button";
          item.className =
            "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150";

          // Icon
          const iconSpan = document.createElement("span");
          iconSpan.className = "text-lg flex-shrink-0";
          iconSpan.textContent = opt.icon;

          // Content
          const contentDiv = document.createElement("div");
          contentDiv.className = "flex-1 min-w-0";

          const titleDiv = document.createElement("div");
          titleDiv.className =
            "font-medium text-gray-900 dark:text-neutral-100 truncate";
          titleDiv.textContent = opt.title;

          const descDiv = document.createElement("div");
          descDiv.className =
            "text-xs text-gray-500 dark:text-neutral-400 truncate";
          descDiv.textContent = opt.description;

          contentDiv.appendChild(titleDiv);
          contentDiv.appendChild(descDiv);

          item.appendChild(iconSpan);
          item.appendChild(contentDiv);

          item.addEventListener("click", () => {
            props.command(opt);
          });

          container.appendChild(item);
        });

        // Show "No results" if empty
        if (options.length === 0) {
          const noResults = document.createElement("div");
          noResults.className =
            "px-3 py-4 text-center text-sm text-gray-500 dark:text-neutral-400";
          noResults.textContent = "No matching blocks";
          container.appendChild(noResults);
        }
      },
      setPosition: (el: HTMLElement, rect?: DOMRect) => {
        if (!rect) return;
        el.style.position = "fixed";
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.bottom + 8}px`;
      },
    };
  },
});

export default SlashCommand;