import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const userAssets = process.env['GRAPHDECK_ASSETS']
const kitOverrides = userAssets ? { files: { assets: userAssets } } : null
const basePath = process.env.NODE_ENV === "production" ? "/graphdeck" : ""

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    paths: {
      base: basePath
    },
    ...kitOverrides
  }
}
