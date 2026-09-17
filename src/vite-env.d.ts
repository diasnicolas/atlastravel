/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZAPTURIZE_API_URL?: string;
  readonly VITE_ZAPTURIZE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
