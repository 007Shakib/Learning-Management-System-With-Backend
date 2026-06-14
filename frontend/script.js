const API_BASE = "http://localhost:5000";
const links = document.querySelectorAll(".nav a, .auth a");

links.forEach(link => {
  try {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  } catch (e) {}
});

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem("user");
  window.location.href = new URL('logreg/login.html', _base).href;
}

function updateAuthUI() {
  const user = getStoredUser();
  const authLinks = document.querySelectorAll(".nav a, .auth a");

  authLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    const href = link.getAttribute("href") || "";

    if (user && user.name) {
      if (text === "login" || href.includes("login.html")) {
        link.textContent = user.name;
        link.href = "#";
        link.onclick = () => {
          window.location.href = new URL('dashboard.html', _base).href;
        };
      }

      if (text === "register" || href.includes("register.html")) {
        link.style.display = "none";
      }
    }
  });

  if (user && user.name && !window.location.pathname.endsWith('logout.html')) {
    const authContainer = document.querySelector('.auth');
    if (authContainer && !document.getElementById('logoutLink')) {
      const existingLogout = Array.from(authContainer.querySelectorAll('a')).find(a => a.textContent.toLowerCase().includes('logout'));
      if (existingLogout) {
        existingLogout.id = "logoutLink";
        existingLogout.onclick = (e) => {
          e.preventDefault();
          logoutUser();
        };
        return;
      }

      const logoutBtn = document.createElement("a");
      logoutBtn.id = "logoutLink";
      logoutBtn.href = "#";
      logoutBtn.textContent = "Logout";
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        logoutUser();
      };
      authContainer.appendChild(logoutBtn);
    }
  }
}

function showAuthMessage(message, type = "error") {
  const authMessage = document.getElementById("authMessage");
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function handleLoginForm() {
  const loginForm = document.getElementById("loginForm");
  const user = getStoredUser();

  if (user && window.location.pathname.endsWith('login.html')) {
    window.location.href = new URL('dashboard.html', _base).href;
    return;
  }

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showAuthMessage("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        showAuthMessage(data.message || "Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      saveUser(data);
      window.location.href = new URL('dashboard.html', _base).href;
    } catch (error) {
      showAuthMessage("Connection failed. Is the backend server running?");
      console.error(error);
    }
  });
}

function handleRegisterForm() {
  const registerForm = document.getElementById("registerForm");
  const user = getStoredUser();

  if (user && window.location.pathname.endsWith('register.html')) {
    window.location.href = new URL('dashboard.html', _base).href;
    return;
  }

  if (!registerForm) return;

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const role = document.getElementById("registerRole").value;

    if (!name || !email || !password || !confirmPassword || !role) {
      showAuthMessage("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showAuthMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!response.ok) {
        const data = await response.json();
        showAuthMessage(data.message || "Registration failed. Please try again.");
        return;
      }

      const data = await response.json();
      saveUser(data);
      window.location.href = new URL('dashboard.html', _base).href;
    } catch (error) {
      showAuthMessage("Connection failed. Is the backend server running?");
      console.error(error);
    }
  });
}

function updateDashboard() {
  const greeting = document.getElementById("dashboardGreeting");
  const roleText = document.getElementById("dashboardRole");
  const studentSection = document.getElementById("studentSection");
  const instructorSection = document.getElementById("instructorSection");
  const adminSection = document.getElementById("adminSection");
  const user = getStoredUser();

  const isDashboardPage = greeting || roleText || studentSection || instructorSection || adminSection;
  if (!isDashboardPage) return;

  if (!user) {
    window.location.href = new URL('logreg/login.html', _base).href;
    return;
  }

  if (greeting) {
    greeting.textContent = `Welcome, ${user.name}!`;
  }
  if (roleText) {
    roleText.textContent = `User Type: ${user.role}`;
  }

  if (studentSection) studentSection.style.display = user.role === "Student" || user.role === "Admin" ? "grid" : "none";
  if (instructorSection) instructorSection.style.display = user.role === "Instructor" || user.role === "Admin" ? "grid" : "none";
  if (adminSection) adminSection.style.display = user.role === "Admin" ? "grid" : "none";
}

function initPage() {
  updateAuthUI();
  handleLoginForm();
  handleRegisterForm();
  updateDashboard();
}

const _currentScript = document.querySelector('script[src$="script.js"]');
const _base = _currentScript ? new URL('.', _currentScript.src).href : (window.location.origin + '/');

const particlesConfig = new URL('particles/particles.json', _base).href;
if (window.particlesJS && typeof window.particlesJS.load === 'function') {
  window.particlesJS.load('particles-js', particlesConfig);
}

function goToPage() {
  window.location.href = new URL('tutorial/tutorial.html', _base).href;
}
function goTocss() {
  window.location.href = new URL('tutorial/tutorial.html', _base).href;
}
function goTojs() {
  window.location.href = new URL('tutorial/tutorial.html', _base).href;
}
function goToRegister() {
    window.location.href = new URL('logreg/register.html', _base).href;
}
function goToLogin() {
    window.location.href = new URL('logreg/login.html', _base).href;
}

if (typeof particlesJS === "function") {
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: { value: "#000000" },
      line_linked: {
        enable: true,
        color: "#000000"
      },
      move: { speed: 6 }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    },
    retina_detect: true
  });
}

initPage();
