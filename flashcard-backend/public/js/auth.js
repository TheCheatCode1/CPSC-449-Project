// Password validation function
function isPasswordValid(password) {
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    if (!isPasswordValid(password)) {
        alert('Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });

    if (res.ok) {
        alert('Registration successful! Please login.');
    } else {
        const error = await res.json();
        alert('Registration failed: ' + error.message);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success && data.data && data.data.user) {
        localStorage.setItem('role', data.data.user.role);
        localStorage.setItem('username', data.data.user.username);

        alert(`Logged in as ${data.data.user.role}`);
        if (data.data.user.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/user.html';
        }
    } else {
        alert('Wrong username or password.');
    }
});

// Show/hide password toggle for registration
const registerPassword = document.getElementById('registerPassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
toggleRegisterPassword.addEventListener('click', () => {
    if (registerPassword.type === 'password') {
        registerPassword.type = 'text';
        toggleRegisterPassword.textContent = '🙈';
    } else {
        registerPassword.type = 'password';
        toggleRegisterPassword.textContent = '👁️';
    }
});

// Show/hide password toggle for login
const loginPassword = document.getElementById('loginPassword');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
toggleLoginPassword.addEventListener('click', () => {
    if (loginPassword.type === 'password') {
        loginPassword.type = 'text';
        toggleLoginPassword.textContent = '🙈';
    } else {
        loginPassword.type = 'password';
        toggleLoginPassword.textContent = '👁️';
    }
}); 