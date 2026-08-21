/// <reference types="vite/client" />

declare const __NATURAL_REFERENCE_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_TERRAIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
