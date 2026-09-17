const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const dataDir = process.env.ORBIT_DATA_DIR || path.join(root, 'data');
const dataFile = path.join(dataDir, 'waitlist.json');
const tasksFile = path.join(dataDir, 'tasks.json');
const port = Number(process.env.PORT || 4173);
fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]');
if (!fs.existsSync(tasksFile)) fs.writeFileSync(tasksFile, '[]');

function readWaitlist() { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
function readTasks() { return JSON.parse(fs.readFileSync(tasksFile, 'utf8')); }
function parseJson(req, callback) {
  let raw = '';
  req.on('data', chunk => { raw += chunk; if (raw.length > 10000) req.destroy(); });
  req.on('end', () => { try { callback(null, JSON.parse(raw)); } catch { callback(new Error('invalid request')); } });
}
function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}
function safeFile(urlPath) {
  const requested = urlPath === '/' ? 'landing.html' : urlPath.slice(1);
  const file = path.resolve(root, requested);
  return file.startsWith(root) ? file : null;
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/signup') {
    parseJson(req, (error, input) => {
      try {
        if (error) throw error;
        const email = String(input.email || '').trim().toLowerCase();
        const name = String(input.name || '').trim().slice(0, 80);
        const referral = String(input.referral || '').trim().slice(0, 40);
        if (!/^\S+@\S+\.\S+$/.test(email)) return send(res, 422, { error: 'valid email required' });
        const waitlist = readWaitlist();
        const existing = waitlist.find(person => person.email === email);
        if (existing) return send(res, 200, { ok: true, position: waitlist.indexOf(existing) + 1, existing: true });
        waitlist.push({ id: crypto.randomUUID(), email, name, referral, createdAt: new Date().toISOString() });
        fs.writeFileSync(dataFile, JSON.stringify(waitlist, null, 2));
        return send(res, 201, { ok: true, position: waitlist.length, existing: false });
      } catch { return send(res, 400, { error: 'invalid request' }); }
    });
    return;
  }
  if (req.method === 'GET' && req.url === '/api/stats') return send(res, 200, { count: readWaitlist().length, goal: 100 });
  if (req.method === 'GET' && req.url === '/api/tasks') return send(res, 200, readTasks());
  if (req.method === 'GET' && req.url === '/api/agents') {
    const tasks = readTasks();
    const names = ['Scout', 'Storyteller', 'Connector', 'Analyst', 'Operator'];
    return send(res, 200, names.map(name => ({ name, tasks: tasks.filter(task => task.agent === name).length, active: tasks.filter(task => task.agent === name && !['done', 'blocked'].includes(task.status)).length })));
  }
  if (req.method === 'POST' && req.url === '/api/tasks') {
    parseJson(req, (error, input) => {
      if (error) return send(res, 400, { error: 'invalid request' });
      const allowed = ['Scout', 'Storyteller', 'Connector', 'Analyst', 'Operator'];
      const agent = String(input.agent || '').trim();
      const title = String(input.title || '').trim().slice(0, 160);
      const channel = String(input.channel || '').trim().slice(0, 60);
      if (!allowed.includes(agent) || !title) return send(res, 422, { error: 'agent and title are required' });
      const tasks = readTasks();
      const task = { id: crypto.randomUUID(), agent, title, channel, status: 'queued', requiresApproval: agent !== 'Analyst', createdAt: new Date().toISOString() };
      tasks.push(task);
      fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
      return send(res, 201, task);
    });
    return;
  }
  if (req.method === 'PATCH' && req.url.startsWith('/api/tasks/')) {
    const id = req.url.slice('/api/tasks/'.length).split('?')[0];
    parseJson(req, (error, input) => {
      if (error) return send(res, 400, { error: 'invalid request' });
      const statuses = ['queued', 'working', 'review', 'done', 'blocked'];
      if (!statuses.includes(input.status)) return send(res, 422, { error: 'invalid status' });
      const tasks = readTasks();
      const task = tasks.find(item => item.id === id);
      if (!task) return send(res, 404, { error: 'task not found' });
      task.status = input.status;
      task.updatedAt = new Date().toISOString();
      fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
      return send(res, 200, task);
    });
    return;
  }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true, service: 'orbit' });
  const file = safeFile((req.url || '/').split('?')[0]);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: 'not found' });
  const ext = path.extname(file);
  const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' }[ext] || 'application/octet-stream';
  send(res, 200, fs.readFileSync(file), type);
});

server.listen(port, '127.0.0.1', () => console.log(`Orbit listening on http://127.0.0.1:${port}`));
