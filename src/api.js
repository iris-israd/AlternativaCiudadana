// El backend vive en netlify/functions/api.mjs (Netlify Functions + Netlify Blobs).
export const NETLIFY=false;
const j=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(async r=>{const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||'Error');return x});
export const submit=(name,data)=>j('/api/'+name,data);
export const getJSON=n=>fetch(`/api/${n==='noticias'?'news':n}`).then(r=>{if(!r.ok)throw new Error('x');return r.json()});
const edad=b=>Math.floor((Date.now()-new Date(b))/31557600000);
export function validar(d){
 for(const k of['tipo_doc','documento','nombre','apellidos','nacimiento','email','celular','departamento','municipio','tratamiento_datos'])if(!d[k])throw new Error('Completa todos los campos obligatorios.');
 if(d.tipo==='militante'&&!(d.nacionalidad&&d.acepta_estatutos&&d.sin_doble_militancia))throw new Error('Para ser militante debes aceptar todas las declaraciones.');
 const a=edad(d.nacimiento);if(a<14)throw new Error('La afiliación es desde los 14 años (art. 14).');
 if(a<18){if(!d.tutor_autoriza)throw new Error('Menores de 18: marca la autorización de tu representante legal (art. 18B).');
  if(d.tipo==='militante'&&d.tipo_doc!=='Tarjeta de identidad')throw new Error('Los militantes menores de edad deben presentar tarjeta de identidad (art. 18A).');}}
