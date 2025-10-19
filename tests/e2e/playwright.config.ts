import { defineConfig } from '@playwright/test'

export default defineConfig({
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
  },
  reporter: [['list']]
})

