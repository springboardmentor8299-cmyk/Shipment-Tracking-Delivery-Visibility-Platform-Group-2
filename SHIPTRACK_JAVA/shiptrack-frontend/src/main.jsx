import "bootstrap-icons/font/bootstrap-icons.css";

(function () {
    try {
        const theme = localStorage.getItem("shiptrack-theme");
        document.documentElement.setAttribute(
            "data-theme",
            theme === "dark" ? "dark" : "light"
        );
    } catch {
        document.documentElement.setAttribute("data-theme", "light");
    }
})();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
    duration: 1000,
    once: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
