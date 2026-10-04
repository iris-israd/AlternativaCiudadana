// POST /api/verificar { documento } -> estado de afiliación (nombre enmascarado)
import { getStore } from "@netlify/blobs";
import { h, mask, json } from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const { documento } = await req.json().catch(() => ({}));
  if (!documento || String(documento).length < 5) return json({ error: "Documento inválido" }, 400);
  const r = await getStore("afiliados").get(h(documento), { type: "json" });
  if (!r) return json({ found: false });
  return json({
    found: true, numero: r.numero, nombre: mask(`${r.nombres} ${r.apellidos}`),
    municipio: r.municipio, departamento: r.departamento, estado: r.estado, desde: r.desde, juvenil: r.juvenil,
  });
};
export const config = { path: "/api/verificar" };
