import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) ?? 'http://127.0.0.1:3210'
const convex = new ConvexReactClient(convexUrl)

const app = (
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>{app}</ConvexProvider>
  </StrictMode>,
)
