import React, { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

const NAV = [
  ["/nosotros", "Nosotros"], ["/programa", "Programa"], ["/plan", "Plan de gobierno"], ["/juventud", "Juventud"],
  ["/transparencia", "Transparencia"], ["/estatutos", "Estatutos"], ["/participa", "Participa"],
];
const DEPS = ["Amazonas","Antioquia","Arauca","Atlántico","Bogotá D.C.","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"];

function Wordmark({ className = "" }) {
  return (
    <span className={`font-display leading-[0.9] tracking-wide ${className}`}>
      <span className="block text-ambar">ALTERNATIVA</span>
      <span className="block grad-t">CIUDADANA</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const loc = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const d = !dark; setDark(d);
    document.documentElement.classList.toggle("dark", d);
    try { localStorage.setItem("mac-theme", d ? "dark" : "light"); } catch (e) {}
  };
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" aria-label="Alternativa Ciudadana, inicio">
          <img src="/logo.svg" alt="Alternativa Ciudadana" className="h-10" />
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium lg:flex">
          {NAV.map(([to, t]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "text-ambar" : "text-mut hover:text-fg")}>{t}</NavLink>
          ))}
        </nav>
        <button onClick={toggle} className="ml-auto rounded-lg border border-line px-3 py-2 text-sm lg:ml-0" aria-label="Cambiar tema">
          {dark ? "Modo claro" : "Modo oscuro"}
        </button>
        <Link to="/afiliate" className="btn hidden sm:inline-block">Afíliate</Link>
        <button className="rounded-lg border border-line px-3 py-2 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>Menú</button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-line px-4 py-3 lg:hidden">
          {[...NAV, ["/afiliate", "Afíliate"], ["/consulta", "Consulta tu afiliación"]].map(([to, t]) => (
            <Link key={to} to={to} className="py-2 font-medium">{t}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/logo.svg" alt="Alternativa Ciudadana" className="h-14" />
          <p className="mt-4 max-w-sm text-sm text-mut">Movimiento Alternativa Ciudadana (MAC). Santiago de Cali, Valle del Cauca. «Lo que nos une, nos representa».</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold">Movimiento</p>
          {[["/nosotros", "Nosotros"], ["/programa", "Programa"], ["/plan", "Plan de gobierno"], ["/transparencia", "Transparencia"], ["/estatutos", "Estatutos"]].map(([to, t]) => <Link key={to} to={to} className="block py-1 text-mut hover:text-fg">{t}</Link>)}
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold">Militancia</p>
          {[["/afiliate", "Afíliate"], ["/consulta", "Consulta tu afiliación"], ["/retiro", "Retiro voluntario"], ["/juventud", "Juventud (JAC)"], ["/participa", "Voluntariado y contacto"], ["/etica", "Canal de ética"]].map(([to, t]) => <Link key={to} to={to} className="block py-1 text-mut hover:text-fg">{t}</Link>)}
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-mut">© 2026 Movimiento Alternativa Ciudadana. Tus datos se tratan conforme a la Ley 1581 de 2012.</p>
    </footer>
  );
}

const Page = ({ title, intro, children }) => (
  <main className="mx-auto max-w-6xl px-4 py-12">
    <h1 className="font-display text-5xl md:text-6xl">{title}</h1>
    {intro && <p className="mt-4 max-w-2xl text-lg text-mut">{intro}</p>}
    <div className="mt-10">{children}</div>
  </main>
);
const Card = ({ t, children, className = "" }) => (
  <div className={`rounded-xl border border-line bg-card p-5 ${className}`}>
    {t && <h3 className="mb-2 text-lg font-bold">{t}</h3>}
    <div className="text-mut">{children}</div>
  </div>
);

/* ---------- Formularios (Netlify Forms) ---------- */
function NForm({ name, submit = "Enviar", okMsg, children, onValues }) {
  const [st, setSt] = useState("idle");
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (onValues && !onValues(Object.fromEntries(fd))) return;
    setSt("sending");
    try {
      const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() });
      if (!r.ok) throw new Error();
      setSt("ok");
    } catch { setSt("error"); }
  };
  if (st === "ok") return <div className="rounded-xl border border-ambar bg-card p-6"><p className="font-bold text-ambar">Recibido.</p><p className="mt-2 text-mut">{okMsg}</p></div>;
  return (
    <form name={name} method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="form-name" value={name} />
      <p className="hidden"><label>No llenar <input name="bot-field" /></label></p>
      {children}
      {st === "error" && <p role="alert" className="text-ros">No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.</p>}
      <button className="btn" disabled={st === "sending"}>{st === "sending" ? "Enviando…" : submit}</button>
    </form>
  );
};
const F = ({ l, name, type = "text", req = true, ...p }) => (
  <label className="block text-sm font-medium">{l}
    <input className="inp mt-1" name={name} type={type} required={req} {...p} />
  </label>
);
const Chk = ({ name, children, req = true }) => (
  <label className="flex items-start gap-3 text-sm text-mut"><input type="checkbox" name={name} value="si" required={req} className="mt-1 h-4 w-4" /><span>{children}</span></label>
);

