import {createAcquisitionCollector} from './btw-acquisition.mjs';
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// meta-capi.mjs
var BRANDS = Object.freeze({ retrozap: { pixel: "1522604139713675", origin: "https://retrozap.com.br", prefix: "retrozap-venda:" }, quiddo: { pixel: "39663521416595790", origin: "https://www.quiddo.com.br", prefix: "quiddo:purchase:" }, sportdna: { pixel: "1109514848506414", origin: "https://sportdna.com.br", prefix: "sportdna:purchase:" } });
async function hash(value) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hash, "hash");
function consentContext(raw, now = Date.now()) {
  if (raw?.marketing !== true || raw.version !== 1 || !Number.isFinite(raw.at) || raw.at > now || now - raw.at > 180 * 864e5) return null;
  if (typeof raw.subject !== "string" || !/^[a-f0-9-]{36}$/.test(raw.subject)) return null;
  const c = { marketing: true, version: 1, at: raw.at, subject: raw.subject };
  for (const key of ["fbp", "fbc"]) if (typeof raw[key] === "string" && /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/.test(raw[key])) c[key] = raw[key];
  return c;
}
__name(consentContext, "consentContext");
var initialized = /* @__PURE__ */ new WeakMap();
async function schema(db) {
  if (initialized.has(db)) return initialized.get(db);
  const init = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS btw_meta_consent (id TEXT PRIMARY KEY, brand TEXT NOT NULL, context TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS btw_meta_outbox (id TEXT PRIMARY KEY, brand TEXT NOT NULL, payload TEXT NOT NULL, created INTEGER NOT NULL, next_try INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL DEFAULT 'pending', lease INTEGER NOT NULL DEFAULT 0, last_status INTEGER, error_code INTEGER)")
  ]);
  initialized.set(db, init);
  try {
    await init;
  } catch (error) {
    initialized.delete(db);
    throw error;
  }
}
__name(schema, "schema");
async function revoke(db, brand, subject) {
  if (!BRANDS[brand] || typeof subject !== "string" || !/^[a-f0-9-]{36}$/.test(subject)) return;
  await schema(db);
  await db.prepare("UPDATE btw_meta_consent SET revoked=1 WHERE brand=? AND json_extract(context,'$.subject')=?").bind(brand, subject).run();
  await db.prepare("UPDATE btw_meta_outbox SET state='revoked',payload='{}' WHERE state='pending' AND id IN (SELECT id FROM btw_meta_consent WHERE brand=? AND revoked=1)").bind(brand).run();
}
__name(revoke, "revoke");
async function payload(brand, sale, context) {
  const b = BRANDS[brand], c = consentContext(context);
  if (!b || !c || sale?.paid !== true || sale.live !== true || sale.free === true || typeof sale.id !== "string" || !sale.id || !Number.isSafeInteger(sale.cents) || sale.cents <= 0 || !Number.isFinite(sale.paidAt) || sale.paidAt > Date.now() + 6e4 || Date.now() - sale.paidAt > 7 * 864e5) return null;
  const user_data = {};
  if (c.fbp) user_data.fbp = c.fbp;
  if (c.fbc) user_data.fbc = c.fbc;
  if (sale.emailMatching === true && /^[a-f0-9]{64}$/.test(context?.em || "")) user_data.em = [context.em];
  if (sale.emailMatching === true && typeof sale.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sale.email.trim())) user_data.em = [await hash(sale.email.trim().toLowerCase())];
  if (!Object.keys(user_data).length) return null;
  return { event_name: "Purchase", event_time: Math.floor(sale.paidAt / 1e3), event_id: await hash(b.prefix + sale.id), action_source: "website", event_source_url: b.origin + "/", user_data, custom_data: { value: sale.cents / 100, currency: "BRL" } };
}
__name(payload, "payload");
async function enqueue(db, brand, sale) {
  await schema(db);
  const row = await db.prepare("SELECT * FROM btw_meta_consent WHERE id=? AND brand=? AND revoked=0").bind(sale.id, brand).first();
  if (!row || row.created > sale.paidAt) return false;
  const event = await payload(brand, sale, JSON.parse(row.context));
  if (!event) return false;
  await db.prepare("INSERT OR IGNORE INTO btw_meta_outbox(id,brand,payload,created,next_try) VALUES (?,?,?,?,?)").bind(sale.id, brand, JSON.stringify(event), Date.now(), Date.now()).run();
  return true;
}
__name(enqueue, "enqueue");
async function drain(db, env, brand, fetcher = fetch) {
  const b = BRANDS[brand];
  if (!b || env.META_CAPI_ENABLED !== "true" || !env.META_CAPI_TOKEN || !/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION || "")) return;
  await schema(db);
  const now = Date.now();
  await db.prepare("UPDATE btw_meta_outbox SET state='expired',payload='{}' WHERE state='pending' AND (created<? OR json_extract(payload,'$.event_time')<?)").bind(now - 864e5, Math.floor((now - 864e5) / 1e3)).run();
  const rows = await db.prepare("SELECT o.* FROM btw_meta_outbox o JOIN btw_meta_consent c ON c.id=o.id AND c.brand=o.brand WHERE o.brand=? AND o.state='pending' AND o.next_try<=? AND o.lease<? AND c.revoked=0 ORDER BY o.next_try,o.created LIMIT 2").bind(brand, now, now).all();
  for (const row of rows.results || []) {
    const lock = await db.prepare("UPDATE btw_meta_outbox SET lease=?,attempts=attempts+1 WHERE id=? AND state='pending' AND lease<?").bind(now + 6e4, row.id, now).run();
    if (!lock.meta?.changes) continue;
    const consent = await db.prepare("SELECT revoked FROM btw_meta_consent WHERE id=?").bind(row.id).first();
    if (consent?.revoked !== 0) continue;
    try {
      const body = { data: [JSON.parse(row.payload)] };
      const response = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${b.pixel}/events`, { method: "POST", headers: { Authorization: "Bearer " + env.META_CAPI_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(1e4) });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.events_received === 1) {
        await db.prepare("UPDATE btw_meta_outbox SET state='sent',payload='{}',lease=0,last_status=200,error_code=NULL WHERE id=?").bind(row.id).run();
      } else {
        const terminal = response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
        await db.prepare("UPDATE btw_meta_outbox SET state=?,next_try=?,lease=0,last_status=?,error_code=? WHERE id=?").bind(terminal ? "rejected" : "pending", now + Math.min(36e5, 3e4 * 2 ** Math.min(row.attempts, 7)), response.status, Number.isInteger(result?.error?.code) ? result.error.code : null, row.id).run();
      }
    } catch {
      await db.prepare("UPDATE btw_meta_outbox SET next_try=?,lease=0 WHERE id=?").bind(now + Math.min(36e5, 3e4 * 2 ** Math.min(row.attempts, 7)), row.id).run();
    }
  }
  await db.prepare("UPDATE btw_meta_outbox SET payload='{}' WHERE created<?").bind(now - 7 * 864e5).run();
  await db.prepare("DELETE FROM btw_meta_consent WHERE created<?").bind(now - 7 * 864e5).run();
}
__name(drain, "drain");

// meta-probe.mjs
async function probeMeta(env, brand, fetcher = fetch) {
  if (!BRANDS[brand] || env.META_CAPI_ENABLED !== "true" || !env.META_CAPI_TOKEN || !/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION || "") || !/^TEST[0-9]{1,20}$/.test(env.META_CAPI_TEST_CODE || "")) return;
  try {
    const db = env.DB, now = Date.now(), id = await hash(brand + ":test:" + env.META_CAPI_TEST_CODE);
    await db.prepare("CREATE TABLE IF NOT EXISTS btw_meta_probe (id TEXT PRIMARY KEY,brand TEXT NOT NULL,created INTEGER NOT NULL,checked INTEGER,lease INTEGER NOT NULL DEFAULT 0,state TEXT NOT NULL DEFAULT 'pending',http_status INTEGER,events_received INTEGER,error_code INTEGER)").run();
    await db.prepare("INSERT OR IGNORE INTO btw_meta_probe(id,brand,created) VALUES (?,?,?)").bind(id, brand, now).run();
    const row = await db.prepare("SELECT * FROM btw_meta_probe WHERE id=?").bind(id).first();
    if (row.state !== "pending" || row.lease >= now) return;
    if (now - row.created > 864e5) {
      await db.prepare("UPDATE btw_meta_probe SET state='expired' WHERE id=?").bind(id).run();
      return;
    }
    const lock = await db.prepare("UPDATE btw_meta_probe SET lease=? WHERE id=? AND state='pending' AND lease<?").bind(now + 6e4, id, now).run();
    if (!lock.meta?.changes) return;
    const event = await payload(brand, { id: "capi-test:" + id, paid: true, live: true, cents: 1, paidAt: row.created, email: "capi-test@example.invalid", emailMatching: true }, { subject: "00000000-0000-4000-8000-000000000001", marketing: true, version: 1, at: row.created });
    try {
      const response = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${BRANDS[brand].pixel}/events`, { method: "POST", headers: { Authorization: "Bearer " + env.META_CAPI_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify({ data: [event], test_event_code: env.META_CAPI_TEST_CODE }), signal: AbortSignal.timeout(1e4) });
      const result = await response.json().catch(() => null), received = Number.isInteger(result?.events_received) ? result.events_received : 0;
      const terminal = response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
      await db.prepare("UPDATE btw_meta_probe SET checked=?,lease=0,state=?,http_status=?,events_received=?,error_code=? WHERE id=?").bind(Date.now(), response.ok && received === 1 ? "accepted" : terminal ? "rejected" : "pending", response.status, received, Number.isInteger(result?.error?.code) ? result.error.code : null, id).run();
    } catch {
      await db.prepare("UPDATE btw_meta_probe SET checked=?,lease=0 WHERE id=?").bind(Date.now(), id).run();
    }
  } catch {
    console.warn("meta_connection_check_failed");
  }
}
__name(probeMeta, "probeMeta");

// meta-adapter.mjs
async function runMeta(env) {
  if (env.META_CAPI_ENABLED !== "true") return;
  try {
    await schema(env.DB);
    const rows = await env.DB.prepare("SELECT p.ref id,p.valor value,p.email email,p.pago paid_at FROM compras p JOIN btw_meta_consent c ON c.id=p.ref WHERE c.brand='retrozap' AND c.revoked=0 AND p.status='pago' AND p.modo='ligada' AND CAST(p.valor AS REAL)>0 AND NOT EXISTS (SELECT 1 FROM btw_meta_outbox o WHERE o.id=p.ref) ORDER BY c.created LIMIT 2").all();
    for (const r of rows.results || []) await enqueue(env.DB, "retrozap", { id: r.id, paid: true, live: true, free: false, cents: Math.round(Number(r.value) * 100), paidAt: typeof r.paid_at === "string" ? Date.parse(r.paid_at) : r.paid_at, email: r.email, emailMatching: env.META_EMAIL_MATCHING === "true" });
    await env.DB.prepare("UPDATE btw_meta_outbox SET state='revoked',payload='{}' WHERE state='pending' AND id NOT IN (SELECT id FROM (SELECT p.ref id,p.valor value,p.email email,p.pago paid_at FROM compras p JOIN btw_meta_consent c ON c.id=p.ref WHERE c.brand='retrozap' AND c.revoked=0 AND p.status='pago' AND p.modo='ligada' AND CAST(p.valor AS REAL)>0))").run();
    await drain(env.DB, env, "retrozap");
  } catch {
    console.warn("meta_delivery_check_failed");
  }
}
__name(runMeta, "runMeta");
async function metaRoute(request, env) {
  if (request.method !== "POST" || new URL(request.url).pathname !== "/api/meta/revoke") return null;
  const origin = request.headers.get("Origin");
  if (!["https://retrozap.com.br", "https://www.retrozap.com.br"].includes(origin)) return new Response(null, { status: 403 });
  if (Number(request.headers.get("Content-Length") || 0) > 2048) return new Response(null, { status: 413 });
  try {
    const text = await request.text();
    if (text.length > 2048) return new Response(null, { status: 413 });
    const body = JSON.parse(text);
    await revoke(env.DB, "retrozap", body.subject);
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Vary": "Origin" } });
  } catch {
    return new Response(null, { status: 400 });
  }
}
__name(metaRoute, "metaRoute");

