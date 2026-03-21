import { useState } from "react"



export default function FAQ(){
    const Faqs=[
       { Question:"How does Wassali work?",Answer:"Wassali connects clients who need deliveries with local, verified deliverers. Simply create a delivery request, wait for a deliverer to accept, and track your parcel in real-time until it's delivered."},
       { Question:"How much does delivery cost?",Answer:"Pricing is based on distance and package size. Small packages under 5km typically cost 500-800 DA. You'll see the estimated price before confirming your delivery."},
       { Question:"How are deliverers verified?",Answer:"All deliverers must submit valid ID documentation which is reviewed by our admin team. Only verified deliverers can accept delivery requests on the platform."},
       { Question:"Can I track my delivery?",Answer:" Yes! Once a deliverer accepts your request, you can track the status in real-time through your dashboard. You'll see when they pick up the package and when it's out for delivery."},
       { Question:"What if something goes wrong?",Answer:"We have 24/7 support available. Contact us through the app and our team will help resolve any issues. We also have insurance coverage for lost or damaged items."},
       { Question:"How do I become a deliverer?",Answer:'Sign up, choose "Deliver Parcels" as your role, and submit your ID for verification. Once approved, you can start accepting delivery requests and earning money!'},
    ]

    const [active,setActive]=useState(null)



    return(
        <section id="faq">
  <h2>Frequently Asked Questions</h2>
  <p className="subtitle">Everything you need to know</p>
  
  <div className="faq-container">
    {Faqs.map((faq,i) => (<div class={`faq-item ${active === i ? 'active' : ''}`} key={i} >
      <div className="faq-question" onClick={()=> setActive(active===i ? null : i)}>
        <span>{faq.Question}</span>
        <span className="faq-icon" >▼</span>
      </div>
     {active===i &&( <div className="faq-answer">
        <div className="faq-answer-content">
          {faq.Answer}
        </div>
      </div>)}
    </div>))}
  </div>
</section>
    )
}