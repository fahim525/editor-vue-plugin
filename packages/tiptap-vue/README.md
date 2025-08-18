# @fahim525/tiptap-vue

A powerful Vue 3 rich text editor component built on top of Tiptap, featuring a modern UI with TypeScript support.

## Features

- 🎨 Beautiful and intuitive interface
- ⌨️ Slash commands for quick formatting
- 🖼️ Image support with drag & drop
- 📊 Table editing capabilities
- 🎯 TypeScript support
- 📱 Responsive design
- 🎭 Customizable toolbar
- 🔗 Link management
- 🎨 Text styling (bold, italic, underline, colors)
- 📝 Code blocks with syntax highlighting

## Installation

```bash
npm install @fahim525/tiptap-vue
# or
yarn add @fahim525/tiptap-vue
# or
pnpm add @fahim525/tiptap-vue
```

## Usage

```vue
<template>
  <div>
    <TiptapEditor
      v-model="content"
      :editable="true"
      placeholder="Start typing..."
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TiptapEditor } from "@fahim525/tiptap-vue";

const content = ref("<p>Hello World!</p>");

const handleUpdate = (newContent: string) => {
  console.log("Content updated:", newContent);
};
</script>
```

## Props

| Prop          | Type      | Default               | Description                           |
| ------------- | --------- | --------------------- | ------------------------------------- |
| `modelValue`  | `string`  | `''`                  | The HTML content of the editor        |
| `editable`    | `boolean` | `true`                | Whether the editor is editable        |
| `placeholder` | `string`  | `'Type something...'` | Placeholder text when editor is empty |

## Events

| Event               | Payload  | Description                                |
| ------------------- | -------- | ------------------------------------------ |
| `update:modelValue` | `string` | Emitted when content changes               |
| `update`            | `string` | Emitted when content changes (alternative) |

## Extensions Included

- **SlashCommand** - Quick formatting with `/` commands
- **Image** - Image insertion and management
- **Table** - Table creation and editing
- **Link** - Link insertion and editing
- **Code Block** - Syntax highlighted code blocks
- **Typography** - Smart typography features
- **Text Styling** - Bold, italic, underline, colors, highlights
- **Text Alignment** - Left, center, right alignment

## Styling

The component comes with built-in Tailwind CSS classes. Make sure you have Tailwind CSS configured in your project, or the styles might not work correctly.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build package
pnpm build
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