// functions/api/stats.js
var MIN_TIPO = 30;
var MIN_TODOS = 10;
var MIN_CASAL = 30;
var MODOS = ["amigos", "familia", "trabalho", "comunidade", "casal"];
var CAMPOS = {
  total: [20, 5e6],
  por_dia: [0, 1e5],
  recorde: [1, 1e5],
  audios: [0, 5e6],
  figurinhas: [0, 5e6],
  membros: [2, 5e3],
  dias: [1, 2e4],
  risadas: [0, 100],
  madrugada: [0, 100],
  fora: [0, 100],
  // % das mensagens
  palavrao: [0, 1e4],
  furos: [0, 1e4],
  bomdia: [0, 1e4],
  parabens: [0, 1e4],
  apagadas: [0, 1e4],
  // a cada mil mensagens
  textao: [0, 1e4],
  // caracteres por mensagem
  amor: [0, 1e4],
  coracoes: [0, 1e4]
  // casal: 'te amo' a cada mil textos, corações a cada 100 mensagens
};
var prontoDB = false;
var semeado = false;
var EST_ATE = 30;
var RESUMO_MS = 4 * 36e5;
var QN = 200;
async function prepara(env, cols) {
  if (prontoDB) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS grupos (id TEXT PRIMARY KEY, modo TEXT NOT NULL, criado TEXT NOT NULL, ${cols.map((k) => k + " REAL").join(", ")})`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS grupos_modo ON grupos (modo)`).run();
  for (const k of ["amor REAL", "coracoes REAL", "base TEXT", "estimado INTEGER", "hist_total REAL", "hist_audios REAL"]) try {
    await env.DB.prepare(`ALTER TABLE grupos ADD COLUMN ${k}`).run();
  } catch {
  }
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS resumos (chave TEXT PRIMARY KEY, criado INTEGER, dados TEXT)").run();
  prontoDB = true;
}
__name(prepara, "prepara");
async function semeia(env, cols, base) {
  if (semeado || base !== "2026") return;
  semeado = true;
  if (await env.DB.prepare("SELECT 1 FROM resumos WHERE chave = 'semeado'").first()) return;
  const d = Math.max(1, Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 864e5)), vol = `MIN(1.0, por_dia * MIN(dias, ${d}) / MAX(total, 1))`;
  const expr = { total: `ROUND(por_dia * MIN(dias, ${d}))`, audios: `ROUND(audios * ${vol})`, figurinhas: `ROUND(figurinhas * ${vol})`, amor: "NULL", coracoes: "NULL" };
  const fonte = `FROM grupos WHERE COALESCE(base, '') = '' AND COALESCE(estimado, 0) = 0 AND modo != 'casal' AND por_dia * MIN(dias, ${d}) >= 20`;
  await env.DB.prepare(`INSERT OR IGNORE INTO grupos (id, modo, criado, base, estimado, ${cols.join(", ")}) SELECT id || '~e', modo, criado, '2026', 1, ${cols.map((k) => expr[k] || k).join(", ")} ${fonte}`).run();
  await env.DB.prepare(`INSERT OR IGNORE INTO grupos (id, modo, criado, base, estimado, ${cols.join(", ")}) SELECT id || '~c', 'casal', criado, '2026', 1, ${cols.map((k) => k === "membros" ? "2" : expr[k] || k).join(", ")} ${fonte}`).run();
  await env.DB.prepare("INSERT OR REPLACE INTO resumos (chave, criado, dados) VALUES ('semeado', ?, '{}')").bind(Date.now()).run();
}
__name(semeia, "semeia");
var cortes = /* @__PURE__ */ __name((vals) => vals.length <= 2 * QN ? vals : Array.from({ length: QN + 1 }, (_, i) => vals[Math.round(i * (vals.length - 1) / QN)]), "cortes");
function acima(q, n, v) {
  let lo = 0, hi = q.length;
  while (lo < hi) {
    const m = lo + hi >> 1;
    if (q[m] <= v) lo = m + 1;
    else hi = m;
  }
  return q.length === n ? n - lo : Math.round(n * (1 - lo / q.length));
}
__name(acima, "acima");
async function resumo(env, base, escopo, modo2) {
  const chave = `${base}|${escopo}|${modo2}`;
  const r = await env.DB.prepare("SELECT criado, dados FROM resumos WHERE chave = ?").bind(chave).first();
  if (r) {
    const dd2 = JSON.parse(r.dados);
    if (Date.now() - r.criado < (dd2.n < 200 ? 10 * 6e4 : RESUMO_MS)) return dd2;
  }
  const onde = escopo === "tipo" ? "modo = ?" : "modo != ?", arg = escopo === "tipo" ? modo2 : "casal";
  const rows = (await env.DB.prepare(`SELECT ${COMPARA.join(", ")}, COALESCE(estimado, 0) AS est FROM grupos WHERE ${onde} AND COALESCE(base, '') = ?`).bind(arg, base).all()).results || [];
  const reais = rows.filter((x) => !x.est).length, est = modo2 !== "casal" && reais < EST_ATE, conj = est ? rows : rows.filter((x) => !x.est), m = {};
  for (const k of COMPARA) {
    if (k === "dias") continue;
    const vals = conj.map((x) => x[k]).filter((v) => v != null).sort((a, b) => a - b);
    m[k] = { n: vals.length, q: cortes(vals), media: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  }
  let dd = ((await env.DB.prepare(`SELECT dias FROM grupos WHERE ${onde} AND COALESCE(estimado, 0) = 0`).bind(arg).all()).results || []).map((x) => x.dias).filter((v) => v != null);
  if (dd.length < MIN_TODOS && modo2 !== "casal") dd = ((await env.DB.prepare(`SELECT dias FROM grupos WHERE ${onde}`).bind(arg).all()).results || []).map((x) => x.dias).filter((v) => v != null);
  dd.sort((a, b) => a - b);
  m.dias = { n: dd.length, q: cortes(dd) };
  for (const [k, antigo] of [["hist_total", "total"], ["hist_audios", "audios"]]) {
    const hv = ((await env.DB.prepare(`SELECT COALESCE(${k}, CASE WHEN COALESCE(base, '') = '' THEN ${antigo} END) AS v FROM grupos WHERE ${onde} AND COALESCE(estimado, 0) = 0`).bind(arg).all()).results || []).map((x) => x.v).filter((v) => v != null).sort((a, b) => a - b);
    m[k] = { n: hv.length, q: cortes(hv) };
  }
  const dados2 = { n: conj.length, est, m };
  await env.DB.prepare("INSERT OR REPLACE INTO resumos (chave, criado, dados) VALUES (?, ?, ?)").bind(chave, Date.now(), JSON.stringify(dados2)).run();
  return dados2;
}
__name(resumo, "resumo");
var COMPARA = Object.keys(CAMPOS).filter((k) => k !== "membros");
var HIST = ["hist_total", "hist_audios"];
var SEM_TIPO = ["audios", "figurinhas"];
var resposta = /* @__PURE__ */ __name((obj, status2 = 200) => new Response(JSON.stringify(obj), { status: status2, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "resposta");
async function onRequestPost({ request, env }) {
  if (!env.DB) return resposta({ pronto: false, motivo: "sem_banco" });
  if (env.RANKING === "desligado") return resposta({ pronto: false, motivo: "desligado" });
  let c;
  try {
    c = await request.json();
  } catch {
    return resposta({ error: "bad_request" }, 400);
  }
  const id = String(c?.id || "");
  if (!/^[a-f0-9]{32}$/.test(id) || !MODOS.includes(c?.modo)) return resposta({ error: "bad_request" }, 400);
  const v = {};
  for (const [k, [min, max]] of Object.entries(CAMPOS)) {
    if (c[k] === null && SEM_TIPO.includes(k)) {
      v[k] = null;
      continue;
    }
    const n2 = Number(c[k] ?? 0);
    if (!Number.isFinite(n2) || n2 < min || n2 > max) return resposta({ error: "bad_request", campo: k }, 400);
    v[k] = n2;
  }
  const cols = Object.keys(CAMPOS);
  await prepara(env, cols);
  for (const k of HIST) {
    const n2 = Number(c[k]);
    v[k] = Number.isFinite(n2) && n2 >= 0 && n2 <= 5e7 ? n2 : null;
  }
  const base = /^20\d\d$/.test(String(c.base || "")) ? String(c.base) : "";
  let R = await resumo(env, base, "tipo", c.modo), escopo = "tipo";
  if (c.modo !== "casal" && R.n + 1 < MIN_TIPO) {
    R = await resumo(env, base, "todos", "grupos");
    escopo = "todos";
  }
  const n = R.n + 1, est = R.est;
  await env.DB.prepare(`INSERT OR REPLACE INTO grupos (id, modo, criado, base, ${[...cols, ...HIST].join(", ")}) VALUES (?, ?, ?, ?, ${[...cols, ...HIST].map(() => "?").join(", ")})`).bind(id, c.modo, (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), base, ...cols.map((k) => v[k]), ...HIST.map((k) => v[k])).run();
  await env.DB.prepare("DELETE FROM grupos WHERE id = ?").bind(id + "~e").run();
  await semeia(env, cols, base);
  if (n < (c.modo === "casal" ? MIN_CASAL : escopo === "tipo" ? MIN_TIPO : MIN_TODOS)) return resposta({ pronto: false, n });
  const top = {}, media = {};
  for (const k of [...COMPARA, ...HIST]) {
    const mk = R.m[k];
    if (!mk || v[k] == null) continue;
    const nk = mk.n + 1;
    if (nk >= MIN_TODOS) top[k] = v[k] > 0 ? Math.max(1, Math.ceil((acima(mk.q, mk.n, v[k]) + 1) / nk * 100)) : 100;
    if (k !== "dias" && mk.n >= MIN_TODOS && mk.media != null) media[k] = Math.round(mk.media * 100) / 100;
  }
  return resposta({ pronto: true, n, top, media, escopo, estimado: est });
}
__name(onRequestPost, "onRequestPost");

// functions/api/ideias.js
var resposta2 = /* @__PURE__ */ __name((obj, status2 = 200) => new Response(JSON.stringify(obj), { status: status2, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "resposta");
var TIPOS = ["premio", "recurso", "problema", "outro", "novidades"];
async function onRequestPost2({ request, env }) {
  let c;
  try {
    c = await request.json();
  } catch {
    return resposta2({ error: "bad_request" }, 400);
  }
  if (c?.site) return resposta2({ ok: true });
  const tipo = TIPOS.includes(c?.tipo) ? c.tipo : "outro";
  const texto = String(c?.texto || "").trim().slice(0, 600), contato = String(c?.contato || "").trim().slice(0, 120);
  if (texto.length < 5) return resposta2({ error: "bad_request" }, 400);
  if (!env.DB) return resposta2({ error: "sem_banco" }, 503);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS ideias (id INTEGER PRIMARY KEY AUTOINCREMENT, criado TEXT NOT NULL, tipo TEXT, texto TEXT NOT NULL, contato TEXT)").run();
  await env.DB.prepare("INSERT INTO ideias (criado, tipo, texto, contato) VALUES (?, ?, ?, ?)").bind((/* @__PURE__ */ new Date()).toISOString(), tipo, texto, contato).run();
  return resposta2({ ok: true });
}
__name(onRequestPost2, "onRequestPost");

// functions/api/meta-capi.mjs
var BRANDS2 = Object.freeze({ retrozap: { pixel: "1522604139713675", origin: "https://retrozap.com.br", prefix: "retrozap-venda:" }, quiddo: { pixel: "39663521416595790", origin: "https://www.quiddo.com.br", prefix: "quiddo:purchase:" }, sportdna: { pixel: "1109514848506414", origin: "https://sportdna.com.br", prefix: "sportdna:purchase:" } });
function consentContext2(raw, now = Date.now()) {
  if (raw?.marketing !== true || raw.version !== 1 || !Number.isFinite(raw.at) || raw.at > now || now - raw.at > 180 * 864e5) return null;
  if (typeof raw.subject !== "string" || !/^[a-f0-9-]{36}$/.test(raw.subject)) return null;
  const c = { marketing: true, version: 1, at: raw.at, subject: raw.subject };
  for (const key of ["fbp", "fbc"]) if (typeof raw[key] === "string" && /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/.test(raw[key])) c[key] = raw[key];
  return c;
}
__name(consentContext2, "consentContext");
var initialized2 = /* @__PURE__ */ new WeakMap();
async function schema2(db) {
  if (initialized2.has(db)) return initialized2.get(db);
  const init = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS btw_meta_consent (id TEXT PRIMARY KEY, brand TEXT NOT NULL, context TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS btw_meta_outbox (id TEXT PRIMARY KEY, brand TEXT NOT NULL, payload TEXT NOT NULL, created INTEGER NOT NULL, next_try INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL DEFAULT 'pending', lease INTEGER NOT NULL DEFAULT 0, last_status INTEGER, error_code INTEGER)")
  ]);
  initialized2.set(db, init);
  try {
    await init;
  } catch (error) {
    initialized2.delete(db);
    throw error;
  }
}
__name(schema2, "schema");
async function capture2(db, brand, id, raw) {
  if (!BRANDS2[brand] || typeof id !== "string" || !id || id.length > 100) return;
  const c = consentContext2(raw);
  if (!c) return;
  await schema2(db);
  await db.prepare("INSERT OR IGNORE INTO btw_meta_consent(id,brand,context,created) VALUES (?,?,?,?)").bind(id, brand, JSON.stringify(c), Date.now()).run();
}
__name(capture2, "capture");

// functions/api/meta-adapter.mjs
async function captureCheckout(env, id, meta) {
  if (env.META_CAPI_ENABLED !== "true") return;
  try {
    await capture2(env.DB, "retrozap", id, meta);
  } catch {
    console.warn("meta_consent_capture_failed");
  }
}
__name(captureCheckout, "captureCheckout");

// functions/api/promos.mjs
var promoError = /* @__PURE__ */ __name((status2, message) => {
  throw Object.assign(new Error(message), { status: status2 });
}, "promoError");
var promoHash = /* @__PURE__ */ __name(async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join(""), "promoHash");
var promoEmail = /* @__PURE__ */ __name((v) => String(v || "").trim().toLowerCase(), "promoEmail");
async function promoTables(db) {
  if (!db) promoError(503, "C\xF3digos temporariamente indispon\xEDveis.");
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS promo_codes (id TEXT PRIMARY KEY, hash TEXT UNIQUE NOT NULL, label TEXT NOT NULL, sites TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, expires INTEGER, created INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS promo_grants (id TEXT PRIMARY KEY, code_id TEXT NOT NULL, site TEXT NOT NULL, product TEXT NOT NULL, recipient TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE(code_id,site,product,recipient))"),
    db.prepare("CREATE TABLE IF NOT EXISTS promo_rate (id TEXT PRIMARY KEY, n INTEGER NOT NULL)")
  ]);
}
__name(promoTables, "promoTables");
async function redeemPromo(db, request, site2, product, raw, email) {
  await promoTables(db);
  const bucket = Math.floor(Date.now() / 6e5), ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rateId = bucket + ":" + await promoHash(ip);
  const rate = await db.prepare("INSERT INTO promo_rate(id,n) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET n=n+1 RETURNING n").bind(rateId).first();
  if (rate.n > 20) promoError(429, "Muitas tentativas. Aguarde dez minutos.");
  await db.prepare("DELETE FROM promo_rate WHERE id < ?").bind(bucket - 144 + ":").run();
  email = promoEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) promoError(400, "Confira seu e-mail.");
  const code = String(raw || "").trim().toUpperCase();
  if (code.length < 6 || code.length > 80) promoError(400, "C\xF3digo inv\xE1lido, vencido ou desativado.");
  const c = await db.prepare("SELECT * FROM promo_codes WHERE hash=? AND active=1 AND (expires IS NULL OR expires>?)").bind(await promoHash(code), Date.now()).first();
  if (!c || !JSON.parse(c.sites).includes(site2)) promoError(400, "C\xF3digo inv\xE1lido, vencido ou desativado.");
  const recipient = await promoHash(c.id + ":" + email);
  await db.prepare("INSERT OR IGNORE INTO promo_grants(id,code_id,site,product,recipient,created) SELECT ?,?,?,?,?,? FROM promo_codes WHERE id=? AND active=1 AND (expires IS NULL OR expires>?)").bind(crypto.randomUUID(), c.id, site2, product, recipient, Date.now(), c.id, Date.now()).run();
  const g = await db.prepare("SELECT id,created FROM promo_grants WHERE code_id=? AND site=? AND product=? AND recipient=?").bind(c.id, site2, product, recipient).first();
  if (!g) promoError(400, "C\xF3digo indispon\xEDvel.");
  return g;
}
__name(redeemPromo, "redeemPromo");

// functions/api/pix.js
// Preço do acesso ilimitado (Pix e cartão). O servidor é a fonte da verdade do valor cobrado.
// Promoção de lançamento (DESLIGADA): ligada e entre `inicio` e `fim` (horário de Brasília), o Pix e o cartão cobram `por`
// e o site mostra "De R$ 13,99 por R$ 8,99 · até 31/12" (via /api/cobranca). Fora das datas volta sozinho para PRECO.
// Atenção: cópia de fonte/build/pix.js (esta é a que roda no Worker); mude as duas.
var PRECO = "13.99";
var PROMO_LANCAMENTO = { ligado: false, de: "13,99", por: "8,99", inicio: "2026-12-01", fim: "2026-12-31" };
var hojeBR = /* @__PURE__ */ __name((agora = Date.now()) => new Date(agora - 3 * 36e5).toISOString().slice(0, 10), "hojeBR");
var promoAtiva = /* @__PURE__ */ __name((agora, P = PROMO_LANCAMENTO) => {
  const h = hojeBR(agora);
  return P.ligado === true && /^\d{1,3},\d{2}$/.test(P.por) && h >= P.inicio && h <= P.fim;
}, "promoAtiva");
var precoAtual = /* @__PURE__ */ __name((agora, P = PROMO_LANCAMENTO) => promoAtiva(agora, P) ? P.por.replace(",", ".") : PRECO, "precoAtual");
var MP_PADRAO = "https://api.mercadopago.com/v1/orders";
var json = /* @__PURE__ */ __name((obj, status2 = 200) => new Response(JSON.stringify(obj), { status: status2, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "json");
var modo = /* @__PURE__ */ __name((env) => env.COBRANCA === "ligada" ? "ligada" : env.COBRANCA === "desligada" ? "desligada" : "teste", "modo");
var tabela = /* @__PURE__ */ __name((env) => env.DB.prepare("CREATE TABLE IF NOT EXISTS compras (ref TEXT PRIMARY KEY, ordem TEXT, email TEXT, status TEXT, codigo TEXT, criado TEXT, pago TEXT, valor TEXT, modo TEXT)").run(), "tabela");
var tok = /* @__PURE__ */ __name((env) => String(env.MP_TOKEN || "").trim().replace(/^['"]|['"]$/g, "").replace(/^Bearer\s+/i, "").trim(), "tok");
var formaTok = /* @__PURE__ */ __name((env) => {
  const t = tok(env);
  return `token ${t.slice(0, 8)}\u2026 (${t.length} caracteres)`;
}, "formaTok");
var aleatorio = /* @__PURE__ */ __name((n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join(""), "aleatorio");
var pago = /* @__PURE__ */ __name((o) => o && (o.status === "approved" || o.status === "processed" || /accredited|approved/.test(o.status_detail || "") || (o.transactions?.payments || []).some((p) => p.status === "processed" || /accredited|approved/.test(p.status_detail || ""))), "pago");
var MP_PAY = "https://api.mercadopago.com/v1/payments";
var STRIPE = "https://api.stripe.com/v1/checkout/sessions";
var stripeKey = /* @__PURE__ */ __name((env) => String(env.STRIPE_KEY || "").trim(), "stripeKey");
var stripeTeste = /* @__PURE__ */ __name((env) => /^(sk|rk)_test_/.test(stripeKey(env)), "stripeTeste");
var precoCartao = /* @__PURE__ */ __name((env) => promoAtiva() ? precoAtual() : String(env.PRECO_CARTAO || PRECO), "precoCartao");
async function consultaOrdem(env, id) {
  if (id.startsWith("stripe:")) {
    const r2 = await fetch(`${env.STRIPE_API || STRIPE}/${encodeURIComponent(id.slice(7))}`, { headers: { Authorization: `Bearer ${stripeKey(env)}` } });
    const s = r2.ok ? await r2.json() : null;
    return s ? { status: s.payment_status === "paid" ? "approved" : "pending" } : null;
  }
  const url = id.startsWith("pay:") ? `${env.MP_PAY_API || MP_PAY}/${encodeURIComponent(id.slice(4))}` : `${env.MP_API || MP_PADRAO}/${encodeURIComponent(id)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${tok(env)}` } });
  return r.ok ? r.json() : null;
}
__name(consultaOrdem, "consultaOrdem");
async function confirma(env, ref) {
  const c = await env.DB.prepare("SELECT * FROM compras WHERE ref = ?").bind(ref).first();
  if (!c) return null;
  if (c.status === "pago") return c.codigo;
  const o = await consultaOrdem(env, c.ordem);
  if (!pago(o)) return null;
  const codigo = "RZ-" + aleatorio(4) + "-" + aleatorio(4);
  const up = await env.DB.prepare("UPDATE compras SET status = 'pago', codigo = ?, pago = ? WHERE ref = ? AND status != 'pago'").bind(codigo, (/* @__PURE__ */ new Date()).toISOString(), ref).run();
  if (up?.meta?.changes) await enviaCodigo(env, c.email, codigo);
  return (await env.DB.prepare("SELECT codigo FROM compras WHERE ref = ?").bind(ref).first())?.codigo || codigo;
}
__name(confirma, "confirma");
async function enviaCodigo(env, email, codigo) {
  if (!env.RESEND_KEY || !email) return false;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1A0B2E">
    <h1 style="color:#1A0B2E">Seu acesso premium do Retrozap \u{1F3C6}</h1>
    <p>Valeu pela compra! Seu acesso est\xE1 liberado: <b>grupos ilimitados</b> e <b>categorias extras</b>.</p>
    <p>Guarde este c\xF3digo para usar em outro celular ou navegador:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:2px;background:#FFC23C;padding:14px;border-radius:12px;text-align:center">${codigo}</p>
    <p>Como usar: no Retrozap, quando aparecer o pagamento, toque em <b>"J\xE1 paguei, tenho um c\xF3digo"</b> e digite o c\xF3digo acima.</p>
    <p><a href="https://retrozap.com.br" style="color:#7A3FC2">retrozap.com.br</a> \xB7 Todo grupo tem uma hist\xF3ria.</p>
    <p style="font-size:12px;color:#777">Suas mensagens nunca saem do seu celular. D\xFAvidas: oi@retrozap.com.br</p></div>`;
  try {
    const r = await fetch(env.RESEND_API || "https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${env.RESEND_KEY}` },
      body: JSON.stringify({
        from: env.EMAIL_DE || "Retrozap <codigo@retrozap.com.br>",
        to: [email],
        reply_to: "oi@retrozap.com.br",
        subject: "Seu c\xF3digo de acesso do Retrozap \u{1F3C6}",
        html,
        text: `Seu acesso premium do Retrozap est\xE1 liberado. C\xF3digo: ${codigo}. No site, toque em "J\xE1 paguei, tenho um c\xF3digo" e digite o c\xF3digo. retrozap.com.br`
      })
    });
    if (!r.ok) console.log("resend erro", r.status);
    return r.ok;
  } catch (e) {
    console.log("resend falhou", String(e));
    return false;
  }
}
__name(enviaCodigo, "enviaCodigo");
async function config({ env }) {
  return json({ modo: modo(env), pronto: !!(env.MP_TOKEN && env.DB), preco: precoAtual().replace(".", ","), cartao: !!(stripeKey(env) && env.DB), cartaoTeste: stripeTeste(env), precoCartao: precoCartao(env).replace(".", ","), promo: promoAtiva() ? { de: PROMO_LANCAMENTO.de, por: PROMO_LANCAMENTO.por, fim: PROMO_LANCAMENTO.fim } : null });
}
__name(config, "config");
async function criar({ request, env }) {
  if (!env.MP_TOKEN || !env.DB) return json({ error: "indisponivel" }, 503);
  if (modo(env) === "desligada") return json({ error: "desligada" }, 403);
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const email = String(c?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: "email" }, 400);
  await tabela(env);
  const ref = crypto.randomUUID();
  await captureCheckout(env, ref, c?.meta);
  const teste = modo(env) === "teste", preco = precoAtual();
  const payer = teste ? { email: "test@testuser.com", first_name: "APRO" } : { email };
  const corpo = {
    type: "online",
    processing_mode: "automatic",
    total_amount: preco,
    external_reference: ref,
    description: "Retrozap: grupos ilimitados",
    payer,
    transactions: { payments: [{ amount: preco, payment_method: { id: "pix", type: "bank_transfer" }, expiration_time: "PT30M" }] }
  };
  const cab = { "content-type": "application/json", accept: "application/json", Authorization: `Bearer ${tok(env)}` };
  const motivo = /* @__PURE__ */ __name((st, o2) => `${st} ${o2?.message || o2?.error || ""} ${(o2?.errors || o2?.cause || []).map((e) => e.message || e.description || e.code || "").join("; ")}`.trim().slice(0, 300), "motivo");
  let r = await fetch(env.MP_API || MP_PADRAO, { method: "POST", headers: { ...cab, "X-Idempotency-Key": ref }, body: JSON.stringify(corpo) });
  let o = await r.json().catch(() => null), ordem, pm;
  const erros = [];
  if (r.ok && o?.id) {
    ordem = o.id;
    pm = o.transactions?.payments?.[0]?.payment_method || {};
  } else {
    erros.push("orders: " + motivo(r.status, o));
    const classico = {
      transaction_amount: Number(preco),
      description: corpo.description,
      payment_method_id: "pix",
      external_reference: ref,
      payer,
      date_of_expiration: new Date(Date.now() + 30 * 6e4).toISOString().replace("Z", "-00:00")
    };
    r = await fetch(env.MP_PAY_API || MP_PAY, { method: "POST", headers: { ...cab, "X-Idempotency-Key": ref + "-p" }, body: JSON.stringify(classico) });
    o = await r.json().catch(() => null);
    if (r.ok && o?.id) {
      ordem = "pay:" + o.id;
      const t = o.point_of_interaction?.transaction_data || {};
      pm = { qr_code: t.qr_code, qr_code_base64: t.qr_code_base64, ticket_url: t.ticket_url };
    } else erros.push("payments: " + motivo(r.status, o));
  }
  if (!ordem) {
    console.log("mp erro", erros.join(" | "));
    return json({ error: "mp", detalhe: teste ? erros.join(" | ") + " | " + formaTok(env) : void 0 }, 502);
  }
  await env.DB.prepare("INSERT INTO compras (ref, ordem, email, status, criado, valor, modo) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(ref, ordem, email, "pendente", (/* @__PURE__ */ new Date()).toISOString(), preco, modo(env)).run();
  return json({ ref, qr: pm.qr_code || "", qr64: pm.qr_code_base64 || "", link: pm.ticket_url || "", preco: preco.replace(".", ",") });
}
__name(criar, "criar");
async function status({ request, env }) {
  if (!(env.MP_TOKEN || stripeKey(env)) || !env.DB) return json({ error: "indisponivel" }, 503);
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const ref = String(c?.ref || "").slice(0, 60);
  if (!ref) return json({ error: "bad_request" }, 400);
  await tabela(env);
  const codigo = await confirma(env, ref);
  if (!codigo) return json({ pago: false });
  const venda = await env.DB.prepare("SELECT valor, modo FROM compras WHERE ref = ?").bind(ref).first();
  let medicao;
  if (venda?.modo === "ligada" && Number(venda.valor) > 0) {
    const hash2 = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("retrozap-venda:" + ref));
    medicao = { id: Array.from(new Uint8Array(hash2), (b) => b.toString(16).padStart(2, "0")).join(""), valor: Number(venda.valor), moeda: "BRL" };
  }
  return json({ pago: true, codigo, ...medicao ? { medicao } : {} });
}
__name(status, "status");
async function cartao({ request, env }) {
  if (!stripeKey(env) || !env.DB) return json({ error: "indisponivel" }, 503);
  if (modo(env) === "desligada") return json({ error: "desligada" }, 403);
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const email = String(c?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: "email" }, 400);
  await tabela(env);
  const ref = crypto.randomUUID();
  await captureCheckout(env, ref, c?.meta);
  const origem = new URL(request.url).origin, valor = precoCartao(env);
  const f = new URLSearchParams({
    mode: "payment",
    locale: "pt-BR",
    customer_email: email,
    client_reference_id: ref,
    "metadata[ref]": ref,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "brl",
    "line_items[0][price_data][unit_amount]": String(Math.round(parseFloat(valor) * 100)),
    "line_items[0][price_data][product_data][name]": "Retrozap: acesso ilimitado",
    "line_items[0][price_data][product_data][description]": "Pagamento \xFAnico. Grupos ilimitados, todos os personagens, categoria livre, v\xEDdeo e sem an\xFAncios.",
    success_url: `${origem}/?cartao=ok&ref=${ref}`,
    cancel_url: `${origem}/?cartao=volta`
  });
  const r = await fetch(env.STRIPE_API || STRIPE, { method: "POST", headers: { Authorization: `Bearer ${stripeKey(env)}`, "content-type": "application/x-www-form-urlencoded", "Idempotency-Key": ref }, body: f });
  const s = await r.json().catch(() => null);
  if (!r.ok || !s?.url) {
    console.log("stripe erro", r.status, JSON.stringify(s?.error || s).slice(0, 300));
    return json({ error: "stripe", detalhe: stripeTeste(env) ? s?.error?.message || String(r.status) : void 0 }, 502);
  }
  await env.DB.prepare("INSERT INTO compras (ref, ordem, email, status, criado, valor, modo) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(ref, "stripe:" + s.id, email, "pendente", (/* @__PURE__ */ new Date()).toISOString(), valor, stripeTeste(env) ? "teste" : modo(env)).run();
  return json({ ref, url: s.url });
}
__name(cartao, "cartao");
async function stripeWebhook({ request, env }) {
  if (!stripeKey(env) || !env.DB) return json({ ok: true });
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ ok: true });
  }
  const id = String(c?.data?.object?.id || "").slice(0, 120);
  if (!/^cs_/.test(id)) return json({ ok: true });
  await tabela(env);
  const linha = await env.DB.prepare("SELECT ref FROM compras WHERE ordem = ?").bind("stripe:" + id).first();
  if (linha) await confirma(env, linha.ref);
  return json({ ok: true });
}
__name(stripeWebhook, "stripeWebhook");
async function webhook({ request, env }) {
  if (!env.MP_TOKEN || !env.DB) return json({ ok: true });
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ ok: true });
  }
  const id = String(c?.data?.id || "").slice(0, 80);
  if (!id) return json({ ok: true });
  await tabela(env);
  const linha = await env.DB.prepare("SELECT ref FROM compras WHERE ordem = ? OR ordem = ?").bind(id, "pay:" + id).first();
  if (linha) await confirma(env, linha.ref);
  return json({ ok: true });
}
__name(webhook, "webhook");
var AMIGOS_HASH = ["b86dd5b2692c26982629e053cc68993bbe6b043a732546d972013bfcc0c9f5c5"];
async function acesso({ request, env }) {
  if (!env.DB) return json({ ok: false }, 503);
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  await tabela(env);
  if (c?.email) return json({ ok: false, error: "recuperacao_por_email" });
  const codigo = String(c?.codigo || "").trim().toUpperCase().slice(0, 40);
  if (codigo.startsWith("RZ-AMIGOS-")) {
    const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codigo)))].map((x) => x.toString(16).padStart(2, "0")).join("");
    const extras = String(env.CODIGOS_AMIGOS || "").toUpperCase().split(",").map((x) => x.trim()).filter(Boolean);
    return json({ ok: AMIGOS_HASH.includes(h) || extras.includes(codigo) });
  }
  if (!/^RZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) return json({ ok: false });
  try {
    if (await env.DB.prepare("SELECT grant_id FROM promo_acessos WHERE codigo=?").bind(codigo).first()) return json({ ok: true });
  } catch {
  }
  const linha = modo(env) === "ligada" ? await env.DB.prepare("SELECT ref FROM compras WHERE codigo = ? AND status = 'pago' AND modo = 'ligada'").bind(codigo).first() : await env.DB.prepare("SELECT ref FROM compras WHERE codigo = ? AND status = 'pago'").bind(codigo).first();
  return json({ ok: !!linha });
}
__name(acesso, "acesso");
async function recuperar({ request, env }) {
  if (!env.DB) return json({ ok: true });
  let c;
  try {
    c = await request.json();
  } catch {
    return json({ ok: true });
  }
  const email = String(c?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "email" }, 400);
  await tabela(env);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS envios (email TEXT PRIMARY KEY, quando INTEGER)").run();
  const ult = await env.DB.prepare("SELECT quando FROM envios WHERE email = ?").bind(email).first();
  if (ult && Date.now() - ult.quando < 2 * 6e4) return json({ ok: true });
  const filtro = modo(env) === "ligada" ? " AND modo = 'ligada'" : "";
  const linha = await env.DB.prepare(`SELECT codigo FROM compras WHERE email = ? AND status = 'pago'${filtro} ORDER BY pago DESC LIMIT 1`).bind(email).first();
  let promocional = null;
  if (!linha?.codigo) try {
    promocional = await env.DB.prepare("SELECT codigo FROM promo_acessos WHERE email=? ORDER BY criado DESC LIMIT 1").bind(email).first();
  } catch {
  }
  if (linha?.codigo || promocional?.codigo) {
    await env.DB.prepare("INSERT OR REPLACE INTO envios (email, quando) VALUES (?, ?)").bind(email, Date.now()).run();
    await enviaCodigo(env, email, linha?.codigo || promocional.codigo);
  }
  return json({ ok: true });
}
__name(recuperar, "recuperar");
async function promo({ request, env }) {
  if (!env.DB) return json({ error: "Indispon\xEDvel." }, 503);
  if (request.headers.get("Origin") !== new URL(request.url).origin) return json({ error: "Origem inv\xE1lida." }, 403);
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ error: "Pedido muito grande." }, 413);
    const b = JSON.parse(text), email = String(b.email || "").trim().toLowerCase();
    const g = await redeemPromo(env.PROMOS, request, "retrozap", "premium", b.codigo, email);
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS promo_acessos (grant_id TEXT PRIMARY KEY,email TEXT NOT NULL,codigo TEXT NOT NULL UNIQUE,criado TEXT NOT NULL)").run();
    await env.DB.prepare("INSERT OR IGNORE INTO promo_acessos(grant_id,email,codigo,criado) VALUES (?,?,?,?)").bind(g.id, email, "RZ-" + aleatorio(4) + "-" + aleatorio(4), new Date(g.created).toISOString()).run();
    const a = await env.DB.prepare("SELECT codigo FROM promo_acessos WHERE grant_id=?").bind(g.id).first();
    return json({ ok: true, codigo: a.codigo });
  } catch (e) {
    return json({ error: e.status ? e.message : "N\xE3o foi poss\xEDvel aplicar o c\xF3digo." }, e.status || 503);
  }
}
__name(promo, "promo");

