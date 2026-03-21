
import { useEffect, useRef, useState } from "react";

export default function Hitw(){
const cardRefs = useRef([]);
const [visibleCards, setVisibleCards] = useState(new Set());

useEffect(() => {
    const revealCards = () => {
      const trigger = window.innerHeight - 100;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const top = card.getBoundingClientRect().top;
        if (top < trigger) {
          setTimeout(() => {
            setVisibleCards((prev) => new Set([...prev, index]));
          }, index * 100);
        }
      });
    };

    window.addEventListener("scroll", revealCards);
    revealCards();
    return () => window.removeEventListener("scroll", revealCards);
  }, []);


    return(
    <section id="how">
  <h2>How It Works</h2>
  <p className="subtitle">Three simple steps</p>
  <div className="cards">
    <div className={`card ${visibleCards.has(0) ? "show" : ""}`} ref={(el) =>(cardRefs.current[0]=el)}>
      <div className="step">1</div>
      <h3>Create Delivery</h3>
      <p>Enter pickup and drop-off locations</p>
    </div>
    <div className={`card ${visibleCards.has(1) ? "show" : ""}`} ref={(el) =>(cardRefs.current[1]=el)}>
      <div className="step">2</div>
      <h3>Deliverer Accepts</h3>
      <p>A verified local deliverer takes the job</p>
    </div>
    <div className={`card ${visibleCards.has(2) ? "show" : ""}`} ref={(el) =>(cardRefs.current[2]=el)}>
      <div className="step">3</div>
      <h3>Delivered</h3>
      <p>Your parcel arrives safely and fast</p>
    </div>
  </div>
</section>
    )
}