// Dark mode toggle (only visual feature that works)
// Animated dark mode toggle
const darkToggleInput = document.getElementById('darkToggleInput');
if (darkToggleInput) {
  // Load saved preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkToggleInput.checked = true;
  }

  darkToggleInput.addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
    localStorage.setItem('darkMode', this.checked);
  });
}

// Mobile menu toggle (visual only)
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.getElementById('navLinks');
if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', function() {
    navLinks.classList.toggle('active');
  });
}

// Auto-rotate testimonials (visual effect)
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');
const dots = document.querySelectorAll('.slider-dots .dot');

function showTestimonial(index) {
  testimonials.forEach(t => t.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  
  if (testimonials[index]) testimonials[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
}

// Auto-rotate every 5 seconds
if (testimonials.length > 0) {
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 5000);
}

// Dot click handlers
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    currentTestimonial = index;
    showTestimonial(index);
  });
});

// FAQ accordion (visual effect)
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
  question.addEventListener('click', function() {
    const item = this.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('active');
    });
    
    // Open clicked FAQ if it wasn't active
    if (!isActive) {
      item.classList.add('active');
    }
  });
});


// Reveal cards on scroll (visual effect)
const cards = document.querySelectorAll(".card");
function revealCards() {
  const trigger = window.innerHeight - 100;
  cards.forEach((card, index) => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) {
      setTimeout(() => {
        card.classList.add("show");
      }, index * 100);
    }
  });
}

window.addEventListener("scroll", revealCards);
window.addEventListener("load", revealCards);