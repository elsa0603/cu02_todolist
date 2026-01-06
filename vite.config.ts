import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署需要設定 base 路徑
  // 如果您的倉庫名稱是 cu02_todolist，則 base 應該是 '/cu02_todolist/'
  // 如果使用自訂域名，可以設為 '/'
  base: process.env.NODE_ENV === 'production' ? '/cu02_todolist/' : '/',
})
