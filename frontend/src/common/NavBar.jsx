
import React from "react"

import { NavLink } from "react-router-dom";
import { useEffect,useState } from "react";

function useDarkMode(){
  const [darkMode,setDarkMode]=useState(() => {
    return localStorage.getItem("darkMode") === "true";
  })

  useEffect(() => {
    if(darkMode){
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark"); 
    }else{
       document.body.classList.remove("dark-mode");
       document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("darkMode",darkMode)
  },[darkMode]);

  return [darkMode,setDarkMode]
}

export default function Nav(){
  const [darkMode,setDarkMode]=useDarkMode();

    return(
      <>
    <nav className="site-nav">
        <div className="site-logo">  
          <svg
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: "6px",
              width: "24px",
              height: "24px",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          Wassali
        </div>
 
        <button className="mobile-menu-btn">☰</button>
 
        <div className="nav-links" id="navLinks">
          <NavLink to="/" className="main-nav-item">   {/* renamed from nav-item */}
            Home
          </NavLink>
          <NavLink to="/#faq" className="main-nav-item">
            FAQ
          </NavLink>
          <NavLink className="main-nav-item notification-link">
            <svg
              style={{ width: "20px", height: "20px" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notification-badge">3</span>
          </NavLink>
 
          <NavLink to="/Register">
            <button className="btn-primary">Register</button>
          </NavLink>
 
          <svg
            className="filter-svg"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
          >
            <filter id="blurFilter">
              <feGaussianBlur stdDeviation="5" />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              />
            </filter>
          </svg>
 
          <label className="dark-mode-label">
            <div className="switch">
              <input
                id="darkToggleInput"
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode((prev) => !prev)}
              />
              <div className="toggle-container">
                <div className="thumb" />
                <div className="toggle-icon-left" />
                <div className="toggle-icon-right" />
              </div>
            </div>
          </label>
        </div>
      </nav>
      </>
    )
}