import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css'
import App from './App/App.tsx'
import FormPage from './forms/FormPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/form/:formId" element={<FormPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
  
)
