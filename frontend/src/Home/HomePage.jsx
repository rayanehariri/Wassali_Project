import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';
import LogoIcon from '../auth/LogoIcon';

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
  const [size, setSize]         = useState(500);
  const [price, setPrice]       = useState(null);

  function calculatePrice() {
    setPrice(parseInt(size) + distance * 50);
  }

  return (
    <section className="calculator">
      <h2>Calculate Your Delivery Cost</h2>
      <p className="subtitle">Get an instant price estimate</p>
      <div className="calculator-box">
        <div className="form-group">
          <label>Distance (km)</label>
          <input type="number" value={distance} min="1" max="50"
            onChange={function (e) { setDistance(e.target.value); }} placeholder="Enter distance" />
        </div>
        <div className="form-group">
          <label>Package Size</label>
          <select value={size} onChange={function (e) { setSize(e.target.value); }}>
            <option value="500">Small (&lt; 5kg) - Base 500 DA</option>
            <option value="800">Medium (5-15kg) - Base 800 DA</option>
            <option value="1200">Large (&gt; 15kg) - Base 1200 DA</option>
          </select>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={calculatePrice}>
          Calculate Price
        </button>
        {price !== null && (
          <div className="price-result">
            <div className="price-amount">{price} DA</div>
            <div className="price-label">Estimated delivery cost</div>
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
  return (
    <section className="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join the Wassali community and experience smarter local delivery</p>
      <div className="cta-buttons">
        {currentUser ? (
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
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