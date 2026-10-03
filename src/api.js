// Modo Netlify Forms: los formularios se envian a Netlify; noticias y cuentas salen de /noticias.json y /finanzas.json.
export const NETLIFY=true;
export async function submit(name,data){
 const body=new URLSearchParams({'form-name':name});
 for(const[k,v]of Object.entries(data))body.append(k,v===true?'sí':String(v));
 const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});
 if(!r.ok)throw new Error('No pudimos enviar el formulario. Intenta de nuevo.');
 return{ok:true,netlify:true,estado:data.tipo==='militante'?'pendiente':'activo'};}
export async function getJSON(n){
 const r=await fetch(`/${n}.json`);if(!r.ok)throw new Error('No disponible');const j=await r.json();if(n!=='finanzas')return j;
 const by={};[...j.movimientos].sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha))).forEach((m,i)=>{const c=by[m.campana]||(by[m.campana]={nombre:m.campana,ingresos:0,gastos:0,saldo:0,movimientos:[]});const v=Number(m.monto)||0;m.tipo==='ingreso'?c.ingresos+=v:c.gastos+=v;c.saldo=c.ingresos-c.gastos;c.movimientos.push({...m,id:i,monto:v})});
 return{campanas:Object.values(by)};}
const edad=b=>Math.floor((Date.now()-new Date(b))/31557600000);
export function validar(d){
 for(const k of['tipo_doc','documento','nombre','apellidos','nacimiento','email','celular','departamento','municipio','tratamiento_datos'])if(!d[k])throw new Error('Completa todos los campos obligatorios.');
 if(d.tipo==='militante'&&!(d.nacionalidad&&d.acepta_estatutos&&d.sin_doble_militancia))throw new Error('Para ser militante debes aceptar todas las declaraciones.');
 const a=edad(d.nacimiento);if(a<14)throw new Error('La afiliación es desde los 14 años (art. 14).');
 if(a<18){if(!d.tutor_autoriza)throw new Error('Menores de 18: marca la autorización de tu representante legal (art. 18B).');
  if(d.tipo==='militante'&&d.tipo_doc!=='Tarjeta de identidad')throw new Error('Los militantes menores de edad deben presentar tarjeta de identidad (art. 18A).');}}
