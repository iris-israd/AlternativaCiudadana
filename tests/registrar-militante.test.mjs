import test from 'node:test';import assert from 'node:assert/strict';
import {crearHandler,validar} from '../netlify/functions/registrar-militante.js';
function fakeDb(rows=[],{failInsert,failSelect}={}){return{rows,from(){const f=[];const q={select(){return q},eq(c,v){f.push([c,v]);return q},limit(){return q},
 then(a,b){if(failSelect)return Promise.resolve({error:failSelect}).then(a,b);return Promise.resolve({data:rows.filter(r=>f.every(([c,v])=>r[c]===v)),error:null}).then(a,b)},
 insert(r){if(failInsert)return Promise.resolve({error:failInsert});if(rows.some(x=>x.documento===r.documento||x.email===r.email))return Promise.resolve({error:{code:'23505',message:'duplicate key (documento)=(123)'}});rows.push(r);return Promise.resolve({error:null})}};return q}}}
const ok={nombre_completo:'Ana María  Pérez',tipo_documento:'CC',documento:'1.234.567',email:'Ana@Correo.CO',fecha_nacimiento:'1995-03-10',departamento:'Valle del Cauca',comisiones:['jovenes','jovenes','mujeres'],habeas_data:true,tiempo_ms:5000,sitio_web:''};
const req=(b,m='POST',h={'content-type':'application/json'})=>new Request('http://x/api/registrar-militante',{method:m,headers:h,body:m==='POST'?(typeof b==='string'?b:JSON.stringify(b)):undefined});
const H=(db,env={},fetchFn)=>crearHandler({getDb:()=>db,env:k=>env[k],fetchFn});
const call=async(h,r)=>{const x=await h(r);return[x.status,await x.json()]};
test('solo POST',async()=>assert.equal((await call(H(fakeDb()),req(null,'GET')))[0],405));
test('JSON inválido y tipo de contenido',async()=>{assert.equal((await call(H(fakeDb()),req('{x')))[0],400);assert.equal((await call(H(fakeDb()),req(ok,'POST',{'content-type':'text/plain'})))[0],400)});
test('éxito normaliza datos',async()=>{const db=fakeDb();const [s,j]=await call(H(db),req(ok));assert.equal(s,200);assert.equal(j.ok,true);
 const r=db.rows[0];assert.equal(r.documento,'1234567');assert.equal(r.email,'ana@correo.co');assert.equal(r.nombre_completo,'Ana María Pérez');assert.deepEqual(r.comisiones,['jovenes','mujeres']);assert.equal(r.habeas_data_aceptado,true);assert.equal(r.autorizacion_representante,false)});
for(const[n,mod,campo]of[['nombre',{nombre_completo:'Ana'},'nombre_completo'],['cédula con letras',{documento:'12ab56'},'documento'],['cédula corta',{documento:'123'},'documento'],['correo',{email:'ana@'},'email'],['fecha',{fecha_nacimiento:'2020-02-31'},'fecha_nacimiento'],['menor de 14',{fecha_nacimiento:'2018-01-01'},'fecha_nacimiento'],['departamento',{departamento:'Atlantis'},'departamento'],['comisión inválida',{comisiones:['x']},'comisiones'],['habeas data',{habeas_data:false},'habeas_data'],['tipo doc',{tipo_documento:'ZZ'},'tipo_documento']])
 test('400 por '+n,async()=>{const db=fakeDb();const [s,j]=await call(H(db),req({...ok,...mod}));assert.equal(s,400);assert.equal(j.campo,campo);assert.equal(db.rows.length,0)});
test('menores: exige TI y autorización',async()=>{const hoy=new Date();const nac=`${hoy.getUTCFullYear()-16}-01-01`;
 assert.equal((await call(H(fakeDb()),req({...ok,fecha_nacimiento:nac})))[1].campo,'tipo_documento');
 assert.equal((await call(H(fakeDb()),req({...ok,fecha_nacimiento:nac,tipo_documento:'TI'})))[1].campo,'autorizacion_representante');
 const db=fakeDb();assert.equal((await call(H(db),req({...ok,fecha_nacimiento:nac,tipo_documento:'TI',autorizacion_representante:true})))[0],200);assert.equal(db.rows[0].autorizacion_representante,true)});
test('honeypot: éxito falso sin guardar',async()=>{const db=fakeDb();const [s]=await call(H(db),req({...ok,sitio_web:'http://spam'}));assert.equal(s,200);assert.equal(db.rows.length,0)});
test('formulario enviado demasiado rápido',async()=>{const db=fakeDb();const [s,j]=await call(H(db),req({...ok,tiempo_ms:200}));assert.equal(s,400);assert.equal(j.codigo,'rapido');assert.equal(db.rows.length,0)});
test('duplicado por cédula o correo (sin revelar cuál)',async()=>{const db=fakeDb([{documento:'1234567',email:'otro@x.co'}]);let [s,j]=await call(H(db),req(ok));assert.equal(s,400);assert.equal(j.codigo,'duplicado');assert.ok(!/documento|correo/i.test(j.mensaje.replace('escríbenos','')));
 [s,j]=await call(H(fakeDb([{documento:'999999',email:'ana@correo.co'}])),req(ok));assert.equal(j.codigo,'duplicado')});
test('carrera: violación UNIQUE al insertar → 400',async()=>{const [s,j]=await call(H(fakeDb([],{failInsert:{code:'23505',message:'x'}})),req(ok));assert.equal(s,400);assert.equal(j.codigo,'duplicado')});
test('fallo de base de datos → 500 sin filtrar detalles',async()=>{for(const o of[{failInsert:{code:'XX',message:'secreto'}},{failSelect:{message:'secreto'}}]){const [s,j]=await call(H(fakeDb([],o)),req(ok));assert.equal(s,500);assert.ok(!JSON.stringify(j).includes('secreto'))}
 const h=crearHandler({getDb:()=>{throw new Error('Faltan variables')},env:()=>undefined});assert.equal((await call(h,req(ok)))[0],500)});
test('Turnstile',async()=>{const env={TURNSTILE_SECRET_KEY:'s'};assert.equal((await call(H(fakeDb(),env),req(ok)))[1].codigo,'captcha');
 const no=async()=>({json:async()=>({success:false})}),si=async()=>({json:async()=>({success:true})});
 assert.equal((await call(H(fakeDb(),env,no),req({...ok,turnstile_token:'t'})))[1].codigo,'captcha');
 const db=fakeDb();assert.equal((await call(H(db,env,si),req({...ok,turnstile_token:'t'})))[0],200);assert.equal(db.rows.length,1)});
test('validar es puro',()=>assert.ok(validar(ok).row));
