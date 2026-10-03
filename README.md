# Web del MAC: registro de militantes (Netlify Functions + Supabase)

## Archivos clave
- `supabase/migrations/20261003000000_militantes.sql`: tabla `militantes`, índices, RLS y función de supresión.
- `netlify/functions/registrar-militante.js`: API serverless (POST /api/registrar-militante).
- `src/FormularioMilitante.jsx` y `src/comisiones.js`: formulario y lista de comisiones (la usan front y función).
- `tests/registrar-militante.test.mjs`: `npm test` (21 pruebas, sin base de datos real).
- `netlify.toml`, `.env.example`.

## 1. Supabase
1. Crea un proyecto en supabase.com (región cercana, p. ej. South America São Paulo) y guarda la contraseña de la base.
2. SQL Editor > New query: pega TODO el archivo de `supabase/migrations/` y ejecútalo. Debe decir "Success".
3. Table Editor: confirma que `militantes` existe y muestra el candado de RLS activo.
4. Project Settings > API: copia la Project URL y la clave secreta (`service_role`, o `sb_secret_...` en proyectos nuevos). Nunca la pongas en el código ni en variables que empiecen por `VITE_`.

## 2. Netlify
1. Sube el repo a GitHub e impórtalo en Netlify (Add new site > Import an existing project). `netlify.toml` ya define build, carpeta de funciones y rutas.
2. Site configuration > Environment variables > Add a variable:
   - `SUPABASE_URL` = la Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = la clave secreta (marca "Contains secret values")
   - Opcional (anti-bots reforzado): `TURNSTILE_SECRET_KEY` (secreto) y `VITE_TURNSTILE_SITEKEY` (pública). Se crean en Cloudflare > Turnstile.
3. Deploys > Trigger deploy > Deploy site (las variables solo aplican a deploys nuevos).

## 3. Verificar en producción (reemplaza TU-SITIO)
    # 405 con JSON = la función está viva
    curl -i https://TU-SITIO.netlify.app/api/registrar-militante
    # 400 con mensaje de validación = llega a la función
    curl -i -X POST https://TU-SITIO.netlify.app/api/registrar-militante -H "Content-Type: application/json" -d '{}'
Luego haz un registro real desde /unete y revisa la fila en Supabase > Table Editor. Registra de nuevo los mismos datos: debe responder 400 "Ya existe un registro...". Errores: Netlify > Logs > Functions > registrar-militante. Si ves 500, casi siempre faltan las variables o no se ejecutó el SQL.
Límite por IP: Site configuration > Security > Rate limiting rules (debe aparecer la regla de la función).

## 4. Habeas Data (Ley 1581 de 2012)
- Se guarda cuándo y bajo qué versión de la política aceptó cada persona (`habeas_data_at`, `habeas_data_version`). Si cambias la política, sube `VERSION_POLITICA` en la función.
- Derecho de supresión: SQL Editor > `select public.anonimizar_militante(ID);`
- Partidos: los datos de afiliación política son sensibles. Designa un responsable del tratamiento, publica la política en /privacidad y revisa todo con un abogado.
- La base solo se accede con la clave secreta, desde la función. No la compartas ni uses la clave pública (anon) con esta tabla.
