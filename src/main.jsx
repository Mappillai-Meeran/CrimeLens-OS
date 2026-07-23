import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CaseProvider } from './services/caseStore'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaseProvider>
      <App />
    </CaseProvider>
  </StrictMode>,
)
