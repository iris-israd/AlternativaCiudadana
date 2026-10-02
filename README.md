# Web del MAC (Netlify Functions + Netlify Blobs)

## Desplegar
1. Sube la carpeta a GitHub e impórtala en Netlify (Add new site > Import an existing project). `netlify.toml` ya configura todo.
2. **Obligatorio:** Site configuration > Environment variables > crea `ADMIN_KEY` con una clave larga (marca "Contains secret values"). Sin ella el panel /admin queda bloqueado. Vuelve a desplegar.
3. Entra a `/admin` con esa clave: valida militantes, publica noticias y registra movimientos financieros.
No hay base de datos que instalar: los datos viven en Netlify Blobs (incluido en tu sitio).
El despliegue por arrastrar `dist` NO sirve: las funciones requieren despliegue desde Git o CLI.

## Local
`npm install` y `npm run dev` (usa Netlify CLI; simula funciones y Blobs). Con `ADMIN_KEY=clave npm run dev`.

## Flujo de afiliación
Simpatizante: queda activo y recibe un código `MAC-XXXXXX`. Militante: queda "pendiente" hasta que el admin lo activa. Con documento + correo la persona consulta su certificado, pide aval (solo militantes activos) o renuncia. Un documento solo puede tener una afiliación vigente.
