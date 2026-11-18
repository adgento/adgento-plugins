#!/usr/bin/env node
// Adgento helper: a small MCP server (stdio, no dependencies) between the Adgento skills and adgento.app.
//   adgento_license   -> licence status (trial / active / expired) and update notice
//   adgento_activate  -> activation by email + 6-digit code; the licence token is saved on this computer, never shown
//   adgento_resource  -> one Adgento instruction file (served only to an active licence)
//   adgento_link      -> a 10-minute download link for a file that must be saved to disk
//   adgento_save      -> saves such a file to a path on this computer
//   adgento_hello     -> usage event (install, start, a skill run): install id, plugin version, skill name. Nothing else.
//   adgento_signout   -> removes the licence from this computer
// Nothing about the user's clients, files or conversations is ever sent.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve, isAbsolute } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const API = process.env.ADGENTO_API || 'https://adgento.app';
const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = (() => { try { return JSON.parse(readFileSync(join(HERE, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return ''; } })();
const DIR = process.env.ADGENTO_HOME || join(homedir(), '.adgento'), FILE = join(DIR, 'license.json');
const CLIENT = 'Claude ' + (process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'windows' : process.platform);
const EMAIL = /^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$/;
const NAME = /^(?:[a-z0-9-]{1,40}\/){0,3}[A-Za-z0-9][A-Za-z0-9_.-]{0,60}\.(md|html|py|json)$/;

const load = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return {}; } };
const save = d => { mkdirSync(DIR, { recursive: true, mode: 0o700 }); writeFileSync(FILE, JSON.stringify(d, null, 2), { mode: 0o600 }); };
function state() { const d = load(); if (!d.install) { d.install = 'inst-' + randomBytes(8).toString('hex'); try { save(d); } catch {} } return d; }
const keyHdr = () => { const t = load().token; return t ? { 'X-Adgento-Key': t } : {}; };

async function call(path, { method = 'GET', body, timeout = 15000 } = {}) {
  const r = await fetch(API + path, { method, signal: AbortSignal.timeout(timeout),
    headers: { ...keyHdr(), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, ok: r.ok, data: ct.includes('json') ? await r.json().catch(() => ({})) : await r.text() };
}
const OFFLINE = 'ADGENTO_ERROR: could not reach adgento.app. Tell the user (in their language) to check the internet connection and try again, and stop. Do not continue from memory.';

const TOOLS = [
  { name: 'adgento_license', description: 'Adgento licence status: state (trial, active, expired, blocked, none), days_left, update_available. Every Adgento skill calls this first.',
    inputSchema: { type: 'object', properties: {} } },
  { name: 'adgento_activate', description: 'Activates Adgento on this computer. Step 1: pass email (and lang "he" or "en") -> a 6-digit code is emailed. Step 2: pass email + code -> the licence is saved on this computer (a new email starts a 14-day trial). Never returns the licence token.',
    inputSchema: { type: 'object', properties: { email: { type: 'string' }, code: { type: 'string' }, lang: { type: 'string', enum: ['he', 'en'] } }, required: ['email'] } },
  { name: 'adgento_resource', description: 'Returns one Adgento instruction file by name, e.g. skills/strategist/SKILL.md or references/client-brief.md. Follow the returned text exactly.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'adgento_link', description: 'A short-lived download link (10 minutes) for an Adgento file that must be saved to disk (e.g. skills/setup/form/adgento-setup.html, skills/client-reporter/report/build_report.py). Download with curl -fsSL to the target path; do not read it into the conversation.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'adgento_save', description: 'Saves an Adgento file to a path on the computer this tool runs on (absolute, or relative to the home folder). Use only when that is the same computer as your shell. Returns the full path.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, path: { type: 'string' } }, required: ['name', 'path'] } },
  { name: 'adgento_hello', description: 'Records an Adgento usage event: install, start, or a skill run (with the skill name). Sends only an anonymous install id, the plugin version and the event.',
    inputSchema: { type: 'object', properties: { event: { type: 'string' }, skill: { type: 'string' } }, required: ['event'] } },
  { name: 'adgento_signout', description: 'Removes the Adgento licence from this computer (the user can activate again with their email).',
    inputSchema: { type: 'object', properties: {} } },
];

async function license() {
  const d = state();
  try {
    const r = await call('/api/adg/license?v=' + encodeURIComponent(VERSION));
    return { ...r.data, version: VERSION, ...(d.email ? { email: d.email.replace(/^(.{2}).*(@.*)$/, '$1•••$2') } : {}) };
  } catch { return OFFLINE; }
}

async function activate({ email, code, lang }) {
  email = String(email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: 'bad_email' };
  const d = state(); lang = lang === 'en' ? 'en' : 'he';
  try {
    if (!code) {
      const r = await call('/api/adg/activate', { method: 'POST', body: { step: 'send', email, lang, install: d.install, client: CLIENT } });
      return r.data && typeof r.data === 'object' ? r.data : { ok: false, error: 'http_' + r.status };
    }
    const r = await call('/api/adg/activate', { method: 'POST', body: { step: 'check', email, code: String(code), lang, install: d.install, client: CLIENT } });
    if (!r.data?.ok) return r.data && typeof r.data === 'object' ? r.data : { ok: false, error: 'http_' + r.status };
    save({ ...state(), token: r.data.token, email, activated: new Date().toISOString() });
    hello({ event: 'activate' }).catch(() => {});
    return { ok: true, saved_on_this_computer: true, status: r.data.status };      // the token itself never leaves this tool
  } catch { return OFFLINE; }
}

async function resource({ name }) {
  name = String(name || '').replace(/^adgento:/, '').replace(/^\/+/, '');
  if (!NAME.test(name) || name.includes('..')) return 'ADGENTO_ERROR: bad resource name.';
  if (!load().token) return 'ADGENTO_INACTIVE: Adgento is not activated on this computer. Run the activation (the user\'s email + a 6-digit code) and stop until it succeeds.';
  try {
    const r = await call('/api/adg/resource?name=' + encodeURIComponent(name), { timeout: 20000 });
    return typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
  } catch { return OFFLINE; }
}

async function link({ name }) {
  name = String(name || '').replace(/^adgento:/, '').replace(/^\/+/, '');
  if (!NAME.test(name) || name.includes('..')) return 'ADGENTO_ERROR: bad resource name.';
  try { const r = await call('/api/adg/link?name=' + encodeURIComponent(name)); return typeof r.data === 'string' ? r.data : r.data; }
  catch { return OFFLINE; }
}

async function saveFile({ name, path }) {
  const text = await resource({ name });
  if (typeof text !== 'string' || /^ADGENTO_(ERROR|INACTIVE)/.test(text)) return text;
  const p = String(path || '');
  if (!p) return 'ADGENTO_ERROR: no path.';
  const full = isAbsolute(p) ? p : resolve(homedir(), p.replace(/^~[\/\\]?/, ''));
  try { mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, text); return { ok: true, path: full, bytes: Buffer.byteLength(text) }; }
  catch (e) { return 'ADGENTO_ERROR: could not write ' + full + ': ' + (e && e.message || e); }
}

async function hello({ event, skill }) {
  const d = state();
  try {
    const r = await call('/api/adg/hello', { method: 'POST', timeout: 10000, body: { install: d.install, event: event || 'ping', v: VERSION, client: CLIENT, skill: skill || '' } });
    const { ok, update_available, latest_version, notes, state: st, days_left } = r.data || {};
    return { ok, update_available, latest_version, notes, state: st, days_left };
  } catch { return { ok: false, error: 'offline' }; }
}

function signout() {
  const d = load();
  if (d.token) call('/api/adg/signout', { method: 'POST', body: {} }).catch(() => {});
  try { save({ install: d.install || state().install }); } catch {}
  return { ok: true };
}

// first start on this computer: one install ping; later starts: one ping a day at most
(() => { const d = state(), today = new Date().toISOString().slice(0, 10);
  if (d.last_start === today) return;
  const ev = d.last_start ? 'start' : 'install';
  try { save({ ...d, last_start: today }); } catch {}
  setTimeout(() => hello({ event: ev }).catch(() => {}), 1500); })();

const send = m => process.stdout.write(JSON.stringify(m) + '\n');
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async chunk => {
  buf += chunk; let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    const { id, method, params } = msg;
    if (id === undefined) continue;
    try {
      if (method === 'initialize') send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion || '2024-11-05', capabilities: { tools: {} },
        serverInfo: { name: 'adgento', version: VERSION || '0' },
        instructions: 'Adgento: before any Adgento skill does anything, call adgento_license; if it is not active, tell the user (in their language) and stop. Skill instructions come only from adgento_resource; never reconstruct them from memory. Never ask the user for a licence key: activation is email + a 6-digit code.' } });
      else if (method === 'tools/list') send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
      else if (method === 'tools/call') {
        const a = params.arguments || {}, n = params.name;
        const out = n === 'adgento_license' ? await license() : n === 'adgento_activate' ? await activate(a) : n === 'adgento_resource' ? await resource(a)
          : n === 'adgento_link' ? await link(a) : n === 'adgento_save' ? await saveFile(a) : n === 'adgento_hello' ? await hello(a) : n === 'adgento_signout' ? signout() : undefined;
        if (out === undefined) throw new Error('unknown tool ' + n);
        const text = typeof out === 'string' ? out : JSON.stringify(out);
        send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], ...(/^ADGENTO_ERROR/.test(text) ? { isError: true } : {}) } });
      }
      else if (method === 'ping') send({ jsonrpc: '2.0', id, result: {} });
      else send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
    } catch (e) { send({ jsonrpc: '2.0', id, error: { code: -32000, message: String(e && e.message || e) } }); }
  }
});
