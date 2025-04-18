import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  imports: {
    // Add directories to auto-import from
    dirs: ['src/analysis', 'src/services', 'src/ui', 'src/utils'],
    // Configure auto-imports for ESLint
    eslintrc: {
      enabled: true,
    },
  },
  manifest: {
    action: {
      default_icon: {
        '16': 'icon/icon16.png',
        '48': 'icon/icon48.png',
        '128': 'icon/icon128.png',
      },
      default_popup: 'popup.html',
    },
    description: "Repository analyzer: because in repositories, it's not just size that matters",
    homepage_url: 'https://github.com/LeonardoPuccio/RateThisRepo',
    host_permissions: ['*://github.com/*', '*://api.github.com/*'],
    icons: {
      '16': 'icon/icon16.png',
      '48': 'icon/icon48.png',
      '128': 'icon/icon128.png',
    },
    incognito: 'split',
    name: 'RateThisRepo',
    options_page: 'options.html',
    permissions: ['storage', 'activeTab'],
    version: '0.3.0',
    web_accessible_resources: [
      {
        matches: ['<all_urls>'],
        resources: ['assets/tailwind.css'],
      },
    ],
  },
  srcDir: 'src',
  vite: () => ({
    // Add enhanced CSS support for Shadow DOM
    css: {
      postcss: {
        plugins: [],
      },
    },
    plugins: [tailwindcss()],
  }),
});
