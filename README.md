# Editor Vue Plugin

A modern, feature-rich Vue.js rich text editor plugin built with TipTap and TypeScript. This plugin provides a comprehensive editing experience with multiple UI variants, slash commands, and extensive formatting options.

## ✨ Features

- 🎨 **Multiple UI Variants**: Choose from balloon, balloon-block, or top-sticky toolbar styles
- ⚡ **Vue 3 + TypeScript**: Full type safety and modern Vue composition API
- 📝 **Rich Text Editing**: Bold, italic, underline, strikethrough, colors, and more
- 📊 **Tables**: Full table support with resizing and manipulation
- 🖼️ **Image Support**: Drag & drop and paste image handling
- ⚡ **Slash Commands**: Notion-like slash commands for quick block insertion
- 🎯 **Two Presets**: Starter (minimal) and Notion-like (full featured)
- 🌙 **Dark Mode**: Built-in dark mode support
- 🔧 **Extensible**: Easy to customize and extend with additional TipTap extensions
- 📦 **Monorepo**: Organized workspace structure with pnpm

## 🚀 Installation

```bash
# Using pnpm (recommended)
pnpm add @crafely/tiptap-vue

# Using npm
npm install @crafely/tiptap-vue

# Using yarn
yarn add @crafely/tiptap-vue
```

## 📖 Quick Start

### Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TiptapEditor } from '@crafely/tiptap-vue'

const content = ref('<p>Hello world!</p>')
</script>

<template>
  <TiptapEditor 
    v-model="content"
    placeholder="Start typing..."
  />
</template>
```

### With Vue Plugin (Global Configuration)

```ts
// main.ts
import { createApp } from 'vue'
import TiptapVuePlugin from '@crafely/tiptap-vue'
import App from './App.vue'

const app = createApp(App)

app.use(TiptapVuePlugin, {
  variant: 'top-sticky',
  preset: 'notionLike',
  placeholder: 'Start writing...'
})

app.mount('#app')
```

## 🎛️ Configuration Options

### Editor Variants

- **`balloon`**: Selection-based bubble menu for formatting
- **`balloon-block`**: Floating menu for block-level operations
- **`top-sticky`**: Fixed toolbar at the top (default)

### Editor Presets

- **`starter`**: Minimal feature set (paragraphs, basic formatting)
- **`notionLike`**: Full feature set with tables, images, slash commands

### Props

```ts
interface TiptapEditorProps {
  modelValue?: JSONContent | string | null
  content?: JSONContent | string | null
  editable?: boolean
  autofocus?: boolean | "start" | "end" | "all"
  variant?: "balloon" | "balloon-block" | "top-sticky"
  preset?: "starter" | "notionLike"
  placeholder?: string
  extensions?: Extension[]
  onUploadImage?: (file: File) => Promise<string>
  editorClass?: string
}
```

## 💡 Examples

### Balloon Menu Style

```vue
<template>
  <TiptapEditor 
    v-model="content"
    variant="balloon"
    preset="starter"
    placeholder="Select text to see formatting options..."
  />
</template>
```

### With Image Upload

```vue
<script setup lang="ts">
import { TiptapEditor } from '@crafely/tiptap-vue'

const content = ref('')

const handleImageUpload = async (file: File): Promise<string> => {
  // Upload file to your server/CDN
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const { url } = await response.json()
  return url
}
</script>

<template>
  <TiptapEditor 
    v-model="content"
    :on-upload-image="handleImageUpload"
    placeholder="Drag and drop images here..."
  />
</template>
```

### Custom Extensions

```vue
<script setup lang="ts">
import { TiptapEditor } from '@crafely/tiptap-vue'
import { Mention } from '@tiptap/extension-mention'

const content = ref('')

const extensions = [
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
  }),
]
</script>

<template>
  <TiptapEditor 
    v-model="content"
    :extensions="extensions"
    preset="notionLike"
  />
</template>
```

## 🛠️ Development

This project uses a monorepo structure with pnpm workspaces.

### Setup

```bash
# Clone the repository
git clone https://github.com/fahim525/editor-vue-plugin.git
cd editor-vue-plugin

# Install dependencies
pnpm install

# Start development
pnpm dev:vue
```

### Project Structure

```
editor-vue-plugin/
├── packages/
│   └── tiptap-vue/           # Main package
│       ├── src/
│       │   ├── ui/
│       │   │   └── TiptapEditor.vue
│       │   ├── extensions/
│       │   │   └── slash-command.ts
│       │   ├── types.ts
│       │   ├── plugin.ts
│       │   └── index.ts
│       └── package.json
├── apps/
│   └── vue-demo/             # Demo application
└── package.json
```

### Scripts

```bash
# Build all packages
pnpm build

# Run demo application
pnpm dev:vue

# Lint code
pnpm lint
```

## 🎨 Styling

The editor uses Tailwind CSS classes and is designed to work with dark mode out of the box. You can customize the appearance by:

1. **Using the `editorClass` prop** to add custom CSS classes
2. **Overriding CSS variables** for colors and spacing
3. **Customizing Tailwind configuration** for your specific needs

```vue
<template>
  <TiptapEditor 
    v-model="content"
    editor-class="my-custom-editor border-2 border-blue-500"
  />
</template>

<style>
.my-custom-editor .ProseMirror {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}
</style>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - The headless editor framework
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/fahim525/editor-vue-plugin/issues) on GitHub.

---

Built with ❤️ by [Fahim Ahmed](https://github.com/fahim525)