function age(f) { const d = new Date(f); if (isNaN(d)) return null; const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; }

function Afiliate() {
  const [fn, setFn] = useState("");
  const a = age(fn);
  const menor = a !== null && a >= 14 && a < 18;
  return (
    <Page title="Afíliate al MAC" intro="Pueden afiliarse personas colombianas desde los 14 años que compartan los principios del movimiento y no pertenezcan a otro partido o movimiento con personería jurídica (Estatutos, art. 14).">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NForm name="afiliacion" submit="Enviar solicitud de afiliación" okMsg="Tu solicitud fue registrada. En unos minutos podrás ver tu número de afiliado en «Consulta tu afiliación», usando tu número de documento.">
            <div className="grid gap-4 sm:grid-cols-2">
              <F l="Nombres" name="nombres" autoComplete="given-name" />
              <F l="Apellidos" name="apellidos" autoComplete="family-name" />
              <label className="block text-sm font-medium">Tipo de documento
                <select name="tipo_documento" className="inp mt-1" required><option>Cédula de ciudadanía</option><option>Tarjeta de identidad</option></select>
              </label>
              <F l="Número de documento" name="documento" inputMode="numeric" minLength={5} />
              <F l="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={fn} onChange={(e) => setFn(e.target.value)} />
              <F l="Correo electrónico" name="email" type="email" autoComplete="email" />
              <F l="Teléfono" name="telefono" type="tel" />
              <label className="block text-sm font-medium">Departamento
                <select name="departamento" className="inp mt-1" required defaultValue="">{<option value="" disabled>Selecciona</option>}{DEPS.map((d) => <option key={d}>{d}</option>)}</select>
              </label>
              <F l="Municipio" name="municipio" />
            </div>
            {a !== null && a < 14 && <p role="alert" className="text-ros">La afiliación empieza a los 14 años.</p>}
            {menor && (
              <fieldset className="grid gap-4 rounded-xl border border-ambar p-4">
                <legend className="px-2 font-bold text-ambar">Militante juvenil: autorización del representante legal</legend>
                <p className="text-sm text-mut">Tu afiliación pasará a la Juventud Alternativa Ciudadana (JAC). La autorización es requisito de validez y puede revocarse en cualquier momento (art. 18B).</p>
                <F l="Nombre del padre, madre o representante" name="rep_nombre" />
                <F l="Documento del representante" name="rep_documento" />
                <F l="Parentesco" name="rep_parentesco" />
                <Chk name="rep_autoriza">Como representante legal, autorizo la afiliación del menor.</Chk>
              </fieldset>
            )}
            <Chk name="acepta_estatutos">Acepto los <Link to="/estatutos" className="underline">Estatutos</Link>, los valores del MAC y su Código de Ética.</Chk>
            <Chk name="no_doble_militancia">Declaro que no pertenezco a otro partido o movimiento político con personería jurídica (prohibición de doble militancia).</Chk>
            <Chk name="tratamiento_datos">Autorizo el tratamiento de mis datos personales para fines de la militancia (Ley 1581 de 2012). Los datos de menores no se usan para propaganda ni se comparten con terceros.</Chk>
          </NForm>
        </div>
        <aside className="grid content-start gap-4">
          <Card t="Cómo funciona">Registras tu solicitud, recibes un número de afiliado (MAC-AAAA-00000) y puedes consultarlo cuando quieras. Tu número de documento no se guarda en claro en el registro.</Card>
          <Card t="Derechos">Voz y voto en asambleas, elegir y ser elegido, recibir información y formación, debido proceso y retiro libre (art. 16).</Card>
          <Card t="Ya eres afiliado"><Link to="/consulta" className="underline">Consulta tu afiliación</Link> o <Link to="/retiro" className="underline">solicita tu retiro</Link>.</Card>
        </aside>
      </div>
    </Page>
  );
}

