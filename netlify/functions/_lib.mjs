import { createHash } from "node:crypto";
const SALT = process.env.MAC_SALT || "mac-dev-salt-cambiar";
export const h = (v) => createHash("sha256").update(SALT + String(v).trim().toLowerCase().replace(/[\s.\-]/g, "")).digest("hex");
export const edad = (f) => { const d = new Date(f); if (isNaN(d)) return null; const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; };
export const mask = (s) => s.split(" ").map((p) => p[0] + "•".repeat(Math.max(p.length - 1, 1))).join(" ");
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
