import {createClient} from '@supabase/supabase-js';
import {regiones} from '../../src/content.js';
import {COMISIONES as COM} from '../../src/comisiones.js';

// Límite por IP gestionado por Netlify (solo se declara aquí, no en netlify.toml).
export const config={path:'/api/registrar-militante',rateLimit:{windowLimit:8,windowSize:60,aggregateBy:['ip','domain']}};

export const DEPARTAMENTOS=regiones.flatMap(([,d])=>d);
export const COMISIONES=COM.map(([k])=>k);
const TIPOS=['CC','TI','CE','PP'];
const VERSION_POLITICA='2026-10';
const MSG_OK='¡Gracias por sumarte! Recibimos tu registro. Validaremos tu información y te contactaremos por correo.';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const fail=(status,codigo,mensaje,campo)=>json(status,{ok:false,codigo,mensaje,...(campo?{campo}:{})});
const bad=(campo,mensaje)=>({error:{campo,mensaje}});

export function edadDe(iso,hoy=new Date()){const [y,m,d]=iso.split('-').map(Number);let e=hoy.getUTCFullYear()-y;const mm=hoy.getUTCMonth()+1;if(mm<m||(mm===m&&hoy.getUTCDate()<d))e--;return e}

export function validar(b,hoy=new Date()){
 const s=v=>typeof v==='string'?v.trim():'';
 const nombre=s(b.nombre_completo).replace(/\s+/g,' ');
 if(nombre.length<5||nombre.length>120||nombre.split(' ').length<2||!/^\p{L}[\p{L}'.\- ]*$/u.test(nombre))return bad('nombre_completo','Escribe tu nombre completo (nombres y apellidos).');
 const tipo=s(b.tipo_documento).toUpperCase();
 if(!TIPOS.includes(tipo))return bad('tipo_documento','Selecciona un tipo de documento válido.');
 const documento=s(b.documento).replace(/[\s.\-]/g,'').toUpperCase();
 if(!(tipo==='PP'?/^[A-Z0-9]{5,15}$/:/^\d{5,12}$/).test(documento))return bad('documento',tipo==='PP'?'El pasaporte debe tener entre 5 y 15 letras o números.':'El número de documento debe tener entre 5 y 12 dígitos, sin letras.');
 const email=s(b.email).toLowerCase();
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))return bad('email','Escribe un correo electrónico válido.');
 const nac=s(b.fecha_nacimiento);
 const okFecha=/^\d{4}-\d{2}-\d{2}$/.test(nac)&&new Date(nac+'T00:00:00Z').toISOString().slice(0,10)===nac;
 if(!okFecha)return bad('fecha_nacimiento','Escribe una fecha de nacimiento válida.');
 const edad=edadDe(nac,hoy);
 if(edad<14)return bad('fecha_nacimiento','La afiliación es desde los 14 años (art. 14 de los estatutos).');
 if(edad>110)return bad('fecha_nacimiento','Revisa tu fecha de nacimiento.');
 if(edad<18){
  if(tipo!=='TI')return bad('tipo_documento','Si eres menor de 18 años debes registrarte con tarjeta de identidad (art. 18A).');
  if(b.autorizacion_representante!==true)return bad('autorizacion_representante','Debes confirmar la autorización de tu representante legal (art. 18B).');
 }
 const departamento=s(b.departamento);
 if(!DEPARTAMENTOS.includes(departamento))return bad('departamento','Selecciona tu departamento.');
 const raw=b.comisiones===undefined?[]:b.comisiones;
 if(!Array.isArray(raw)||raw.length>COMISIONES.length||raw.some(c=>!COMISIONES.includes(c)))return bad('comisiones','Selecciona solo comisiones de la lista.');
 if(b.habeas_data!==true)return bad('habeas_data','Debes autorizar el tratamiento de tus datos personales para continuar.');
 return{row:{nombre_completo:nombre,tipo_documento:tipo,documento,email,departamento,fecha_nacimiento:nac,comisiones:[...new Set(raw)],autorizacion_representante:edad<18,habeas_data_aceptado:true,habeas_data_at:hoy.toISOString(),habeas_data_version:VERSION_POLITICA}};
}

export function crearHandler({getDb,env,fetchFn=fetch}){return async req=>{
 try{
  if(req.method!=='POST')return fail(405,'metodo','Método no permitido.');
  if(Number(req.headers.get('content-length')||0)>20000)return fail(413,'tamano','La solicitud es demasiado grande.');
  if(!(req.headers.get('content-type')||'').includes('application/json'))return fail(400,'formato','Formato de solicitud no válido.');
  let b;try{b=await req.json()}catch{return fail(400,'json','La solicitud no es válida.')}
  if(!b||typeof b!=='object'||Array.isArray(b))return fail(400,'json','La solicitud no es válida.');

  // Anti-bots: honeypot (respuesta falsa de éxito) y tiempo mínimo de llenado.
  if(typeof b.sitio_web==='string'&&b.sitio_web.trim()!=='')return json(200,{ok:true,mensaje:MSG_OK});
  if(!(Number(b.tiempo_ms)>=1500))return fail(400,'rapido','Enviaste el formulario muy rápido. Espera un momento e inténtalo de nuevo.');
  const secret=env('TURNSTILE_SECRET_KEY');
  if(secret){
   const token=typeof b.turnstile_token==='string'?b.turnstile_token:'';
   if(!token)return fail(400,'captcha','Completa la verificación de seguridad.');
   const ip=req.headers.get('x-nf-client-connection-ip');
   const r=await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token,...(ip?{remoteip:ip}:{})})});
   const v=await r.json().catch(()=>({}));
   if(!v.success)return fail(400,'captcha','No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.');
  }

  const {row,error}=validar(b);
  if(error)return fail(400,'validacion',error.mensaje,error.campo);

  const db=getDb();
  const [porDoc,porMail]=await Promise.all([
   db.from('militantes').select('id').eq('documento',row.documento).limit(1),
   db.from('militantes').select('id').eq('email',row.email).limit(1)]);
  if(porDoc.error)throw porDoc.error;if(porMail.error)throw porMail.error;
  const DUP='Ya existe un registro con esos datos. Si crees que es un error, escríbenos desde la página de contacto.';
  if(porDoc.data?.length||porMail.data?.length)return fail(400,'duplicado',DUP);

  const {error:e}=await db.from('militantes').insert(row);
  if(e){if(e.code==='23505')return fail(400,'duplicado',DUP);throw e}
  return json(200,{ok:true,mensaje:MSG_OK});
 }catch(e){
  console.error('registrar-militante',e?.code||'',String(e?.message||e).slice(0,200));
  return fail(500,'servidor','No pudimos completar tu registro por un problema nuestro. Inténtalo de nuevo en unos minutos.');
 }}}

let cliente;
export default crearHandler({
 env:k=>process.env[k],
 getDb:()=>{
  if(!cliente){
   const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
   if(!url||!key)throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
   cliente=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  }
  return cliente;
 }});
