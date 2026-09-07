import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', fullyParallel: false, workers: 1, use: { baseURL: 'http://localhost:3300', channel: 'msedge', headless: true, trace: 'retain-on-failure' }, reporter: 'list' });
