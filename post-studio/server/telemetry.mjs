#!/usr/bin/env node
// Post Studio helper: a tiny MCP server (stdio, no dependencies).
//   post_studio_hello     -> tells adgento.app that Post Studio was installed / synced / opened (anonymous install id,
//                            plugin version, and the email only if the user chose to give it)
//   post_studio_resource  -> fetches the skills' instructions from adgento.app (they are not kept in the public plugin)
// Nothing about the user's posts, brands or files is ever sent.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const API = process.env.POST_STUDIO_API || 'https://adgento.app';
const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = (() => { try { return JSON.parse(readFileSync(join(HERE, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return ''; } })();
const DIR = join(homedir(), '.post-studio'), FILE = join(DIR, 'install.json');
const load = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return {}; } };
const save = d => { try { mkdirSync(DIR, { recursive: true }); writeFileSync(FILE, JSON.stringify(d, null, 2), { mode: 0o600 }); } catch {} };
function state() { const d = load(); if (!d.install) { d.install = 'inst-' + randomBytes(8).toString('hex'); save(d); } return d; }

const TOOLS = [
  { name: 'post_studio_hello', description: 'Check in with adgento.app (anonymous install id + plugin version; the email only if the user gave it). event: install, sync, open, post or export. Returns update_available and latest_version.',
    inputSchema: { type: 'object', properties: { event: { type: 'string', enum: ['install', 'sync', 'open', 'post', 'export'] }, email: { type: 'string', description: 'Optional: the email the user signed up with, only if they chose to give it.' } }, required: ['event'] } },
  { name: 'post_studio_resource', description: 'Fetch one of the Post Studio skills\' instruction files from adgento.app (install.md, sync.md, create-brand.md, contract.md, example-starter.md, unlock.json). Returns the text.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
];

async function hello({ event, email }) {
  const d = state();
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { d.email = String(email).trim().toLowerCase(); save(d); }
  try {
    const r = await fetch(API + '/api/ps/hello', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ install: d.install, event: event || 'ping', v: VERSION, client: 'Claude desktop', email: d.email || '' }) });
    return { http: r.status, ...(await r.json().catch(() => ({}))) };
  } catch (e) { return { ok: false, error: 'offline' }; }
}
async function resource({ name }) {
  if (!/^[a-z0-9-]{2,40}\.(md|json)$/.test(String(name || ''))) return { error: 'bad_name' };
  try {
    const r = await fetch(API + '/api/ps/resource?name=' + encodeURIComponent(name), { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { error: r.status === 404 ? 'not_found' : 'http_' + r.status };
    return { text: await r.text() };
  } catch (e) { return { error: 'offline' }; }
}

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
      if (method === 'initialize') send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'post-studio', version: VERSION || '0' } } });
      else if (method === 'tools/list') send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
      else if (method === 'tools/call') {
        const a = params.arguments || {};
        const out = params.name === 'post_studio_hello' ? await hello(a) : params.name === 'post_studio_resource' ? await resource(a) : null;
        if (!out) throw new Error('unknown tool ' + params.name);
        send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: out.text !== undefined ? out.text : JSON.stringify(out) }] } });
      }
      else if (method === 'ping') send({ jsonrpc: '2.0', id, result: {} });
      else send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
    } catch (e) { send({ jsonrpc: '2.0', id, error: { code: -32000, message: String(e && e.message || e) } }); }
  }
});
