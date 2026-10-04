// Panel de administración (Secretaría General). Requiere variable ADMIN_TOKEN.
// GET  /api/admin?formato=csv   -> lista/exporta afiliados
// POST /api/admin {documento, estado} -> cambia el estado (Activo, Suspendido, Expulsado...)
import { getStore } from "@netlify/blobs";
import { h, json } from "./_lib.mjs";

export default async (req) => {
  const tk = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!process.env.ADMIN_TOKEN || tk !== process.env.ADMIN_TOKEN) return json({ error: "No autorizado" }, 401);
  const s = getStore("afiliados");
  if (req.method === "POST") {
    const { documento, estado } = await req.json();
    const r = await s.get(h(documento), { type: "json" });
    if (!r) return json({ error: "No existe" }, 404);
    await s.setJSON(h(documento), { ...r, estado });
    return json({ ok: true });
  }
  const { blobs } = await s.list();
  const filas = [];
  for (const b of blobs) filas.push(await s.get(b.key, { type: "json" }));
  if (new URL(req.url).searchParams.get("formato") === "csv") {
    const cols = ["numero", "nombres", "apellidos", "departamento", "municipio", "email", "telefono", "juvenil", "estado", "desde"];
    const csv = [cols.join(","), ...filas.map((f) => cols.map((c) => `"${String(f[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=afiliados.csv" } });
  }
  return json({ total: filas.length, afiliados: filas });
};
export const config = { path: "/api/admin" };