// src/historia.js
var HISTORIA = { "commits": 176, "dias": 13, "horas": 38, "sessoes": 37, "primeiro": "2026-10-17", "ultimo": "2026-11-02" };

// src/product-funnels.mjs
var PRODUCT_FUNNELS = {
  Quiddo: { property: "562055723", host: "quiddo.com.br", steps: [["Visitou", "page_view"], ["Iniciou pagamento", "begin_checkout"], ["Comprou", "purchase"]] },
  "SPORT DNA": { property: "562098147", host: "sportdna.com.br", steps: [["Visitou", "page_view"], ["Iniciou teste", "quiz_start"], ["Concluiu teste", "quiz_complete"], ["Iniciou pagamento", "begin_checkout"], ["Comprou", "purchase"]] }
};
var shift = /* @__PURE__ */ __name((d, n) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10), "shift");
async function productFunnels(google2, env, product, zone, end, observedAt = (/* @__PURE__ */ new Date()).toISOString(), variant = "") {
  const original = PRODUCT_FUNNELS[product], def = original ? { ...original, steps: product === "Quiddo" && variant === "activation" ? [["Chegou \xE0 cria\xE7\xE3o", "page_view"], ["Criou sala", "create_room"]] : original.steps } : null;
  if (variant && !(product === "Quiddo" && variant === "activation" || product === "SPORT DNA" && ["racket", "surf", "run"].includes(variant))) throw Error("FIXED_JOURNEY");
  if (!def || zone !== "America/Sao_Paulo") return [7, 30].map((days) => ({ status: "error", days, error_code: "GA_FUNNEL_TIME_ZONE" }));
  return Promise.all([7, 30].map(async (days) => {
    const base = { days, variant, property_id: def.property, time_zone: zone, observed_at: observedAt, start_date: shift(end, 1 - days), end_date: end, method: "native_same_zone", mode: "closed", sequential: true };
    try {
      const steps = def.steps.map(([name, event]) => ({ name, filterExpression: { funnelEventFilter: { eventName: event, ...event === "page_view" || variant ? { funnelParameterFilterExpression: { funnelParameterFilter: { eventParameterName: "page_location", stringFilter: { matchType: "FULL_REGEXP", value: "^https?://(www\\.)?" + def.host.replaceAll(".", "\\.") + (variant === "activation" ? "/(?:criar)/?([?#].*)?$" : variant ? "/" + variant + "/?([?#].*)?$" : product === "SPORT DNA" ? "/(?:racket|surf|run)/?([?#].*)?$" : "(/.*)?$"), caseSensitive: false } } } } : {} } } }));
      const r = await google2(env, `https://analyticsdata.googleapis.com/v1alpha/properties/${def.property}:runFunnelReport`, { dateRanges: [{ startDate: base.start_date, endDate: end }], funnel: { isOpenFunnel: false, steps } });
      const t = r.funnelTable;
      if (!t || !Array.isArray(t.rows)) throw Error("report");
      const metric = t.metricHeaders?.findIndex((x) => x.name === "activeUsers"), dim = t.dimensionHeaders?.findIndex((x) => x.name === "funnelStepName");
      if (metric < 0 || dim < 0 || metric === void 0 || dim === void 0) throw Error("schema");
      const values = /* @__PURE__ */ new Map();
      for (const row of t.rows) {
        const index = parseInt(row.dimensionValues?.[dim]?.value, 10) - 1, raw = row.metricValues?.[metric]?.value, value = raw === void 0 || raw === "" ? null : Number(raw);
        if (!Number.isInteger(index) || index < 0 || index >= steps.length || values.has(index) || value === null || !Number.isInteger(value) || value < 0) throw Error("schema");
        values.set(index, value);
      }
      const result = def.steps.map(([name, event], i) => ({ name, event, users: values.has(i) ? values.get(i) : null }));
      if (result.some((x, i) => i && x.users !== null && result[i - 1].users !== null && x.users > result[i - 1].users)) throw Error("sequence");
      return { ...base, status: "available", thresholded: !!t.metadata?.subjectToThresholding, steps: result };
    } catch (e) {
      const m = String(e?.message || "");
      return { ...base, status: "error", error_code: /permission|access|forbidden/i.test(m) ? "GA_ACCESS_DENIED" : /quota|exhausted/i.test(m) ? "GA_QUOTA" : "GA_FUNNEL_REPORT_FAILED" };
    }
  }));
}
__name(productFunnels, "productFunnels");

