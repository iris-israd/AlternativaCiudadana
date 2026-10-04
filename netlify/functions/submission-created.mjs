// Se ejecuta automáticamente cada vez que Netlify Forms recibe un envío.
import { getStore, connectLambda } from "@netlify/blobs";
import { h, edad } from "./_lib.mjs";

export const handler = async (event) => {
  connectLambda(event);
  const { payload } = JSON.parse(event.body);
  const d = payload.data || {};
  const nombre = payload.form_name || d["form-name"];
  const afiliados = getStore("afiliados");

  if (nombre === "afiliacion") {
    const a = edad(d.fecha_nacimiento);
    const key = h(d.documento);
    if (a === null || a < 14) return { statusCode: 200, body: "rechazado: edad" };
    if (await afiliados.get(key)) return { statusCode: 200, body: "duplicado" };
    const menor = a < 18;
    if (menor && !(d.rep_autoriza && d.rep_nombre && d.rep_documento)) return { statusCode: 200, body: "rechazado: sin autorización" };
    const contador = getStore("contador");
    const anio = new Date().getFullYear();
    const n = Number((await contador.get(String(anio))) || 0) + 1;
    await contador.set(String(anio), String(n));
    const numero = `MAC-${anio}-${String(n).padStart(5, "0")}`;
    await afiliados.setJSON(key, {
      numero, nombres: d.nombres, apellidos: d.apellidos, municipio: d.municipio, departamento: d.departamento,
      email_hash: h(d.email), email: d.email, telefono: d.telefono, juvenil: menor, fecha_nacimiento: d.fecha_nacimiento,
      rep: menor ? { nombre: d.rep_nombre, documento: d.rep_documento, parentesco: d.rep_parentesco } : null,
      estado: menor ? "Pendiente de verificación del representante legal" : "Activo",
      desde: new Date().toISOString(),
    });
  }

  if (nombre === "retiro") {
    const key = h(d.documento);
    const r = await afiliados.get(key, { type: "json" });
    // El retiro solo procede si el correo coincide con el registrado.
    if (r && r.email_hash === h(d.email)) {
      await afiliados.setJSON(key, { ...r, estado: "Retirado", retirado_en: new Date().toISOString(), email: null, telefono: null, rep: null });
    }
  }
  return { statusCode: 200, body: "ok" };
};
