import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend (AT-3) runs on :8000; AT-1/AT-2 need no backend at all.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
