import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const naturalReferenceVersion = Date.now().toString(36);

export default defineConfig({
  plugins: [react()],
  define: {
    __NATURAL_REFERENCE_VERSION__: JSON.stringify(naturalReferenceVersion),
  },
});
