# Sitio web del Movimiento Alternativa Ciudadana (MAC)

React + Vite + Tailwind, con backend en Netlify (Forms, Functions y Blobs).

## Desplegar
1. Sube esta carpeta a un repositorio (GitHub) y conéctalo en Netlify, o ejecuta `npx netlify deploy --prod`.
2. Build: `npm run build`, publicar: `dist` (ya está en netlify.toml).
3. Variables de entorno (Site settings > Environment variables):
   - `MAC_SALT`: texto largo y secreto (se usa para cifrar documentos de afiliados). No lo cambies después.
   - `ADMIN_TOKEN`: clave para el panel de administración.
4. Netlify Forms detecta los formularios de `index.html`: afiliacion, retiro, voluntariado, contacto, denuncia, boletin. Actívalos en Forms > Notifications para recibir correos.

## Sistema de militancia
- `afiliacion` -> función `submission-created` valida edad (>=14), exige autorización del representante si es menor, evita duplicados y asigna número `MAC-AAAA-00000`.
- `/api/verificar` -> consulta pública (documento) con nombre enmascarado.
- `retiro` -> marca "Retirado" solo si el correo coincide y borra contacto.
- `/api/admin` (Bearer ADMIN_TOKEN): `GET` lista, `GET ?formato=csv` exporta, `POST {documento, estado}` cambia estado.
  Ejemplo: `curl -H "Authorization: Bearer TU_TOKEN" https://TU-SITIO/api/admin?formato=csv -o afiliados.csv`

## Transparencia
Edita `public/data/transparencia.json` (ingresos, gastos, donantes, contratos con `valor` numérico en COP, decisiones y errores) y vuelve a publicar.

## Desarrollo local
`npm install` y `npx netlify dev` (necesario para probar funciones y Blobs).
