
import { NavLink } from "react-router-dom"

export default function Footer(){
    return(
        <>
        <footer className="main-footer">
  <div className="footer-grid">
    <div>
      <h3>
           <svg style={{display: 'inline-block', verticalAlign:'middle',marginRight: '6px',width:'24px' ,height:'24px'}}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        Wassali
      </h3>
      <p>Fast, local, and trusted delivery platform connecting communities.</p>
    </div>
    <div>
      <h4>Company</h4>
      <NavLink to='/about'>About</NavLink>
      <NavLink to='/contact'>Contact</NavLink>
      <a href="#">Terms & Privacy</a>
    </div>
    <div>
      <h4>Connect</h4>
      <a href="#">Twitter</a>
      <a href="#">Facebook</a>
      <a href="#">Instagram</a>
    </div>
  </div>
  <p className="copyright">
    © 2026 Wassali. All rights reserved.
  </p>
</footer>
        </>
    )
}
