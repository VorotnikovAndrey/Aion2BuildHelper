import './lib/env'
import '@fontsource-variable/inter'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useApp } from './lib/store'

// Сначала загружаем настройки и данные, потом рисуем — чтобы не мелькал пустой экран «нет данных».
useApp
  .getState()
  .load()
  .catch((e) => console.error('[load]', e))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
