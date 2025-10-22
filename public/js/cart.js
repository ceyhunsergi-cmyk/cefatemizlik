// Cefa Temizlik - Sepet Sayfası JS

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

document.addEventListener('DOMContentLoaded', function() {
    displayCart();
    document.getElementById('place-order').addEventListener('click', placeOrder);
});

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Sepetiniz boş.</p>';
        totalPrice.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.quantity} adet x ${item.price} TL</p>
            </div>
            <div>
                <span>${itemTotal} TL</span>
                <button class="btn-danger" onclick="removeFromCart(${index})">Kaldır</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    totalPrice.textContent = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

async function placeOrder() {
    if (!currentUser) {
        alert('Sipariş vermek için giriş yapmalısınız.');
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) {
        alert('Sepetiniz boş.');
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                items: cart
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Siparişiniz başarıyla verildi!');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        } else {
            alert('Sipariş verilirken hata oluştu.');
        }
    } catch (error) {
        console.error('Sipariş hatası:', error);
        alert('Sipariş verilirken hata oluştu.');
    }
}
