import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { webdriverio } from '@vitest/browser-webdriverio';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		browser: {
			enabled: true,
			provider: webdriverio({
				capabilities: {
					browserVersion: '120'
				}
			}),
			instances: [{ browser: 'chrome' }]
		}
	}
});