// src/admin.js
var json2 = /* @__PURE__ */ __name((obj, status2 = 200) => new Response(JSON.stringify(obj), { status: status2, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } }), "json");
var sha = /* @__PURE__ */ __name(async (t) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(t)))), "sha");
async function autorizado(request, env) {
  if (!env.ADMIN_SENHA) return false;
  const [a, b] = await Promise.all([sha(request.headers.get("x-senha") || ""), sha(env.ADMIN_SENHA)]);
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
__name(autorizado, "autorizado");
var todas = /* @__PURE__ */ __name(async (env, sql, ...p) => {
  try {
    return (await env.DB.prepare(sql).bind(...p).all()).results || [];
  } catch {
    return [];
  }
}, "todas");
var uma = /* @__PURE__ */ __name(async (env, sql, ...p) => (await todas(env, sql, ...p))[0] || {}, "uma");
var CARTAO = "ordem LIKE 'stripe:%'";
var mascara = /* @__PURE__ */ __name((e) => String(e || "").replace(/^(.{2}).*(@.*)$/, "$1\u2022\u2022\u2022$2"), "mascara");
async function site(env) {
  if (!env.DB) return { erro: "sem_banco" };
  const real = "COALESCE(estimado, 0) = 0";
  const [g, modos, gDia, c, cDia, ultimas, ideias, recentes] = await Promise.all([
    uma(env, `SELECT COUNT(*) AS total, SUM(criado >= date('now', '-6 days')) AS semana, SUM(criado = date('now')) AS hoje, SUM(base = '2026') AS ano FROM grupos WHERE ${real}`),
    todas(env, `SELECT modo, COUNT(*) AS n FROM grupos WHERE ${real} GROUP BY modo ORDER BY n DESC`),
    todas(env, `SELECT criado AS dia, modo, COUNT(*) AS n FROM grupos WHERE ${real} AND criado >= date('now', '-89 days') GROUP BY criado, modo`),
    uma(env, `SELECT SUM(status = 'pago') AS pagos, SUM(CASE WHEN status = 'pago' THEN CAST(valor AS REAL) ELSE 0 END) AS receita, COUNT(DISTINCT CASE WHEN status = 'pago' THEN email END) AS clientes,
      SUM(status = 'pago' AND pago >= date('now', '-6 days')) AS semana, SUM(${CARTAO}) AS checkouts, SUM(${CARTAO} AND status = 'pago') AS pagos_cartao,
      SUM(CASE WHEN ${CARTAO} AND status = 'pago' THEN CAST(valor AS REAL) ELSE 0 END) AS receita_cartao, SUM(NOT ${CARTAO}) AS pix, SUM(NOT ${CARTAO} AND status = 'pago') AS pagos_pix FROM compras WHERE modo = 'ligada'`),
    todas(env, `SELECT substr(pago, 1, 10) AS dia, CASE WHEN ${CARTAO} THEN 'cartao' ELSE 'pix' END AS meio, COUNT(*) AS n FROM compras WHERE modo = 'ligada' AND status = 'pago' AND pago >= date('now', '-89 days') GROUP BY dia, meio`),
    todas(env, `SELECT email, pago, valor, CASE WHEN ${CARTAO} THEN 'Cart\xE3o' ELSE 'Pix' END AS meio FROM compras WHERE modo = 'ligada' AND status = 'pago' ORDER BY pago DESC LIMIT 8`),
    todas(env, "SELECT tipo, COUNT(*) AS n FROM ideias GROUP BY tipo"),
    todas(env, "SELECT criado, tipo, texto FROM ideias WHERE tipo != 'novidades' ORDER BY criado DESC LIMIT 10")
  ]);
  return { grupos: g, modos, gDia, compras: c, cDia, ultimas: ultimas.map((u) => ({ ...u, email: mascara(u.email) })), ideias, recentes };
}
__name(site, "site");
var tokenGoogle = null;
function googleToken(env) {
  if (!tokenGoogle || tokenGoogle.ate < Date.now()) tokenGoogle = { ate: Date.now() + 50 * 6e4, t: novoToken(env).catch((e) => {
    tokenGoogle = null;
    throw e;
  }) };
  return tokenGoogle.t;
}
__name(googleToken, "googleToken");
async function novoToken(env) {
  const sa = JSON.parse(env.GOOGLE_SA);
  const b64 = /* @__PURE__ */ __name((o2) => btoa(typeof o2 === "string" ? o2 : String.fromCharCode(...new Uint8Array(o2))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"), "b64");
  const agora = Math.floor(Date.now() / 1e3);
  const corpo = b64(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64(JSON.stringify({
    iss: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: agora,
    exp: agora + 3600,
    scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly"
  }));
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----|\s/g, "")), (ch) => ch.charCodeAt(0));
  const chave = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const jwt = corpo + "." + b64(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", chave, new TextEncoder().encode(corpo)));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt
  });
  const o = await r.json();
  if (!o.access_token) throw new Error("google_token: " + (o.error_description || o.error || r.status));
  return o.access_token;
}
__name(novoToken, "novoToken");
async function google(env, url, corpo) {
  if (env.__btwAcquisitionDiagnostics) env.__btwAcquisitionDiagnostics.external_requests++;
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + await googleToken(env) }, body: JSON.stringify(corpo) });
  const o = await r.json();
  if (!r.ok) throw new Error(o?.error?.message || String(r.status));
  return o;
}
__name(google, "google");
var linhas = /* @__PURE__ */ __name((o) => (o.rows || []).map((r) => [...(r.dimensionValues || []).map((v) => v.value), ...(r.metricValues || []).map((v) => Number(v.value))]), "linhas");
async function analytics(env) {
  if (!env.GOOGLE_SA || !env.GA4_PROPERTY) return { erro: "nao_configurado" };
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runReport`;
  const periodo = [{ startDate: "29daysAgo", endDate: "today" }];
  const [dia, paginas, canais] = await Promise.all([
    google(env, url, { dateRanges: periodo, dimensions: [{ name: "date" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] }),
    google(env, url, { dateRanges: periodo, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], limit: 12, orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }] }),
    google(env, url, { dateRanges: periodo, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], limit: 8, orderBys: [{ metric: { metricName: "sessions" }, desc: true }] })
  ]);
  const tot = await google(env, url, { dateRanges: periodo, metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] });
  const up = await google(env, url, {
    dateRanges: [{ startDate: "89daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "upload_ok" } } }
  }).catch(() => null);
  const data = /* @__PURE__ */ __name((d) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`, "data");
  return { uploads: up ? linhas(up).map(([d, n]) => [data(d), n]) : null, total: linhas(tot)[0] || [0, 0, 0], dia: linhas(dia).map(([d, ...m]) => [`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`, ...m]), paginas: linhas(paginas), canais: linhas(canais) };
}
__name(analytics, "analytics");
async function busca(env) {
  if (!env.GOOGLE_SA) return { erro: "nao_configurado" };
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.GSC_SITE || "sc-domain:retrozap.com.br")}/searchAnalytics/query`;
  const d = /* @__PURE__ */ __name((n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10), "d");
  const periodo = { startDate: d(30), endDate: d(1) };
  const [dia, termos, tot] = await Promise.all([
    google(env, url, { ...periodo, dimensions: ["date"] }),
    google(env, url, { ...periodo, dimensions: ["query"], rowLimit: 12 }),
    google(env, url, periodo)
  ]);
  const r = /* @__PURE__ */ __name((o, dim) => (o.rows || []).map((x) => ({ [dim]: x.keys?.[0], cliques: x.clicks, impressoes: x.impressions, ctr: x.ctr, posicao: x.position })), "r");
  return { total: r(tot, "k")[0] || { cliques: 0, impressoes: 0 }, dia: r(dia, "dia"), termos: r(termos, "termo") };
}
__name(busca, "busca");
var seguro = /* @__PURE__ */ __name((p) => p.catch((e) => ({ erro: String(e?.message || e).slice(0, 200) })), "seguro");
async function barra(request, env) {
  if (!env.ADMIN_SENHA) return json2({ error: "desligado" }, 503);
  if (!await autorizado(request, env)) {
    await new Promise((r) => setTimeout(r, 800));
    return json2({ error: "senha" }, 401);
  }
  return null;
}
__name(barra, "barra");
async function dados({ request, env }) {
  const nao = await barra(request, env);
  if (nao) return nao;
  const [s, a, b, n] = await Promise.all([seguro(site(env)), seguro(analytics(env)), seguro(busca(env)), env.DB ? uma(env, "SELECT v FROM config WHERE k = 'negocio'") : {}]);
  let negocio = null;
  try {
    negocio = n.v ? JSON.parse(n.v) : null;
  } catch {
  }
  return json2({ gerado: (/* @__PURE__ */ new Date()).toISOString(), cobranca: env.COBRANCA || "teste", site: s, analytics: a, busca: b, negocio, historia: HISTORIA });
}
__name(dados, "dados");
async function salvar({ request, env }) {
  const nao = await barra(request, env);
  if (nao) return nao;
  if (!env.DB) return json2({ error: "sem_banco" }, 503);
  const t = await request.text();
  if (t.length > 2e4) return json2({ error: "grande" }, 413);
  let o;
  try {
    o = JSON.parse(t);
  } catch {
    return json2({ error: "bad_request" }, 400);
  }
  if (!o || typeof o !== "object" || !Array.isArray(o.custos)) return json2({ error: "bad_request" }, 400);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT, atualizado TEXT)").run();
  await env.DB.prepare("INSERT OR REPLACE INTO config (k, v, atualizado) VALUES ('negocio', ?, ?)").bind(JSON.stringify(o), (/* @__PURE__ */ new Date()).toISOString()).run();
  return json2({ ok: true });
}
__name(salvar, "salvar");
var pagina = /* @__PURE__ */ __name((p) => ({ andGroup: { expressions: [{ funnelEventFilter: { eventName: "page_view" } }, { funnelFieldFilter: { fieldName: "pagePath", stringFilter: { matchType: "EXACT", value: p } } }] } }), "pagina");
var eventoF = /* @__PURE__ */ __name((...n) => n.length === 1 ? { funnelEventFilter: { eventName: n[0] } } : { orGroup: { expressions: n.map((e) => ({ funnelEventFilter: { eventName: e } })) } }, "eventoF");
var COMPARTILHOU = ["compartilhou", "card_compartilhado", "card_salvo", "card_whatsapp_web", "card_copiado"];
var ETAPAS = [
  ["In\xEDcio", pagina("/"), "/"],
  ["Come\xE7ar", pagina("/comecar"), "/comecar"],
  ["Leu a conversa", eventoF("upload_ok"), "upload_ok"],
  ["Turma", pagina("/turma"), "/turma"],
  ["Ato I: conhecendo", pagina("/conhecendo"), "/conhecendo"],
  ["Categorias", pagina("/categorias"), "/categorias"],
  ["1\xBA pr\xEAmio", pagina("/premios/1"), "/premios/1"],
  ["Metade dos pr\xEAmios", pagina("/premios/4"), "/premios/4"],
  ["Ato III: Gran Finale", pagina("/resumo"), "/resumo"],
  ["Fim", pagina("/fim"), "/fim"],
  ["Compartilhou", eventoF(...COMPARTILHOU), COMPARTILHOU]
];
var PAGAMENTO = [["Iniciou o pagamento", eventoF("pix_gerado", "cartao_aberto")], ["Comprou", eventoF("compra_ilimitado")]];
var DIMS = ["deviceCategory", "operatingSystem", "sessionDefaultChannelGroup", "sessionSource", "newVsReturning"];
var LANCAMENTO = "2026-10-17";
async function funilGA(env, corpo) {
  const url = `https://analyticsdata.googleapis.com/v1alpha/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runFunnelReport`;
  const o = await google(env, url, corpo), t = o.funnelTable || {}, bq = (t.dimensionHeaders || []).length > 1;
  const res = {};
  for (const r of t.rows || []) {
    const [passo, valor = "total"] = (r.dimensionValues || []).map((v) => v.value), i = parseInt(passo) - 1;
    const k = valor === "RESERVED_TOTAL" ? "total" : valor;
    if (i >= 0) (res[k] ||= [])[i] = Number(r.metricValues?.[0]?.value || 0);
  }
  return { bq, res };
}
__name(funilGA, "funilGA");
async function funil({ request, env }) {
  const nao = await barra(request, env);
  if (nao) return nao;
  if (!env.GOOGLE_SA || !env.GA4_PROPERTY) return json2({ erro: "nao_configurado" });
  const q = new URL(request.url).searchParams;
  const dias = q.get("dias") === "lanc" ? "lanc" : String(Math.min(365, Math.max(1, parseInt(q.get("dias")) || 30)));
  const periodo = [{ startDate: dias === "lanc" ? LANCAMENTO : `${dias}daysAgo`, endDate: "today" }];
  const ver = DIMS.includes(q.get("ver")) ? q.get("ver") : "", campo = DIMS.includes(q.get("campo")) ? q.get("campo") : "", valor = String(q.get("valor") || "").slice(0, 100);
  const filtro = campo && valor ? { filter: { fieldName: campo, stringFilter: { matchType: "EXACT", value: valor } } } : void 0;
  const aberto = q.get("aberto") === "1";
  const base = { dateRanges: periodo, ...filtro ? { dimensionFilter: filtro } : {} };
  const passos = ETAPAS.map(([nome, f]) => ({ name: nome, filterExpression: f }));
  const rep = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runReport`;
  const [principal, quebra, pag, entrada, ...opcoes] = await Promise.all([
    seguro(funilGA(env, { ...base, funnel: { isOpenFunnel: aberto, steps: passos } })),
    ver ? seguro(funilGA(env, { ...base, funnel: { isOpenFunnel: aberto, steps: passos }, funnelBreakdown: { breakdownDimension: { name: ver }, limit: "6" } })) : null,
    seguro(funilGA(env, { ...base, funnel: { isOpenFunnel: true, steps: PAGAMENTO.map(([nome, f]) => ({ name: nome, filterExpression: f })) } })),
    seguro(google(env, rep, { ...base, dimensions: [{ name: "landingPage" }], metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagementRate" }], limit: 10, orderBys: [{ metric: { metricName: "sessions" }, desc: true }] })),
    ...["deviceCategory", "operatingSystem", "sessionDefaultChannelGroup", "newVsReturning"].map((d) => seguro(google(env, rep, { dateRanges: periodo, dimensions: [{ name: d }], metrics: [{ name: "activeUsers" }], limit: 8, orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }] })))
  ]);
  let etapas = principal.res?.total, aproximado = false;
  if (!etapas) {
    const [pg, ev] = await Promise.all([
      seguro(google(env, rep, { ...base, dimensions: [{ name: "pagePath" }], metrics: [{ name: "activeUsers" }], limit: 200 })),
      seguro(google(env, rep, { ...base, dimensions: [{ name: "eventName" }], metrics: [{ name: "activeUsers" }], limit: 200 }))
    ]);
    if (pg.erro && ev.erro) return json2({ erro: principal.erro || pg.erro });
    const m = new Map([...linhas(pg), ...linhas(ev)].map(([k, n]) => [k, n]));
    etapas = ETAPAS.map(([, , k]) => Array.isArray(k) ? Math.max(0, ...k.map((e) => m.get(e) || 0)) : m.get(k) || 0);
    aproximado = true;
  }
  const valores = quebra?.res ? Object.entries(quebra.res).filter(([k]) => k !== "total").map(([k, v]) => ({ valor: k, passos: ETAPAS.map((_, i) => v[i] || 0) })) : [];
  return json2({
    nomes: ETAPAS.map((e) => e[0]),
    passos: ETAPAS.map((_, i) => etapas[i] || 0),
    aproximado,
    aberto,
    dias,
    ver,
    campo,
    valor,
    erroFunil: principal.erro || "",
    quebra: valores,
    erroQuebra: quebra?.erro || "",
    pagamento: pag.res?.total ? PAGAMENTO.map((p, i) => [p[0], pag.res.total[i] || 0]) : [],
    entrada: entrada.erro ? [] : linhas(entrada),
    opcoes: Object.fromEntries(["deviceCategory", "operatingSystem", "sessionDefaultChannelGroup", "newVsReturning"].map((d, i) => [d, opcoes[i].erro ? [] : linhas(opcoes[i]).map((x) => x[0])]))
  });
}
__name(funil, "funil");
async function painel() {
  return new Response(PAGINA, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-frame-options": "DENY" } });
}
__name(painel, "painel");
var PAGINA = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Painel Retrozap</title>
<style>
:root{--bg:#1A0B2E;--card:#2A1242;--borda:#3D1A5C;--txt:#F6F0FF;--txt2:#C9B8E0;--txt3:#9A86B8;--serie:#FFC23C;--serie2:#FF4F8B;--g1:#BE8700;--g2:#DB3B74;--g3:#4A86E6;--ok:#3DDC97;--alerta:#FFB547}
[hidden]{display:none!important}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:0}h2{font-size:15px;margin:0 0 12px;color:var(--txt2);font-weight:600;text-transform:uppercase;letter-spacing:.06em}
header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.sub{color:var(--txt3);font-size:13px}
section{margin-top:28px}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}@media(min-width:700px){.grid{grid-template-columns:repeat(auto-fit,minmax(195px,1fr))}}.dois{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.card{background:var(--card);border:1px solid var(--borda);border-radius:14px;padding:14px 16px;min-width:0}
.tile .v{font-size:clamp(21px,2.2vw,26px);white-space:nowrap;line-height:1.15;font-weight:700;font-variant-numeric:tabular-nums}.tile .l{color:var(--txt2);font-size:13px}.tile .d{color:var(--txt3);font-size:12px;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:6px 4px;border-bottom:1px solid var(--borda);text-align:left;vertical-align:top}th{color:var(--txt3);font-weight:500}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.aviso{color:var(--txt3);font-size:13px}.aviso b{color:var(--alerta)}a{color:var(--serie)}
.links{display:flex;flex-wrap:wrap;gap:8px}.links a{background:var(--card);border:1px solid var(--borda);border-radius:999px;padding:7px 12px;text-decoration:none;color:var(--txt);font-size:13px}
.links a:hover{border-color:var(--serie)}button,input{font:inherit}button{background:var(--serie);color:var(--bg);border:0;border-radius:10px;padding:9px 14px;font-weight:600;cursor:pointer}
button.sec{background:transparent;color:var(--txt2);border:1px solid var(--borda)}input{background:var(--card);border:1px solid var(--borda);color:var(--txt);border-radius:10px;padding:9px 12px;width:100%}
#login{max-width:340px;margin:18vh auto 0;display:grid;gap:10px}.graf{position:relative}.graf svg{display:block;width:100%;height:150px}.graf .ttl{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.graf .ttl b{font-size:14px}.graf .ttl span{color:var(--txt3);font-size:12px}.eixo{fill:var(--txt3);font-size:10px}.tip{position:absolute;pointer-events:none;background:#0F0620;border:1px solid var(--borda);border-radius:8px;padding:5px 8px;font-size:12px;white-space:nowrap;display:none;z-index:2}
rect.alvo{fill:transparent}rect.alvo:hover+rect,rect.barra:hover{opacity:.8}.tag{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--borda);color:var(--txt2)}
.status{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--txt2)}.ponto{width:8px;height:8px;border-radius:50%;background:var(--ok)}.ponto.off{background:var(--alerta)}
.abas{display:flex;gap:4px;border-bottom:1px solid var(--borda);margin:-4px 0 4px}.abas button{background:transparent;color:var(--txt2);border-radius:10px 10px 0 0;border-bottom:2px solid transparent;padding:9px 16px}
.abas button[aria-selected="true"]{color:var(--txt);border-bottom-color:var(--serie)}.rola{overflow-x:auto}table.edit{min-width:760px}table.edit input,table.edit select{padding:6px 8px;border-radius:8px}
select{font:inherit;background:var(--card);border:1px solid var(--borda);color:var(--txt);border-radius:10px;padding:9px 10px}button.mini{padding:4px 10px}.campo{display:grid;gap:4px;font-size:12px;color:var(--txt2)}
.filtros{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.filtros select,.campo select{width:100%;min-width:0;text-overflow:ellipsis}.funil{margin-top:10px}.etapa{display:grid;grid-template-columns:minmax(120px,190px) 1fr auto;gap:10px;align-items:center;padding:4px 0}
.etapa .nome{font-size:13px;display:flex;gap:8px;align-items:center}.etapa .num{color:var(--txt3);font-size:11px;min-width:16px}.trilho{background:rgba(255,255,255,.04);border-radius:4px;height:22px;display:block;overflow:hidden}
.barra-f{display:block;height:100%;background:var(--serie);border-radius:0 4px 4px 0}.etapa .val{font-variant-numeric:tabular-nums;font-size:13px;white-space:nowrap;min-width:84px;text-align:right}.etapa small,small.sub{color:var(--txt3)}
.etapa:hover .barra-f{opacity:.8}.perda{font-size:11px;color:var(--txt3);padding:0 0 0 24px}.perda.pior{color:var(--alerta);font-weight:600}
@media(max-width:520px){.etapa{grid-template-columns:1fr auto}.etapa .trilho{grid-column:1/-1;grid-row:2}}
.ttl-c{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}
.chip{background:transparent;color:var(--txt2);border:1px solid var(--borda);border-radius:999px;padding:6px 12px;font-weight:500;font-size:13px;display:inline-flex;align-items:center;gap:7px}
.chip[aria-pressed="true"]{color:var(--txt);border-color:var(--txt3);background:rgba(255,255,255,.04)}.chip[aria-pressed="false"] .cor{opacity:.25}.chip .cor{width:10px;height:10px;border-radius:3px;display:inline-block}
.col:hover rect:not(.alvo){opacity:.8}summary{cursor:pointer}
</style></head><body><main>
<form id="login" hidden><h1>Painel Retrozap</h1><p class="sub">Digite a senha do painel (segredo ADMIN_SENHA na Cloudflare).</p><input id="senha" type="password" autocomplete="current-password" aria-label="Senha"><button>Entrar</button><p id="erro" class="aviso" role="alert"></p></form>
<div id="app" hidden></div></main>
<div class="tip" id="tip"></div>
<script>
const $ = s => document.querySelector(s), esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = n => Number(n || 0).toLocaleString('pt-BR'), brl = n => Number(n || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), pct = n => (Number(n || 0) * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '%';
let senha = ''; try { senha = localStorage.getItem('rz_admin') || ''; } catch {}
const tile = (v, l, d = '') => '<div class="card tile"><div class="v">' + v + '</div><div class="l">' + l + '</div>' + (d ? '<div class="d">' + d + '</div>' : '') + '</div>';
// \xFAltimos 30 dias, um ponto por dia (dias sem dado = 0)
const dias30 = (pares, ate = 0) => { const m = new Map(pares); return Array.from({length: 30}, (_, i) => { const d = new Date(Date.now() - (29 - i + ate) * 864e5).toISOString().slice(0, 10); return [d, m.get(d) || 0]; }); };
function barras(titulo, serie, rotulo){
  const W = 600, H = 150, base = H - 18, max = Math.max(1, ...serie.map(s => s[1])), bw = W / serie.length, soma = serie.reduce((a, s) => a + s[1], 0);
  const r = serie.map(([d, v], i) => { const h = v ? Math.max(3, v / max * (base - 10)) : 0, x = i * bw + 1;
    return '<rect class="alvo" x="' + (i * bw) + '" y="0" width="' + bw + '" height="' + base + '" data-t="' + esc(d.split('-').reverse().slice(0, 2).join('/') + ': ' + fmt(v) + ' ' + rotulo) + '"></rect>' +
      (h ? '<rect class="barra" x="' + x + '" y="' + (base - h) + '" width="' + Math.max(1, bw - 2) + '" height="' + h + '" rx="2" fill="var(--serie)"></rect>' : ''); }).join('');
  const ex = [0, 14, 29].map(i => '<text class="eixo" x="' + (i * bw + bw / 2) + '" y="' + (H - 4) + '" text-anchor="' + (i ? i === 29 ? 'end' : 'middle' : 'start') + '">' + serie[i][0].split('-').reverse().slice(0, 2).join('/') + '</text>').join('');
  return '<div class="card graf"><div class="ttl"><b>' + titulo + '</b><span>' + fmt(soma) + ' em 30 dias \xB7 m\xE1x. ' + fmt(max) + '/dia</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(titulo) + ': ' + fmt(soma) + ' em 30 dias">' +
    '<line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '" stroke="var(--borda)"></line>' + r + ex + '</svg></div>';
}
const tabela = (cab, rows) => '<table><thead><tr>' + cab.map(c => '<th' + (c[1] ? ' class="n"' : '') + '>' + c[0] + '</th>').join('') + '</tr></thead><tbody>' +
  (rows.length ? rows.map(r => '<tr>' + r.map((v, i) => '<td' + (cab[i][1] ? ' class="n"' : '') + '>' + v + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + cab.length + '" class="aviso">Nada ainda.</td></tr>') + '</tbody></table>';
const falta = (o, como) => o.erro === 'nao_configurado' ? '<div class="card aviso"><b>N\xE3o configurado.</b> ' + como + '</div>' : '<div class="card aviso"><b>Erro:</b> ' + esc(o.erro) + '</div>';
const MODOS = {amigos: 'Amigos', familia: 'Fam\xEDlia', trabalho: 'Trabalho', comunidade: 'Comunidade', casal: 'Casais'};
const LINKS = [['Cloudflare (Worker)', 'https://dash.cloudflare.com/?to=/:account/workers/services/view/retrozap-v2'], ['D1 retrozap', 'https://dash.cloudflare.com/?to=/:account/workers/d1'],
  ['Google Analytics', 'https://analytics.google.com/'], ['Search Console', 'https://search.google.com/search-console?resource_id=sc-domain:retrozap.com.br'], ['AdSense', 'https://www.google.com/adsense/'],
  ['Mercado Pago', 'https://www.mercadopago.com.br/activities'], ['GitHub', 'https://github.com/gtorniero/retrozap'], ['Instagram', 'https://www.instagram.com/'], ['TikTok Studio', 'https://www.tiktok.com/tiktokstudio'], ['Gmail', 'https://mail.google.com/']];

// ---------- aba Neg\xF3cio: investimentos (salvos no D1), payback, linha do tempo e plano ----------
const PRECO = 13.99, PRECO_CARTAO = 13.99;
const NEG_PADRAO = {inicio: '2026-10-17', horasAntes: 0, valorHora: 0, taxa: 0.99, taxaCartao: 3.99, tarifaCartao: 0.39, imposto: 0, extraMes: 0, extraAcum: 0, custos: [
  {nome: 'Claude (assinatura)', valor: 500, freq: 'mensal', desde: '2026-10-01', obs: ''},
  {nome: 'Empresa (abertura e manuten\xE7\xE3o)', valor: 1000, freq: 'anual', desde: '2026-10-01', obs: 'estimativa: confirmar'},
  {nome: 'Dom\xEDnio retrozap.com.br', valor: 40, freq: 'anual', desde: '2026-10-01', obs: ''},
  {nome: 'Higgsfield', valor: 150, freq: 'mensal', desde: '2026-10-01', obs: 'estimativa: confirmar'},
  {nome: 'Outras plataformas', valor: 0, freq: 'mensal', desde: '2026-10-01', obs: 'Cloudflare, GitHub, Google e Mercado Pago no plano gr\xE1tis'}]};
const PREMISSAS = [['taxa', 'Taxa do Mercado Pago no Pix (%)'], ['taxaCartao', 'Taxa do Stripe no cart\xE3o (%)'], ['tarifaCartao', 'Tarifa fixa do Stripe por venda (R$)'], ['imposto', 'Imposto sobre a venda (%) \xB7 MEI = 0'], ['extraMes', 'AdSense + parcerias por m\xEAs (R$)'], ['extraAcum', 'Outras receitas at\xE9 hoje, AdSense etc. (R$)'],
  ['inicio', 'In\xEDcio do projeto', 'date'], ['horasAntes', 'Horas de trabalho antes do GitHub'], ['valorHora', 'Quanto vale sua hora (R$) \xB7 0 = n\xE3o contar']];
const MARCOS = [
  ['Antes do GitHub', 'V1: a cerim\xF4nia num arquivo s\xF3 (zapped.html), arrastar e soltar a conversa, sem servidor'],
  ['17/10', 'Site no ar: blog com 11 artigos, perguntas frequentes, AdSense, LGPD e tutorial animado de exportar'],
  ['17\u201318/10', 'Cobran\xE7a: 1\xBA grupo gr\xE1tis, depois R$ 4,99 no Pix (Mercado Pago), c\xF3digo de acesso e recupera\xE7\xE3o por e-mail'],
  ['18/10', 'Novo fluxo da cerim\xF4nia (in\xEDcio, Ato I, categorias, pr\xEAmios), p\xF3dio de 3, ranking a partir de 10 grupos'],
  ['19/10', 'Retrozap Casais, Destaques 2026 Premium, categoria livre, v\xEDdeo para stories, SEO e cookies (LGPD)'],
  ['19/10', 'Ranking s\xF3 com 2026 (com estimativas no come\xE7o) e Turma: quem sumiu, trocou de n\xFAmero ou saiu'],
  ['19\u201320/10', 'V\xEDdeo de 20s tamb\xE9m para grupos; 2026 em n\xFAmeros + ranking numa imagem s\xF3'],
  ['20/10', 'AdSense some para quem \xE9 Premium; painel /admin com m\xE9tricas, payback e este plano'],
  ['20\u201321/10', 'Retrospectiva em 3 atos (Conhecendo, Categorias, Gran Finale 2026), v\xEDdeo de ~30s, regras mais justas nas categorias'],
  ['21/10', 'Convites com link de origem e chegada personalizada; tela de M\xEDdias com v\xEDdeo e imagens'],
  ['22/10', 'Empresa: CNPJ da Beyond the Work Ideas; termos de compra, arrependimento e registro de acessos (Marco Civil)'],
  ['23\u201324/10', 'Cart\xE3o, Apple Pay e Google Pay pelo Stripe (R$ 6,99), al\xE9m do Pix'],
  ['31/10', 'Novo pre\xE7o: R$ 6,99 no Pix e R$ 8,99 no cart\xE3o; casal passa a ser Premium (cobrado ao ir para as categorias)'],
  ['01/11', 'Pre\xE7o \xFAnico: R$ 8,99 no Pix ou no cart\xE3o; Pix passa para a conta PJ da Beyond the Work'],
  ['14/11', 'Pre\xE7o \xFAnico: R$ 13,99 no Pix ou no cart\xE3o']];
let NEG = null, DADOS = null;
const num = v => Number(String(v ?? '').replace(',', '.')) || 0;
const meses = desde => { const a = new Date(desde + 'T12:00:00'), b = new Date(); return isNaN(a) || a > b ? (isNaN(a) ? 1 : 0) : (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1; };
const gasto = c => c.freq === 'mensal' ? num(c.valor) * meses(c.desde) : c.freq === 'anual' ? num(c.valor) * Math.ceil(meses(c.desde) / 12) : meses(c.desde) ? num(c.valor) : 0;
const brl0 = n => Number(n || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});
const quando = m => m <= 0 ? 'J\xE1 se pagou' : !isFinite(m) ? 'Sem payback' : m < 1 ? '< 1 m\xEAs' : m > 120 ? 'mais de 10 anos' : Math.ceil(m) + (Math.ceil(m) === 1 ? ' m\xEAs' : ' meses');
function conta(){
  const n = NEG, c = DADOS.site?.compras || {}, imp = num(n.imposto) / 100, pagos = c.pagos || 0, pc = c.pagos_cartao || 0, rc = c.receita_cartao || 0;
  // l\xEDquido por venda: Pix (taxa do Mercado Pago) e cart\xE3o (taxa + tarifa do Stripe); a m\xE9dia segue o que j\xE1 foi vendido
  const liqPix = PRECO * (1 - num(n.taxa) / 100 - imp), liqCartao = PRECO_CARTAO * (1 - num(n.taxaCartao) / 100 - imp) - num(n.tarifaCartao);
  const vendido = ((c.receita || 0) - rc) * (1 - num(n.taxa) / 100 - imp) + rc * (1 - num(n.taxaCartao) / 100 - imp) - pc * num(n.tarifaCartao);
  const liq = pagos ? vendido / pagos : liqPix;
  const custoMes = n.custos.reduce((a, x) => a + (x.freq === 'mensal' ? num(x.valor) : x.freq === 'anual' ? num(x.valor) / 12 : 0), 0);
  const investido = n.custos.reduce((a, x) => a + gasto(x), 0), horas = num(n.horasAntes) + (DADOS.historia?.horas || 0), tempo = horas * num(n.valorHora);
  const d30 = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10), vendas30 = (DADOS.site?.cDia || []).filter(x => x.dia >= d30).reduce((a, x) => a + x.n, 0), recebido = vendido + num(n.extraAcum);
  const saldo = recebido - investido, recMes = vendas30 * liq + num(n.extraMes), lucro = recMes - custoMes;
  const pay = (sd, l) => sd >= 0 ? 0 : l > 0 ? -sd / l : Infinity;
  return {liq, liqPix, liqCartao, custoMes, investido, horas, tempo, vendas30, recebido, saldo, recMes, lucro, pay, payback: pay(saldo, lucro), equilibrio: Math.max(0, Math.ceil((custoMes - num(n.extraMes)) / liq))};
}
function calcNegocio(){
  const k = conta(), n = NEG, pagos = DADOS.site?.compras?.pagos || 0;
  let h = '<section><h2>Payback</h2><div class="grid">' + tile(brl0(k.investido), 'Investido at\xE9 hoje', 'custo fixo de ' + brl(k.custoMes) + '/m\xEAs') + tile(brl0(k.recebido), 'Recebido (l\xEDquido)', fmt(pagos) + ' vendas \xB7 m\xE9dia ' + brl(k.liq) + ' (Pix ' + brl(k.liqPix) + ' \xB7 cart\xE3o ' + brl(k.liqCartao) + ')') +
    tile((k.saldo < 0 ? '\u2212' : '+') + brl0(Math.abs(k.saldo)), 'Saldo', k.saldo < 0 ? 'falta recuperar' : 'j\xE1 no lucro') +
    tile(fmt(k.equilibrio), 'Vendas/m\xEAs para empatar', '\u2248 ' + fmt(Math.ceil(k.equilibrio / 30)) + ' por dia') + tile(quando(k.payback), 'Payback no ritmo atual', fmt(k.vendas30) + ' vendas nos \xFAltimos 30 dias' + (isFinite(k.payback) ? '' : ': ainda n\xE3o cobre o custo fixo'));
  if (num(n.valorHora)) h += tile(brl0(k.tempo), 'Seu tempo', fmt(k.horas) + ' h \xD7 ' + brl(n.valorHora)) + tile(quando(k.pay(k.saldo - k.tempo, k.lucro)), 'Payback contando seu tempo');
  h += '</div>';
  const cen = [[k.vendas30, 'Ritmo atual'], [k.equilibrio, 'Empate'], [300, ''], [1000, ''], [3000, '']].filter((x, i, l) => l.findIndex(y => y[0] === x[0]) === i);
  h += '<div class="card" style="margin-top:12px"><b>Cen\xE1rios (vendas por m\xEAs)</b><div class="rola">' + tabela([['Vendas/m\xEAs'], ['Receita l\xEDquida/m\xEAs', 1], ['Lucro/m\xEAs', 1], ['Payback', 1]], cen.map(([v, t]) => {
    const l = v * k.liq + num(n.extraMes) - k.custoMes; return [fmt(v) + (t ? ' <span class="tag">' + t + '</span>' : ''), brl(v * k.liq + num(n.extraMes)), (l < 0 ? '\u2212' : '') + brl(Math.abs(l)), quando(k.pay(k.saldo, l))]; })) + '</div>' +
    '<p class="aviso">Payback = quanto falta recuperar \xF7 lucro do m\xEAs. Retrospectiva vende no fim do ano: dezembro e janeiro devem concentrar boa parte das vendas.</p></div></section>';
  $('#neg-pay').innerHTML = h; h = '';
  // linha do tempo
  const hi = DADOS.historia || {}, dias = Math.max(1, Math.round((Date.now() - new Date(n.inicio + 'T00:00:00')) / 864e5));
  h += '<section><h2>Como chegamos aqui</h2><div class="grid">' + tile(fmt(dias), 'Dias de projeto', 'desde ' + new Date(n.inicio + 'T12:00:00').toLocaleDateString('pt-BR')) + tile(fmt(hi.commits), 'Vers\xF5es publicadas', 'commits em ' + fmt(hi.dias) + ' dias') +
    tile(fmt(k.horas) + ' h', 'Horas de trabalho', (num(n.horasAntes) ? fmt(n.horasAntes) + ' h antes + ' : '') + fmt(hi.horas) + ' h no GitHub (estimativa m\xEDnima)') + tile(fmt(hi.sessoes), 'Sess\xF5es de trabalho', 'pelo intervalo entre vers\xF5es') + '</div>' +
    '<div class="card" style="margin-top:12px"><b>Linha do tempo</b>' + tabela([['Quando'], ['O que entrou']], MARCOS.map(([q, t]) => ['<span style="white-space:nowrap">' + q + '</span>', t])) + '</div></section>';
  // plano de neg\xF3cio
  const meta = Math.max(0, Math.ceil((-Math.min(0, k.saldo) + 3 * k.custoMes) / k.liq));
  const P = [['Resumo', 'O Retrozap transforma o export de um grupo de WhatsApp numa retrospectiva estilo Wrapped (personagens, pr\xEAmios, ranking, cards e v\xEDdeo), lida 100% no navegador. 1\xBA grupo gr\xE1tis; casais e demais grupos no Premium: R$ 13,99 no Pix ou no cart\xE3o (Apple Pay e Google Pay), pagamento \xFAnico.'],
    ['Oportunidade', 'O Brasil tem mais de 140 milh\xF5es de pessoas no WhatsApp e a vida social acontece nos grupos. Retrospectivas viralizam no fim do ano (Spotify Wrapped) e n\xE3o existe uma para grupos de WhatsApp, em portugu\xEAs e com privacidade.'],
    ['P\xFAblico', 'Grupos de amigos (18\u201335 anos), fam\xEDlias, trabalho e comunidades. Casais como segundo produto: presente e datas comemorativas.'],
    ['Diferencial', 'Nenhuma mensagem sai do celular; humor brasileiro; cards e v\xEDdeo prontos para stories. Cada grupo tem v\xE1rios membros que veem o resultado, ent\xE3o um uso puxa outros.'],
    ['Receita', 'Premium por pagamento \xFAnico: R$ 13,99 no Pix ou no cart\xE3o (Stripe); casal cobrado depois do Ato I \xB7 AdSense para quem n\xE3o \xE9 Premium \xB7 parceria Party Games (7% das vendas, desligada) \xB7 pr\xF3ximas: pacote Casais no Dia dos Namorados (12/06) e pre\xE7o por temporada.'],
    ['Aquisi\xE7\xE3o', 'Cards e v\xEDdeo compartilhados levam o endere\xE7o do site \xB7 Reels e TikTok com exemplos \xB7 SEO (blog, \u201CWhatsApp Wrapped\u201D) \xB7 datas: dezembro/janeiro (retrospectiva), Dia dos Namorados, anivers\xE1rios de grupo.'],
    ['Metas', 'Empatar: ' + fmt(k.equilibrio) + ' vendas/m\xEAs. Temporada dez\u2013jan: ' + fmt(meta) + ' vendas pagam todo o investimento e 3 meses de custo fixo. Acompanhar: grupos/dia, Pix gerado \u2192 pago, vendas por grupo.'],
    ['Riscos', 'WhatsApp mudar o formato do export \xB7 venda concentrada no fim do ano \xB7 pagamento \xFAnico (pouca recorr\xEAncia) \xB7 c\xF3pia da ideia \xB7 custo fixo alto para a receita atual (a assinatura do Claude \xE9 o maior custo: d\xE1 para baixar o plano fora da temporada).'],
    ['Pr\xF3ximos passos', 'Ligar Analytics e Search Console no painel \xB7 Instagram e TikTok \xB7 preparar a campanha de dezembro \xB7 testar pre\xE7o (ex.: R$ 9,90 no Casais) \xB7 e-mail para a lista de novidades no lan\xE7amento da temporada.']];
  h += '<section><h2>Plano de neg\xF3cio</h2><div class="dois">' + P.map(([t, x]) => '<div class="card"><b>' + t + '</b><p style="margin:6px 0 0;color:var(--txt2)">' + x + '</p></div>').join('') + '</div></section>';
  $('#neg-resto').innerHTML = h;
  NEG.custos.forEach((c, i) => { const e = $('#tot' + i); if (e) e.textContent = brl(gasto(c)); });
}
function formNegocio(){
  const linha = (c, i) => '<tr><td><input data-i="' + i + '" data-c="nome" value="' + esc(c.nome) + '" aria-label="Item"></td><td><input data-i="' + i + '" data-c="valor" inputmode="decimal" value="' + esc(c.valor) + '" aria-label="Valor em reais" style="width:90px"></td>' +
    '<td><select data-i="' + i + '" data-c="freq" aria-label="Frequ\xEAncia">' + ['mensal', 'anual', '\xFAnico'].map(f => '<option' + (c.freq === f ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></td>' +
    '<td><input type="date" data-i="' + i + '" data-c="desde" value="' + esc(c.desde) + '" aria-label="Desde"></td><td class="n" id="tot' + i + '"></td><td><input data-i="' + i + '" data-c="obs" value="' + esc(c.obs) + '" aria-label="Observa\xE7\xE3o"></td>' +
    '<td><button class="sec mini" data-tira="' + i + '" aria-label="Remover ' + esc(c.nome) + '">\xD7</button></td></tr>';
  $('#neg-form').innerHTML = '<section><h2>Investimentos</h2><div class="card"><div class="rola"><table class="edit"><thead><tr><th>Item</th><th>Valor (R$)</th><th>Frequ\xEAncia</th><th>Desde</th><th class="n">At\xE9 hoje</th><th>Observa\xE7\xE3o</th><th></th></tr></thead><tbody>' +
    NEG.custos.map(linha).join('') + '</tbody></table></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="sec" id="mais">+ Adicionar item</button></div>' +
    '<div class="grid" style="margin-top:14px">' + PREMISSAS.map(([k, t, tipo]) => '<label class="campo">' + t + '<input data-p="' + k + '" ' + (tipo ? 'type="' + tipo + '"' : 'inputmode="decimal"') + ' value="' + esc(NEG[k]) + '"></label>').join('') + '</div>' +
    '<div style="display:flex;gap:10px;align-items:center;margin-top:12px"><button id="salvar">Salvar</button><span id="salvo" class="aviso" role="status"></span></div></div></section>';
  $('#neg-form').oninput = $('#neg-form').onchange = e => { const t = e.target;
    if (t.dataset.c) NEG.custos[t.dataset.i][t.dataset.c] = t.value; else if (t.dataset.p) NEG[t.dataset.p] = t.value; else return;
    $('#salvo').textContent = 'Altera\xE7\xF5es n\xE3o salvas.'; calcNegocio(); };
  $('#neg-form').onclick = e => { const t = e.target;
    if (t.id === 'mais'){ NEG.custos.push({nome: '', valor: 0, freq: 'mensal', desde: new Date().toISOString().slice(0, 10), obs: ''}); formNegocio(); calcNegocio(); }
    if (t.dataset.tira){ NEG.custos.splice(Number(t.dataset.tira), 1); formNegocio(); calcNegocio(); $('#salvo').textContent = 'Altera\xE7\xF5es n\xE3o salvas.'; }
    if (t.id === 'salvar') salvaNegocio(); };
}
async function salvaNegocio(){
  $('#salvo').textContent = 'Salvando\u2026';
  const r = await fetch('/api/admin/negocio', {method: 'POST', headers: {'x-senha': senha, 'content-type': 'application/json'}, body: JSON.stringify(NEG)}).catch(() => null);
  $('#salvo').textContent = r?.ok ? 'Salvo.' : 'N\xE3o consegui salvar. Tente de novo.';
}
function negocio(d){
  DADOS = d; NEG = Object.assign(JSON.parse(JSON.stringify(NEG_PADRAO)), d.negocio || {});
  formNegocio(); calcNegocio();
}

// ---------- aba Funil ----------
const NOMES_DIM = {deviceCategory: 'Dispositivo', operatingSystem: 'Sistema', sessionDefaultChannelGroup: 'Canal', sessionSource: 'Origem', newVsReturning: 'Novo ou voltou'};
const TRAD = {mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet', new: 'Novo', returning: 'Voltou', Direct: 'Direto', 'Organic Search': 'Busca org\xE2nica', 'Organic Social': 'Redes sociais',
  Referral: 'Outros sites', Unassigned: 'Sem origem', '(not set)': 'N\xE3o informado', 'Paid Search': 'Busca paga', 'Paid Social': 'Social pago', Email: 'E-mail'};
const tr = v => TRAD[v] || v;
let FUNIL = {dias: '30', ver: '', campo: '', valor: '', aberto: '0'}, OPCOES = null;
try { Object.assign(FUNIL, JSON.parse(localStorage.getItem('rz_funil') || '{}')); } catch {}
const pctN = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
function controlesFunil(){
  const sel = (id, rot, ops, v) => '<label class="campo">' + rot + '<select id="' + id + '">' + ops.map(([k, t]) => '<option value="' + esc(k) + '"' + (String(v) === String(k) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
  const dims = [['', 'Nenhum'], ...Object.entries(NOMES_DIM)];
  const vals = FUNIL.campo && OPCOES?.[FUNIL.campo] ? OPCOES[FUNIL.campo] : [];
  if (FUNIL.valor && !vals.includes(FUNIL.valor)) vals.unshift(FUNIL.valor);
  return '<div class="card filtros">' + sel('f-dias', 'Per\xEDodo', [['7', '\xDAltimos 7 dias'], ['14', '\xDAltimos 14 dias'], ['30', '\xDAltimos 30 dias'], ['90', '\xDAltimos 90 dias'], ['lanc', 'Desde o lan\xE7amento (17/10)']], FUNIL.dias) +
    sel('f-campo', 'Filtrar por', dims.filter(d => d[0] !== 'sessionSource'), FUNIL.campo) +
    (FUNIL.campo ? sel('f-valor', 'Valor', [['', 'Todos'], ...vals.map(v => [v, tr(v)])], FUNIL.valor) : '') +
    sel('f-ver', 'Comparar por', dims, FUNIL.ver) +
    sel('f-aberto', 'Tipo de funil', [['0', 'Fechado: come\xE7a no In\xEDcio'], ['1', 'Aberto: entra em qualquer etapa']], FUNIL.aberto) + '</div>';
}
function desenhaFunil(f){
  const p = f.passos, n0 = p[0] || 0, fim = p[9] || 0, comp = p[10] || 0;
  // maior perda entre etapas seguidas (em pessoas)
  let pior = -1, piorN = 0; for (let i = 1; i < p.length; i++){ const s = (p[i - 1] || 0) - (p[i] || 0); if (s > piorN){ piorN = s; pior = i; } }
  let h = '<div class="grid" style="margin-top:12px">' + tile(fmt(n0), f.aberto ? 'Entraram no funil (1\xAA etapa)' : 'Come\xE7aram no In\xEDcio') +
    tile(fmt(fim), 'Chegaram ao fim', pctN(fim, n0).toLocaleString('pt-BR') + '% de quem come\xE7ou') + tile(fmt(comp), 'Compartilharam', pctN(comp, n0).toLocaleString('pt-BR') + '% de quem come\xE7ou') +
    tile(pior > 0 ? '\u2212' + fmt(piorN) : '\u2014', 'Maior perda', pior > 0 ? f.nomes[pior - 1] + ' \u2192 ' + f.nomes[pior] + ' (' + pctN(piorN, p[pior - 1]).toLocaleString('pt-BR') + '% sa\xEDram)' : 'sem dados') + '</div>';
  h += '<div class="card" style="margin-top:12px"><b>Jornada completa</b>' + (f.aproximado ? ' <span class="tag">aproximado</span>' : '') + '<div class="funil">';
  p.forEach((v, i) => {
    if (i){ const s = (p[i - 1] || 0) - v, pr = pctN(s, p[i - 1]);
      h += '<div class="perda' + (i === pior ? ' pior' : '') + '">' + (s > 0 ? '\u2193 sa\xEDram ' + fmt(s) + ' (' + pr.toLocaleString('pt-BR') + '%)' + (i === pior ? ' \xB7 \u26A0 maior perda' : '') : s < 0 ? '\u2191 +' + fmt(-s) + ' entraram aqui' : '\u2193 ningu\xE9m saiu') + '</div>'; }
    const w = n0 ? Math.max(.5, v / Math.max(n0, ...p) * 100) : 0;
    h += '<div class="etapa" data-t="' + esc(f.nomes[i] + ': ' + fmt(v) + ' pessoas \xB7 ' + pctN(v, n0).toLocaleString('pt-BR') + '% do in\xEDcio') + '"><span class="nome"><span class="num">' + (i + 1) + '</span>' + esc(f.nomes[i]) + '</span>' +
      '<span class="trilho"><span class="barra-f" style="width:' + w + '%"></span></span><span class="val">' + fmt(v) + ' <small>' + pctN(v, n0).toLocaleString('pt-BR') + '%</small></span></div>';
  });
  h += '</div>' + (f.aproximado ? '<p class="aviso">O relat\xF3rio de funil do Google n\xE3o respondeu' + (f.erroFunil ? ' (' + esc(f.erroFunil) + ')' : '') + '. Mostrando quantas pessoas viram cada etapa, sem exigir a ordem.</p>' : '') +
    '<p class="aviso">Pessoas \xFAnicas em cada etapa, na ordem. \u201CMetade dos pr\xEAmios\u201D = 4\xBA pr\xEAmio. Quem escolhe \u201CRecusar\u201D no aviso de cookies pode n\xE3o ser contado.</p></div>';
  if (f.ver){
    h += '<div class="card" style="margin-top:12px"><b>Comparando por ' + esc(NOMES_DIM[f.ver]) + '</b>';
    if (f.erroQuebra) h += '<p class="aviso"><b>Erro:</b> ' + esc(f.erroQuebra) + '</p>';
    else h += '<div class="rola">' + tabela([['Etapa'], ...f.quebra.map(q => [esc(tr(q.valor)), 1])], f.nomes.map((nm, i) => [esc(nm), ...f.quebra.map(q => fmt(q.passos[i]) + ' <small class="sub">' + pctN(q.passos[i], q.passos[0]).toLocaleString('pt-BR') + '%</small>')])) + '</div>' +
      '<p class="aviso">% = parte de quem come\xE7ou naquele recorte. At\xE9 6 valores, os maiores.</p>';
    h += '</div>';
  }
  const c = DADOS?.site?.compras || {};
  h += '<div class="dois" style="margin-top:12px"><div class="card"><b>Por onde as pessoas entram</b>' + tabela([['P\xE1gina de entrada'], ['Sess\xF5es', 1], ['Engajamento', 1]], (f.entrada || []).map(x => [esc(x[0] || '(sem p\xE1gina)'), fmt(x[1]), pct(x[3])])) + '</div>' +
    '<div class="card"><b>Pagamento</b>' + tabela([['Etapa'], ['Pessoas', 1]], [...(f.pagamento || []).map(x => [esc(x[0]) + ' <span class="tag">Analytics</span>', fmt(x[1])]),
      ['Pix gerado \u2192 pago <span class="tag">banco</span>', fmt(c.pagos_pix) + ' de ' + fmt(c.pix)], ['Cart\xE3o: checkout \u2192 pago <span class="tag">banco</span>', fmt(c.pagos_cartao) + ' de ' + fmt(c.checkouts)]]) +
    '<p class="aviso">\u201Cbanco\u201D = n\xFAmeros reais das vendas (D1), no per\xEDodo todo.</p></div></div>';
  return h;
}
async function carregaFunil(){
  const el = $('#aba-f'); if (!el) return;
  try { localStorage.setItem('rz_funil', JSON.stringify(FUNIL)); } catch {}
  el.innerHTML = '<section><h2>Funil da jornada</h2>' + controlesFunil() + '<div id="f-corpo"><p class="aviso" role="status">Carregando o funil\u2026</p></div></section>';
  ligaFiltros();
  const qs = new URLSearchParams(FUNIL).toString();
  const r = await fetch('/api/admin/funil?' + qs, {headers: {'x-senha': senha}}).catch(() => null);
  const f = r?.ok ? await r.json() : {erro: r ? 'HTTP ' + r.status : 'sem conex\xE3o'};
  if (f.opcoes && !OPCOES){ OPCOES = f.opcoes; if (FUNIL.campo){ el.querySelector('.filtros').outerHTML = controlesFunil(); ligaFiltros(); } }
  $('#f-corpo').innerHTML = f.erro ? falta(f, 'Configure o Google Analytics (GOOGLE_SA e GA4_PROPERTY) para ver o funil.') : desenhaFunil(f);
}
function ligaFiltros(){
  const muda = (id, k, extra) => { const e = $('#' + id); if (e) e.onchange = () => { FUNIL[k] = e.value; if (extra) extra(); carregaFunil(); }; };
  muda('f-dias', 'dias'); muda('f-ver', 'ver'); muda('f-aberto', 'aberto'); muda('f-valor', 'valor'); muda('f-campo', 'campo', () => { FUNIL.valor = ''; });
}

// ---------- gr\xE1fico combinado: grupos + pagamentos (mesma escala) e % de convers\xE3o embaixo (mesmas datas) ----------
let GRAF = {dias: '30', agrupar: 'dia', meio: '', modo: '', base: 'ga', grupos: true, pagos: true, conv: true};
try { Object.assign(GRAF, JSON.parse(localStorage.getItem('rz_graf') || '{}')); } catch {}
const ddmm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
function serieCombo(){
  const s = DADOS.site || {}, up = DADOS.analytics?.uploads, temGA = Array.isArray(up);
  const base = GRAF.base === 'ga' && temGA ? 'ga' : 'banco';
  const ini = GRAF.dias === 'lanc' ? '2026-10-17' : new Date(Date.now() - (num(GRAF.dias) - 1) * 864e5).toISOString().slice(0, 10), hoje = new Date().toISOString().slice(0, 10);
  const g = new Map(), p = new Map(), soma = (m, k, n) => m.set(k, (m.get(k) || 0) + n);
  if (base === 'ga') up.forEach(([d, n]) => soma(g, d, n)); else (s.gDia || []).filter(x => !GRAF.modo || x.modo === GRAF.modo).forEach(x => soma(g, x.dia, x.n));
  (s.cDia || []).filter(x => !GRAF.meio || x.meio === GRAF.meio).forEach(x => soma(p, x.dia, x.n));
  // um ponto por dia (ou por semana, come\xE7ando na segunda)
  const pts = [], idx = new Map();
  for (let t = new Date(ini + 'T12:00:00'); t.toISOString().slice(0, 10) <= hoje; t = new Date(t.getTime() + 864e5)){
    const d = t.toISOString().slice(0, 10);
    let k = d; if (GRAF.agrupar === 'semana'){ const w = new Date(t.getTime() - ((t.getDay() + 6) % 7) * 864e5); k = w.toISOString().slice(0, 10); }
    if (!idx.has(k)){ idx.set(k, pts.length); pts.push({k, g: 0, p: 0}); }
    const o = pts[idx.get(k)]; o.g += g.get(d) || 0; o.p += p.get(d) || 0;
  }
  return {pts, base, temGA};
}
function desenhaCombo(){
  const el = $('#combo'); if (!el) return;
  try { localStorage.setItem('rz_graf', JSON.stringify(GRAF)); } catch {}
  const {pts, base, temGA} = serieCombo(), nomeG = base === 'ga' ? 'Grupos lidos' : 'Grupos no ranking';
  const tg = pts.reduce((a, x) => a + x.g, 0), tp = pts.reduce((a, x) => a + x.p, 0);
  const sel = (id, rot, ops, v) => '<label class="campo">' + rot + '<select id="' + id + '">' + ops.map(([k, t]) => '<option value="' + k + '"' + (String(v) === k ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>';
  const chip = (k, t, cor) => '<button type="button" class="chip" data-serie="' + k + '" aria-pressed="' + !!GRAF[k] + '"><span class="cor" style="background:' + cor + '"></span>' + t + '</button>';
  let h = '<div class="card"><div class="ttl-c"><b>Grupos, pagamentos e convers\xE3o</b><span class="sub">' + fmt(tg) + ' ' + nomeG.toLowerCase() + ' \xB7 ' + fmt(tp) + ' pagamentos \xB7 ' +
    (tg ? pctN(tp, tg).toLocaleString('pt-BR') + '% de convers\xE3o' : 'sem grupos no per\xEDodo') + '</span></div>';
  h += '<div class="filtros" style="margin-top:10px">' + sel('g-dias', 'Per\xEDodo', [['7', '\xDAltimos 7 dias'], ['14', '\xDAltimos 14 dias'], ['30', '\xDAltimos 30 dias'], ['90', '\xDAltimos 90 dias'], ['lanc', 'Desde o lan\xE7amento']], GRAF.dias) +
    sel('g-agrupar', 'Ver por', [['dia', 'Dia'], ['semana', 'Semana']], GRAF.agrupar) +
    sel('g-base', 'Grupos contados', [['ga', 'Grupos lidos (Analytics)'], ['banco', 'No ranking (banco)']], base) +
    (base === 'banco' ? sel('g-modo', 'Tipo de grupo', [['', 'Todos'], ['amigos', 'Amigos'], ['familia', 'Fam\xEDlia'], ['trabalho', 'Trabalho'], ['comunidade', 'Comunidade'], ['casal', 'Casais']], GRAF.modo) : '') +
    sel('g-meio', 'Meio de pagamento', [['', 'Pix e cart\xE3o'], ['pix', 'S\xF3 Pix'], ['cartao', 'S\xF3 cart\xE3o']], GRAF.meio) + '</div>';
  h += '<div class="chips">' + chip('grupos', nomeG, 'var(--g1)') + chip('pagos', 'Pagamentos', 'var(--g2)') + chip('conv', '% de convers\xE3o', 'var(--g3)') + '</div>';
  if (!temGA && GRAF.base === 'ga') h += '<p class="aviso">Analytics indispon\xEDvel: usando os grupos do ranking.</p>';
  const W = 600, n = pts.length, bw = W / Math.max(1, n), lado = GRAF.grupos && GRAF.pagos;
  const rot = x => (GRAF.agrupar === 'semana' ? 'sem. ' : '') + ddmm(x.k);
  const dica = x => esc(rot(x) + ': ' + fmt(x.g) + ' ' + nomeG.toLowerCase() + ' \xB7 ' + fmt(x.p) + ' pagamentos' + (x.g ? ' \xB7 ' + pctN(x.p, x.g).toLocaleString('pt-BR') + '%' : ''));
  const eixo = (H) => [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i).map((i, j, a) => '<text class="eixo" x="' + (i * bw + bw / 2) + '" y="' + (H - 4) + '" text-anchor="' + (j === 0 && a.length > 1 ? 'start' : j === a.length - 1 && a.length > 1 ? 'end' : 'middle') + '">' + rot(pts[i]) + '</text>').join('');
  if (GRAF.grupos || GRAF.pagos){
    const H = 170, b0 = H - 18, max = Math.max(1, ...pts.map(x => Math.max(GRAF.grupos ? x.g : 0, GRAF.pagos ? x.p : 0)));
    const barra = (v, x, w, cor) => { const hh = v ? Math.max(3, v / max * (b0 - 14)) : 0; return hh ? '<rect x="' + x + '" y="' + (b0 - hh) + '" width="' + Math.max(1, w) + '" height="' + hh + '" rx="2" fill="' + cor + '"></rect>' : ''; };
    const marcas = pts.map((x, i) => { const w = lado ? (bw - 3) / 2 : bw - 2, x0 = i * bw + 1;
      return '<g class="col"><rect class="alvo" x="' + (i * bw) + '" y="0" width="' + bw + '" height="' + b0 + '" data-t="' + dica(x) + '"></rect>' +
        (GRAF.grupos ? barra(x.g, x0, w, 'var(--g1)') : '') + (GRAF.pagos ? barra(x.p, lado ? x0 + w + 1 : x0, w, 'var(--g2)') : '') + '</g>'; }).join('');
    h += '<div class="graf"><div class="ttl"><b style="font-weight:500;color:var(--txt2)">Quantidade</b><span>m\xE1x. ' + fmt(max) + '/' + GRAF.agrupar + '</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Grupos e pagamentos por ' + GRAF.agrupar + '" style="height:170px">' +
      '<line x1="0" x2="' + W + '" y1="' + b0 + '" y2="' + b0 + '" stroke="var(--borda)"></line>' + marcas + eixo(H) + '</svg></div>';
  }
  if (GRAF.conv){
    const H = 100, b0 = H - 18, cv = pts.map(x => x.g ? x.p / x.g : null), max = Math.max(.01, ...cv.filter(v => v != null));
    const marcas = pts.map((x, i) => { const v = cv[i], hh = v ? Math.max(3, v / max * (b0 - 14)) : 0;
      return '<g class="col"><rect class="alvo" x="' + (i * bw) + '" y="0" width="' + bw + '" height="' + b0 + '" data-t="' + dica(x) + '"></rect>' + (hh ? '<rect x="' + (i * bw + 1) + '" y="' + (b0 - hh) + '" width="' + Math.max(1, bw - 2) + '" height="' + hh + '" rx="2" fill="var(--g3)"></rect>' : '') + '</g>'; }).join('');
    h += '<div class="graf" style="margin-top:8px"><div class="ttl"><b style="font-weight:500;color:var(--txt2)">% de convers\xE3o (pagamentos \xF7 grupos)</b><span>m\xE1x. ' + (max * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '%</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Convers\xE3o por ' + GRAF.agrupar + '" style="height:100px">' +
      '<line x1="0" x2="' + W + '" y1="' + b0 + '" y2="' + b0 + '" stroke="var(--borda)"></line>' + marcas + eixo(H) + '</svg></div>';
  }
  h += '<details style="margin-top:8px"><summary class="aviso">Ver em tabela</summary><div class="rola">' + tabela([[GRAF.agrupar === 'semana' ? 'Semana' : 'Dia'], [nomeG, 1], ['Pagamentos', 1], ['Convers\xE3o', 1]],
    pts.slice().reverse().filter(x => x.g || x.p).map(x => [rot(x), fmt(x.g), fmt(x.p), x.g ? pctN(x.p, x.g).toLocaleString('pt-BR') + '%' : '\u2014'])) + '</div></details>';
  h += '<p class="aviso">' + (base === 'ga' ? '\u201CGrupos lidos\u201D = conversas abertas no site (evento do Analytics); n\xE3o conta quem recusou cookies.' : '\u201CNo ranking\u201D = s\xF3 quem aceitou a compara\xE7\xE3o, por isso a % pode passar de 100%.') + ' Pagamentos v\xEAm do banco (reais).</p></div>';
  el.innerHTML = h;
  const muda = (id, k) => { const e = $('#' + id); if (e) e.onchange = () => { GRAF[k] = e.value; desenhaCombo(); }; };
  ['dias', 'agrupar', 'base', 'modo', 'meio'].forEach(k => muda('g-' + k, k));
  el.querySelectorAll('[data-serie]').forEach(b => b.onclick = () => { GRAF[b.dataset.serie] = !GRAF[b.dataset.serie]; if (!GRAF.grupos && !GRAF.pagos && !GRAF.conv) GRAF[b.dataset.serie] = true; desenhaCombo(); });
}

function render(d){
  const s = d.site || {}, g = s.grupos || {}, c = s.compras || {}, a = d.analytics || {}, b = d.busca || {}, ide = Object.fromEntries((s.ideias || []).map(x => [x.tipo, x.n]));
  const conv = c.pix ? (c.pagos_pix || 0) / c.pix : 0, sug = Object.entries(ide).filter(([t]) => t !== 'novidades').reduce((x, [, n]) => x + n, 0);
  let h = '<header><div><h1>Painel Retrozap</h1><div class="sub">Atualizado ' + new Date(d.gerado).toLocaleString('pt-BR') + '</div></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<span class="status"><span class="ponto' + (d.cobranca === 'ligada' ? '' : ' off') + '"></span>Cobran\xE7a ' + esc(d.cobranca) + '</span><button class="sec" id="sair">Sair</button><button id="atualizar">Atualizar</button></div></header>' +
    '<nav class="abas" role="tablist"><button role="tab" data-aba="m">M\xE9tricas</button><button role="tab" data-aba="f">Funil</button><button role="tab" data-aba="n">Neg\xF3cio</button></nav><div id="aba-m" role="tabpanel">';
  h += '<section><h2>Links</h2><div class="links">' + LINKS.map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + ' \u2197</a>').join('') + '</div></section>';
  if (s.erro) h += '<section><h2>Site</h2>' + falta(s) + '</section>';
  else {
    h += '<section><h2>Site</h2><div class="grid">' + tile(fmt(g.total), 'Grupos no ranking', fmt(g.semana) + ' nos \xFAltimos 7 dias \xB7 ' + fmt(g.hoje) + ' hoje') +
      tile(fmt(c.clientes), 'Clientes premium', fmt(c.pagos) + ' pagamentos') + tile(brl0(c.receita), 'Receita bruta', 'Pix ' + brl0((c.receita || 0) - (c.receita_cartao || 0)) + ' \xB7 Cart\xE3o ' + brl0(c.receita_cartao) + ' \xB7 ' + fmt(c.semana) + ' vendas em 7 dias') +
      tile(pct(conv), 'Pix gerado \u2192 pago', fmt(c.pagos_pix) + ' de ' + fmt(c.pix) + ' Pix') + tile(pct(c.checkouts ? (c.pagos_cartao || 0) / c.checkouts : 0), 'Cart\xE3o: checkout \u2192 pago', fmt(c.pagos_cartao) + ' de ' + fmt(c.checkouts) + ' checkouts') + tile(fmt(ide.novidades), 'E-mails de novidades') + tile(fmt(sug), 'Sugest\xF5es recebidas') + '</div>';
    h += '<div id="combo" style="margin-top:12px"></div>';
    h += '<div class="dois" style="margin-top:12px"><div class="card"><b>Grupos por tipo</b>' + tabela([['Tipo'], ['Grupos', 1], ['%', 1]], (s.modos || []).map(m => [MODOS[m.modo] || esc(m.modo), fmt(m.n), pct(m.n / (g.total || 1))])) + '</div>' +
      '<div class="card"><b>\xDAltimos pagamentos</b>' + tabela([['E-mail'], ['Meio'], ['Quando', 1], ['Valor', 1]], (s.ultimas || []).map(u => [esc(u.email), u.meio, new Date(u.pago).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}), brl(u.valor)])) + '</div></div>';
    h += '<div class="card" style="margin-top:12px"><b>Sugest\xF5es recentes</b>' + tabela([['Quando'], ['Tipo'], ['Texto']], (s.recentes || []).map(r => [new Date(r.criado).toLocaleDateString('pt-BR'), '<span class="tag">' + esc(r.tipo) + '</span>', esc(r.texto)])) + '</div>';
    h += '<p class="aviso">\u201CGrupos no ranking\u201D conta s\xF3 quem aceitou entrar na compara\xE7\xE3o (o resto nunca sai do celular). Para todos os acessos, veja o Analytics.</p></section>';
  }
  h += '<section><h2>Google Analytics \xB7 30 dias</h2>';
  if (a.erro) h += falta(a, 'Crie a conta de servi\xE7o, coloque o JSON no segredo GOOGLE_SA e o n\xFAmero da propriedade na vari\xE1vel GA4_PROPERTY.');
  else h += '<div class="grid">' + tile(fmt(a.total[0]), 'Usu\xE1rios ativos') + tile(fmt(a.total[1]), 'Sess\xF5es') + tile(fmt(a.total[2]), 'Visualiza\xE7\xF5es') + '</div><div class="dois" style="margin-top:12px">' +
    barras('Usu\xE1rios por dia', dias30(a.dia.map(x => [x[0], x[1]])), 'usu\xE1rios') + '<div class="card"><b>Origem das sess\xF5es</b>' + tabela([['Canal'], ['Sess\xF5es', 1]], a.canais.map(x => [esc(x[0]), fmt(x[1])])) + '</div></div>' +
    '<div class="card" style="margin-top:12px"><b>P\xE1ginas mais vistas</b>' + tabela([['P\xE1gina'], ['Visualiza\xE7\xF5es', 1]], a.paginas.map(x => [esc(x[0]), fmt(x[1])])) + '</div>';
  h += '</section><section><h2>Google Search \xB7 30 dias</h2>';
  if (b.erro) h += falta(b, 'Usa a mesma conta de servi\xE7o (GOOGLE_SA); adicione o e-mail dela como usu\xE1rio no Search Console.');
  else h += '<div class="grid">' + tile(fmt(b.total.cliques), 'Cliques') + tile(fmt(b.total.impressoes), 'Impress\xF5es') + tile(pct(b.total.ctr), 'CTR') + tile((b.total.posicao || 0).toLocaleString('pt-BR', {maximumFractionDigits: 1}), 'Posi\xE7\xE3o m\xE9dia') + '</div>' +
    '<div class="dois" style="margin-top:12px">' + barras('Cliques por dia', dias30(b.dia.map(x => [x.dia, x.cliques]), 1), 'cliques') + '<div class="card"><b>O que buscaram</b>' +
    tabela([['Termo'], ['Cliques', 1], ['Impr.', 1], ['Pos.', 1]], b.termos.map(x => [esc(x.termo), fmt(x.cliques), fmt(x.impressoes), x.posicao.toLocaleString('pt-BR', {maximumFractionDigits: 1})])) + '</div></div>' +
    '<p class="aviso">O Google libera os dados de busca com 2\u20133 dias de atraso.</p>';
  h += '</section></div><div id="aba-f" role="tabpanel"></div><div id="aba-n" role="tabpanel"><div id="neg-pay"></div><div id="neg-form"></div><div id="neg-resto"></div></div>';
  $('#app').innerHTML = h;
  negocio(d); desenhaCombo();
  const aba = a => { try { localStorage.setItem('rz_aba', a); } catch {} document.querySelectorAll('[data-aba]').forEach(b => b.setAttribute('aria-selected', b.dataset.aba === a)); $('#aba-m').hidden = a !== 'm'; $('#aba-n').hidden = a !== 'n'; $('#aba-f').hidden = a !== 'f'; if (a === 'f' && !$('#aba-f').innerHTML) carregaFunil(); };
  document.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => aba(b.dataset.aba));
  let a0 = 'm'; try { a0 = localStorage.getItem('rz_aba') || 'm'; } catch {} aba(a0); $('#app').hidden = false; $('#login').hidden = true;
  $('#atualizar').onclick = carrega; $('#sair').onclick = () => { try { localStorage.removeItem('rz_admin'); } catch {} senha = ''; $('#app').hidden = true; $('#login').hidden = false; };
}
async function carrega(){
  if (!senha){ $('#login').hidden = false; return; }
  const r = await fetch('/api/admin/dados', {headers: {'x-senha': senha}}).catch(() => null);
  if (r?.ok) return render(await r.json());
  $('#app').hidden = true; $('#login').hidden = false;
  $('#erro').textContent = r?.status === 401 ? 'Senha errada.' : r?.status === 503 ? 'Painel desligado: crie o segredo ADMIN_SENHA na Cloudflare.' : 'N\xE3o consegui carregar. Tente de novo.';
}
$('#login').onsubmit = e => { e.preventDefault(); senha = $('#senha').value; try { localStorage.setItem('rz_admin', senha); } catch {} carrega(); };
const tip = $('#tip');
document.addEventListener('mousemove', e => { const t = e.target.closest?.('[data-t]'); if (!t){ tip.style.display = 'none'; return; }
  tip.textContent = t.dataset.t; tip.style.display = 'block'; tip.style.left = Math.min(e.pageX + 12, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = (e.pageY - 34) + 'px'; });
carrega();
<\/script></body></html>`;
var btwInsightsCache;
async function btwInsights(env) {
  if (btwInsightsCache?.until > Date.now()) return btwInsightsCache.value;
  const value = collectBtwInsights(env).catch(() => ({ status: "error" }));
  btwInsightsCache = { until: Date.now() + 3e5, value };
  return value;
}
__name(btwInsights, "btwInsights");
async function collectBtwInsights(env) {
  if (!env.GOOGLE_SA || !env.GA4_PROPERTY) throw Error("not_configured");
  const rep = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runReport`;
  const dates = [{ startDate: "29daysAgo", endDate: "today" }];
  const segment = /* @__PURE__ */ __name(async (dim) => {
    const r = await google(env, rep, { dateRanges: dates, dimensions: [{ name: "date" }, { name: dim }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }], limit: 1e3, orderBys: [{ dimension: { dimensionName: "date" } }] });
    return { status: "available", rows: linhas(r).map(([d, segment2, users, sessions, pageviews]) => ({ date: d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6), segment: String(segment2).slice(0, 100), users, sessions, pageviews })), thresholded: !!r.metadata?.subjectToThresholding };
  }, "segment");
  const funnel = /* @__PURE__ */ __name(async (days) => {
    const end = btwDay(), start = btwOffset(end, 1 - days);
    const chosen = [0, 1, 2, 3, 5, 8, 9, 10].map((i) => ETAPAS[i]);
    const r = await google(env, `https://analyticsdata.googleapis.com/v1alpha/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runFunnelReport`, { dateRanges: [{ startDate: start, endDate: end }], funnel: { isOpenFunnel: false, steps: chosen.map(([name, filterExpression, key]) => ({ name, filterExpression: typeof key === "string" && key.startsWith("/") ? { funnelEventFilter: { eventName: "page_view", funnelParameterFilterExpression: { funnelParameterFilter: { eventParameterName: "page_location", stringFilter: { matchType: "FULL_REGEXP", value: "^https?://(www\\.)?retrozap\\.com\\.br" + (key === "/" ? "/" : key + "/?") + "([?#].*)?$", caseSensitive: false } } } } } : filterExpression })) } });
    const t = r.funnelTable;
    if (!t || !Array.isArray(t.rows)) throw Error("missing_funnel");
    const at = (t.metricHeaders || []).findIndex((x) => x.name === "activeUsers");
    if (at < 0) throw Error("missing_metric");
    const counts = new Map(t.rows.map((row) => [parseInt(row.dimensionValues?.[0]?.value) - 1, Number(row.metricValues?.[at]?.value)]));
    return { status: "available", days, start_date: start, end_date: end, mode: "closed", sequential: true, steps: chosen.map(([name], i) => ({ name, users: counts.has(i) && Number.isFinite(counts.get(i)) ? counts.get(i) : null })), thresholded: !!t.metadata?.subjectToThresholding };
  }, "funnel");
  const safePart = /* @__PURE__ */ __name(async (p) => {
    try {
      return await p;
    } catch (e) {
      const m = String(e?.message || "");
      const hints = ["pagePath", "page_location", "activeUsers", "funnelStepName", "funnelEventFilter", "filterExpression", "isOpenFunnel", "missing_funnel", "missing_metric", "Unknown name", "not supported", "not a valid", "permission", "quota", "exhausted", "limit", "INVALID_ARGUMENT"].filter((x) => m.toLowerCase().includes(x.toLowerCase()));
      return { status: "error", error_code: "GA_FUNNEL_REPORT_FAILED", diagnostic_hints: hints };
    }
  }, "safePart");
  const [channels, devices, funnel7, funnel30] = await Promise.all([safePart(segment("sessionDefaultChannelGroup")), safePart(segment("deviceCategory")), safePart(funnel(7)).then((x) => ({ ...x, days: 7 })), safePart(funnel(30)).then((x) => ({ ...x, days: 30 }))]);
  return { status: "available", channels, devices, funnels: [funnel7, funnel30], period: "29daysAgo..today", collected_at: (/* @__PURE__ */ new Date()).toISOString() };
}
__name(collectBtwInsights, "collectBtwInsights");
var BTW_GA_PRODUCTS = [["Quiddo", "562055723"], ["SPORT DNA", "562098147"]];
var btwProductCache;
async function btwProductAnalytics(env) {
  const end = btwDay();
  if (btwProductCache?.end === end && btwProductCache.until > Date.now()) return btwProductCache.value;
  const value = Promise.all(BTW_GA_PRODUCTS.map(async ([product, property]) => {
    if (!env.GOOGLE_SA) return [product, { status: "not_configured", property_id: property }];
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, dateRanges = [{ startDate: btwOffset(end, -29), endDate: end }], metrics = [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }];
      const run = /* @__PURE__ */ __name((dimensions) => google(env, url, { dateRanges, metrics, ...dimensions ? { dimensions: dimensions.map((name) => ({ name })), limit: 1e3 } : {}, ...dimensions?.includes("date") ? { orderBys: [{ dimension: { dimensionName: "date" } }] } : {} }), "run");
      const [tot, daily, channels, devices] = await Promise.all([run(), run(["date"]), run(["date", "sessionDefaultChannelGroup"]), run(["date", "deviceCategory"])]);
      const rows = linhas(tot)[0];
      if (!rows) throw Error("empty_totals");
      const date = /* @__PURE__ */ __name((d) => d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6), "date"), segments = /* @__PURE__ */ __name((r) => ({ status: "available", thresholded: !!r.metadata?.subjectToThresholding, rows: linhas(r).map(([d, segment, users, sessions, pageviews]) => ({ date: date(d), segment: String(segment).slice(0, 100), users, sessions, pageviews })) }), "segments");
      const variants = product === "Quiddo" ? ["activation"] : ["racket", "surf", "run"], at = (/* @__PURE__ */ new Date()).toISOString(), zone = String(tot.metadata?.timeZone || "unknown");
      const collected = await Promise.all(["", ...variants].map((variant) => productFunnels(google, env, product, zone, end, at, variant))), funnels = collected[0], journeys = Object.fromEntries(variants.map((v, i) => [v, collected[i + 1]]));
      return [product, { status: "available", property_id: property, observed_at: (/* @__PURE__ */ new Date()).toISOString(), time_zone: String(tot.metadata?.timeZone || "unknown"), start_date: btwOffset(end, -29), end_date: end, daily_thresholded: !!daily.metadata?.subjectToThresholding, analytics: { users: rows[0], sessions: rows[1], pageviews: rows[2], days: linhas(daily).map(([d, users, sessions, pageviews]) => ({ date: date(d), users, sessions, pageviews })) }, insights: { status: "available", channels: segments(channels), devices: segments(devices), funnels, journeys } }];
    } catch (e) {
      const message = String(e?.message || "");
      const code = /permission|access|forbidden/i.test(message) ? "GA_ACCESS_DENIED" : /quota|exhausted/i.test(message) ? "GA_QUOTA" : /empty_totals/.test(message) ? "GA_EMPTY_REPORT" : "GA_REPORT_FAILED";
      return [product, { status: "error", property_id: property, error_code: code }];
    }
  })).then(Object.fromEntries);
  btwProductCache = { until: Date.now() + 3e5, end, value };
  return value;
}
__name(btwProductAnalytics, "btwProductAnalytics");
var BTW_PERIOD_PROPERTIES = [["Retrozap", "559410482"], ["Quiddo", "562055723"], ["SPORT DNA", "562098147"]];
var btwDay = /* @__PURE__ */ __name(() => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(/* @__PURE__ */ new Date()), "btwDay");
var btwOffset = /* @__PURE__ */ __name((day, n) => new Date(Date.parse(day + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10), "btwOffset");
var btwPeriodCache;
async function btwPeriodReports(env) {
  const end = btwDay();
  if (btwPeriodCache?.end === end && btwPeriodCache.until > Date.now()) return btwPeriodCache.value;
  const ranges = [7, 30].flatMap((n) => [{ name: "current_" + n, startDate: btwOffset(end, 1 - n), endDate: end }, { name: "previous_" + n, startDate: btwOffset(end, 1 - 2 * n), endDate: btwOffset(end, -n) }]);
  const value = Promise.all(BTW_PERIOD_PROPERTIES.map(async ([product, id]) => {
    try {
      if (!env.GOOGLE_SA) throw Error();
      const r = await google(env, `https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`, { dateRanges: ranges, metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] });
      const idx = (r.dimensionHeaders || []).findIndex((h) => h.name === "dateRange");
      if (idx < 0) throw Error();
      const values = new Map((r.rows || []).map((row) => [row.dimensionValues?.[idx]?.value, (row.metricValues || []).map((x) => Number(x.value))]));
      const metric = /* @__PURE__ */ __name((name) => {
        const a = values.get(name);
        return Object.fromEntries(["users", "sessions", "pageviews"].map((k, i) => [k, a && Number.isFinite(a[i]) && a[i] >= 0 ? a[i] : null]));
      }, "metric");
      const native = { status: "available", property_id: id, observed_at: (/* @__PURE__ */ new Date()).toISOString(), time_zone: String(r.metadata?.timeZone || "unknown").slice(0, 80), thresholded: !!r.metadata?.subjectToThresholding, ranges: [7, 30].map((days) => ({ days, start_date: btwOffset(end, 1 - days), end_date: end, previous_start: btwOffset(end, 1 - 2 * days), previous_end: btwOffset(end, -days), metrics: metric("current_" + days), previous: metric("previous_" + days) })) };
      return [product, { ...native, aligned: await btwAlignedReports(env, id, native.time_zone, end, native) }];
    } catch {
      return [product, { status: "error", property_id: id }];
    }
  })).then(Object.fromEntries);
  btwPeriodCache = { until: Date.now() + 3e5, end, value };
  return value;
}
__name(btwPeriodReports, "btwPeriodReports");
var BTW_REPORT_ZONE = "America/Sao_Paulo";
var BTW_HOUR_FORMATTERS = /* @__PURE__ */ new Map();
function btwHour(instant, zone) {
  if (!BTW_HOUR_FORMATTERS.has(zone)) BTW_HOUR_FORMATTERS.set(zone, new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }));
  const parts = BTW_HOUR_FORMATTERS.get(zone).formatToParts(new Date(instant));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return p.year + p.month + p.day + p.hour;
}
__name(btwHour, "btwHour");
function btwMidnight(day) {
  const nominal = Date.parse(day + "T00:00:00Z");
  let value = nominal;
  for (let i = 0; i < 3; i++) {
    const p = btwHour(value, BTW_REPORT_ZONE), wall = Date.UTC(+p.slice(0, 4), +p.slice(4, 6) - 1, +p.slice(6, 8), +p.slice(8, 10));
    value += nominal - wall;
  }
  if (btwHour(value, BTW_REPORT_ZONE) !== day.replace(/-/g, "") + "00") throw Error("CLOCK");
  return value;
}
__name(btwMidnight, "btwMidnight");
function btwAlignedRequest(start, end, zone) {
  if (!["America/Rio_Branco", "America/Sao_Paulo"].includes(zone)) throw Error("TIME_ZONE");
  const startAt = btwMidnight(start), endAt = btwMidnight(btwOffset(end, 1)), from = btwHour(startAt, zone), to = btwHour(endAt - 36e5, zone), groups = /* @__PURE__ */ new Map();
  for (let instant = startAt; instant < endAt; instant += 36e5) {
    const hour = btwHour(instant, zone), date = hour.slice(0, 8);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date).push(hour.slice(8));
  }
  const full = [], edges = [];
  for (const [date, hours] of groups) {
    if (hours.length === 24 && new Set(hours).size === 24) full.push(date);
    else edges.push(date + "(?:" + [...new Set(hours)].join("|") + ")");
  }
  if (full.length) edges.push("(?:" + full.join("|") + ")(?:[01][0-9]|2[0-3])");
  const pattern = "^(?:" + edges.join("|") + ")$";
  return { start_at: new Date(startAt).toISOString(), end_at_exclusive: new Date(endAt).toISOString(), body: { dateRanges: [{ startDate: from.slice(0, 4) + "-" + from.slice(4, 6) + "-" + from.slice(6, 8), endDate: to.slice(0, 4) + "-" + to.slice(4, 6) + "-" + to.slice(6, 8) }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }], dimensionFilter: { filter: { fieldName: "dateHour", stringFilter: { matchType: "FULL_REGEXP", value: pattern, caseSensitive: true } } } } };
}
__name(btwAlignedRequest, "btwAlignedRequest");
async function btwAlignedReports(env, id, zone, end, native) {
  try {
    const queries = [7, 30].flatMap((days) => [{ days, part: "current", start: btwOffset(end, 1 - days), end }, { days, part: "previous", start: btwOffset(end, 1 - 2 * days), end: btwOffset(end, -days) }]);
    if (zone === BTW_REPORT_ZONE) {
      if (!["562055723", "562098147"].includes(id) || native?.status !== "available" || native.property_id !== id || native.time_zone !== zone || !Array.isArray(native.ranges) || native.ranges.length !== 2) throw Error("TIME_ZONE");
      const ranges = [7, 30].map((days) => {
        const r = native.ranges.find((x) => x.days === days);
        if (!r || r.start_date !== btwOffset(end, 1 - days) || r.end_date !== end || r.previous_start !== btwOffset(end, 1 - 2 * days) || r.previous_end !== btwOffset(end, -days)) throw Error("TIME_ZONE");
        const current = btwAlignedRequest(r.start_date, r.end_date, zone), previous = btwAlignedRequest(r.previous_start, r.previous_end, zone);
        for (const values of [r.metrics, r.previous]) if (!values || ["users", "sessions", "pageviews"].some((k) => !(values[k] === null || typeof values[k] === "number" && Number.isFinite(values[k]) && values[k] >= 0))) throw Error("METRIC");
        return { ...r, start_at: current.start_at, end_at_exclusive: current.end_at_exclusive, previous_start_at: previous.start_at, previous_end_at_exclusive: previous.end_at_exclusive };
      });
      return { status: "available", daily: await btwCanonicalDaily(env, id, zone, end), funnels: [], reporting_time_zone: BTW_REPORT_ZONE, source_time_zone: zone, method: "native_same_zone", observed_at: native.observed_at, thresholded: !!native.thresholded, ranges };
    }
    const results = await Promise.all(queries.map(async (q) => {
      const req = btwAlignedRequest(q.start, q.end, zone), r = await google(env, `https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`, req.body);
      if (r.metadata?.timeZone !== zone || (r.rows || []).length > 1) throw Error("TIME_ZONE");
      const names = (r.metricHeaders || []).map((x) => x.name), values = r.rows?.[0]?.metricValues || [];
      const metric = /* @__PURE__ */ __name((name) => {
        if (!(r.rows || []).length) return null;
        const at = names.indexOf(name);
        if (at < 0) throw Error("METRIC");
        const raw = values[at]?.value;
        if (raw === void 0) return null;
        const v = Number(raw);
        if (!Number.isFinite(v) || v < 0) throw Error("METRIC");
        return v;
      }, "metric");
      return { ...q, start_at: req.start_at, end_at_exclusive: req.end_at_exclusive, metrics: { users: metric("activeUsers"), sessions: metric("sessions"), pageviews: metric("screenPageViews") }, thresholded: !!r.metadata?.subjectToThresholding };
    }));
    const daily = await btwCanonicalDaily(env, id, zone, end);
    return { status: "available", daily, funnels: [], funnel_alignment: { status: "blocked", reason: "population_not_reconciled" }, reporting_time_zone: BTW_REPORT_ZONE, source_time_zone: zone, method: "dateHour_filter", observed_at: (/* @__PURE__ */ new Date()).toISOString(), thresholded: results.some((x) => x.thresholded), ranges: [7, 30].map((days) => {
      const a = results.find((x) => x.days === days && x.part === "current"), b = results.find((x) => x.days === days && x.part === "previous");
      return { days, start_date: a.start, end_date: a.end, start_at: a.start_at, end_at_exclusive: a.end_at_exclusive, previous_start: b.start, previous_end: b.end, previous_start_at: b.start_at, previous_end_at_exclusive: b.end_at_exclusive, metrics: a.metrics, previous: b.metrics };
    }) };
  } catch (e) {
    const message = String(e?.message || "");
    return { status: "error", error_code: /permission|access|forbidden/i.test(message) ? "GA_ACCESS_DENIED" : /quota|exhausted/i.test(message) ? "GA_QUOTA" : "GA_ALIGNED_REPORT_FAILED", diagnostic_hints: ["dateHour", "betweenFilter", "stringFilter", "FULL_REGEXP", "TIME_ZONE", "METRIC", "not supported", "not a valid", "INVALID_ARGUMENT"].filter((x) => message.toLowerCase().includes(x.toLowerCase())) };
  }
}
__name(btwAlignedReports, "btwAlignedReports");
var btwCleanMetrics = /* @__PURE__ */ __name((r) => {
  const names = (r.metricHeaders || []).map((x) => x.name), values = r.rows?.[0]?.metricValues || [];
  if ((r.rows || []).length > 1) throw Error("DAILY_ROWS");
  return Object.fromEntries([["users", "activeUsers"], ["sessions", "sessions"], ["pageviews", "screenPageViews"]].map(([key, name]) => {
    if (!r.rows?.length) return [key, null];
    const at = names.indexOf(name);
    if (at < 0) throw Error("METRIC");
    const raw = values[at]?.value;
    if (raw === void 0 || raw === null || raw === "") return [key, null];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) throw Error("METRIC");
    return [key, value];
  }));
}, "btwCleanMetrics");
var btwSeriesError = /* @__PURE__ */ __name((error, code) => {
  const message = String(error?.message || "");
  return { status: "error", error_code: code, diagnostic_hints: ["dateHour", "batchRunReports", "REPORTS", "DAILY_ROWS", "TIME_ZONE", "METRIC", "missing_funnel", "missing_metric", "not supported", "not a valid", "permission", "quota", "exhausted", "INVALID_ARGUMENT"].filter((x) => message.toLowerCase().includes(x.toLowerCase())) };
}, "btwSeriesError");
async function btwCanonicalDaily(env, id, zone, end) {
  try {
    const start = btwOffset(end, -29), bounds = btwAlignedRequest(start, end, zone), dates = Array.from({ length: 30 }, (_, i) => btwOffset(start, i));
    let days, thresholded = false, method;
    if (zone === BTW_REPORT_ZONE) {
      const product = BTW_GA_PRODUCTS.find(([, property]) => property === id)?.[0], native = (await btwProductAnalytics(env))[product];
      if (native?.status !== "available" || native.time_zone !== zone || native.start_date !== start || native.end_date !== end) throw Error("TIME_ZONE");
      const byDate = new Map(native.analytics.days.map((d) => [d.date, d]));
      days = dates.map((date) => {
        const req = btwAlignedRequest(date, date, zone), row = byDate.get(date);
        return { date, start_at: req.start_at, end_at_exclusive: req.end_at_exclusive, users: row?.users ?? null, sessions: row?.sessions ?? null, pageviews: row?.pageviews ?? null };
      });
      thresholded = !!native.daily_thresholded;
      method = "native_same_zone";
    } else {
      days = [];
      method = "direct_daily_queries";
      for (let i = 0; i < dates.length; i += 5) {
        const batch = dates.slice(i, i + 5), requests = batch.map((date) => btwAlignedRequest(date, date, zone));
        const r = await google(env, `https://analyticsdata.googleapis.com/v1beta/properties/${id}:batchRunReports`, { requests: requests.map((x) => x.body) });
        if (!Array.isArray(r.reports) || r.reports.length !== batch.length) throw Error("REPORTS");
        for (let j = 0; j < batch.length; j++) {
          const report = r.reports[j];
          if (report.metadata?.timeZone !== zone) throw Error("TIME_ZONE");
          thresholded ||= !!report.metadata?.subjectToThresholding;
          days.push({ date: batch[j], start_at: requests[j].start_at, end_at_exclusive: requests[j].end_at_exclusive, ...btwCleanMetrics(report) });
        }
      }
    }
    return { status: "available", property_id: id, reporting_time_zone: BTW_REPORT_ZONE, source_time_zone: zone, observed_at: (/* @__PURE__ */ new Date()).toISOString(), method, thresholded, start_date: start, end_date: end, start_at: bounds.start_at, end_at_exclusive: bounds.end_at_exclusive, days };
  } catch (e) {
    return btwSeriesError(e, "GA_ALIGNED_DAILY_FAILED");
  }
}
__name(btwCanonicalDaily, "btwCanonicalDaily");

