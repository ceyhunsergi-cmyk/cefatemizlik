// Cefa Temizlik Web Sitesi - Express Sunucusu
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.static('public'));


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Veri dosyaları
const dataDir = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(dataDir, 'users.json');
const PRODUCTS_FILE = path.join(dataDir, 'products.json');
const ORDERS_FILE = path.join(dataDir, 'orders.json');
const PASSWORD_RESETS_FILE = path.join(dataDir, 'passwordResets.json');

// Veri dosyalarını başlat
async function initDataFiles() {
  await fs.ensureDir(path.join(__dirname, 'data'));
  await fs.ensureFile(USERS_FILE);
  await fs.ensureFile(PRODUCTS_FILE);
  await fs.ensureFile(ORDERS_FILE);
  await fs.ensureFile(PASSWORD_RESETS_FILE);

  // Varsayılan admin kullanıcıları
  const defaultUsers = [
    { id: 1, username: 'fatihatay', password: 'fatih0542', role: 'admin' },
    { id: 2, username: 'cemsergi', password: 'cem0542', role: 'admin' },
    { id: 3, username: 'ceyhunsergi', password: 'ceyhun0542', role: 'admin' }
  ];

  if (!(await fs.pathExists(USERS_FILE)) || (await fs.readJson(USERS_FILE, { throws: false })) === null) {
    await fs.writeJson(USERS_FILE, defaultUsers);
  }

  // Varsayılan ürünler
  const defaultProducts = [
    { id: 1, name: 'Çamaşır Deterjanı', category: 'Deterjanlar', price: 25, description: 'Yüksek kaliteli çamaşır deterjanı', image: 'detergent.jpg' },
    { id: 2, name: 'Süpürge', category: 'Süpürgeler', price: 50, description: 'Dayanıklı süpürge', image: 'broom.jpg' },
    { id: 3, name: 'Çöp Kovası', category: 'Çöp Kovaları', price: 30, description: 'Büyük çöp kovası', image: 'trashcan.jpg' },
    { id: 4, name: 'Çöp Poşeti', category: 'Çöp Poşetleri', price: 10, description: 'Paket çöp poşeti', image: 'trashbag.jpg' }
  ];

  if (!(await fs.pathExists(PRODUCTS_FILE)) || (await fs.readJson(PRODUCTS_FILE, { throws: false })) === null) {
    await fs.writeJson(PRODUCTS_FILE, defaultProducts);
  }

  // Diğer dosyalar boş başlat
  if (!(await fs.pathExists(ORDERS_FILE))) {
    await fs.writeJson(ORDERS_FILE, []);
  }
  if (!(await fs.pathExists(PASSWORD_RESETS_FILE))) {
    await fs.writeJson(PASSWORD_RESETS_FILE, []);
  }
}

// API Uç Noktaları

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await fs.readJson(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
  }
});

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const users = await fs.readJson(USERS_FILE);
  if (users.find(u => u.username === username)) {
    res.json({ success: false, message: 'Kullanıcı adı zaten mevcut' });
  } else {
    const newUser = { id: users.length + 1, username, password, role: 'user' };
    users.push(newUser);
    await fs.writeJson(USERS_FILE, users);
    res.json({ success: true, user: newUser });
  }
});

// Şifre sıfırlama talebi
app.post('/api/forgot-password', async (req, res) => {
  const { username } = req.body;
  const resets = await fs.readJson(PASSWORD_RESETS_FILE);
  resets.push({ username, timestamp: new Date().toISOString() });
  await fs.writeJson(PASSWORD_RESETS_FILE, resets);
  res.json({ success: true, message: 'Şifre sıfırlama talebi gönderildi' });
});

// Ürünleri getir
app.get('/api/products', async (req, res) => {
  const products = await fs.readJson(PRODUCTS_FILE);
  res.json(products);
});

// Ürün ekle (admin)
app.post('/api/products', async (req, res) => {
  const { name, category, price, description, image } = req.body;
  const products = await fs.readJson(PRODUCTS_FILE);
  const newProduct = { id: products.length + 1, name, category, price, description, image };
  products.push(newProduct);
  await fs.writeJson(PRODUCTS_FILE, products);
  res.json({ success: true, product: newProduct });
});

// Ürün güncelle (admin)
app.put('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, price, description, image } = req.body;
  let products = await fs.readJson(PRODUCTS_FILE);
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    products[productIndex] = { id, name, category, price, description, image };
    await fs.writeJson(PRODUCTS_FILE, products);
    res.json({ success: true, product: products[productIndex] });
  } else {
    res.json({ success: false, message: 'Ürün bulunamadı' });
  }
});

// Ürün sil (admin)
app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let products = await fs.readJson(PRODUCTS_FILE);
  products = products.filter(p => p.id !== id);
  await fs.writeJson(PRODUCTS_FILE, products);
  res.json({ success: true });
});

// Sipariş oluştur
app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body;
  const orders = await fs.readJson(ORDERS_FILE);
  const newOrder = { id: orders.length + 1, userId, items, status: 'pending', timestamp: new Date().toISOString() };
  orders.push(newOrder);
  await fs.writeJson(ORDERS_FILE, orders);
  res.json({ success: true, order: newOrder });
});

// Siparişleri getir (admin)
app.get('/api/orders', async (req, res) => {
  const orders = await fs.readJson(ORDERS_FILE);
  res.json(orders);
});

// Kullanıcıları getir (admin)
app.get('/api/users', async (req, res) => {
  const users = await fs.readJson(USERS_FILE);
  res.json(users);
});

// Kullanıcı ekle (admin)
app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body;
  const users = await fs.readJson(USERS_FILE);
  const newUser = { id: users.length + 1, username, password, role };
  users.push(newUser);
  await fs.writeJson(USERS_FILE, users);
  res.json({ success: true, user: newUser });
});

// Şifre sıfırlama taleplerini getir (admin)
app.get('/api/password-resets', async (req, res) => {
  const resets = await fs.readJson(PASSWORD_RESETS_FILE);
  res.json(resets);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cefa Temizlik sunucusu port ${PORT} üzerinde çalışıyor.`);
});



