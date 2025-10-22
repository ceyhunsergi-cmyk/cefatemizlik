// Cefa Temizlik - Ürünler Sayfası JS

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupFilters();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
    }
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">${product.price} TL</p>
                <button class="btn-primary" onclick="addToCart(${product.id})">Sepete Ekle</button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

function setupFilters() {
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('category-filter');

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        displayProducts(filtered);
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
}

function addToCart(productId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Sepete ürün eklemek için giriş yapmalısınız.');
        window.location.href = 'login.html';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Ürün sepete eklendi!');
    }
}