// src/btw-readonly.mjs
function acceptableToken(s) {
  return typeof s === "string" && !/\s/.test(s) && new Set(s).size >= 10 && (s.length >= 32 || s.length >= 15 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && /[^a-zA-Z0-9]/.test(s));
}
__name(acceptableToken, "acceptableToken");
var reply = /* @__PURE__ */ __name((body, status2 = 200) => Response.json(body, { status: status2, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }), "reply");
var number = /* @__PURE__ */ __name((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null, "number");
var digest = /* @__PURE__ */ __name((s) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then((x) => new Uint8Array(x)), "digest");
async function equal(a, b) {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
__name(equal, "equal");
var safe = /* @__PURE__ */ __name(async (fn) => {
  try {
    return { status: "available", data: await fn() };
  } catch {
    return { status: "error", data: null };
  }
}, "safe");
function createMetricsHandler({ analytics: analytics2, busca: busca2, insights, products, periods, acquisition }) {
  return async ({ request, env }) => {
    if (request.method !== "GET") return reply({ error: "method_not_allowed" }, 405);
    if (!acceptableToken(env.BTW_READ_TOKEN)) return reply({ error: "integration_not_configured" }, 503);
    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ") || !await equal(auth.slice(7), env.BTW_READ_TOKEN)) return reply({ error: "unauthorized" }, 401);
    const reportQuery=new URL(request.url).searchParams;
    if (reportQuery.get('section') === 'acquisition' || reportQuery.get('scope') === 'acquisition') {
      const started=Date.now(), diagnostics={external_requests:0};
      const acquisitionData=await safe(()=>acquisition({...env,__btwAcquisitionDiagnostics:diagnostics}));
      return reply({product:'Retrozap',observed_at:new Date().toISOString(),acquisition:acquisitionData,diagnostics:{duration_ms:Date.now()-started,...diagnostics}});
    }
    const [ga, search, payments, insightData, productData, periodData] = await Promise.all([
      safe(async () => {
        const x = await analytics2(env);
        if (x.erro || !Array.isArray(x.total)) throw Error();
        return { period: "29daysAgo..today", users: number(x.total[0]), sessions: number(x.total[1]), pageviews: number(x.total[2]), days: (x.dia || []).slice(-30).map((r) => ({ date: r[0], users: number(r[1]), sessions: number(r[2]), pageviews: number(r[3]) })), channels: (x.canais || []).slice(0, 8).filter((x2) => Array.isArray(x2) && typeof x2[0] === "string").map((x2) => [x2[0].slice(0, 100), number(x2[1])]) };
      }),
      safe(async () => {
        const x = await busca2(env);
        if (x.erro || !x.total) throw Error();
        return { period: "30daysAgo..yesterday", clicks: number(x.total.cliques), impressions: number(x.total.impressoes), ctr: number(x.total.ctr), position: number(x.total.posicao), days: (x.dia || []).slice(-30).map((r) => ({ date: r.dia, clicks: number(r.cliques), impressions: number(r.impressoes) })) };
      }),
      safe(async () => {
        if (!env.DB) throw Error();
        const r = await env.DB.prepare("SELECT COUNT(*) AS count, COUNT(DISTINCT email) AS customers, SUM(CAST(valor AS REAL)) AS gross_brl FROM compras WHERE modo = 'ligada' AND status = 'pago'").first();
        if (!r) throw Error();
        return { source: "Retrozap D1 compras", period: "accumulated", count: number(r.count), customers: number(r.customers), gross_brl: number(r.gross_brl), fees_brl: null, bank_payout_brl: null, daily: await safe(() => readCommerceSeries(env)) };
      }),
      safe(async () => {
        if (!insights) throw Error();
        return await insights(env);
      }),
      safe(async () => {
        if (!products) throw Error();
        return await products(env);
      }),
      safe(async () => {
        if (!periods) throw Error();
        return await periods(env);
      })
    ]);
    const existingAcquisition = acquisition?.peek?.();
    const acquisitionData = existingAcquisition ? await safe(() => existingAcquisition) : {status:'error',error_code:'ACQUISITION_SEPARATE_REQUEST',data:null};
    return reply({ product: "Retrozap", observed_at: (/* @__PURE__ */ new Date()).toISOString(), analytics: ga, search, payments, insights: insightData, products: productData, period_reports: periodData, acquisition: acquisitionData });
  };
}
__name(createMetricsHandler, "createMetricsHandler");
async function readCommerceSeries(env, now = Date.now()) {
  const end = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date(now)), start = new Date(Date.parse(end) - 59 * 864e5).toISOString().slice(0, 10);
  const [sales, checkouts, unknown] = await Promise.all([
    env.DB.prepare("SELECT date(pago, '-3 hours') AS date, COUNT(*) AS purchases, SUM(CAST(valor AS REAL)) AS gross_brl, SUM(CASE WHEN ordem LIKE 'stripe:%' THEN 1 ELSE 0 END) AS card, SUM(CASE WHEN ordem NOT LIKE 'stripe:%' THEN 1 ELSE 0 END) AS pix FROM compras WHERE modo = 'ligada' AND status = 'pago' AND date(pago, '-3 hours') BETWEEN ? AND ? GROUP BY date(pago, '-3 hours') ORDER BY date").bind(start, end).all(),
    env.DB.prepare("SELECT date(criado, '-3 hours') AS date, COUNT(*) AS checkouts FROM compras WHERE modo = 'ligada' AND date(criado, '-3 hours') BETWEEN ? AND ? GROUP BY date(criado, '-3 hours') ORDER BY date").bind(start, end).all(),
    env.DB.prepare("SELECT COUNT(*) AS undated FROM compras WHERE modo = 'ligada' AND status = 'pago' AND (pago IS NULL OR date(pago, '-3 hours') IS NULL)").first()
  ]);
  if (sales.success === false || checkouts.success === false || !Array.isArray(sales.results) || !Array.isArray(checkouts.results) || !unknown || !Number.isInteger(unknown.undated)) throw Error("commerce_unavailable");
  const byDay = new Map(sales.results.map((r) => [r.date, r])), byCheckout = new Map(checkouts.results.map((r) => [r.date, r]));
  const days = Array.from({ length: 60 }, (_, i) => {
    const date = new Date(Date.parse(start) + i * 864e5).toISOString().slice(0, 10), v = byDay.get(date), c = byCheckout.get(date);
    const row = { date, purchases: v ? number(v.purchases) : 0, gross_brl: v ? number(v.gross_brl) : 0, card: v ? number(v.card) : 0, pix: v ? number(v.pix) : 0, checkouts: c ? number(c.checkouts) : 0 };
    if (Object.values(row).slice(1).some((x) => x === null)) throw Error("commerce_invalid");
    return row;
  });
  return { time_zone: "America/Sao_Paulo", currency: "BRL", start_date: start, end_date: end, partial_current_day: true, undated_count: unknown.undated, days };
}
__name(readCommerceSeries, "readCommerceSeries");

// src/index.js
var btwAcquisition = createAcquisitionCollector(google, async env => {
  if(env.__btwAcquisitionDiagnostics)env.__btwAcquisitionDiagnostics.external_requests++;
  const r = await fetch('https://www.googleapis.com/webmasters/v3/sites', {headers:{Authorization:'Bearer '+await googleToken(env)}});
  if (!r.ok) throw Error(String(r.status));
  return await r.json();
});
var btwMetrics = createMetricsHandler({ analytics, busca, insights: btwInsights, products: btwProductAnalytics, periods: btwPeriodReports, acquisition: btwAcquisition });
var POST = { "/api/promo": promo, "/api/stats": onRequestPost, "/api/ideias": onRequestPost2, "/api/pix": criar, "/api/pix/status": status, "/api/mp-webhook": webhook, "/api/acesso": acesso, "/api/recuperar": recuperar, "/api/cartao": cartao, "/api/stripe-webhook": stripeWebhook, "/api/admin/negocio": salvar };
var GET = { "/api/btw/metrics": btwMetrics, "/api/cobranca": config, "/api/admin/dados": dados, "/api/admin/funil": funil, "/admin": painel };
var ACESSOS_OK = false;
async function registraAcesso(env, request, rota) {
  if (!env.DB) return;
  try {
    if (!ACESSOS_OK) {
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS acessos (quando INTEGER NOT NULL, ip TEXT, porta TEXT, rota TEXT)").run();
      await env.DB.prepare("CREATE INDEX IF NOT EXISTS acessos_quando ON acessos (quando)").run();
      ACESSOS_OK = true;
    }
    const h = request.headers;
    await env.DB.prepare("INSERT INTO acessos (quando, ip, porta, rota) VALUES (?, ?, ?, ?)").bind(Date.now(), h.get("cf-connecting-ip") || "", h.get("cf-connecting-port") || "", rota).run();
    if (Math.random() < 0.01) await env.DB.prepare("DELETE FROM acessos WHERE quando < ?").bind(Date.now() - 190 * 864e5).run();
  } catch {
  }
}
__name(registraAcesso, "registraAcesso");
var app = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") && url.pathname !== "/api/mp-webhook" && url.pathname !== "/api/stripe-webhook") ctx?.waitUntil?.(registraAcesso(env, request, request.method + " " + url.pathname));
    const rota = (request.method === "POST" ? POST : request.method === "GET" ? GET : {})[url.pathname];
    if (rota) return rota({ request, env });
    if (url.pathname.startsWith("/api/")) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { "content-type": "application/json" } });
    return env.ASSETS.fetch(request);
  }
};
var index_default = { ...app, async fetch(request, env, ctx) {
  const route = await metaRoute(request, env);
  if (route) return route;
  const response = await app.fetch(request, env, ctx);
  ctx?.waitUntil(runMeta(env));
  return response;
}, async scheduled(_event, env, ctx) {
  ctx.waitUntil(Promise.all([runMeta(env), probeMeta(env, "retrozap")]));
} };
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
