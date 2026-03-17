import { useState,useEffect,useRef } from "react";


export default function  Tsm (){

  const Testimonial=[
    {avatar:"SA",name:"Sarah A.",role:"Client • Algiers",text:'"Wassali made sending packages so easy! The deliverer was professional and my parcel arrived within 2 hours. Highly recommend!"'},
    {avatar:"KM",name:"Karim M.",role:"Deliverer • Oran",text:'"As a deliverer, Wassali gives me flexible earning opportunities. The app is simple and I love being part of the local community."'},
    {avatar:"LB",name:"Lina B.",role:"Business Owner • Constantine",text:'"Fast, affordable, and reliable! I use Wassali for all my business deliveries now. The tracking feature is excellent."'},
  ];





 const Style=
 {color:"var(--text-secondary)",
fontSize:"14px"};


  const [current, setCurrent] = useState(0);
 
  const intervalRef = useRef(null);

const startInterval = () => {
  clearInterval(intervalRef.current);
  intervalRef.current = setInterval(() => {
    setCurrent((prev) => (prev + 1) % Testimonial.length);
  }, 5000);
};

useEffect(() => {
  startInterval();
  return () => clearInterval(intervalRef.current);
}, []);

const handleDotClick = (i) => {
  setCurrent(i);
  startInterval(); 
};

return(
   <section id="testimonials">
  <h2>What Our Users Say</h2>
  <p className="subtitle">Real experiences from real people</p>
  <div className="testimonials-slider">
    {Testimonial.map((test,i) =>(
    <div key={i} className={`testimonial ${i === current ? "active" : ""}`}>
      <p className="testimonial-text">{test.text}</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{test.avatar}</div>
        <div>
          <strong>{test.name}</strong>
          <div style={Style}>{test.role}</div>
        </div>
      </div>
    </div>))}
    </div>
 

  <div className="slider-dots">
  {Testimonial.map((_, i) => (
    <span
      key={i}
      className={`dot ${i === current ? "active" : ""}`}
      onClick={() =>handleDotClick(i)}
    />
  ))}
</div>
</section>
)
}