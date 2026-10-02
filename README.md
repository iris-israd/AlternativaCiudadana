# Web del MAC

## Opción A: Netlify (recomendada)
Formularios con Netlify Forms; noticias y cuentas desde `public/noticias.json` y `public/finanzas.json`.
1. Sube la carpeta a un repositorio de GitHub.
2. En Netlify: Add new site > Import an existing project. Netlify lee `netlify.toml` (build `npm run build`, publica `dist`).
3. Tras el primer deploy, revisa Forms: deben aparecer afiliacion, voluntariado, contacto, donacion, certificado, aval y renuncia. Activa avisos por correo en Forms > Form notifications.
(Alternativa sin Git: `npm install && npm run build` y arrastra `dist` a app.netlify.com/drop.)

## Opción B: servidor propio (Express + SQLite)
Necesita Node 22.5+ y disco persistente (VPS, Railway, Render con disco, Fly). `npm install` y `ADMIN_KEY=clave npm start`. Panel en /admin.
