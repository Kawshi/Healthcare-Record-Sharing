/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_MODE: string;
  readonly VITE_CONTRACT_URLS: string;
  readonly VITE_AI_PROVIDER_URL?: string;
  readonly VITE_AI_PROVIDER_KEY?: string;
  readonly VITE_BACKEND_BASE_URL?: string;
  readonly VITE_WALLET_ALLOW_MANUAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
