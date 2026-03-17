import { Link } from "react-router-dom"

export default function Hero(){
    return(
  <div className="hero page">
  <h1>Fast, Local, <span>Trusted Delivery</span></h1>
  <p>Wassali connects you with trusted local deliverers for fast, affordable, and secure deliveries.</p>

  <div className="hero-buttons">
    <Link to="/Register"> <button className="btn-primary">Get Started →</button></Link>
    <Link to="/Register"><button className="btn-outline">Become a Deliverer</button></Link>
  </div>
  </div>

    )
}