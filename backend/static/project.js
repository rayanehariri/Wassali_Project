// API Base URL
const API_BASE = 'http://127.0.0.1:5000/api';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
  // Load saved dark mode preference
  initDarkMode();

  // Test backend connection
  testBackendConnection();

  // Check if user is logged in
  checkAuthStatus();

  // Initialize UI components
  initMobileMenu();
  initTestimonials();
  initFaqAccordion();
  initScrollReveal();
});

// ========== DARK MODE ==========
function initDarkMode() {
  const darkToggle = document.getElementById('darkToggleInput');
  if (darkToggle) {
    // Load saved preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkToggle.checked = true;
    }

    darkToggle.addEventListener('change', function () {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('darkMode', this.checked);
    });
  }
}

// ========== BACKEND CONNECTION ==========
async function testBackendConnection() {
  try {
    const response = await fetch('http://127.0.0.1:5000/');
    if (response.ok) {
      console.log('✅ Connected to backend');
    } else {
      console.warn('⚠️ Backend connection issue');
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    showToast('Cannot connect to server. Make sure Flask is running.', 'error');
  }
}

// ========== AUTHENTICATION ==========
function checkAuthStatus() {
  const user = localStorage.getItem('user');
  const authButtons = document.getElementById('authButtons');

  if (!authButtons) return;

  if (user) {
    // User is logged in
    const userData = JSON.parse(user);
    authButtons.innerHTML = `
            <span style="color: var(--text-secondary); margin-right: 10px;">👤 ${userData.username}</span>
            <button class="btn-outline" onclick="logout()">Logout</button>
        `;
  } else {
    // User is not logged in
    authButtons.innerHTML = `
            <button class="btn-outline" onclick="openAuthModal('login')">Login</button>
            <button class="btn-primary" onclick="openAuthModal('register')">Register</button>
        `;
  }
}

function openAuthModal(tab = 'login', role = null) {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  modal.style.display = 'flex';
  switchAuthTab(tab);

  if (role && tab === 'register') {
    const roleSelect = document.getElementById('regRole');
    if (roleSelect) roleSelect.value = role;
  }
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const modalTitle = document.getElementById('authModalTitle');

  if (tab === 'login') {
    loginTab?.classList.add('active');
    registerTab?.classList.remove('active');
    loginForm?.classList.add('active');
    registerForm?.classList.remove('active');
    if (modalTitle) modalTitle.textContent = 'Login';
  } else {
    loginTab?.classList.remove('active');
    registerTab?.classList.add('active');
    loginForm?.classList.remove('active');
    registerForm?.classList.add('active');
    if (modalTitle) modalTitle.textContent = 'Register';
  }
}

async function handleLogin() {
  const username = document.getElementById('loginUsername')?.value;
  const password = document.getElementById('loginPassword')?.value;

  if (!username || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Welcome ${data.username}!`, 'success');
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        role: data.role
      }));
      closeAuthModal();
      checkAuthStatus();

      // Clear login form
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('Login failed. Check server connection.', 'error');
    console.error('Login error:', error);
  }
}

async function handleRegister() {
  const username = document.getElementById('regUsername')?.value;
  const email = document.getElementById('regEmail')?.value;
  const password = document.getElementById('regPassword')?.value;
  const role = document.getElementById('regRole')?.value;

  if (!username || !email || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }

  // Client-side validation
  if (username.length < 3) {
    showToast('Username must be at least 3 characters', 'error');
    return;
  }

  if (!email.includes('@') || (!email.endsWith('.com') && !email.endsWith('.dz'))) {
    showToast('Email must be valid (.com or .dz)', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Registration successful! Please login.', 'success');
      switchAuthTab('login');

      // Clear register form
      document.getElementById('regUsername').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('Registration failed. Check server connection.', 'error');
    console.error('Registration error:', error);
  }
}

function logout() {
  localStorage.removeItem('user');
  checkAuthStatus();
  showToast('Logged out successfully', 'success');
}

// ========== PRICE CALCULATOR ==========
function calculatePrice() {
  const distance = parseFloat(document.getElementById('calcDistance')?.value) || 5;
  const sizeSelect = document.getElementById('calcSize');
  const basePrice = parseFloat(sizeSelect?.value) || 500;
  const priceDisplay = document.querySelector('.price-amount');

  // Simple calculation logic
  const totalPrice = basePrice + (distance * 50);

  if (priceDisplay) {
    priceDisplay.textContent = `${totalPrice} DA`;
    showToast(`Estimated price: ${totalPrice} DA`, 'success');
  }
}

// ========== DELIVERY API FUNCTIONS ==========

async function createDelivery(client_id, pickup_address, dropoff_address, description, price) {
  try {
    const response = await fetch(`${API_BASE}/client/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id,
        pickup_address,
        dropoff_address,
        description_of_order: description,
        price
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Create delivery error:', error);
    return { success: false, message: 'Failed to create delivery' };
  }
}

async function trackDelivery(delivery_id) {
  try {
    const response = await fetch(`${API_BASE}/client/deliveries/track/${delivery_id}`);
    return await response.json();
  } catch (error) {
    console.error('Track delivery error:', error);
    return { success: false, message: 'Failed to track delivery' };
  }
}

async function getMyDeliveries(client_id) {
  try {
    const response = await fetch(`${API_BASE}/client/deliveries/${client_id}`);
    return await response.json();
  } catch (error) {
    console.error('Get deliveries error:', error);
    return { success: false, message: 'Failed to get deliveries' };
  }
}

async function getAvailableDeliveries() {
  try {
    const response = await fetch(`${API_BASE}/deliverer/deliveries/available`);
    return await response.json();
  } catch (error) {
    console.error('Get available deliveries error:', error);
    return { success: false, message: 'Failed to get available deliveries' };
  }
}

async function acceptDelivery(delivery_id, deliverer_id) {
  try {
    const response = await fetch(`${API_BASE}/deliverer/deliveries/accept/${delivery_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverer_id })
    });
    return await response.json();
  } catch (error) {
    console.error('Accept delivery error:', error);
    return { success: false, message: 'Failed to accept delivery' };
  }
}

async function markDelivered(delivery_id) {
  try {
    const response = await fetch(`${API_BASE}/deliverer/deliveries/mark_delivered/${delivery_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('Mark delivered error:', error);
    return { success: false, message: 'Failed to mark as delivered' };
  }
}

// ========== NAVIGATION ==========
function goToHome() {
  window.location.href = '/';
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }
}

// ========== TESTIMONIALS SLIDER ==========
function initTestimonials() {
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.slider-dots .dot');

  if (testimonials.length === 0) return;

  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    if (testimonials[index]) testimonials[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
  }

  // Auto-rotate every 5 seconds
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 5000);

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentTestimonial = index;
      showTestimonial(index);
    });
  });
}

