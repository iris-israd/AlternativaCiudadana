// Modo Netlify (por defecto): los formularios van a Netlify Forms y los datos públicos salen de /noticias.json y /finanzas.json.
// Modo Express (vite --mode express): usa el backend con SQLite en /api.
export const NETLIFY=import.meta.env.VITE_BACKEND!=='express';
const j=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.error||'Error');return x});
export async function submit(name,data){
 if(!NETLIFY)return j('/api/'+name,data);
 const body=new URLSearchParams({'form-name':name});
 for(const[k,v]of Object.entries(data))body.append(k,v===true?'sí':String(v));
 const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});
 if(!r.ok)throw new Error('No pudimos enviar el formulario. Intenta de nuevo.');
 return{ok:true,netlify:true,estado:data.tipo==='militante'?'pendiente':'activo'};}
export const getJSON=n=>fetch(NETLIFY?`/${n}.json`:`/api/${n==='noticias'?'news':n}`).then(r=>{if(!r.ok)throw new Error('x');return r.json()});
const edad=b=>Math.floor((Date.now()-new Date(b))/31557600000);
export function validar(d){
 for(const k of['tipo_doc','documento','nombre','apellidos','nacimiento','email','celular','departamento','municipio','tratamiento_datos'])if(!d[k])throw new Error('Completa todos los campos obligatorios.');
 if(d.tipo==='militante'&&!(d.nacionalidad&&d.acepta_estatutos&&d.sin_doble_militancia))throw new Error('Para ser militante debes aceptar todas las declaraciones.');
 const a=edad(d.nacimiento);if(a<14)throw new Error('La afiliación es desde los 14 años (art. 14).');
 if(a<18){if(!d.tutor_autoriza)throw new Error('Menores de 18: marca la autorización de tu representante legal (art. 18B).');
  if(d.tipo==='militante'&&d.tipo_doc!=='Tarjeta de identidad')throw new Error('Los militantes menores de edad deben presentar tarjeta de identidad (art. 18A).');}}
