import { useEffect,useState,useRef } from "react";


export default function Wch(){
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
        <section id="why">
  <h2>Why Choose Wassali?</h2>
  <div className="cards">
    <div className={`card ${visibleCards.has(0) ? "show" : ""}`} ref={(el) =>(cardRefs.current[0]=el)}>
      <div className="icon green">📈</div>
      <h3>Affordable</h3>
      <p>Lower costs with local deliveries</p>
    </div>
    <div className={`card ${visibleCards.has(1) ? "show" : ""}`} ref={(el) =>(cardRefs.current[1]=el)}>
      <div className="icon blue">👥</div>
      <h3>Community</h3>
      <p>Built around trust and neighborhoods</p>
    </div>
    <div className={`card ${visibleCards.has(2) ? "show" : ""}`} ref={(el) =>(cardRefs.current[2]=el)}>
      <div className="icon green">🍃</div>
      <h3>Eco-Friendly</h3>
      <p>Less distance, less pollution</p>
    </div>
  </div>
</section>
    )
}