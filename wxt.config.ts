import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

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
    }
  },
  alias: {
    '@analysis': resolve('src/analysis'),
    '@components': resolve('src/components'),
    '@interfaces': resolve('src/interfaces'),
    '@services': resolve('src/services'),
    '@ui': resolve('src/ui'),
    '@utils': resolve('src/utils')
  }
});
