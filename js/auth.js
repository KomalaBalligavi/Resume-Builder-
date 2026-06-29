// Complete Authentication System for GMU Resume Builder

// ===== LOGIN FUNCTIONALITY =====
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
    }

    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Show password toggle
        const showPassword = document.getElementById('showPassword');
        if (showPassword) {
            showPassword.addEventListener('change', (e) => this.togglePasswordVisibility(e));
        }

        // Demo login for testing
        this.setupDemoLogin();
    }

    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid GMU email address');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showError('Please enter your password');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Simulate API call (replace with actual authentication)
        setTimeout(() => {
            this.authenticateUser(email, password, rememberMe);
        }, 1500);
    }

    validateEmail(email) {
        const gmuEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmu\.edu|masonlive\.gmu\.edu)$/;
        return gmuEmailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    authenticateUser(email, password, rememberMe) {
        // Demo authentication - Replace with actual backend API call
        if (email === 'demo@gmu.edu' && password === 'demo123') {
            this.loginSuccess({
                id: 1,
                email: email,
                username: 'Demo User',
                name: 'Demo User',
                role: 'student',
                gmuId: 'G12345678'
            }, rememberMe);
        } else {
            // Check if user exists in localStorage (for demo purposes)
            const users = JSON.parse(localStorage.getItem('gmuResumeUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.loginSuccess(user, rememberMe);
            } else {
                this.loginFailure('Invalid email or password. Please try again.');
            }
        }
    }

    loginSuccess(userData, rememberMe) {
        // Create session
        const sessionData = {
            ...userData,
            loggedIn: true,
            loginTime: new Date().toISOString(),
            sessionExpiry: rememberMe ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        // Store session
        localStorage.setItem('gmuUserSession', JSON.stringify(sessionData));
        
        // Show success message
        this.showSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    loginFailure(errorMessage) {
        this.setLoadingState(false);
        this.showError(errorMessage);
        
        // Shake animation for error
        const form = document.getElementById('loginForm');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }

    setLoadingState(loading) {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            const btnText = loginBtn.querySelector('.btn-text');
            const btnLoading = loginBtn.querySelector('.btn-loading');
            
            if (loading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
                loginBtn.disabled = true;
            } else {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                loginBtn.disabled = false;
            }
        }
    }

    togglePasswordVisibility(event) {
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.type = event.target.checked ? 'text' : 'password';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;

        const form = document.getElementById('loginForm') || document.getElementById('registerForm');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    checkExistingSession() {
        const session = localStorage.getItem('gmuUserSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expiry = new Date(sessionData.sessionExpiry);
            
            if (now < expiry) {
                window.location.href = 'dashboard.html';
            } else {
                localStorage.removeItem('gmuUserSession');
            }
        }
    }

    setupDemoLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'true') {
            document.getElementById('loginEmail').value = 'demo@gmu.edu';
            document.getElementById('loginPassword').value = 'demo123';
        }
    }
}

