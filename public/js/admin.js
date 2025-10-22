// Cefa Temizlik - Admin Paneli JS

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    setupTabs();
    loadProducts();
    loadOrders();
    loadUsers();
    loadPasswordResets();
    loadReports();

    // Form event listeners
    document.getElementById('add-product-form').addEventListener('submit', addProduct);
    document.getElementById('add-user-form').addEventListener('submit', addUser);
    document.getElementById('logout-btn').addEventListener('click', logout);
});

function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => tab.style.display = 'none');
    btns.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName + '-tab').style.display = 'block';
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-list');
    container.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <h4>${product.name}</h4>
            <p>Kategori: ${product.category}</p>
            <p>Fiyat: ${product.price} TL</p>
            <button class="btn-warning" onclick="editProduct(${product.id})">Düzenle</button>
            <button class="btn-danger" onclick="deleteProduct(${product.id})">Sil</button>
        `;
        container.appendChild(productDiv);
    });
}

async function addProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: formData.get('image')
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Ürün başarıyla eklendi!');
            e.target.reset();
            loadProducts();
        } else {
            alert('Ürün eklenirken hata oluştu.');
        }
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        alert('Ürün eklenirken hata oluştu.');
    }
}

async function editProduct(id) {
    const newName = prompt('Yeni ürün adı:');
    const newCategory = prompt('Yeni kategori:');
    const newPrice = prompt('Yeni fiyat:');
    const newDescription = prompt('Yeni açıklama:');
    const newImage = prompt('Yeni resim URL:');

    if (newName && newCategory && newPrice && newDescription) {
        const productData = {
            name: newName,
            category: newCategory,
            price: parseFloat(newPrice),
            description: newDescription,
            image: newImage
        };

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            if (result.success) {
                alert('Ürün başarıyla güncellendi!');
                loadProducts();
            } else {
                alert('Ürün güncellenirken hata oluştu.');
            }
        } catch (error) {
            console.error('Ürün güncelleme hatası:', error);
            alert('Ürün güncellenirken hata oluştu.');
        }
    }
}

async function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                loadProducts();
            } else {
                alert('Ürün silinirken hata oluştu.');
            }
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            alert('Ürün silinirken hata oluştu.');
        }
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    container.innerHTML = '';

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        let itemsHtml = '<ul>';
        order.items.forEach(item => {
            itemsHtml += `<li>${item.name} - ${item.quantity} adet x ${item.price} TL = ${item.quantity * item.price} TL</li>`;
        });
        itemsHtml += '</ul>';
        
        orderDiv.innerHTML = `
            <h4>Sipariş #${order.id}</h4>
            <p>Kullanıcı ID: ${order.userId}</p>
            <p>Ürünler:</p>
            ${itemsHtml}
            <p>Toplam: ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} TL</p>
            <p>Tarih: ${new Date(order.timestamp).toLocaleString('tr-TR')}</p>
            <p>Durum: ${order.status}</p>
        `;
        container.appendChild(orderDiv);
    });
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
    }
}

function displayUsers(users) {
    const container = document.getElementById('users-list');
    container.innerHTML = '';

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <h4>${user.username}</h4>
            <p>Rol: ${user.role}</p>
            <button class="btn-danger" onclick="deleteUser(${user.id})">Sil</button>
        `;
        container.appendChild(userDiv);
    });
}

async function addUser(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Kullanıcı başarıyla eklendi!');
            e.target.reset();
            loadUsers();
        } else {
            alert('Kullanıcı eklenirken hata oluştu.');
        }
    } catch (error) {
        console.error('Kullanıcı ekleme hatası:', error);
        alert('Kullanıcı eklenirken hata oluştu.');
    }
}

async function loadPasswordResets() {
    try {
        const response = await fetch('/api/password-resets');
        const resets = await response.json();
        displayPasswordResets(resets);
    } catch (error) {
        console.error('Şifre talepleri yüklenirken hata:', error);
    }
}

function displayPasswordResets(resets) {
    const container = document.getElementById('resets-list');
    container.innerHTML = '';

    resets.forEach(reset => {
        const resetDiv = document.createElement('div');
        resetDiv.className = 'reset-item';
        resetDiv.innerHTML = `
            <h4>${reset.username}</h4>
            <p>Talep Tarihi: ${new Date(reset.timestamp).toLocaleString('tr-TR')}</p>
        `;
        container.appendChild(resetDiv);
    });
}

async function loadReports() {
    try {
        const ordersResponse = await fetch('/api/orders');
        const usersResponse = await fetch('/api/users');
        const productsResponse = await fetch('/api/products');

        const orders = await ordersResponse.json();
        const users = await usersResponse.json();
        const products = await productsResponse.json();

        const totalSales = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0);
        const totalOrders = orders.length;
        const totalUsers = users.filter(u => u.role === 'user').length;
        const totalProducts = products.length;

        const container = document.getElementById('reports-content');
        container.innerHTML = `
            <p>Toplam Satış: ${totalSales} TL</p>
            <p>Toplam Sipariş: ${totalOrders}</p>
            <p>Toplam Kullanıcı: ${totalUsers}</p>
            <p>Toplam Ürün: ${totalProducts}</p>
        `;
    } catch (error) {
        console.error('Raporlar yüklenirken hata:', error);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
