import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: "RateThisRepo",
    description: "Repository analyzer: because in repositories, it's not just size that matters",
    version: "0.2.0",
    homepage_url: "https://github.com/LeonardoPuccio/RateThisRepo",
    permissions: [
      "storage",
      "activeTab"
    ],
    host_permissions: [
      "*://github.com/*",
      "*://api.github.com/*"
    ],
    incognito: "split",
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icon/icon16.png",
        "48": "icon/icon48.png",
        "128": "icon/icon128.png"
      }
    },
    options_page: "options.html",
    icons: {
      "16": "icon/icon16.png",
      "48": "icon/icon48.png",
      "128": "icon/icon128.png"
    },
    web_accessible_resources: [
      {
        resources: [
          "assets/tailwind.css",
        ],
        matches: ["<all_urls>"]
      }
    ]
  },
  imports: {
    // Configure auto-imports for ESLint
    eslintrc: {
      enabled: true,
    },
    // Add directories to auto-import from
    dirs: [
      'src/analysis',
      'src/services',
      'src/ui',
      'src/utils',
    ]
  },
  vite: () => ({
    plugins: [tailwindcss()],
    // Add enhanced CSS support for Shadow DOM
    css: {
      postcss: {
        plugins: [],
      },
    },
  }),
});
