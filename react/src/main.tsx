import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import './index.css';
import Home from './Home.tsx';
import Login from './Login.tsx';


createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </Router>
  </StrictMode>
)
