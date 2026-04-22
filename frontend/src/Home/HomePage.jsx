import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';
import LogoIcon from '../auth/LogoIcon';
import { getDashboardPath, getAccountPath } from '../common/navPaths';

function AnimatedCard({ children }) {
  const cardRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(function () {
    const observer = new IntersectionObserver(
      function ([entry]) { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return function () { observer.disconnect(); };
  }, []);

  return (
    <div ref={cardRef} className={`card ${isVisible ? 'show' : ''}`}>
      {children}
    </div>
  );
}

function Hero({ currentUser }) {
  const navigate = useNavigate();
  return (
    <div className="hero page">
      <h1>Fast, Local, <span>Trusted Delivery</span></h1>
      <p>Wassali connects you with trusted local deliverers for fast, affordable, and secure deliveries.</p>
      <div className="hero-buttons">
        {currentUser ? (
          <>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
            <button className="btn-outline" onClick={() => navigate('/dashboard')}>My Account</button>
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
            <button className="btn-outline" onClick={() => navigate('/login')}>Log In</button>
          </>
        )}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { num: 1, title: 'Create Delivery', desc: 'Enter pickup and drop-off locations' },
    { num: 2, title: 'Deliverer Accepts', desc: 'A verified local deliverer takes the job' },
    { num: 3, title: 'Delivered', desc: 'Your parcel arrives safely and fast' },
  ];
  return (
    <section id="how">
      <h2>How It Works</h2>
      <p className="subtitle">Three simple steps</p>
      <div className="cards">
        {steps.map(function (step) {
          return (
            <AnimatedCard key={step.num}>
              <div className="step">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </AnimatedCard>
          );
        })}
      </div>
    </section>
  );
}

function WhyChoose() {
  const reasons = [
    { icon: '📈', color: 'green', title: 'Affordable',   desc: 'Lower costs with local deliveries' },
    { icon: '👥', color: 'blue',  title: 'Community',    desc: 'Built around trust and neighborhoods' },
    { icon: '🍃', color: 'green', title: 'Eco-Friendly', desc: 'Less distance, less pollution' },
  ];
  return (
    <section id="why">
      <h2>Why Choose Wassali?</h2>
      <div className="cards">
        {reasons.map(function (reason) {
          return (
            <AnimatedCard key={reason.title}>
              <div className={`icon ${reason.color}`}>{reason.icon}</div>
              <h3>{reason.title}</h3>
              <p>{reason.desc}</p>
            </AnimatedCard>
          );
        })}
      </div>
    </section>
  );
}

function Calculator() {
  const [distance, setDistance] = useState(5);
  const [weight, setWeight] = useState(3);
  const [urgency, setUrgency] = useState("standard");
  const [zone, setZone] = useState("same");
  const [estimate, setEstimate] = useState(null);

  function roundTo10(value) {
    return Math.round(value / 10) * 10;
  }

 function calculatePrice() {
  const safeDistance = Math.max(1, Number(distance) || 1);
  const safeWeight   = Math.max(0.5, Number(weight) || 0.5);

  const baseFee = 120;

  // تسعير تدريجي — كلما زادت المسافة، قل سعر الكيلومتر
  let distanceFee = 0;
  if (safeDistance <= 10) {
    distanceFee = safeDistance * 28;
  } else if (safeDistance <= 50) {
    distanceFee = (10 * 28) + ((safeDistance - 10) * 18);
  } else if (safeDistance <= 150) {
    distanceFee = (10 * 28) + (40 * 18) + ((safeDistance - 50) * 12);
  } else {
    distanceFee = (10 * 28) + (40 * 18) + (100 * 12) + ((safeDistance - 150) * 8);
  }

  // وزن: مجاني حتى 5 كغ
  const weightFee = safeWeight <= 5 ? 0 : (safeWeight - 5) * 15;

  // منطقة
  const zoneFee = zone === 'cross' ? 60 : 0;

  // تخفيض القرب فقط للمسافات القصيرة
  const affordabilityDiscount =
    safeDistance <= 3 ? 50 :
    safeDistance <= 6 ? 30 : 0;

  // Express فقط على الأساس والمسافة
  const urgencyFee =
    urgency === 'express'
      ? (baseFee + distanceFee) * 0.12
      : 0;

  const subtotal   = baseFee + distanceFee + weightFee
                   + zoneFee - affordabilityDiscount + urgencyFee;
  const serviceFee = Math.max(25, subtotal * 0.03);

  const final = roundTo10(subtotal + serviceFee);
  const min   = roundTo10(final * 0.94);
  const max   = roundTo10(final * 1.06);

  setEstimate({
    min, max, average: final,
    breakdown: {
      baseFee:               roundTo10(baseFee),
      distanceFee:           roundTo10(distanceFee),
      weightFee:             roundTo10(weightFee),
      zoneFee:               roundTo10(zoneFee),
      affordabilityDiscount: roundTo10(affordabilityDiscount),
      urgencyFee:            roundTo10(urgencyFee),
      serviceFee:            roundTo10(serviceFee),
    },
  });
}

  return (
    <section className="calculator">
      <h2>Calculate Your Delivery Cost</h2>
      <p className="subtitle">Transparent and affordable pricing powered for Algerian cities</p>
      <div className="calculator-box">
        <div className="form-group">
          <label>Distance (km)</label>
          <input type="number" value={distance} min="1" max="50"
            onChange={function (e) { setDistance(e.target.value); }} placeholder="Enter distance" />
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input type="number" value={weight} min="0.5" max="40" step="0.5"
            onChange={function (e) { setWeight(e.target.value); }} placeholder="Enter weight" />
        </div>
        <div className="form-group">
          <label>Urgency</label>
          <select value={urgency} onChange={function (e) { setUrgency(e.target.value); }}>
            <option value="standard">Standard (best price)</option>
            <option value="express">Express (+12%)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Delivery Zone</label>
          <select value={zone} onChange={function (e) { setZone(e.target.value); }}>
            <option value="same">Same district</option>
            <option value="cross">Cross-district</option>
          </select>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={calculatePrice}>
          Calculate Smart Estimate
        </button>
        {estimate !== null && (
          <div className="price-result">
            <div className="price-amount">{estimate.min} - {estimate.max} DA</div>
            <div className="price-label">Estimated delivery range (average {estimate.average} DA)</div>
            <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", textAlign: "left" }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700 }}>Price Breakdown</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>Base fee: {estimate.breakdown.baseFee} DA</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>Distance fee: {estimate.breakdown.distanceFee} DA</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>Weight fee: {estimate.breakdown.weightFee} DA</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>Zone fee: {estimate.breakdown.zoneFee} DA</p>
              <p style={{ margin: "2px 0", fontSize: 12, color: "#22c55e" }}>Affordability discount: -{estimate.breakdown.affordabilityDiscount} DA</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>Service fee: {estimate.breakdown.serviceFee} DA</p>
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>
              No hidden fees. Final price is confirmed before you place the order.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const testimonialsList = [
  { initials: 'RH', name: 'Rayan Hr.',    role: 'Client • Chlef',         text: '"Wassali made sending packages so easy! The deliverer was professional and my parcel arrived within 2 hours. Highly recommend!"' },
  { initials: 'SM', name: 'Sofian M.',    role: 'Deliverer • Mostaganem', text: '"As a deliverer, Wassali gives me flexible earning opportunities. The app is simple and I love being part of the local community."' },
  { initials: 'IB', name: 'Ilyas Bacha', role: 'Business Owner • Oran',   text: '"Fast, affordable, and reliable! I use Wassali for all my business deliveries now. The tracking feature is excellent."' },
];

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(function () {
    const timer = setInterval(function () {
      setCurrentIndex(function (prev) { return (prev + 1) % testimonialsList.length; });
    }, 5000);
    return function () { clearInterval(timer); };
  }, []);

  const current = testimonialsList[currentIndex];
  return (
    <section id="testimonials">
      <h2>What Our Users Say</h2>
      <p className="subtitle">Real experiences from real people</p>
      <div className="testimonials-slider">
        <div className="testimonial active">
          <p className="testimonial-text">{current.text}</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">{current.initials}</div>
            <div>
              <strong>{current.name}</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{current.role}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="slider-dots">
        {testimonialsList.map(function (_, index) {
          return (
            <span key={index} className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={function () { setCurrentIndex(index); }} />
          );
        })}
      </div>
    </section>
  );
}

function Security() {
  const features = [
    { cls: 'green-icon',  title: 'ID Verification',    desc: 'All deliverers must submit and verify their ID cards before accepting orders.',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { cls: 'blue-icon',   title: 'GPS Tracking',       desc: 'Real-time location tracking during active deliveries for complete transparency.',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
    { cls: 'purple-icon', title: 'Admin Supervision',  desc: 'Platform administrators monitor all activities to prevent fraud and ensure quality.',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
    { cls: 'green-icon',  title: 'Verified Badges',    desc: 'See at a glance which deliverers are verified and approved by Wassali.',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  ];
  return (
    <section className="security-new">
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div className="security-shield-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 style={{ fontSize: 36, marginBottom: 10, color: 'var(--text-primary)' }}>Trust, Security & Transparency</h2>
      </div>
      <div className="security-cards-grid">
        {features.map(function (feature) {
          return (
            <div key={feature.title} className="security-feature-card">
              <div className={`feature-icon ${feature.cls}`}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const faqList = [
  { q: 'How does Wassali work?',        a: "Wassali connects clients who need deliveries with local, verified deliverers. Simply create a delivery request, wait for a deliverer to accept, and track your parcel in real-time until it's delivered." },
  { q: 'How much does delivery cost?',  a: "Pricing is based on distance and package size. Small packages under 5km typically cost 500-800 DA. You'll see the estimated price before confirming your delivery." },
  { q: 'How are deliverers verified?',  a: 'All deliverers must submit valid ID documentation which is reviewed by our admin team. Only verified deliverers can accept delivery requests on the platform.' },
  { q: 'Can I track my delivery?',      a: 'Yes! Once a deliverer accepts your request, you can track the status in real-time through your dashboard.' },
  { q: 'What if something goes wrong?', a: 'We have 24/7 support available. Contact us through the app and our team will help resolve any issues.' },
  { q: 'How do I become a deliverer?',  a: 'Sign up, choose "Deliver Parcels" as your role, and submit your ID for verification. Once approved, you can start accepting delivery requests and earning money!' },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faq">
      <h2>Frequently Asked Questions</h2>
      <p className="subtitle">Everything you need to know</p>
      <div className="faq-container">
        {faqList.map(function (item, index) {
          return (
            <div key={index} className={`faq-item ${openIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span>{item.q}</span>
                <span className="faq-icon">▼</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CTA({ currentUser }) {
  const navigate = useNavigate();
  const dash = currentUser ? getDashboardPath(currentUser) : '/register';
  return (
    <section className="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join the Wassali community and experience smarter local delivery</p>
      <div className="cta-buttons">
        {currentUser ? (
          <button className="btn-primary" onClick={() => navigate(dash)}>Go to Dashboard →</button>
        ) : (
          <>
            <button className="btn-primary" onClick={() => navigate('/register')}>Create Your Account →</button>
            <button className="btn-outline" onClick={() => navigate('/login')}>Log In</button>
          </>
        )}
      </div>
    </section>
  );
}

function HomePage({ currentUser }) {
  return (
    <>
      <Hero currentUser={currentUser} />
      <HowItWorks />
      <WhyChoose />
      <Calculator />
      <Testimonials />
      <Security />
      <FAQ />
      <CTA currentUser={currentUser} />
      <Footer />
    </>
  );
}

export default HomePage;