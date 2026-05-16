const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const JWT_SECRET = 'prevname_secret_key_change_in_prod';

// Use /tmp on Vercel (writable), or local dir otherwise
const DB_DIR = process.env.VERCEL ? '/tmp' : __dirname;
const DB_PATH = path.join(DB_DIR, 'db.json');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            writeDB({ users: [] });
            return { users: [] };
        }
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch { return { users: [] }; }
}

function writeDB(data) {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); } catch {}
}

function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token requis' });
    try {
        const token = header.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch { return res.status(401).json({ error: 'Token invalide' }); }
}

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    if (password.length < 6)
        return res.status(400).json({ error: 'Mot de passe trop court (min 6)' });
    const db = readDB();
    if (db.users.find(u => u.username === username))
        return res.status(400).json({ error: "Nom d'utilisateur déjà pris" });
    if (db.users.find(u => u.email === email))
        return res.status(400).json({ error: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        username, email, password: hash,
        credits: 0,
        createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, credits: user.credits } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, credits: user.credits } });
});

app.get('/api/me', auth, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ id: user.id, username: user.username, email: user.email, credits: user.credits });
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for SPA-like routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Route API inconnue' });
    }
    const filePath = path.join(__dirname, '..', req.path === '/' ? 'index.html' : req.path);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;

// For local dev
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur Prevname démarré sur http://localhost:${PORT}`);
    });
}