// ========== FAQ ACCORDION ==========
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', function () {
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
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
  const cards = document.querySelectorAll('.card');

  function revealCards() {
    const trigger = window.innerHeight - 100;
    cards.forEach((card, index) => {
      const top = card.getBoundingClientRect().top;
      if (top < trigger) {
        setTimeout(() => {
          card.classList.add('show');
        }, index * 100);
      }
    });
  }

  window.addEventListener('scroll', revealCards);
  window.addEventListener('load', revealCards);
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3000);
}

// ========== DEBUG FUNCTION ==========
async function debugAPI() {
  console.log('🔍 Checking API endpoints...');

  const endpoints = [
    { url: 'http://127.0.0.1:5000/', name: 'Home', method: 'GET' },
    { url: `${API_BASE}/auth/register/`, name: 'Register', method: 'POST', body: { test: true } },
    { url: `${API_BASE}/auth/login/`, name: 'Login', method: 'POST', body: { test: true } },
    { url: `${API_BASE}/admin/users`, name: 'Admin Users', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      const options = { method: endpoint.method };
      if (endpoint.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      console.log(`${endpoint.name} (${response.status}):`, response.ok ? '✅' : '❌');

      if (!response.ok) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`${endpoint.name}: ❌ (${error.message})`);
    }
  }
}

// Make functions globally available
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.calculatePrice = calculatePrice;
window.debugAPI = debugAPI;
window.createDelivery = createDelivery;
window.trackDelivery = trackDelivery;
window.getMyDeliveries = getMyDeliveries;
window.getAvailableDeliveries = getAvailableDeliveries;
window.acceptDelivery = acceptDelivery;
window.markDelivered = markDelivered;
window.goToHome = goToHome;
