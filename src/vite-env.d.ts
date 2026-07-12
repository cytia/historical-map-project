/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TERRAIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