// ===== REGISTRATION FUNCTIONALITY =====
class RegistrationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Registration form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }

        // Real-time password validation
        const passwordInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('confirmPassword');
        
        if (passwordInput && confirmInput) {
            passwordInput.addEventListener('input', () => this.validatePassword());
            confirmInput.addEventListener('input', () => this.validatePasswordConfirmation());
        }

        // GMU ID format validation
        const gmuIdInput = document.getElementById('gmuId');
        if (gmuIdInput) {
            gmuIdInput.addEventListener('input', (e) => this.formatGMUId(e));
        }
    }

    handleRegistration(event) {
        event.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const gmuId = document.getElementById('gmuId')?.value.trim() || '';
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validate inputs
        if (!this.validateRegistration(name, email, password, confirmPassword, acceptTerms)) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Simulate API call
        setTimeout(() => {
            this.registerUser(name, email, password, gmuId);
        }, 1500);
    }

    validateRegistration(name, email, password, confirmPassword, acceptTerms) {
        // Name validation
        if (!name || name.length < 2) {
            this.showError('Please enter your full name');
            return false;
        }

        // Email validation
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid GMU email address');
            return false;
        }

        // Password validation
        if (!this.validatePasswordStrength(password)) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        // Password confirmation
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        // Terms acceptance
        if (!acceptTerms) {
            this.showError('Please accept the Terms of Service and Privacy Policy');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const gmuEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmu\.edu|masonlive\.gmu\.edu)$/;
        return gmuEmailRegex.test(email);
    }

    validatePasswordStrength(password) {
        return password.length >= 6;
    }

    validatePassword() {
        const password = document.getElementById('registerPassword').value;
        const requirements = document.querySelector('.password-requirements');
        
        if (requirements) {
            if (password.length < 6) {
                requirements.style.color = '#c62828';
            } else {
                requirements.style.color = '#2e7d32';
            }
        }
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmInput) {
            if (confirmPassword && password !== confirmPassword) {
                confirmInput.style.borderColor = '#c62828';
            } else if (confirmPassword) {
                confirmInput.style.borderColor = '#2e7d32';
            } else {
                confirmInput.style.borderColor = '';
            }
        }
    }

    formatGMUId(event) {
        let value = event.target.value.toUpperCase();
        value = value.replace(/[^A-Z0-9]/g, '');
        
        if (!value.startsWith('G')) {
            value = 'G' + value.replace('G', '');
        }
        
        value = value.substring(0, 9);
        event.target.value = value;
    }

    registerUser(name, email, password, gmuId) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('gmuResumeUsers') || '[]');
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            this.registrationFailure('An account with this email already exists. Please login instead.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            gmuId: gmuId || null,
            role: 'student',
            createdAt: new Date().toISOString(),
            resumes: []
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('gmuResumeUsers', JSON.stringify(users));
        this.registrationSuccess(newUser);
    }

    registrationSuccess(userData) {
        // Create session
        const sessionData = {
            ...userData,
            loggedIn: true,
            loginTime: new Date().toISOString(),
            sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        // Store session
        localStorage.setItem('gmuUserSession', JSON.stringify(sessionData));
        
        // Show success message
        this.showSuccess('Account created successfully! Welcome to GMU Resume Builder.');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    registrationFailure(errorMessage) {
        this.setLoadingState(false);
        this.showError(errorMessage);
        
        const form = document.getElementById('registerForm');
        if (form) {
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }

    setLoadingState(loading) {
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            const btnText = registerBtn.querySelector('.btn-text');
            const btnLoading = registerBtn.querySelector('.btn-loading');
            
            if (loading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
                registerBtn.disabled = true;
            } else {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                registerBtn.disabled = false;
            }
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;

        const form = document.getElementById('registerForm') || document.getElementById('loginForm');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// ===== SHARED FUNCTIONS =====

// GMU SSO Integration (placeholder function)
function loginWithGMU() {
    // This would integrate with GMU's actual Single Sign-On system
    alert('Redirecting to GMU Single Sign-On...\n\nIn a real implementation, this would redirect to GMU SSO.');
    
    // For demo purposes, we'll simulate SSO success
    setTimeout(() => {
        const auth = new AuthSystem();
        auth.loginSuccess({
            id: 2,
            email: 'sso.user@gmu.edu',
            username: 'SSO User',
            name: 'SSO User',
            role: 'student',
            gmuId: 'G87654321',
            sso: true
        }, true);
    }, 2000);
}

// GMU SSO Registration (placeholder function)
function registerWithGMU() {
    // This would integrate with GMU's actual Single Sign-On system
    alert('Redirecting to GMU Single Sign-On...\n\nIn a real implementation, this would redirect to GMU SSO for registration.');
    
    // For demo purposes, we'll simulate SSO registration success
    setTimeout(() => {
        const registration = new RegistrationSystem();
        registration.registrationSuccess({
            id: Date.now(),
            name: 'SSO User',
            email: 'sso.user@gmu.edu',
            role: 'student',
            gmuId: 'G87654321',
            sso: true,
            createdAt: new Date().toISOString(),
            resumes: []
        });
    }, 2000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all user data
        localStorage.removeItem('gmuUserSession');
        localStorage.removeItem('gmuUserResumes');
        localStorage.removeItem('gmuResumeUsers');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Check authentication status
function isAuthenticated() {
    const session = localStorage.getItem('gmuUserSession');
    if (!session) return false;
    
    const sessionData = JSON.parse(session);
    const now = new Date();
    const expiry = new Date(sessionData.sessionExpiry);
    
    return now < expiry;
}

// Get current user data
function getCurrentUser() {
    const session = localStorage.getItem('gmuUserSession');
    return session ? JSON.parse(session) : null;
}

// ===== LOGOUT & SESSION MANAGEMENT =====
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Update user welcome message
    const userWelcome = document.getElementById('userWelcome');
    if (userWelcome) {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.name) {
            userWelcome.textContent = `Welcome, ${currentUser.name}!`;
        } else if (currentUser && currentUser.username) {
            userWelcome.textContent = `Welcome, ${currentUser.username}!`;
        }
    }

    // Check authentication for protected pages
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['builder.html', 'dashboard.html'];
    
    if (protectedPages.includes(currentPage)) {
        if (!isAuthenticated()) {
            alert('Please login to access this page.');
            window.location.href = 'login.html';
            return;
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupLogout();
    
    if (document.getElementById('loginForm')) {
        new AuthSystem();
    } else if (document.getElementById('registerForm')) {
        const session = localStorage.getItem('gmuUserSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expiry = new Date(sessionData.sessionExpiry);
            
            if (now < expiry) {
                window.location.href = 'dashboard.html';
                return;
            }
        }
        
        new RegistrationSystem();
    }
});