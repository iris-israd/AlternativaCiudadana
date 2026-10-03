import {useEffect,useRef,useState} from 'react';
import {regiones} from './content.js';
import {COMISIONES} from './comisiones.js';
const SITEKEY=import.meta.env.VITE_TURNSTILE_SITEKEY;
const inp="block w-full border border-line bg-surface p-2 font-normal mt-1 rounded";
const vacio={nombre_completo:'',tipo_documento:'CC',documento:'',email:'',fecha_nacimiento:'',departamento:'',comisiones:[],autorizacion_representante:false,habeas_data:false,sitio_web:''};
export default function FormularioMilitante(){
 const [d,setD]=useState(vacio),[estado,setEstado]=useState('idle'),[msg,setMsg]=useState(''),[campo,setCampo]=useState(''),[token,setToken]=useState('');
 const t0=useRef(Date.now()),ts=useRef(null);
 const set=k=>e=>setD(p=>({...p,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}));
 const toggle=k=>setD(p=>({...p,comisiones:p.comisiones.includes(k)?p.comisiones.filter(x=>x!==k):[...p.comisiones,k]}));
 const menor=d.fecha_nacimiento&&(Date.now()-new Date(d.fecha_nacimiento))/31557600000<18;
 useEffect(()=>{if(!SITEKEY)return;const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;
  s.onload=()=>{if(ts.current)window.turnstile.render(ts.current,{sitekey:SITEKEY,callback:setToken,'expired-callback':()=>setToken('')})};document.head.appendChild(s);return()=>s.remove()},[]);
 async function enviar(e){e.preventDefault();if(estado==='loading')return;setEstado('loading');setMsg('');setCampo('');
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),20000);
  try{
   const r=await fetch('/api/registrar-militante',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,body:JSON.stringify({...d,tiempo_ms:Date.now()-t0.current,turnstile_token:token})});
   const j=await r.json().catch(()=>null);
   if(r.ok&&j?.ok){setEstado('ok');setMsg(j.mensaje);setD(vacio);setToken('');window.turnstile&&ts.current&&window.turnstile.reset(ts.current);t0.current=Date.now();return}
   setEstado('error');setCampo(j?.campo||'');
   setMsg(r.status===429?'Has hecho demasiados intentos. Espera un minuto e inténtalo de nuevo.':j?.mensaje||'No pudimos procesar tu registro. Inténtalo de nuevo.');
  }catch{setEstado('error');setMsg('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')}
  finally{clearTimeout(to)}
 }
 const err=k=>campo===k&&estado==='error'?' ring-2 ring-rosa':'';
 if(estado==='ok')return <div role="status" className="max-w-2xl border-2 border-ambar p-6 space-y-3"><h2 className="text-2xl font-extrabold">¡Registro recibido!</h2><p>{msg}</p><button onClick={()=>setEstado('idle')} className="bg-morado text-white font-semibold rounded-full px-6 py-3">Registrar a otra persona</button></div>;
 return <form onSubmit={enviar} noValidate className="max-w-2xl space-y-5" aria-busy={estado==='loading'}>
  <div aria-hidden="true" style={{position:'absolute',left:'-9999px',height:0,overflow:'hidden'}}><label>Sitio web<input tabIndex={-1} autoComplete="off" value={d.sitio_web} onChange={set('sitio_web')}/></label></div>
  <div className="grid sm:grid-cols-2 gap-4">
   <label className="sm:col-span-2 font-semibold text-base">Nombre completo<input required autoComplete="name" className={inp+err('nombre_completo')} value={d.nombre_completo} onChange={set('nombre_completo')}/></label>
   <label className="font-semibold text-base">Tipo de documento<select className={inp+err('tipo_documento')} value={d.tipo_documento} onChange={set('tipo_documento')}><option value="CC">Cédula de ciudadanía</option><option value="TI">Tarjeta de identidad</option><option value="CE">Cédula de extranjería</option><option value="PP">Pasaporte</option></select></label>
   <label className="font-semibold text-base">Número de documento<input required inputMode={d.tipo_documento==='PP'?'text':'numeric'} className={inp+err('documento')} value={d.documento} onChange={set('documento')}/></label>
   <label className="font-semibold text-base">Correo electrónico<input required type="email" autoComplete="email" className={inp+err('email')} value={d.email} onChange={set('email')}/></label>
   <label className="font-semibold text-base">Fecha de nacimiento<input required type="date" className={inp+err('fecha_nacimiento')} value={d.fecha_nacimiento} onChange={set('fecha_nacimiento')}/></label>
   <label className="sm:col-span-2 font-semibold text-base">Departamento<select required className={inp+err('departamento')} value={d.departamento} onChange={set('departamento')}><option value="">Selecciona</option>{regiones.map(([r,ds])=><optgroup key={r} label={r}>{ds.map(x=><option key={x}>{x}</option>)}</optgroup>)}</select></label>
  </div>
  {menor&&<label className={'flex gap-2 items-start text-base border-2 border-ambar p-4'+err('autorizacion_representante')}><input type="checkbox" className="mt-2" checked={d.autorizacion_representante} onChange={set('autorizacion_representante')}/><span>Soy menor de 18 años y mi representante legal autoriza mi afiliación (art. 18B). Me registro con tarjeta de identidad.</span></label>}
  <fieldset className="space-y-2"><legend className="font-bold text-lg">Comisiones de interés <span className="font-normal text-sm">(opcional)</span></legend>
   <p className="text-sm opacity-80">Elegirlas es voluntario; algunas pueden revelar información sensible y solo las usamos para invitarte a trabajar en ellas.</p>
   <div className="grid sm:grid-cols-2 gap-2">{COMISIONES.map(([k,l])=><label key={k} className="flex gap-2 items-start text-base"><input type="checkbox" className="mt-2" checked={d.comisiones.includes(k)} onChange={()=>toggle(k)}/><span>{l}</span></label>)}</div></fieldset>
  <label className={'flex gap-2 items-start text-base'+err('habeas_data')}><input type="checkbox" required className="mt-2" checked={d.habeas_data} onChange={set('habeas_data')}/><span>Autorizo de manera libre, previa y expresa el tratamiento de mis datos personales conforme a la Ley 1581 de 2012, según la <a className="underline text-link" href="/privacidad" target="_blank" rel="noopener">política de tratamiento de datos</a>. Puedo conocer, actualizar, rectificar o suprimir mis datos en cualquier momento.</span></label>
  {SITEKEY&&<div ref={ts}/>}
  <button disabled={estado==='loading'} className="bg-morado text-white font-semibold rounded-full px-6 py-3 disabled:opacity-60">{estado==='loading'?'Enviando...':'Enviar mi registro'}</button>
  <div aria-live="assertive">{estado==='error'&&msg&&<p role="alert" className="border-2 border-rosa p-3 font-semibold">{msg}</p>}</div>
 </form>}
