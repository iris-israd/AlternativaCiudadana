import {getStore} from '@netlify/blobs';
export const config={path:'/api/*'};
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const bad=(m,s=400)=>J({error:m},s);
const mail=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const age=b=>Math.floor((Date.now()-new Date(b))/31557600000);
const clean=o=>Object.fromEntries(Object.entries(o||{}).map(([k,v])=>[k.slice(0,40),typeof v==='string'?v.trim().slice(0,2000):v]));
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode=()=>'MAC-'+[...crypto.getRandomValues(new Uint8Array(6))].map(b=>ALPH[b%32]).join('');
const SEED={id:'0',title:'Nace el Movimiento Alternativa Ciudadana',body:'El 30 de agosto de 2026 se constituyó en Cali el MAC, por iniciativa de L. Escorcia.',created:'2026-08-30T00:00:00.000Z'};
const REQ={voluntariado:['nombre','email','municipio','area'],contacto:['nombre','email','mensaje'],donacion:['nombre','email','monto']};
const AFIL=['tipo','tipo_doc','documento','nombre','apellidos','nacimiento','email','celular','departamento','municipio','tratamiento_datos'];
const hits=new Map();
export function makeHandler(getS,env=()=>process.env){return async(req,context)=>{
 const s=getS(),url=new URL(req.url),[a,b,c]=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean),post=req.method==='POST';
 const ip=context?.ip||req.headers.get('x-nf-client-connection-ip')||'x',t=Date.now(),h=(hits.get(ip)||[]).filter(x=>t-x<60000);h.push(t);hits.set(ip,h);
 if(h.length>40)return bad('Demasiadas solicitudes. Intenta en un minuto.',429);
 const d=clean(post?await req.json().catch(()=>({})):{});
 const all=async p=>{const {blobs}=await s.list({prefix:p});return(await Promise.all(blobs.map(x=>s.get(x.key,{type:'json'})))).filter(Boolean)};
 const saveSub=(kind,data)=>{const id=rid();return s.setJSON('sub/'+id,{id,kind,data,created:new Date().toISOString()})};
 const mine=async x=>{if(!x.documento||!x.email)return null;const r=await s.get('doc/'+norm(x.documento),{type:'json'});if(!r)return null;const m=await s.get('members/'+r.codigo,{type:'json'});return m&&m.email===String(x.email).toLowerCase()?m:null};
 try{
 if(req.method==='GET'&&a==='news'){const n=(await all('news/')).sort((x,y)=>y.created.localeCompare(x.created));return J(n.length?n:[SEED])}
 if(req.method==='GET'&&a==='finanzas'){const by={};for(const m of (await all('mov/')).sort((x,y)=>y.fecha.localeCompare(x.fecha))){const k=by[m.campana]||(by[m.campana]={nombre:m.campana,ingresos:0,gastos:0,saldo:0,movimientos:[]});m.tipo==='ingreso'?k.ingresos+=m.monto:k.gastos+=m.monto;k.saldo=k.ingresos-k.gastos;k.movimientos.push(m)}return J({campanas:Object.values(by)})}
 if(a==='admin'){const K=env().ADMIN_KEY;if(!K||req.headers.get('x-admin-key')!==K)return bad('Clave incorrecta',401);
  if(req.method==='GET'&&b==='members')return J((await all('members/')).sort((x,y)=>y.created.localeCompare(x.created)).slice(0,1000));
  if(req.method==='GET'&&b==='submissions')return J((await all('sub/')).sort((x,y)=>y.created.localeCompare(x.created)).slice(0,500));
  if(post&&b==='members'&&c){if(!['activo','suspendido','retirado','pendiente'].includes(d.estado))return bad('Estado no válido');const m=await s.get('members/'+c,{type:'json'});if(!m)return bad('No existe',404);m.estado=d.estado;await s.setJSON('members/'+c,m);return J({ok:true})}
  if(post&&b==='news'){if(!d.title||!d.body)return bad('Título y texto son obligatorios');const id=rid();await s.setJSON('news/'+id,{id,title:d.title,body:d.body,created:new Date().toISOString()});return J({id})}
  if(req.method==='DELETE'&&b==='news'&&c){await s.delete('news/'+c);return J({ok:true})}
  if(post&&b==='movimientos'){if(!d.campana||!d.concepto||!d.fecha||!(Number(d.monto)>0)||!['ingreso','gasto'].includes(d.tipo))return bad('Datos del movimiento incompletos');const id=rid();await s.setJSON('mov/'+id,{id,campana:d.campana,tipo:d.tipo,concepto:d.concepto,fecha:d.fecha,monto:Number(d.monto)});return J({ok:true})}
  return bad('No existe',404)}
 if(!post)return bad('No existe',404);
 if(d.web||d['bot-field'])return J({ok:true});
 if(a==='afiliacion'){
  for(const x of AFIL)if(!d[x])return bad(`Falta el campo: ${x}`);
  if(!['simpatizante','militante'].includes(d.tipo))return bad('Tipo no válido');if(!mail.test(d.email))return bad('Correo no válido');
  if(isNaN(new Date(d.nacimiento)))return bad('Fecha no válida');const ed=age(d.nacimiento);if(ed<14)return bad('La afiliación es desde los 14 años (art. 14).');
  if(d.tipo==='militante'&&!(d.nacionalidad&&d.acepta_estatutos&&d.sin_doble_militancia))return bad('Para ser militante debes aceptar todas las declaraciones.');
  if(ed<18){if(!d.tutor_autoriza)return bad('Menores de 18: marca la autorización de tu representante legal (art. 18B).');if(d.tipo==='militante'&&d.tipo_doc!=='Tarjeta de identidad')return bad('Los militantes menores de edad deben presentar tarjeta de identidad (art. 18A).')}
  const doc=norm(d.documento);if(!doc)return bad('Documento no válido');
  const ex=await s.get('doc/'+doc,{type:'json'});if(ex){const m=await s.get('members/'+ex.codigo,{type:'json'});if(m&&m.estado!=='retirado')return bad('Ya existe una afiliación con ese documento. Consulta tu certificado en Mi afiliación.',409)}
  let codigo;for(let i=0;i<8;i++){const k=newCode();if(!(await s.get('members/'+k,{type:'json'}))){codigo=k;break}}if(!codigo)return bad('Intenta de nuevo',500);
  const estado=d.tipo==='militante'?'pendiente':'activo';
  await s.setJSON('members/'+codigo,{id:codigo,codigo,tipo:d.tipo,tipo_doc:d.tipo_doc,documento:d.documento,nombre:d.nombre,apellidos:d.apellidos,nacimiento:d.nacimiento,email:d.email.toLowerCase(),celular:d.celular,departamento:d.departamento,municipio:d.municipio,juvenil:ed<18?1:0,estado,created:new Date().toISOString()});
  await s.setJSON('doc/'+doc,{codigo});return J({ok:true,codigo,estado,tipo:d.tipo})}
 if(a==='certificado'){const m=await mine(d);if(!m)return bad('No encontramos una afiliación con esos datos.',404);return J({codigo:m.codigo,nombre:m.nombre+' '+m.apellidos,tipo:m.tipo,estado:m.estado,created:m.created,juvenil:!!m.juvenil})}
 if(a==='renuncia'){const m=await mine(d);if(!m||m.estado==='retirado')return bad('No encontramos una afiliación activa con esos datos.',404);
  m.estado='retirado';m.retiro=new Date().toISOString();if(m.juvenil)m.celular='';await s.setJSON('members/'+m.codigo,m);await saveSub('renuncia',{codigo:m.codigo,motivo:d.motivo||''});return J({ok:true})}
 if(a==='aval'){const m=await mine(d);if(!m||m.tipo!=='militante'||m.estado!=='activo')return bad('Solo pueden pedir aval los militantes activos. Si te afiliaste hace poco, tu solicitud puede estar pendiente de validación.');
  if(!d.cargo||!d.territorio||!d.mensaje)return bad('Completa todos los campos');if(age(m.nacimiento)<18&&d.cargo!=='Consejo de Juventud')return bad('Los menores de 18 solo pueden aspirar a Consejos de Juventud (art. 18E).');
  await saveSub('aval',{codigo:m.codigo,cargo:d.cargo,territorio:d.territorio,mensaje:d.mensaje});return J({ok:true})}
 if(REQ[a]){for(const x of REQ[a])if(!d[x])return bad(`Falta el campo: ${x}`);if(!mail.test(d.email))return bad('Correo no válido');if(a==='donacion'&&!(Number(d.monto)>0))return bad('Monto no válido');await saveSub(a,d);return J({ok:true})}
 return bad('No existe',404)
 }catch(e){console.error(e);return bad('Error del servidor',500)}}}
export default makeHandler(()=>getStore({name:'mac',consistency:'strong'}));
