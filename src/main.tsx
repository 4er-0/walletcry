import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource-variable/inter/index.css'
import './styles/globals.css'

import { ThemeProvider } from './app/theme'
import { router } from './app/router'
import { initData } from './data'

// Seed the local-first store on first run + request persistent storage.
// Fire-and-forget: live queries pick up the data as soon as it lands.
void initData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
