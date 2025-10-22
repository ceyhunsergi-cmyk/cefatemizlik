// Cefa Temizlik - Giriş/Kayıt JS

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    registerLink.addEventListener('click', showRegister);
    loginLink.addEventListener('click', showLogin);
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
});

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            if (result.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş yapılırken hata oluştu.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            showLogin();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        alert('Kayıt olurken hata oluştu.');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const username = prompt('Kullanıcı adınızı girin:');
    if (username) {
        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            alert('Şifre sıfırlama talebi gönderilirken hata oluştu.');
        }
    }
}

function showRegister(e) {
    e.preventDefault();
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
}

function showLogin(e) {
    e.preventDefault();
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}
