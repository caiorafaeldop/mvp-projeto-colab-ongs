
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DATA_MODE?: "api" | "static" | "auto";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

