import { Link } from "react-router-dom"

export default function Gst(){
    return(
        <section className="cta">
  <h2>Ready to Get Started?</h2>
  <p>Join the Wassali community and experience smarter local delivery</p>
 <Link to="/Register"><button className="btn-primary">Create Your Account →</button></Link>
</section>
    )
}