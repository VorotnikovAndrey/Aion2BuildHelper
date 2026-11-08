import type { AppApi } from '@shared/api'

declare global {
  interface Window {
    /** Есть в приложении (Electron). В браузерном режиме разработки — нет, вместо него lib/webApi.ts. */
    api?: AppApi
  }
}

export {}
