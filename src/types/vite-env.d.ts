// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL: string; // VITE_SOCKET_URL環境変数の型定義
  readonly PROD: boolean; // import.meta.env.PROD の型定義
  readonly DEV: boolean;  // import.meta.env.DEV の型定義
  readonly SSR: boolean;  // import.meta.env.SSR の型定義
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}