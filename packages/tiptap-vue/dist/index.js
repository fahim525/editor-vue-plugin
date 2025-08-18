// src/plugin.ts
var defaultOptions = {
  variant: "top-sticky",
  preset: "notionLike",
  placeholder: "Start typing\u2026",
  extensions: void 0,
  onUploadImage: void 0
};
var setTiptapDefaults = (options) => {
  defaultOptions = { ...defaultOptions, ...options };
};
var getTiptapDefaults = () => defaultOptions;

// src/extensions/slash-command.ts
import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[SlashCommand] ${message}`, data);
  }
}
var DEBUG = true;
var defaultItems = (editor) => [
  // Basic Blocks
  {
    title: "Text",
    description: "Just start writing with plain text.",
    icon: "\u{1F4DD}",
    category: "Basic blocks",
    searchTerms: ["p", "paragraph", "text"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).setParagraph().run();
    }
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    icon: "\u{1F4F0}",
    category: "Basic blocks",
    searchTerms: ["h1", "heading", "title"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    }
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: "\u{1F4C4}",
    category: "Basic blocks",
    searchTerms: ["h2", "heading", "subtitle"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    }
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: "\u{1F4C3}",
    category: "Basic blocks",
    searchTerms: ["h3", "heading", "subheading"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    }
  },
  {
    title: "Bulleted list",
    description: "Create a simple bulleted list.",
    icon: "\u2022",
    category: "Basic blocks",
    searchTerms: ["ul", "bullet", "list", "unordered"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleBulletList().run();
    }
  },
  {
    title: "Numbered list",
    description: "Create a list with numbering.",
    icon: "\u{1F522}",
    category: "Basic blocks",
    searchTerms: ["ol", "numbered", "list", "ordered"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleOrderedList().run();
    }
  },
  {
    title: "To-do list",
    description: "Track tasks with a to-do list.",
    icon: "\u2611\uFE0F",
    category: "Basic blocks",
    searchTerms: ["todo", "task", "checklist", "check"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleTaskList?.().run();
    }
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    icon: "\u{1F4AC}",
    category: "Basic blocks",
    searchTerms: ["quote", "blockquote", "citation"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleBlockquote().run();
    }
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    icon: "\u{1F4BB}",
    category: "Basic blocks",
    searchTerms: ["code", "codeblock", "snippet"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).toggleCodeBlock().run();
    }
  },
  {
    title: "Divider",
    description: "Visually divide blocks.",
    icon: "\u2796",
    category: "Basic blocks",
    searchTerms: ["hr", "horizontal", "rule", "divider", "separator"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).setHorizontalRule().run();
    }
  },
  // Media & Content
  {
    title: "Image",
    description: "Add an image to your content.",
    icon: "\u{1F5BC}\uFE0F",
    category: "Media & Content",
    searchTerms: ["image", "img", "photo", "picture"],
    command: ({ editor: editor2, range }) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            editor2.chain().focus().deleteRange(range).setImage({ src: reader.result }).run();
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  },
  {
    title: "Video",
    description: "Embed a video in your content.",
    icon: "\u{1F3A5}",
    category: "Media & Content",
    searchTerms: ["video", "embed", "youtube", "vimeo"],
    command: ({ editor: editor2, range }) => {
      const url = prompt("Enter video URL:");
      if (url) {
        editor2.chain().focus().deleteRange(range).setIframe({ src: url }).run();
      }
    }
  },
  {
    title: "Link",
    description: "Add a hyperlink to your text.",
    icon: "\u{1F517}",
    category: "Media & Content",
    searchTerms: ["link", "url", "hyperlink", "anchor"],
    command: ({ editor: editor2, range }) => {
      const url = prompt("Enter URL:");
      if (url) {
        editor2.chain().focus().deleteRange(range).setLink({ href: url }).run();
      }
    }
  },
  // Advanced
  {
    title: "Table",
    description: "Add a table to organize data.",
    icon: "\u{1F4CA}",
    category: "Advanced",
    searchTerms: ["table", "grid", "data"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  },
  {
    title: "Callout",
    description: "Highlight important information.",
    icon: "\u{1F4A1}",
    category: "Advanced",
    searchTerms: ["callout", "highlight", "info", "note"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).setParagraph().run();
    }
  },
  {
    title: "Columns",
    description: "Create a multi-column layout.",
    icon: "\u{1F4D0}",
    category: "Advanced",
    searchTerms: ["columns", "layout", "grid", "split"],
    command: ({ editor: editor2, range }) => {
      editor2.chain().focus().deleteRange(range).setParagraph().run();
    }
  }
];
var SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    console.log("\u{1F3AF} SlashCommand extension created!");
    debugLog("SlashCommand created");
    return {
      suggestion: {},
      items: []
    };
  },
  onReady() {
    debugLog("SlashCommand onReady called");
    setTimeout(() => {
      try {
        this.storage.insertWelcomeContent(this.editor);
        debugLog("Welcome content inserted successfully");
      } catch (error) {
        debugLog("Error inserting welcome content:", error);
      }
    }, 100);
  },
  addProseMirrorPlugins() {
    debugLog("addProseMirrorPlugins called");
    const editor = this.editor;
    if (!editor) {
      debugLog("ERROR: Editor is not available");
      return [];
    }
    const items = (query = "") => {
      const allItems = [...defaultItems(editor), ...this.options.items ?? []];
      debugLog("Items function called", { query, totalItems: allItems.length });
      if (!query) return allItems;
      const searchQuery = query.toLowerCase();
      const filteredItems = allItems.filter(
        (item) => item.title.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery) || item.searchTerms.some(
          (term) => term.toLowerCase().includes(searchQuery)
        )
      );
      debugLog("Filtered items", filteredItems);
      return filteredItems;
    };
    const suggestionPlugin = Suggestion({
      editor,
      char: "/",
      allow: ({ state, range }) => {
        debugLog("Allow function called", { state, range });
        return true;
      },
      items: ({ query }) => {
        debugLog("Items function called", { query });
        const result = items(query);
        debugLog("Items result", result);
        return result;
      },
      render: () => {
        debugLog("Render function called");
        let component = null;
        let list = null;
        return {
          onStart: (props) => {
            debugLog("onStart called", props);
            try {
              component = document.createElement("div");
              component.className = "z-50 max-w-sm w-80 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 backdrop-blur-sm";
              const header = document.createElement("div");
              header.className = "px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-t-xl";
              const headerText = document.createElement("p");
              headerText.className = "text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide";
              headerText.textContent = "Choose a block type";
              header.appendChild(headerText);
              const subtitle = document.createElement("p");
              subtitle.className = "text-xs text-gray-500 dark:text-gray-400 mt-1";
              subtitle.textContent = "Type / to search blocks";
              header.appendChild(subtitle);
              component.appendChild(header);
              list = document.createElement("div");
              list.className = "p-2 max-h-96 overflow-y-auto";
              component.appendChild(list);
              document.body.appendChild(component);
              this.storage.updateList(list, props);
              this.storage.setPosition(component, props.clientRect);
              setTimeout(() => {
                const firstItem = list?.querySelector("button");
                if (firstItem) {
                  firstItem.focus();
                }
              }, 50);
              debugLog("Component created and added to DOM successfully");
            } catch (error) {
              debugLog("Error in onStart:", error);
            }
          },
          onUpdate: (props) => {
            if (!list || !component) return;
            this.storage.updateList(list, props);
            this.storage.setPosition(component, props.clientRect);
            const headerText = component.querySelector("p");
            const subtitle = component.querySelectorAll("p")[1];
            if (headerText && props.query) {
              headerText.textContent = `Search results for "${props.query}"`;
              if (subtitle)
                subtitle.textContent = `${props.items?.length || 0} blocks found`;
            } else if (headerText) {
              headerText.textContent = "Choose a block type";
              if (subtitle) subtitle.textContent = "Type / to search blocks";
            }
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              component?.remove();
              component = null;
              list = null;
              return true;
            }
            if (props.event.key === "ArrowDown" || props.event.key === "ArrowUp") {
              const items2 = list?.querySelectorAll("button");
              if (!items2 || items2.length === 0) return false;
              const currentIndex = Array.from(items2).findIndex(
                (item) => item === document.activeElement
              );
              let nextIndex = 0;
              if (props.event.key === "ArrowDown") {
                nextIndex = currentIndex < items2.length - 1 ? currentIndex + 1 : 0;
              } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items2.length - 1;
              }
              items2[nextIndex]?.focus();
              return true;
            }
            if (props.event.key === "Enter") {
              const focusedItem = list?.querySelector("button:focus");
              if (focusedItem) {
                focusedItem.click();
                return true;
              }
            }
            return false;
          },
          onExit: () => {
            component?.remove();
            component = null;
            list = null;
          }
        };
      },
      command: ({ editor: editor2, range, props }) => {
        debugLog("Command executed", { editor: editor2, range, props });
        props.command({ editor: editor2, range });
      }
    });
    return [suggestionPlugin];
  },
  addStorage() {
    return {
      // Insert default welcome content
      insertWelcomeContent: (editor) => {
        const welcomeContent = [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Your Editor" }]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a " },
              {
                type: "text",
                marks: [{ type: "strong" }],
                text: "rich text editor"
              },
              {
                type: "text",
                text: " powered by TipTap. Start typing or use the "
              },
              { type: "text", marks: [{ type: "code" }], text: "/" },
              {
                type: "text",
                text: " slash command to add different content blocks."
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Try typing " },
              { type: "text", marks: [{ type: "code" }], text: "/" },
              { type: "text", text: " anywhere to see available blocks!" }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "You can create " },
              { type: "text", marks: [{ type: "strong" }], text: "headings" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "strong" }], text: "lists" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "strong" }], text: "quotes" },
              { type: "text", text: ", and much more." }
            ]
          }
        ];
        if (editor.state.doc.content.size <= 2) {
          editor.commands.setContent(welcomeContent);
        }
      },
      updateList: (container, props) => {
        container.textContent = "";
        const options = props.items;
        let currentCategory = "";
        options.forEach((opt, index) => {
          if (opt.category !== currentCategory) {
            currentCategory = opt.category;
            if (index > 0) {
              const spacer = document.createElement("div");
              spacer.className = "h-3";
              container.appendChild(spacer);
            }
            const categoryHeader = document.createElement("div");
            categoryHeader.className = "px-3 py-2 mb-2";
            const categoryText = document.createElement("span");
            categoryText.className = "text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full";
            categoryText.textContent = opt.category;
            categoryHeader.appendChild(categoryText);
            container.appendChild(categoryHeader);
          }
          const item = document.createElement("button");
          item.type = "button";
          item.className = "flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group";
          const iconContainer = document.createElement("div");
          iconContainer.className = "flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-200";
          const iconSpan = document.createElement("span");
          iconSpan.className = "text-lg";
          iconSpan.textContent = opt.icon;
          iconContainer.appendChild(iconSpan);
          const contentDiv = document.createElement("div");
          contentDiv.className = "flex-1 min-w-0";
          const titleDiv = document.createElement("div");
          titleDiv.className = "font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200";
          const descDiv = document.createElement("div");
          descDiv.className = "text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5";
          titleDiv.textContent = opt.title;
          descDiv.textContent = opt.description;
          contentDiv.appendChild(titleDiv);
          contentDiv.appendChild(descDiv);
          const shortcutDiv = document.createElement("div");
          shortcutDiv.className = "flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-mono";
          shortcutDiv.textContent = "/";
          shortcutDiv.style.fontSize = "10px";
          item.appendChild(iconContainer);
          item.appendChild(contentDiv);
          item.appendChild(shortcutDiv);
          item.addEventListener("click", () => {
            props.command(opt);
          });
          container.appendChild(item);
        });
        if (options.length === 0) {
          const noResults = document.createElement("div");
          noResults.className = "px-4 py-8 text-center";
          const noResultsIcon = document.createElement("div");
          noResultsIcon.className = "text-4xl mb-3 text-gray-300 dark:text-gray-600";
          noResultsIcon.textContent = "\u{1F50D}";
          const noResultsText = document.createElement("div");
          noResultsText.className = "text-sm text-gray-500 dark:text-gray-400";
          noResultsText.textContent = "No matching blocks found";
          const noResultsHint = document.createElement("div");
          noResultsHint.className = "text-xs text-gray-400 dark:text-gray-500 mt-1";
          noResultsHint.textContent = "Try a different search term";
          noResults.appendChild(noResultsIcon);
          noResults.appendChild(noResultsText);
          noResults.appendChild(noResultsHint);
          container.appendChild(noResults);
        }
      },
      setPosition: (el, rect) => {
        if (!rect) return;
        el.style.transition = "opacity 0.15s ease-out, transform 0.15s ease-out";
        el.style.opacity = "0";
        el.style.transform = "translateY(-8px) scale(0.95)";
        el.style.position = "fixed";
        el.style.left = `${rect.left}px`;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = el.offsetHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
          el.style.top = `${rect.bottom + 8}px`;
        } else {
          el.style.top = `${rect.top - dropdownHeight - 8}px`;
        }
        const viewportWidth = window.innerWidth;
        const dropdownWidth = el.offsetWidth;
        if (rect.left + dropdownWidth > viewportWidth) {
          el.style.left = `${viewportWidth - dropdownWidth - 16}px`;
        }
        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0) scale(1)";
        });
      }
    };
  }
});
export {
  SlashCommand,
  getTiptapDefaults,
  setTiptapDefaults
};
