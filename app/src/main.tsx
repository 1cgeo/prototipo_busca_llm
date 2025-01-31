import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

// Desabilita logs em produção
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)