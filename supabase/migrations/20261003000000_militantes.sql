-- Registro de militantes del MAC. Ejecutar en Supabase > SQL Editor (o `supabase db push`).
create extension if not exists pg_trgm with schema extensions;

create table public.militantes (
  id                          bigint generated always as identity primary key,
  nombre_completo             text        not null,
  tipo_documento              text        not null,
  documento                   text        not null,   -- normalizado: mayúsculas, sin puntos ni espacios
  email                       text        not null,   -- normalizado en minúsculas
  departamento                text        not null,
  fecha_nacimiento            date        not null,
  comisiones                  text[]      not null default '{}',
  autorizacion_representante  boolean     not null default false,  -- menores de 18 (art. 18B)
  habeas_data_aceptado        boolean     not null,
  habeas_data_at              timestamptz not null,               -- cuándo autorizó
  habeas_data_version         text        not null,               -- versión de la política aceptada
  estado                      text        not null default 'pendiente',
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  constraint militantes_documento_key unique (documento),
  constraint militantes_email_key     unique (email),
  constraint militantes_nombre_chk    check (char_length(nombre_completo) between 5 and 120),
  constraint militantes_tipo_chk      check (tipo_documento in ('CC','TI','CE','PP')),
  constraint militantes_documento_chk check (documento ~ '^[A-Z0-9]{5,15}$'),
  constraint militantes_email_chk     check (email = lower(email) and char_length(email) <= 254
                                             and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  constraint militantes_habeas_chk    check (habeas_data_aceptado is true),
  constraint militantes_estado_chk    check (estado in ('pendiente','activo','suspendido','retirado'))
);

-- documento y email ya tienen índice único. Índices para las consultas frecuentes del panel:
create index militantes_departamento_idx on public.militantes (departamento);
create index militantes_estado_created_idx on public.militantes (estado, created_at desc);
create index militantes_created_idx on public.militantes (created_at desc);
create index militantes_comisiones_idx on public.militantes using gin (comisiones);
create index militantes_nombre_trgm_idx on public.militantes using gin (nombre_completo extensions.gin_trgm_ops);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger militantes_updated_at before update on public.militantes
  for each row execute function public.set_updated_at();

-- Seguridad: nadie con la clave pública (anon) o de usuarios puede leer ni escribir.
-- Solo la clave service_role (que usa la función de Netlify) accede, porque ignora RLS.
alter table public.militantes enable row level security;
revoke all on public.militantes from anon, authenticated;

-- Derecho de supresión (Ley 1581): conserva la fila sin datos personales.
-- Uso desde el SQL Editor:  select public.anonimizar_militante(123);
create function public.anonimizar_militante(p_id bigint) returns void language sql set search_path = '' as $$
  update public.militantes set
    nombre_completo = 'ELIMINADO', documento = 'ELIM' || lpad(id::text, 8, '0'),
    email = 'eliminado-' || id || '@eliminado.invalid', comisiones = '{}',
    fecha_nacimiento = date '1900-01-01', estado = 'retirado'
  where id = p_id;
$$;
revoke execute on function public.anonimizar_militante(bigint) from public, anon, authenticated;