function Consulta() {
  const [doc, setDoc] = useState(""); const [res, setRes] = useState(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/verificar", { method: "POST", body: JSON.stringify({ documento: doc }) });
      if (!r.ok) throw new Error(); setRes(await r.json());
    } catch { setErr("No se pudo consultar. Intenta de nuevo en unos minutos."); }
    setBusy(false);
  };
  return (
    <Page title="Consulta tu afiliación" intro="Ingresa tu número de documento para ver el estado de tu afiliación y tu número de afiliado.">
      <form onSubmit={go} className="flex max-w-xl flex-col gap-3 sm:flex-row">
        <input className="inp" placeholder="Número de documento" value={doc} onChange={(e) => setDoc(e.target.value)} required inputMode="numeric" aria-label="Número de documento" />
        <button className="btn" disabled={busy}>{busy ? "Consultando…" : "Consultar"}</button>
      </form>
      {err && <p role="alert" className="mt-4 text-ros">{err}</p>}
      {res && !res.found && <p className="mt-6 text-mut">No hay una afiliación con ese documento. Si te afiliaste hace pocos minutos, espera un momento y reintenta, o <Link to="/afiliate" className="underline">afíliate aquí</Link>.</p>}
      {res?.found && (
        <div className="mt-8 max-w-md overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center gap-3 border-b border-line bg-[#1b1128] p-4 text-white"><img src="/simbolo.svg" alt="" className="h-12 w-12" /><div><p className="font-display text-xl">CARNET DIGITAL MAC</p><p className="text-xs">{res.juvenil ? "Militante juvenil · JAC" : "Afiliado"}</p></div></div>
          <dl className="grid gap-2 p-5 text-sm">
            <div><dt className="text-mut">Número</dt><dd className="text-xl font-bold text-ambar">{res.numero}</dd></div>
            <div><dt className="text-mut">Nombre</dt><dd className="font-bold">{res.nombre}</dd></div>
            <div><dt className="text-mut">Territorio</dt><dd>{res.municipio}, {res.departamento}</dd></div>
            <div><dt className="text-mut">Estado</dt><dd>{res.estado}</dd></div>
            <div><dt className="text-mut">Afiliado desde</dt><dd>{new Date(res.desde).toLocaleDateString("es-CO")}</dd></div>
          </dl>
        </div>
      )}
    </Page>
  );
}

const Retiro = () => (
  <Page title="Retiro voluntario" intro="Puedes retirarte del movimiento cuando quieras, sin sanción alguna (art. 16.8 y 18J). Tus datos de contacto se eliminan, salvo lo que exija la ley. El correo debe coincidir con el de tu afiliación.">
    <div className="max-w-xl"><NForm name="retiro" submit="Solicitar retiro" okMsg="Procesamos tu solicitud. Si los datos coinciden, tu afiliación quedará como «Retirada».">
      <F l="Número de documento" name="documento" /><F l="Correo registrado" name="email" type="email" />
      <label className="block text-sm font-medium">Motivo (opcional)<textarea name="motivo" className="inp mt-1" rows="3" /></label>
    </NForm></div>
  </Page>
);

