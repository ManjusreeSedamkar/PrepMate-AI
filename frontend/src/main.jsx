import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { InterviewProvider } from './context/InterviewContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InterviewProvider>
      <App />
    </InterviewProvider>
  </React.StrictMode>,
)
