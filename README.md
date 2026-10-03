# Web del MAC (React + Tailwind + Netlify Forms)

## Desplegar
1. Sube esta carpeta a GitHub e impórtala en Netlify (Add new site > Import an existing project). `netlify.toml` ya configura todo. También sirve `npm install && npm run build` y arrastrar `dist` a app.netlify.com/drop.
2. En el primer deploy, Netlify detecta los formularios ocultos de `index.html`. Revisa Forms: deben aparecer afiliacion, voluntariado, contacto, donacion, certificado, aval y renuncia.
3. Forms > Form notifications: agrega un aviso por correo para cada formulario (sobre todo afiliacion, certificado, aval y renuncia).

## Cómo funciona la afiliación con Netlify Forms
Netlify guarda cada envío; no hay base de datos propia ni códigos automáticos. El equipo revisa Forms: valida a los militantes (doble militancia), responde los certificados, estudia los avales y procesa las renuncias. Las respuestas se pueden exportar a CSV desde Forms.

## Contenido editable (sin código)
- `public/noticias.json`: lista de noticias `{id,title,body,created}`.
- `public/finanzas.json`: `{"movimientos":[{"campana":"Nombre","tipo":"ingreso|gasto","concepto":"...","fecha":"2026-10-01","monto":100000}]}`. La página de Transparencia calcula los totales.
- Estatutos y plan: reemplaza `public/Estatutos-de-MAC.pdf` y `public/Plan-de-Gobierno-MAC.pdf`.
- Capítulos del plan: `src/plan.js`.

## Local
`npm install` y `npm run dev`. Los formularios solo funcionan ya desplegados en Netlify.