/* ---------- Páginas de contenido ---------- */
const VALORES = [
  ["Rigor", "Cada propuesta tiene un diagnóstico técnico, una fuente verificable y una ruta de ejecución viable dentro del marco constitucional e institucional vigente."],
  ["Cercanía", "La construcción programática se hace desde el territorio, con equipos regionales de escucha ciudadana antes de formular políticas."],
  ["Transparencia", "Publicamos nuestras cuentas y cómo decidimos, y reconocemos públicamente nuestros errores. La confianza se construye con hechos verificables."],
  ["Pluralidad", "Las decisiones públicas mejoran cuando se integran diversas voces y perspectivas en el espacio de representación."],
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-mor/40 via-transparent to-ros/20" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <h1 className="font-display text-6xl leading-none md:text-7xl">Gobernar para <span className="grad-t">todos</span></h1>
            <p className="mt-6 max-w-lg text-lg text-mut">Socialdemocracia con rigor, cercanía, transparencia y pluralidad. Un país por construir, con las manos abiertas.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/afiliate" className="btn">Afíliate</Link><Link to="/programa" className="btn2">Conoce el escorcianismo</Link></div>
          </div>
          <img src="/logo.svg" alt="Alternativa Ciudadana" className="w-full" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-4xl">Cuatro valores, una forma de hacer política</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">{VALORES.map(([t, d]) => <Card key={t} t={t}>{d}</Card>)}</div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        <Card t="Plan de gobierno 2050-2054">20 capítulos con diagnóstico, propuestas y marco de ejecución. <Link to="/plan" className="block pt-2 font-bold text-ambar">Ver el plan</Link></Card>
        <Card t="Cuentas claras">Ingresos, gastos, donantes, contratos, decisiones y errores reconocidos. <Link to="/transparencia" className="block pt-2 font-bold text-ambar">Portal de transparencia</Link></Card>
        <Card t="Desde los 14 años">La Juventud Alternativa Ciudadana abre la militancia a jóvenes con protección especial. <Link to="/juventud" className="block pt-2 font-bold text-ambar">Conoce la JAC</Link></Card>
      </section>
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="grid gap-6 rounded-2xl border border-line bg-card p-8 md:grid-cols-2">
          <div><h2 className="font-display text-3xl">Recibe novedades</h2><p className="mt-2 text-mut">Boletín con convocatorias, consultas internas y rendición de cuentas.</p></div>
          <NForm name="boletin" submit="Suscribirme" okMsg="Listo, quedaste suscrito al boletín."><F l="Correo electrónico" name="email" type="email" /></NForm>
        </div>
      </section>
    </>
  );
}

function Nosotros() {
  return (
    <Page title="Nosotros" intro="El Movimiento Alternativa Ciudadana (MAC) es una organización política de ciudadanas y ciudadanos, libre y voluntaria, de centro a centroizquierda: socialdemócrata, progresista, reformista y constitucionalista.">
      <div className="grid gap-6 md:grid-cols-2">
        <Card t="Historia">El movimiento surgió el 23 de abril de 2026 como Movimiento Nueva Síntesis, a partir del descontento con los candidatos llevados a las elecciones presidenciales de ese año, la alta fragmentación de los partidos tradicionales y la creciente polarización del país. Se constituyó como movimiento independiente el 30 de agosto de 2026 en Santiago de Cali, Valle del Cauca.</Card>
        <Card t="Símbolos">Colores ámbar, morado y rosa. El logotipo son dos trazos que convergen en una «A», un arco que los une como puente y un punto superior: la ciudadanía que se encuentra y construye en común. Lemas: «Gobernar para todos», «Lo que nos une, nos representa» y «Democracia que construye».</Card>
      </div>
      <h2 className="mt-14 font-display text-4xl">Liderazgo</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card t="Iris Maia Escorcia · Fundadora y presidenta">Ingeniera y política. Fundadora y presidenta del movimiento, creadora del escorcianismo y del tecnodesarrollismo. Candidata a la Presidencia de la República. Impulsó desde el 29 de diciembre de 2025 un ala reformista dentro del Partido Liberal Colombiano.</Card>
        <Card t="María Camila Herrera · Secretaria general">Lleva las actas, el registro de afiliados y los libros del movimiento, y apoya a la Presidencia en la coordinación de los órganos (art. 27). Candidata a la Vicepresidencia de la República. «El progreso verdadero no deja a nadie atrás.»</Card>
      </div>
      <p className="mt-4 text-sm text-mut">Hasta la primera Convención Nacional, la Presidencia la ejerce Iris Maia Escorcia, fundadora del movimiento.</p>
      <h2 className="mt-14 font-display text-4xl">Valores rectores</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{VALORES.map(([t, d]) => <Card key={t} t={t}>{d}</Card>)}</div>
      <h2 className="mt-14 font-display text-4xl">Cómo nos organizamos</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card t="Convención Nacional">Máxima autoridad. Aprueba estatutos y programa, elige la Presidencia y la Dirección Nacional. Se reúne cada dos años.</Card>
        <Card t="Dirección Nacional">10 miembros con paridad y alternancia de género y representación territorial, más un representante de la JAC mayor de 18 años.</Card>
        <Card t="Control y ética">Veeduría de Transparencia, Comité de Ética y Garantías (10 miembros) y Consejo Programático y Técnico.</Card>
      </div>
    </Page>
  );
}

