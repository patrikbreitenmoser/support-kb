import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } })],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb/incidents/4471/problems', '/kb', '/kb/incidents/4471', '/kb/triage/dedupe', '/kb/decisions/0001-dedupe-by-subject'] }
  }
};
