import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from 'react-query'
import App from './App-enhanced'
import queryClient from './config/queryClient'
import './index.css'

// Temporarily disable StrictMode to avoid Chart.js canvas reuse issues
// TODO: Re-enable after fixing chart cleanup
ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)