const IDEAS = [
  ["Socialdemocracia", "Economía de mercado regulada, con un Estado que garantiza derechos sociales: salud, educación, protección laboral."],
  ["Progresismo", "Avance continuo en derechos y bienestar, basado en evidencia y no en nostalgia."],
  ["Reformismo", "Transformar por las vías institucionales, con reformas graduales, verificables y sostenibles."],
  ["Constitucionalismo", "Toda propuesta se ejecuta dentro de la Constitución de 1991. El plan de gobierno no requiere reforma constitucional."],
  ["Socioliberalismo", "Libertades individuales y libertad económica combinadas con cohesión social e igualdad de oportunidades."],
  ["Ambientalismo", "Proteger la biodiversidad y los recursos naturales como activo económico y deber moral: lucha contra la deforestación, pago por servicios ambientales, transición energética."],
  ["Feminismo", "Igualdad de género en la práctica: transparencia salarial, paridad, prevención de violencias y corresponsabilidad en el cuidado."],
  ["Gobierno abierto", "Decisiones, agendas, contratos y datos públicos por defecto, con participación ciudadana."],
  ["Gobierno electrónico", "Trámites digitales, identidad y firma digital, interoperabilidad y ciberseguridad, sin excluir a quien no tiene acceso."],
  ["Antirracismo", "Combatir la discriminación estructural y garantizar derechos a comunidades afrocolombianas, indígenas y raizales."],
  ["Republicanismo social", "Ciudadanía activa, bien común, instituciones fuertes y derechos sociales como condición de la libertad de todos."],
  ["Tolerancia cero", "Cero tolerancia al delito (extorsión, microtráfico, corrupción), ejercida con respeto al debido proceso y a los derechos humanos."],
  ["Interpartidismo", "Buscar acuerdos con fuerzas de distinto signo cuando no contradigan principios ni programa. Las ideas se juzgan por si funcionan, no por quién las propone."],
  ["Tecnodesarrollismo", "Estrategia de Estado de largo plazo para ampliar el potencial científico, tecnológico y de innovación del país. Ver abajo."],
];
const TD = [
  ["Sectores estratégicos", "Cada país elige, según sus ventajas, campos prioritarios: energía (renovables, almacenamiento), agrotecnología, software y biotecnología."],
  ["Estado impulsor", "Financia I+D, compra innovación, crea institutos públicos de investigación y construye infraestructura digital y científica, sin monopolio."],
  ["Triple hélice", "Vínculo estructural entre universidades, Estado y empresas (modelo de Etzkowitz y Leydesdorff)."],
  ["Inversión sostenida", "Gasto creciente y estable en educación, ciencia e infraestructura, con presupuestos plurianuales y metas de Estado."],
  ["Propiedad intelectual e investigación local", "Protección de patentes, datos y resultados de investigación financiada con recursos públicos, para que el valor se quede en el país."],
  ["Salvaguardas", "Protección de datos, evaluación ambiental, derechos laborales (incluida la transición de empleos afectados por automatización) y regulación de la IA."],
  ["Institucionalidad estable", "Agencias técnicas autónomas, directivos por mérito y políticas que sobrevivan a los cambios de gobierno."],
];
const EJES = [
  ["Seguridad", "Tolerancia cero frente al delito, con respeto a la Constitución, el debido proceso y los derechos humanos. En el plan: Bloque de Búsqueda contra la Extorsión y ruta con plazo para grupos armados."],
  ["Ambientalismo", "Protección de recursos naturales, con sanciones al ecocidio, guardabosques y mercados de servicios ambientales."],
  ["Igualdad y justicia social", "Corregir desigualdades estructurales: salud primaria, educación rural, vivienda, empleo formal y protección a independientes."],
  ["Prosperidad y tecnodesarrollo", "Crecimiento con Estado que funciona: simplificación tributaria, apoyo a mipymes y política industrial focalizada."],
];

