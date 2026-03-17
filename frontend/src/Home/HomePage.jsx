import Nav from "../common/NavBar";
import Footer from "../common/Footer";
import {Outlet} from "react-router-dom"
import Hero from "./Hero";
import Hitw from "./HowItWork";
import Wch from "./WhyChose";
import Prc from "./PriceCalculator";
import Tsm from "./Testimonials";
import Sct from "./Security";
import Gst from "./GetStarted";
import FAQ from "./FAQ";


export default function Home(){
    return(
        
    <div className="site-wrapper">
      <Nav/>
      <main>
      <Hero/>
      <Hitw/>
      <Wch/>
      <Prc/>
      <Tsm/>
      <Sct/>
      <FAQ/>
      <Gst/>
      <Outlet/>
      </main>
      <Footer/>
      </div>
    )
}