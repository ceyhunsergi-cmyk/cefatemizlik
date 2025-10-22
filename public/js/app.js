// Cefa Temizlik - Genel Uygulama JS

// Kullanıcı oturum yönetimi
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    updateNavButtons();
});

// Navigasyon butonlarını güncelle
function updateNavButtons() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = 'Çıkış Yap';
            loginBtn.href = '#';
            loginBtn.addEventListener('click', logout);
        } else {
            loginBtn.textContent = 'Giriş Yap';
            loginBtn.href = 'login.html';
        }
    }
}

// Çıkış yap
function logout(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// API çağrıları için yardımcı fonksiyon
async function apiCall(endpoint, options = {}) {
    const response = await fetch(endpoint, options);
    return await response.json();
}