function Programa() {
  return (
    <Page title="Programa e ideología" intro="La ideología fundacional del MAC es el escorcianismo, corriente sociopolítica colombiana ideada por Iris Maia Escorcia. Aquí explicamos qué es y en qué consiste cada una de sus ideas.">
      <h2 className="font-display text-4xl">¿Qué es el escorcianismo?</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>Surgió el 28 de agosto de 2026 como corriente propia dentro del ala reformista que Escorcia impulsaba desde el 29 de diciembre de 2025 en el Partido Liberal Colombiano, como expresión del reformismo, el progresismo y el socialrepublicanismo. Busca normalizar modelos socialdemócratas y socioliberales. El 30 de agosto de 2026, con la fundación formal del movimiento, pasó a ser su ideología fundacional.</Card>
        <Card>Se fundamenta en la <b>avanzada social controlada</b> y la <b>seguridad nacional</b>. A nivel discursivo plantea una separación total del conservadurismo, con un proyecto de avance social, político y económico orientado a corregir desigualdades estructurales. Rechaza el populismo y el dogmatismo ideológico, y prefiere consensos antes que disputas.</Card>
      </div>
      <h2 className="mt-14 font-display text-4xl">Los cuatro ejes</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{EJES.map(([t, d]) => <Card key={t} t={t}>{d}</Card>)}</div>
      <h2 className="mt-14 font-display text-4xl">Ideas orientadoras</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{IDEAS.map(([t, d]) => <Card key={t} t={t}>{d}</Card>)}</div>
      <h2 className="mt-14 font-display text-4xl">Tecnodesarrollismo</h2>
      <p className="mt-4 max-w-3xl text-mut">Propuesta de orientación política y económica de Iris Maia Escorcia: un país tiene un potencial científico, tecnológico y de innovación que puede y debe ampliarse con una estrategia liderada por el Estado, sostenida en el largo plazo y protegida de los ciclos de gobierno. Combina el desarrollismo (un Estado que promueve la transformación productiva) con la centralidad de sectores intensivos en conocimiento. No se identifica con la izquierda ni con la derecha: es una doctrina de método y prioridades más que de valores últimos.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card t="La tecnología es el motor">No es solo un insumo del crecimiento, y su desarrollo no debe dejarse solo al azar del mercado.</Card>
        <Card t="El Estado planifica">Financia, coordina y, cuando hace falta, produce directamente, sin que eso implique monopolio.</Card>
        <Card t="El valor se queda">Talento, propiedad intelectual y capacidades empresariales locales, con límites: privacidad, ambiente, derechos laborales y control de la IA.</Card>
      </div>
      <h3 className="mt-8 text-2xl font-bold">Principios</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{TD.map(([t, d]) => <Card key={t} t={t}>{d}</Card>)}</div>
    </Page>
  );
}

const CAPS = ["Atención primaria en salud","Educación pública de calidad","Protección ambiental efectiva","Apoyo al emprendimiento local","Gasto público eficiente","Equidad de género en la práctica","Seguridad alimentaria y campo","Estado digital y transparente","Seguridad, paz y estabilidad territorial","Economía regional, empleo e inclusión productiva","Protección a trabajadores independientes","Fuerzas Militares","Diversidad, inclusión y sociedad","Sistema judicial","Infraestructura y movilidad","Vivienda","Cultura","Política exterior","Fusión y modernización ministerial","Economía y crecimiento productivo"];
const Plan = () => (
  <Page title="Plan de gobierno 2050-2054" intro="«Colombia que funcione para todos» es un método de gobierno: propuestas concretas, medibles y ejecutables dentro de los marcos institucionales vigentes. Ninguna propuesta requiere reforma constitucional. Es un documento vivo.">
    <a href="/plan-de-gobierno.pdf" className="btn" download>Descargar plan completo (PDF)</a>
    <div className="mt-8 grid gap-3 md:grid-cols-2">
      {CAPS.map((c, i) => <div key={c} className="flex gap-4 rounded-xl border border-line bg-card p-4"><span className="font-display text-3xl text-ambar">{i + 1}</span><span className="self-center font-bold">{c}</span></div>)}
    </div>
    <p className="mt-6 text-sm text-mut">Cada capítulo incluye diagnóstico, propuestas y marco de ejecución con el nivel de gobierno competente y el instrumento jurídico requerido.</p>
  </Page>
);

const Juventud = () => (
  <Page title="Juventud Alternativa Ciudadana" intro="El MAC admite militantes desde los 14 años. La JAC reúne a quienes tienen entre 14 y 17 años, con coordinación nacional y territorial elegida por sus miembros.">
    <div className="grid gap-4 md:grid-cols-3">
      <Card t="Qué puedes hacer">Votar en consultas internas de la JAC, participar con voz en los órganos del movimiento, recibir formación adecuada a tu edad y postularte a los Consejos de Juventud.</Card>
      <Card t="Protección">Actividades con adultos responsables, sin uso de menores en propaganda ni recolección de fondos, canal confidencial de denuncia y datos solo para la militancia.</Card>
      <Card t="Requisitos">Documento de identidad, autorización del representante legal, aceptar estatutos y Código de Ética, y no pertenecer a otro partido con personería.</Card>
    </div>
    <p className="mt-6 max-w-3xl text-mut">Los menores de 18 no pueden ejercer cargos directivos, representar legalmente al movimiento ni ser candidatos, salvo a Consejos de Juventud. Al cumplir 18 años pasas a ser afiliado con plenitud de derechos.</p>
    <Link to="/afiliate" className="btn mt-6">Unirme a la JAC</Link>
  </Page>
);

function Estatutos() {
  const T = [["I", "Disposiciones generales", "Denominación, naturaleza, símbolos y marco normativo."], ["II", "Principios, valores e ideología", "Rigor, cercanía, transparencia, pluralidad y escorcianismo."], ["III", "Afiliados", "Derechos, deberes y militancia juvenil desde los 14 años."], ["IV", "Organización y órganos", "Convención, Dirección, Presidencia, Tesorería, Veeduría y directorios."], ["V", "Democracia interna", "Selección de candidatos, coaliciones y equidad de género."], ["VI-VII", "Bancadas y ética", "Régimen de bancada, Código de Ética y debido proceso."], ["VIII", "Transparencia y finanzas", "Cuentas abiertas, rendición de cuentas y gobierno abierto."], ["IX-XI", "Interpartidismo, reforma y transitorias", "Diálogo con otras fuerzas, reforma, fusión y disolución."]];
  return (
    <Page title="Estatutos" intro="Los estatutos son la norma interna del movimiento. Se reforman en la Convención Nacional por mayoría de dos tercios.">
      <a href="/estatutos-mac.pdf" className="btn" download>Descargar estatutos (PDF)</a>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{T.map(([n, t, d]) => <Card key={t} t={`Título ${n}. ${t}`}>{d}</Card>)}</div>
      <div className="mt-8 aspect-[3/4] max-h-[80vh] w-full overflow-hidden rounded-xl border border-line md:aspect-video"><iframe title="Estatutos del MAC" src="/estatutos-mac.pdf" className="h-full w-full" /></div>
    </Page>
  );
}

const money = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
function Transparencia() {
  const [d, setD] = useState(null); const [tab, setTab] = useState("ingresos");
  useEffect(() => { fetch("/data/transparencia.json").then((r) => r.json()).then(setD).catch(() => setD({ error: true })); }, []);
  if (!d) return <Page title="Transparencia"><p className="text-mut">Cargando…</p></Page>;
  if (d.error) return <Page title="Transparencia"><p className="text-ros">No se pudieron cargar los datos.</p></Page>;
  const tot = (a) => a.reduce((s, x) => s + (x.valor || 0), 0);
  const TABS = [["ingresos", "Ingresos"], ["gastos", "Gastos"], ["donantes", "Donantes"], ["contratos", "Contratos"], ["decisiones", "Decisiones"], ["errores", "Errores reconocidos"]];
  const rows = d[tab] || [];
  const csv = () => {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]); const t = [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" })); a.download = `mac-${tab}.csv`; a.click();
  };
  return (
    <Page title="Portal de transparencia" intro="Publicamos nuestras cuentas, contratos, donantes y decisiones, y reconocemos nuestros errores (arts. 46 y 49-51). Sin perjuicio de los informes ante el CNE.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card t="Ingresos">{money(tot(d.ingresos))}</Card><Card t="Gastos">{money(tot(d.gastos))}</Card><Card t="Corte">{new Date(d.corte).toLocaleDateString("es-CO", { timeZone: "UTC" })}</Card>
      </div>
      <p className="mt-4 text-sm text-mut">{d.nota}</p>
      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-lg border px-4 py-2 text-sm font-bold ${tab === k ? "border-ambar bg-ambar text-[#1d1228]" : "border-line"}`}>{l}</button>)}
        <button onClick={csv} className="btn2 ml-auto !py-2 text-sm">Descargar CSV</button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-card">
        {rows.length ? (
          <table className="w-full text-left text-sm"><thead><tr className="border-b border-line">{Object.keys(rows[0]).map((c) => <th key={c} className="p-3 capitalize">{c}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-line last:border-0">{Object.entries(r).map(([k, v]) => <td key={k} className="p-3 text-mut">{k === "valor" ? money(v) : String(v)}</td>)}</tr>)}</tbody></table>
        ) : <p className="p-6 text-mut">Aún no hay registros en esta categoría.</p>}
      </div>
      <p className="mt-6 text-sm text-mut">¿Viste algo que no cuadra? <Link to="/etica" className="underline">Usa el canal de ética</Link> o escribe a la Veeduría desde <Link to="/participa" className="underline">contacto</Link>.</p>
    </Page>
  );
}

const Participa = () => (
  <Page title="Participa" intro="Apoya al MAC sin afiliarte: los simpatizantes y voluntarios participan en actividades de escucha y equipos de trabajo, sin voto en los órganos de decisión (art. 16A).">
    <div className="grid gap-10 md:grid-cols-2">
      <div><h2 className="mb-4 font-display text-3xl">Voluntariado</h2>
        <NForm name="voluntariado" submit="Quiero ser voluntario" okMsg="Gracias. El equipo de tu territorio te contactará.">
          <F l="Nombre" name="nombre" /><F l="Correo" name="email" type="email" /><F l="Teléfono" name="telefono" type="tel" req={false} /><F l="Municipio" name="municipio" />
          <label className="block text-sm font-medium">Área<select name="area" className="inp mt-1"><option>Escucha territorial</option><option>Comunicaciones</option><option>Tecnología</option><option>Formación</option><option>Logística</option></select></label>
          <label className="block text-sm font-medium">Cuéntanos más<textarea name="mensaje" rows="3" className="inp mt-1" /></label>
        </NForm></div>
      <div><h2 className="mb-4 font-display text-3xl">Contacto</h2>
        <NForm name="contacto" submit="Enviar mensaje" okMsg="Mensaje enviado. Responderemos a tu correo.">
          <F l="Nombre" name="nombre" /><F l="Correo" name="email" type="email" />
          <label className="block text-sm font-medium">Asunto<select name="asunto" className="inp mt-1"><option>Consulta general</option><option>Prensa</option><option>Veeduría de Transparencia</option><option>Propuesta programática</option></select></label>
          <label className="block text-sm font-medium">Mensaje<textarea name="mensaje" rows="5" required className="inp mt-1" /></label>
        </NForm></div>
    </div>
  </Page>
);

const Etica = () => (
  <Page title="Canal de ética y denuncia" intro="Reporta de forma confidencial conductas que violen los estatutos o el Código de Ética: corrupción, violencia o acoso (incluida la política y de género), doble militancia, uso indebido de recursos o riesgos para menores de edad (art. 18G y 43). Lo recibe el Comité de Ética y Garantías.">
    <div className="max-w-xl"><NForm name="denuncia" submit="Enviar denuncia" okMsg="Tu reporte fue recibido de forma confidencial. Si hay riesgo para una persona, acude también a las autoridades (línea 123).">
      <label className="block text-sm font-medium">Tipo<select name="tipo" className="inp mt-1"><option>Corrupción o uso indebido de recursos</option><option>Violencia o acoso</option><option>Doble militancia</option><option>Protección de menores</option><option>Otro</option></select></label>
      <label className="block text-sm font-medium">Relato de los hechos<textarea name="relato" rows="6" required className="inp mt-1" /></label>
      <F l="Contacto (opcional, si quieres respuesta)" name="contacto_opcional" req={false} />
    </NForm></div>
  </Page>
);

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">Saltar al contenido</a>
      <Header />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/programa" element={<Programa />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/juventud" element={<Juventud />} />
          <Route path="/estatutos" element={<Estatutos />} />
          <Route path="/transparencia" element={<Transparencia />} />
          <Route path="/afiliate" element={<Afiliate />} />
          <Route path="/consulta" element={<Consulta />} />
          <Route path="/retiro" element={<Retiro />} />
          <Route path="/participa" element={<Participa />} />
          <Route path="/etica" element={<Etica />} />
          <Route path="*" element={<Page title="Página no encontrada" intro="Esa dirección no existe."><Link to="/" className="btn">Volver al inicio</Link></Page>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
