import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0C0D1A;font-family:'Albert Sans',sans-serif;}
  ::-webkit-scrollbar{width:4px;height:4px;background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
  .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;}
  .glass-dark{background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:12px;}
  .kpi{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px 22px;}
  .kpi.hi{border-color:rgba(212,175,55,0.5);background:rgba(212,175,55,0.08);}
  .kpi.green{border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.06);}
  .kpi.rose{border-color:rgba(244,114,182,0.4);background:rgba(244,114,182,0.06);}
  .kpi.red{border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06);}
  .inp{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#fff;font-family:'Albert Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:border 0.2s;}
  .inp:focus{border-color:#D4AF37;}
  .inp::placeholder{color:rgba(255,255,255,0.2);}
  select.inp{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;}
  select.inp option{background:#1a1b2e;color:#fff;}
  .btn-gold{background:#D4AF37;color:#0C0D1A;border:none;border-radius:10px;padding:10px 20px;font-family:'Albert Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-gold:hover{background:#e6c444;}
  .btn-gold:disabled{background:rgba(212,175,55,0.3);cursor:default;color:rgba(12,13,26,0.5);}
  .btn-ghost{background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 16px;font-family:'Albert Sans',sans-serif;font-size:12px;cursor:pointer;transition:all 0.2s;}
  .btn-ghost:hover{border-color:#D4AF37;color:#fff;}
  .nav-tab{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,0.35);transition:all 0.18s;}
  .nav-tab:hover{color:rgba(255,255,255,0.7);}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;}
  .tab-dash{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,0.35);transition:all 0.18s;}
  .tab-dash:hover{color:rgba(255,255,255,0.7);}
  .clienta-sugg{padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;}
  .clienta-sugg:hover{background:rgba(212,175,55,0.2);}
`;

let cssInjected = false;
function useCSSInjection(){useEffect(()=>{if(cssInjected)return;const s=document.createElement("style");s.textContent=CSS;document.head.appendChild(s);cssInjected=true;},[]);}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN BEAUTY DESIGN — 2 ubicaciones
// ══════════════════════════════════════════════════════════════════════════════
const USUARIOS=[
  {id:1,nombre:"Salón San Jerónimo",usuario:"salon",password:"beauty2026",rol:"sucursal",color:"#D4AF37"},
  {id:2,nombre:"Barbería",usuario:"barberia",password:"beauty2026",rol:"sucursal",color:"#49B8D3"},
  {id:0,nombre:"Admin",usuario:"beauty.admin",password:"beauty.admin2026",rol:"admin",color:"#D4AF37"},
];
const SUCURSALES_NAMES=["Salón San Jerónimo","Barbería"];
const COLORES={"Salón San Jerónimo":"#D4AF37","Barbería":"#49B8D3"};
const fmt=(n)=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(n||0);
const fmtN=(n)=>new Intl.NumberFormat("es-MX").format(n||0);
const pct=(a,b)=>b>0?((a/b)*100).toFixed(1):"0";
const hoy=()=>new Date().toISOString().slice(0,10);
const inicioMes=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;};
const mesLabel=()=>new Date().toLocaleDateString("es-MX",{month:"long",year:"numeric"});

// ── Comisiones bancarias (% sobre monto cobrado con tarjeta) ──
const COMISION_DEBITO=0.018;   // 1.8%
const COMISION_CREDITO=0.032;  // 3.2%

// ── Comisión estilistas (% del servicio realizado) ──
const COMISION_ESTILISTA=0.30; // 30%

// ── Estilistas por sucursal ──
const ESTILISTAS={
  1:["Ana","Lupita","Karla","Sofía"],
  2:["Carlos","Miguel","Raúl","Diego"],
};

const CATALOGO=[
  {categoria:"Cortes",items:[
    {nombre:"Corte Dama",precio:350,msi:[]},
    {nombre:"Corte Caballero",precio:200,msi:[]},
    {nombre:"Corte Niño/Niña",precio:150,msi:[]},
    {nombre:"Corte + Barba",precio:300,msi:[]},
    {nombre:"Recorte de Puntas",precio:180,msi:[]},
    {nombre:"Fleco",precio:100,msi:[]},
  ]},
  {categoria:"Color",items:[
    {nombre:"Tinte Raíz",precio:800,msi:[3]},
    {nombre:"Tinte Completo",precio:1200,msi:[3]},
    {nombre:"Mechas/Highlights",precio:1800,msi:[3]},
    {nombre:"Balayage",precio:2500,msi:[3,6]},
    {nombre:"Decoloración Global",precio:2200,msi:[3,6]},
    {nombre:"Matiz / Toner",precio:500,msi:[]},
    {nombre:"Color Fantasía",precio:2000,msi:[3]},
    {nombre:"Corrección de Color",precio:3000,msi:[3,6]},
  ]},
  {categoria:"Tratamientos",items:[
    {nombre:"Keratina",precio:1800,msi:[3]},
    {nombre:"Botox Capilar",precio:1500,msi:[3]},
    {nombre:"Tratamiento Hidratante",precio:600,msi:[]},
    {nombre:"Cauterización",precio:1200,msi:[3]},
    {nombre:"Nanoplastia",precio:2500,msi:[3,6]},
    {nombre:"Ampolleta Reparadora",precio:350,msi:[]},
  ]},
  {categoria:"Peinados",items:[
    {nombre:"Peinado Evento",precio:800,msi:[]},
    {nombre:"Peinado Novia",precio:2500,msi:[3]},
    {nombre:"Brushing / Blowout",precio:350,msi:[]},
    {nombre:"Planchado",precio:300,msi:[]},
    {nombre:"Ondas / Rizos",precio:400,msi:[]},
  ]},
  {categoria:"Barbería",items:[
    {nombre:"Corte Clásico",precio:200,msi:[]},
    {nombre:"Corte Fade",precio:250,msi:[]},
    {nombre:"Barba Completa",precio:180,msi:[]},
    {nombre:"Corte + Barba Premium",precio:400,msi:[]},
    {nombre:"Diseño de Cejas Hombre",precio:100,msi:[]},
    {nombre:"Afeitado Navaja",precio:250,msi:[]},
    {nombre:"Tratamiento Capilar Hombre",precio:500,msi:[]},
  ]},
  {categoria:"Uñas & Extras",items:[
    {nombre:"Manicure",precio:250,msi:[]},
    {nombre:"Pedicure",precio:300,msi:[]},
    {nombre:"Gelish Manos",precio:400,msi:[]},
    {nombre:"Gelish Pies",precio:450,msi:[]},
    {nombre:"Acrílicas",precio:600,msi:[]},
    {nombre:"Depilación Cera Facial",precio:150,msi:[]},
    {nombre:"Depilación Cera Piernas",precio:350,msi:[]},
    {nombre:"Maquillaje Evento",precio:800,msi:[]},
    {nombre:"Maquillaje Novia",precio:2000,msi:[3]},
  ]},
];

const TIPOS_SVC=[
  {id:"corte",label:"Corte",duracion:45,color:"#D4AF37"},
  {id:"color",label:"Color",duracion:120,color:"#f472b6"},
  {id:"tratamiento",label:"Tratamiento",duracion:90,color:"#a855f7"},
  {id:"peinado",label:"Peinado",duracion:60,color:"#f97316"},
  {id:"barberia",label:"Barbería",duracion:40,color:"#49B8D3"},
  {id:"unas",label:"Uñas/Extras",duracion:60,color:"#10b981"},
];

const HORARIOS={1:{a:"09:00",c:"20:00"},2:{a:"09:00",c:"20:00"},3:{a:"09:00",c:"20:00"},4:{a:"09:00",c:"20:00"},5:{a:"09:00",c:"20:00"},6:{a:"09:00",c:"18:00"},0:null};
const DIAS_L=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const HORAS=Array.from({length:12},(_,i)=>i+9);
const PX_POR_MIN=64/60;
const colorT=(t)=>TIPOS_SVC.find(x=>x.id===t)?.color||"#D4AF37";
const detectTipo=(n)=>{const l=(n||"").toLowerCase();if(l.includes("corte clás")||l.includes("fade")||l.includes("barba")||l.includes("afeitado")||l.includes("cejas hombre"))return TIPOS_SVC[4];if(l.includes("tinte")||l.includes("mech")||l.includes("balay")||l.includes("decol")||l.includes("matiz")||l.includes("toner")||l.includes("fantasía")||l.includes("corrección"))return TIPOS_SVC[1];if(l.includes("keratina")||l.includes("botox")||l.includes("hidrat")||l.includes("cauteri")||l.includes("nanoplas")||l.includes("ampolleta")||l.includes("tratamiento capilar"))return TIPOS_SVC[2];if(l.includes("peinado")||l.includes("novia")&&!l.includes("maquillaje")||l.includes("brushing")||l.includes("blowout")||l.includes("planchado")||l.includes("ondas")||l.includes("rizos"))return TIPOS_SVC[3];if(l.includes("manicure")||l.includes("pedicure")||l.includes("gelish")||l.includes("acrílica")||l.includes("depilación")||l.includes("maquillaje"))return TIPOS_SVC[5];return TIPOS_SVC[0];};
const horaFin=(h,dur)=>{if(!h)return"";const[hh,mm]=h.split(":").map(Number);const f=hh*60+mm+dur;return`${String(Math.floor(f/60)).padStart(2,"0")}:${String(f%60).padStart(2,"0")}`;};
function semanaD(f){const b=new Date(f+"T12:00:00"),d=b.getDay(),l=new Date(b);l.setDate(b.getDate()-(d===0?6:d-1));return Array.from({length:6},(_,i)=>{const x=new Date(l);x.setDate(l.getDate()+i);return x.toISOString().slice(0,10);});}
const FILTROS=["Todos","Cortes","Color","Tratamientos","Peinados","Barbería","Uñas & Extras"];
const ITEM_FILTRO=(item,f)=>{if(f==="Todos")return true;return item.categoria===f;};
const MESES_ES=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ══════════════════════════════════════════════════════════════════════════════
// MINI AGENDA — vista inline del día para sidebar POS
// ══════════════════════════════════════════════════════════════════════════════
function MiniAgendaDia({session,fecha,onSelectHora,horaSeleccionada,duracion}){
  const[citas,setCitas]=useState([]);
  useEffect(()=>{if(!fecha)return;(async()=>{const{data}=await supabase.from("citas").select("*").eq("sucursal_id",session.id).eq("fecha",fecha).neq("estado","cancelada").order("hora_inicio");setCitas(data||[]);})();},[fecha,session.id]);
  const dow=new Date(fecha+"T12:00:00").getDay(),h=HORARIOS[dow];
  if(!h)return<div style={{fontSize:"11px",color:"#ff6b6b",padding:"8px"}}>Domingo — cerrado</div>;
  const[hA]=h.a.split(":").map(Number),[hC]=h.c.split(":").map(Number);
  const hrs=Array.from({length:hC-hA},(_,i)=>i+hA);
  return(
    <div style={{border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",overflow:"hidden",background:"rgba(0,0,0,0.2)"}}>
      <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"10px",color:"rgba(255,255,255,0.4)",letterSpacing:"1px",display:"flex",justifyContent:"space-between"}}>
        <span>{new Date(fecha+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"short"}).toUpperCase()}</span>
        <span>{citas.length} cita{citas.length!==1?"s":""}</span>
      </div>
      <div style={{maxHeight:"260px",overflowY:"auto"}}>
        {hrs.map(hr=>{const s0=`${String(hr).padStart(2,"0")}:00`,s30=`${String(hr).padStart(2,"0")}:30`;
          const citasHr=citas.filter(c=>{const[ch]=c.hora_inicio.split(":").map(Number);return ch===hr;});
          return(<div key={hr} style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
            <div style={{width:"42px",padding:"4px 6px",fontSize:"9px",color:"rgba(255,255,255,0.2)",textAlign:"right",flexShrink:0,paddingTop:"6px"}}>{hr>12?`${hr-12}pm`:hr===12?"12pm":`${hr}am`}</div>
            <div style={{flex:1,minHeight:"44px",position:"relative"}}>
              {[s0,s30].map((slot)=>{const sel=horaSeleccionada===slot;return(
                <div key={slot} onClick={()=>onSelectHora(slot)} style={{height:"22px",cursor:"pointer",background:sel?"rgba(212,175,55,0.25)":"transparent",borderLeft:sel?"2px solid #D4AF37":"2px solid transparent",transition:"all 0.1s",display:"flex",alignItems:"center",paddingLeft:"4px"}}
                  onMouseEnter={e=>{if(!sel)e.currentTarget.style.background="rgba(255,255,255,0.03)";}} onMouseLeave={e=>{if(!sel)e.currentTarget.style.background=sel?"rgba(212,175,55,0.25)":"transparent";}}>
                  {sel&&<span style={{fontSize:"9px",color:"#D4AF37",fontWeight:600}}>{slot}</span>}
                </div>);
              })}
              {citasHr.map(c=>{const[,cm]=c.hora_inicio.split(":").map(Number);const top=cm<30?1:23;const hPx=Math.max(c.duracion_min*(44/60)-2,14);const col=colorT(c.tipo_servicio);
                return(<div key={c.id} style={{position:"absolute",left:"28px",right:"2px",top:`${top}px`,height:`${hPx}px`,background:`${col}22`,border:`1px solid ${col}55`,borderRadius:"4px",padding:"1px 4px",pointerEvents:"none",overflow:"hidden",zIndex:2}}>
                  <div style={{fontSize:"8px",fontWeight:600,color:col,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.hora_inicio} {c.clienta_nombre}</div>
                </div>);
              })}
            </div>
          </div>);
        })}
      </div>
      {horaSeleccionada&&<div style={{padding:"6px 10px",borderTop:"1px solid rgba(212,175,55,0.3)",background:"rgba(212,175,55,0.08)",fontSize:"11px",color:"#D4AF37",fontWeight:600}}>✓ {horaSeleccionada} – {horaFin(horaSeleccionada,duracion)} ({duracion}min)</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FICHA CLIENTE
// ══════════════════════════════════════════════════════════════════════════════
function FichaClienta({clientaId,session,onClose}){
  const[clienta,setClienta]=useState(null);const[citasH,setCitasH]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{setLoading(true);const{data:c}=await supabase.from("clientas").select("*").eq("id",clientaId).single();const{data:ci}=await supabase.from("citas").select("*").eq("clienta_id",clientaId).order("fecha",{ascending:false});setClienta(c);setCitasH(ci||[]);setLoading(false);})();},[clientaId]);
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>Cargando ficha...</div>;
  if(!clienta)return<div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>No encontrado</div>;
  const prox=citasH.find(c=>c.estado==="agendada");
  const totalGastado=citasH.filter(c=>c.es_cobro).reduce((s,c)=>s+Number(c.notas?.match(/\$[\d,]+/)?.[0]?.replace(/[$,]/g,"")||0),0);
  return(
    <div style={{padding:"20px 24px",overflowY:"auto",flex:1,color:"#fff"}}>
      {onClose&&<button className="btn-ghost" onClick={onClose} style={{marginBottom:"16px",fontSize:"11px"}}>← Volver</button>}
      <div style={{display:"flex",gap:"20px",marginBottom:"24px",alignItems:"flex-start"}}>
        <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"rgba(212,175,55,0.2)",border:"1px solid rgba(212,175,55,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",fontWeight:700,color:"#D4AF37",flexShrink:0}}>{clienta.nombre?.charAt(0)?.toUpperCase()||"?"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:"20px",fontWeight:700,marginBottom:"4px"}}>{clienta.nombre}</div>
          <div style={{display:"flex",gap:"16px",fontSize:"12px",color:"rgba(255,255,255,0.4)",flexWrap:"wrap"}}>
            {clienta.telefono&&<span>📱 {clienta.telefono}</span>}
            {clienta.fecha_nacimiento&&<span>🎂 {new Date(clienta.fecha_nacimiento+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}</span>}
            {clienta.como_nos_conocio&&<span>📣 {clienta.como_nos_conocio}</span>}
          </div>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>Desde {new Date(clienta.created_at).toLocaleDateString("es-MX",{month:"short",year:"numeric"})} · {clienta.sucursal_nombre}</div>
        </div>
      </div>
      {prox&&<div className="glass" style={{padding:"16px",marginBottom:"16px",borderColor:"rgba(212,175,55,0.3)"}}>
        <div style={{fontSize:"10px",letterSpacing:"1px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>PRÓXIMA CITA</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:"14px",fontWeight:600}}>{prox.servicio}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>{new Date(prox.fecha+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})} · {prox.hora_inicio}</div></div>
          {prox.estilista&&<div style={{fontSize:"12px",fontWeight:600,color:"#D4AF37"}}>{prox.estilista}</div>}
        </div>
      </div>}
      <div>
        <div style={{fontSize:"10px",letterSpacing:"1px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>HISTORIAL ({citasH.filter(c=>c.estado==="completada").length} completadas)</div>
        {citasH.map(c=><div key={c.id} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:c.estado==="completada"?"#10b981":c.estado==="agendada"?colorT(c.tipo_servicio):"rgba(255,255,255,0.15)",marginTop:"6px",flexShrink:0}}/>
          <div style={{flex:1}}><div style={{fontSize:"12px",fontWeight:500}}>{c.servicio}{c.estilista?<span style={{color:"rgba(255,255,255,0.3)"}}> · {c.estilista}</span>:""}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{new Date(c.fecha+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short"})} · {c.hora_inicio}</div></div>
          <div style={{fontSize:"10px",fontWeight:600,color:c.estado==="completada"?"#10b981":c.estado==="agendada"?"#D4AF37":"rgba(255,255,255,0.2)"}}>{c.estado==="completada"?"✓":c.estado==="agendada"?"Próx.":"✕"}</div>
        </div>)}
        {citasH.length===0&&<div style={{fontSize:"12px",color:"rgba(255,255,255,0.15)"}}>Sin historial</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENDA CALENDAR
// ══════════════════════════════════════════════════════════════════════════════
function AgendaCalendar({session,onVerFicha}){
  const[semana,setSemana]=useState(semanaD(hoy()));const[citas,setCitas]=useState([]);const[detalle,setDetalle]=useState(null);const[saving,setSaving]=useState(false);
  const mRef=useRef(true);useEffect(()=>{mRef.current=true;return()=>{mRef.current=false;};},[]);
  const cargar=async()=>{const{data}=await supabase.from("citas").select("*").eq("sucursal_id",session.id).gte("fecha",semana[0]).lte("fecha",semana[5]).order("hora_inicio");if(data)setCitas(data);};
  useEffect(()=>{cargar();},[semana,session]);
  const completar=async(cita)=>{
    await supabase.from("citas").update({estado:"completada"}).eq("id",cita.id);
    setDetalle(null);
    if(mRef.current)cargar();
  };
  const cancelar=async(id)=>{await supabase.from("citas").update({estado:"cancelada"}).eq("id",id);setDetalle(null);cargar();};
  const semAnt=()=>{const d=new Date(semana[0]+"T12:00:00");d.setDate(d.getDate()-7);setSemana(semanaD(d.toISOString().slice(0,10)));};
  const semSig=()=>{const d=new Date(semana[0]+"T12:00:00");d.setDate(d.getDate()+7);setSemana(semanaD(d.toISOString().slice(0,10)));};
  const cdDia=(f)=>citas.filter(c=>c.fecha===f&&c.estado!=="cancelada");
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 64px)",background:"#0C0D1A",color:"#fff"}}>
      <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <button className="btn-ghost" style={{padding:"6px 14px"}} onClick={()=>setSemana(semanaD(hoy()))}>Hoy</button>
          <button onClick={semAnt} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:"6px 10px",fontSize:"14px"}}>‹</button>
          <button onClick={semSig} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:"6px 10px",fontSize:"14px"}}>›</button>
          <div style={{fontSize:"16px",fontWeight:600,textTransform:"capitalize"}}>{new Date(semana[0]+"T12:00:00").toLocaleDateString("es-MX",{month:"long",year:"numeric"})}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>{TIPOS_SVC.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"10px",color:"rgba(255,255,255,0.35)"}}><div style={{width:"8px",height:"8px",borderRadius:"2px",background:t.color}}/>{t.label}</div>)}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"52px repeat(6,1fr)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,background:"#0C0D1A",zIndex:10}}>
          <div/>
          {semana.map(f=>{const d=new Date(f+"T12:00:00").getDay(),e=f===hoy(),a=HORARIOS[d]!==null;return(
            <div key={f} style={{padding:"10px 8px",textAlign:"center",opacity:a?1:0.4}}>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",letterSpacing:"1px",marginBottom:"4px"}}>{DIAS_L[d].toUpperCase()}</div>
              <div style={{width:"32px",height:"32px",borderRadius:"50%",background:e?"#D4AF37":"transparent",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"16px",fontWeight:e?700:400,color:e?"#0C0D1A":"rgba(255,255,255,0.8)"}}>{f.slice(8)}</span></div>
            </div>);})}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"52px repeat(6,1fr)",position:"relative"}}>
          <div>{HORAS.map(h=><div key={h} style={{height:"64px",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:"8px",paddingTop:"2px"}}><span style={{fontSize:"10px",color:"rgba(255,255,255,0.25)"}}>{h>12?`${h-12}pm`:h===12?"12pm":`${h}am`}</span></div>)}</div>
          {semana.map(f=>{const d=new Date(f+"T12:00:00").getDay(),a=HORARIOS[d]!==null,cd=cdDia(f);return(
            <div key={f} style={{borderLeft:"1px solid rgba(255,255,255,0.05)",position:"relative",opacity:a?1:0.3}}>
              {HORAS.map(h=><div key={h} style={{height:"64px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}/>)}
              {cd.map(c=>{const[ch,cm]=c.hora_inicio.split(":").map(Number),top=(ch-9)*64+cm*PX_POR_MIN,height=Math.max(c.duracion_min*PX_POR_MIN-2,20),col=colorT(c.tipo_servicio);return(
                <div key={c.id} onClick={e=>{e.stopPropagation();setDetalle(c);}} style={{position:"absolute",left:"2px",right:"2px",top:`${top}px`,height:`${height}px`,background:`${col}22`,border:`1px solid ${col}66`,borderLeft:`3px solid ${col}`,borderRadius:"6px",padding:"3px 6px",cursor:"pointer",overflow:"hidden",zIndex:5}} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <div style={{fontSize:"10px",fontWeight:700,color:col,lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.hora_inicio} {c.clienta_nombre}</div>
                  {height>30&&<div style={{fontSize:"9px",color:"rgba(255,255,255,0.5)",marginTop:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.servicio}{c.estilista?` · ${c.estilista}`:""}</div>}
                </div>);})}
              {f===hoy()&&(()=>{const n=new Date(),m=(n.getHours()-9)*60+n.getMinutes();if(m<0||m>720)return null;return<div style={{position:"absolute",left:0,right:0,top:`${m*PX_POR_MIN}px`,height:"2px",background:"#ff4444",zIndex:6,pointerEvents:"none"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ff4444",position:"absolute",left:"-4px",top:"-3px"}}/></div>;})()}
            </div>);})}
        </div>
      </div>
      {detalle&&<div className="overlay" onClick={()=>setDetalle(null)}><div className="glass" style={{width:400,padding:"26px",borderColor:`${colorT(detalle.tipo_servicio)}44`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"16px"}}><div><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"3px"}}>CITA</div><div style={{fontSize:"18px",fontWeight:700}}>{detalle.clienta_nombre}</div></div><button onClick={()=>setDetalle(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:"22px"}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:"9px",background:"rgba(0,0,0,0.3)",borderRadius:"10px",padding:"14px",marginBottom:"16px"}}>
          {[["Servicio",detalle.servicio],["Estilista",detalle.estilista||"—"],["Fecha",new Date(detalle.fecha+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})],["Horario",`${detalle.hora_inicio} – ${detalle.hora_fin}`]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.4)"}}>{l}</span><span style={{fontWeight:500}}>{v}</span></div>)}
        </div>
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          {detalle.estado==="agendada"&&<><button className="btn-ghost" style={{flex:1,color:"#ff6b6b",borderColor:"rgba(255,80,80,0.3)"}} onClick={()=>cancelar(detalle.id)}>Cancelar</button><button className="btn-gold" style={{flex:2}} onClick={()=>completar(detalle)}>✓ Completada</button></>}
          {detalle.estado==="completada"&&<div style={{textAlign:"center",width:"100%",fontSize:"13px",color:"#10b981",fontWeight:600}}>✓ Completada</div>}
          {detalle.estado==="cancelada"&&<div style={{textAlign:"center",width:"100%",fontSize:"13px",color:"rgba(255,255,255,0.3)"}}>Cancelada</div>}
        </div>
        {detalle.clienta_id&&<button className="btn-ghost" style={{width:"100%",fontSize:"11px"}} onClick={()=>{setDetalle(null);onVerFicha&&onVerFicha(detalle.clienta_id);}}>Ver ficha de {detalle.clienta_nombre}</button>}
      </div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POS — Servicio → Datos → Agendar → Cobrar
// ══════════════════════════════════════════════════════════════════════════════
function POS({session,onSwitchSucursal,isAdmin}){
  useCSSInjection();
  const[view,setView]=useState("pos");const[carrito,setCarrito]=useState([]);const[filtro,setFiltro]=useState("Todos");const[busq,setBusq]=useState("");
  const[tipoTicket,setTipoTicket]=useState("nueva");
  const[clientaSel,setClientaSel]=useState(null);const[busqCli,setBusqCli]=useState("");const[cliResults,setCliResults]=useState([]);
  const[nombreCli,setNombreCli]=useState("");const[telCli,setTelCli]=useState("");const[nacDia,setNacDia]=useState("");const[nacMes,setNacMes]=useState("");const[nacAnio,setNacAnio]=useState("");const[comoNos,setComoNos]=useState("");
  const[estilista,setEstilista]=useState("");
  const[fechaCita,setFechaCita]=useState("");const[horaCita,setHoraCita]=useState("");const[showAgenda,setShowAgenda]=useState(false);
  const[metodo,setMetodo]=useState("");const[msiSel,setMsiSel]=useState(0);const[descuento,setDescuento]=useState(0);const[showConfirm,setShowConfirm]=useState(false);const[saving,setSaving]=useState(false);const[showExito,setShowExito]=useState(false);
  const[tickets,setTickets]=useState([]);const[loadingT,setLoadingT]=useState(false);const[fichaId,setFichaId]=useState(null);const[clientas,setClientas]=useState([]);const[cliBusq,setCliBusq]=useState("");const[loadingCli,setLoadingCli]=useState(false);
  // Egresos
  const[showEgreso,setShowEgreso]=useState(false);const[egresoConc,setEgresoConc]=useState("");const[egresoMonto,setEgresoMonto]=useState("");const[egresoMet,setEgresoMet]=useState("Efectivo");const[savingEg,setSavingEg]=useState(false);
  // Corte de caja
  const[corteTickets,setCorteTickets]=useState([]);const[corteEgresos,setCorteEgresos]=useState([]);const[loadingCorte,setLoadingCorte]=useState(false);
  const[efectivoCaja,setEfectivoCaja]=useState("");const[showCierreCaja,setShowCierreCaja]=useState(false);const[savingCierre,setSavingCierre]=useState(false);const[cierreDone,setCierreDone]=useState(false);const[cierreData,setCierreData]=useState(null);

  const cargarCorte=async()=>{setLoadingCorte(true);
    const[{data:tk},{data:eg},{data:ci}]=await Promise.all([
      supabase.from("tickets").select("*").eq("sucursal_id",session.id).eq("fecha",hoy()).order("created_at",{ascending:false}),
      supabase.from("egresos").select("*").eq("sucursal_id",session.id).eq("fecha",hoy()).order("created_at",{ascending:false}),
      supabase.from("cierres_caja").select("*").eq("sucursal_id",session.id).eq("fecha",hoy()).limit(1),
    ]);
    setCorteTickets(tk||[]);setCorteEgresos(eg||[]);
    if(ci&&ci.length>0){setCierreDone(true);setCierreData(ci[0]);}else{setCierreDone(false);setCierreData(null);}
    setLoadingCorte(false);
  };

  // Cálculos corte de caja
  const cEfectivo=corteTickets.filter(t=>(t.metodo_pago||"").startsWith("Efectivo")).reduce((s,t)=>s+Number(t.total),0);
  const cDebito=corteTickets.filter(t=>(t.metodo_pago||"").startsWith("Débito")).reduce((s,t)=>s+Number(t.total),0);
  const cCredito=corteTickets.filter(t=>(t.metodo_pago||"").startsWith("Crédito")).reduce((s,t)=>s+Number(t.total),0);
  const cTransferencia=corteTickets.filter(t=>(t.metodo_pago||"").startsWith("Transferencia")).reduce((s,t)=>s+Number(t.total),0);
  const cTotalVentas=corteTickets.reduce((s,t)=>s+Number(t.total),0);
  const cTotalEgresos=corteEgresos.reduce((s,e)=>s+Number(e.monto),0);
  const cEgresosEfectivo=corteEgresos.filter(e=>(e.metodo_pago||"").startsWith("Efectivo")).reduce((s,e)=>s+Number(e.monto),0);
  const cEfectivoEsperado=cEfectivo-cEgresosEfectivo;

  const cerrarCaja=async()=>{if(!efectivoCaja)return;setSavingCierre(true);
    await supabase.from("cierres_caja").insert([{
      sucursal_id:session.id,sucursal_nombre:session.nombre,fecha:hoy(),
      total_ventas:cTotalVentas,efectivo:cEfectivo,debito:cDebito,credito:cCredito,transferencia:cTransferencia,
      total_egresos:cTotalEgresos,egresos_efectivo:cEgresosEfectivo,
      efectivo_esperado:cEfectivoEsperado,efectivo_real:parseFloat(efectivoCaja),
      diferencia:parseFloat(efectivoCaja)-cEfectivoEsperado,
      tickets_count:corteTickets.length,
    }]);
    setShowCierreCaja(false);setSavingCierre(false);setEfectivoCaja("");
    cargarCorte();
  };

  const todosItems=CATALOGO.flatMap(c=>c.items.map(i=>({...i,categoria:c.categoria})));
  const itemsFilt=todosItems.filter(i=>ITEM_FILTRO(i,filtro)&&(!busq||i.nombre.toLowerCase().includes(busq.toLowerCase())));
  const sel=(item)=>{carrito.find(x=>x.nombre===item.nombre)?setCarrito([]):setCarrito([{...item,qty:1}]);};
  const total=carrito.length>0?carrito[0].precio:0;const totalCD=Math.round(total*(1-descuento/100));const msiD=carrito.length>0?(carrito[0].msi||[]):[];
  const tipoSvc=carrito.length>0?detectTipo(carrito[0].nombre):TIPOS_SVC[0];
  const dOk=tipoTicket==="recompra"?!!clientaSel:nombreCli.trim().length>0;
  const pOk=carrito.length>0,aOk=!!fechaCita&&!!horaCita&&!!estilista,todo=pOk&&dOk&&aOk;
  const dow=fechaCita?new Date(fechaCita+"T12:00:00").getDay():-1,esDom=dow===0;
  const fechaNacISO=nacAnio&&nacMes&&nacDia?`${nacAnio}-${nacMes}-${nacDia}`:null;
  const nombreFinal=tipoTicket==="recompra"&&clientaSel?clientaSel.nombre:nombreCli;
  const estilistasDisp=ESTILISTAS[session.id]||[];
  const buscarCliPOS=async(q)=>{if(q.length<2){setCliResults([]);return;}const{data}=await supabase.from("clientas").select("*").ilike("nombre",`%${q}%`).eq("sucursal_id",session.id).limit(6);setCliResults(data||[]);};
  const selCliPOS=(c)=>{setClientaSel(c);setBusqCli(c.nombre);setCliResults([]);};
  const limpiar=()=>{setCarrito([]);setTipoTicket("nueva");setClientaSel(null);setBusqCli("");setCliResults([]);setNombreCli("");setTelCli("");setNacDia("");setNacMes("");setNacAnio("");setComoNos("");setEstilista("");setFechaCita("");setHoraCita("");setShowAgenda(false);setMetodo("");setMsiSel(0);setDescuento(0);setShowConfirm(false);};

  const cerrar=async()=>{setSaving(true);try{
    const item=carrito[0];
    let cliId=null;
    if(tipoTicket==="recompra"&&clientaSel){cliId=clientaSel.id;}
    else{const{data:cD}=await supabase.from("clientas").insert([{nombre:nombreCli,telefono:telCli,fecha_nacimiento:fechaNacISO,como_nos_conocio:comoNos,sucursal_id:session.id,sucursal_nombre:session.nombre}]).select();cliId=cD?.[0]?.id||null;}
    const{data:tD}=await supabase.from("tickets").insert([{sucursal_id:session.id,sucursal_nombre:session.nombre,servicios:[item.nombre],total:totalCD,metodo_pago:metodo+(msiSel>0?` ${msiSel}MSI`:""),descuento,tipo_clienta:tipoTicket==="recompra"?"Recompra":"Nueva",fecha:hoy(),estilista}]).select();
    const tId=tD?.[0]?.id;
    await supabase.from("citas").insert([{clienta_id:cliId,clienta_nombre:nombreFinal,sucursal_id:session.id,sucursal_nombre:session.nombre,servicio:item.nombre,tipo_servicio:tipoSvc.id,duracion_min:tipoSvc.duracion,fecha:fechaCita,hora_inicio:horaCita,hora_fin:horaFin(horaCita,tipoSvc.duracion),sesion_numero:1,es_cobro:true,estado:"agendada",estilista,notas:`Ticket #${tId||""}`}]);
    setShowConfirm(false);setShowExito(true);setTimeout(()=>{setShowExito(false);limpiar();},2200);
  }catch(e){console.error(e);}setSaving(false);};

  const guardarEgreso=async()=>{if(!egresoConc||!egresoMonto)return;setSavingEg(true);
    await supabase.from("egresos").insert([{sucursal_id:session.id,sucursal_nombre:session.nombre,concepto:egresoConc,monto:parseFloat(egresoMonto),metodo_pago:egresoMet,fecha:hoy()}]);
    setEgresoConc("");setEgresoMonto("");setEgresoMet("Efectivo");setShowEgreso(false);setSavingEg(false);
  };

  const cargarT=async(sid)=>{setLoadingT(true);const{data}=await supabase.from("tickets").select("*").eq("sucursal_id",sid).eq("fecha",hoy()).order("created_at",{ascending:false});if(data)setTickets(data);setLoadingT(false);};
  const cargarCli=async(q)=>{setLoadingCli(true);let qr=supabase.from("clientas").select("*").eq("sucursal_id",session.id).order("created_at",{ascending:false}).limit(50);if(q)qr=qr.ilike("nombre",`%${q}%`);const{data}=await qr;setClientas(data||[]);setLoadingCli(false);};
  const totalHoy=tickets.reduce((s,t)=>s+Number(t.total),0);
  const anios=Array.from({length:73},(_,i)=>String(2012-i));const dias=Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"));

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0C0D1A",color:"#fff"}}>
      <div style={{height:"64px",padding:"0 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{fontSize:"16px",fontWeight:700,letterSpacing:"2px",color:"#D4AF37"}}>BEAUTY DESIGN</div><div style={{width:"1px",height:"18px",background:"rgba(255,255,255,0.1)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:session.color}}/><div style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",fontWeight:300}}>{session.nombre}</div></div>
          <div style={{display:"flex"}}>
            {["pos","agenda","clientas","historial","corte"].map(v=><div key={v} className="nav-tab" style={{borderBottomColor:view===v?"#D4AF37":"transparent",color:view===v?"#fff":"rgba(255,255,255,0.35)"}}
              onClick={()=>{setView(v);setFichaId(null);if(v==="historial")cargarT(session.id);if(v==="clientas")cargarCli("");if(v==="corte")cargarCorte();}}>
              {v==="pos"?"Punto de Venta":v==="agenda"?"📅 Agenda":v==="clientas"?"👤 Clientes":v==="historial"?"Historial":"💰 Corte de Caja"}</div>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          {view==="historial"&&<button className="btn-ghost" onClick={()=>setShowEgreso(true)} style={{fontSize:"11px",color:"#ff6b6b",borderColor:"rgba(255,80,80,0.3)"}}>+ Egreso</button>}
          {view==="historial"&&tickets.length>0&&<div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)"}}>HOY <span style={{color:"#D4AF37",fontWeight:700}}>{fmt(totalHoy)}</span></div>}
          {isAdmin&&<button className="btn-ghost" onClick={onSwitchSucursal} style={{fontSize:"11px"}}>← Dashboard</button>}
        </div>
      </div>

      {view==="agenda"&&<AgendaCalendar key="ag" session={session} onVerFicha={id=>{setFichaId(id);setView("clientas");}}/>}

      {view==="clientas"&&(fichaId?<FichaClienta clientaId={fichaId} session={session} onClose={()=>setFichaId(null)}/>:
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"center"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>CLIENTES · {session.nombre}</div><div style={{flex:1}}/><input className="inp" placeholder="Buscar por nombre..." value={cliBusq} onChange={e=>{setCliBusq(e.target.value);cargarCli(e.target.value);}} style={{maxWidth:"280px",padding:"8px 14px",fontSize:"12px"}}/></div>
          {loadingCli&&<div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.3)"}}>Cargando...</div>}
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {clientas.map(c=><div key={c.id} className="glass" style={{padding:"14px 18px",cursor:"pointer"}} onClick={()=>setFichaId(c.id)} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,175,55,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:700,color:"#D4AF37",flexShrink:0}}>{c.nombre?.charAt(0)?.toUpperCase()}</div>
                <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600}}>{c.nombre}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{c.telefono||"—"} · {c.como_nos_conocio||""}</div></div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)"}}>{new Date(c.created_at).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</div>
              </div></div>)}
            {!loadingCli&&clientas.length===0&&<div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.15)",fontSize:"13px"}}>Sin clientes</div>}
          </div>
        </div>)}

      {view==="historial"&&<div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
        <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>HISTORIAL · {session.nombre}</div>
        {loadingT&&<div style={{color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"40px"}}>Cargando...</div>}
        {!loadingT&&tickets.length===0&&<div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"40px",fontSize:"13px"}}>Sin tickets hoy</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{tickets.map(t=><div key={t.id} className="glass" style={{padding:"16px 20px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>{new Date(t.created_at).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}{t.estilista?` · ${t.estilista}`:""}</div><div style={{fontSize:"13px",fontWeight:500}}>{(t.servicios||[]).join(", ")}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{t.metodo_pago}{t.descuento>0?` · ${t.descuento}% desc`:""}</div></div><div style={{fontSize:"20px",fontWeight:700,color:"#D4AF37"}}>{fmt(t.total)}</div></div></div>)}</div>
        {tickets.length>0&&<div style={{marginTop:"16px",padding:"16px 20px",background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>{tickets.length} tickets</div><div style={{fontSize:"20px",fontWeight:700}}>{fmt(totalHoy)}</div></div>}
      </div>}

      {/* ═══ CORTE DE CAJA DIARIO ═══ */}
      {view==="corte"&&<div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>CORTE DE CAJA · {session.nombre}</div><div style={{fontSize:"13px",color:"rgba(255,255,255,0.25)",marginTop:"4px"}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
          <div style={{display:"flex",gap:"8px"}}>
            <button className="btn-ghost" onClick={()=>setShowEgreso(true)} style={{fontSize:"11px",color:"#ff6b6b",borderColor:"rgba(255,80,80,0.3)"}}>+ Egreso</button>
            <button className="btn-ghost" onClick={cargarCorte} style={{fontSize:"11px"}}>↻ Actualizar</button>
          </div>
        </div>
        {loadingCorte&&<div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.3)"}}>Cargando...</div>}
        {!loadingCorte&&<>
          {/* Cards por método de pago */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px",marginBottom:"20px"}}>
            {[
              {l:"EFECTIVO",v:fmt(cEfectivo),cl:"#10b981",icon:"💵"},
              {l:"DÉBITO",v:fmt(cDebito),cl:"#49B8D3",icon:"💳"},
              {l:"CRÉDITO",v:fmt(cCredito),cl:"#f472b6",icon:"💳"},
              {l:"TRANSFERENCIA",v:fmt(cTransferencia),cl:"#a855f7",icon:"🏦"},
            ].map(k=><div key={k.l} className="kpi"><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.icon} {k.l}</div><div style={{fontSize:"28px",fontWeight:700,color:k.cl}}>{k.v}</div></div>)}
          </div>

          {/* Resumen del día */}
          <div className="glass" style={{padding:"24px",marginBottom:"20px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>RESUMEN DEL DÍA</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>Total ventas ({corteTickets.length} tickets)</span><span style={{fontWeight:700,color:"#D4AF37"}}>{fmt(cTotalVentas)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>├ Efectivo</span><span style={{fontWeight:600,color:"#10b981"}}>{fmt(cEfectivo)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>├ Tarjeta (débito + crédito)</span><span style={{fontWeight:600,color:"#49B8D3"}}>{fmt(cDebito+cCredito)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>└ Transferencia</span><span style={{fontWeight:600,color:"#a855f7"}}>{fmt(cTransferencia)}</span></div>
              {cTotalEgresos>0&&<>
                <div style={{height:"1px",background:"rgba(255,255,255,0.08)",margin:"4px 0"}}/>
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"#ff6b6b"}}>Egresos del día</span><span style={{fontWeight:700,color:"#ff6b6b"}}>-{fmt(cTotalEgresos)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.4)"}}>├ Egresos en efectivo</span><span style={{fontWeight:600,color:"#ff8a65"}}>-{fmt(cEgresosEfectivo)}</span></div>
              </>}
              <div style={{height:"1px",background:"rgba(255,255,255,0.08)",margin:"4px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",background:"rgba(16,185,129,0.06)",borderRadius:"10px",border:"1px solid rgba(16,185,129,0.2)",fontSize:"15px",fontWeight:700}}>
                <span>Efectivo esperado en caja</span><span style={{color:"#10b981"}}>{fmt(cEfectivoEsperado)}</span>
              </div>
            </div>
          </div>

          {/* Egresos del día */}
          {corteEgresos.length>0&&<div className="glass" style={{padding:"24px",marginBottom:"20px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"12px"}}>EGRESOS DE HOY</div>
            {corteEgresos.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div><div style={{fontSize:"13px",fontWeight:500}}>{e.concepto}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{e.metodo_pago}</div></div>
              <div style={{fontSize:"14px",fontWeight:700,color:"#ff6b6b"}}>-{fmt(e.monto)}</div>
            </div>)}
          </div>}

          {/* Ventas por estilista hoy */}
          {corteTickets.length>0&&(()=>{
            const estHoy={};corteTickets.forEach(t=>{if(t.estilista){estHoy[t.estilista]=(estHoy[t.estilista]||0)+Number(t.total);}});
            const estArr=Object.entries(estHoy).sort((a,b)=>b[1]-a[1]);
            if(estArr.length===0)return null;
            return<div className="glass" style={{padding:"24px",marginBottom:"20px"}}>
              <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"12px"}}>VENTAS POR ESTILISTA HOY</div>
              {estArr.map(([n,v])=><div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"32px",height:"32px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,color:"#D4AF37"}}>{n.charAt(0)}</div><span style={{fontSize:"13px",fontWeight:600}}>{n}</span></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:"15px",fontWeight:700,color:"#D4AF37"}}>{fmt(v)}</div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>Comisión: {fmt(v*COMISION_ESTILISTA)}</div></div>
              </div>)}
            </div>;
          })()}

          {/* Cierre de caja */}
          {cierreDone&&cierreData?<div className="glass" style={{padding:"24px",borderColor:"rgba(16,185,129,0.3)"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>✅</div>
              <div style={{fontSize:"16px",fontWeight:700,marginBottom:"4px"}}>Caja cerrada</div>
              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginBottom:"16px"}}>Cerrada a las {new Date(cierreData.created_at).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
                <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>Esperado</div><div style={{fontSize:"18px",fontWeight:700,color:"#49B8D3"}}>{fmt(cierreData.efectivo_esperado)}</div></div>
                <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>Entregado</div><div style={{fontSize:"18px",fontWeight:700,color:"#D4AF37"}}>{fmt(cierreData.efectivo_real)}</div></div>
                <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>Diferencia</div><div style={{fontSize:"18px",fontWeight:700,color:cierreData.diferencia>=0?"#10b981":"#ff6b6b"}}>{cierreData.diferencia>=0?"+":""}{fmt(cierreData.diferencia)}</div></div>
              </div>
            </div>
          </div>
          :<div style={{display:"flex",justifyContent:"center",marginTop:"8px"}}>
            <button className="btn-gold" style={{padding:"14px 40px",fontSize:"15px"}} onClick={()=>setShowCierreCaja(true)} disabled={corteTickets.length===0}>💰 Cerrar Caja del Día</button>
          </div>}
        </>}
      </div>}

      {/* Modal cierre de caja */}
      {showCierreCaja&&<div className="overlay"><div className="glass" style={{width:440,padding:"32px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>💰</div><div style={{fontSize:"18px",fontWeight:700}}>Cerrar Caja</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{session.nombre} · {new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</div></div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"16px",marginBottom:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",marginBottom:"8px"}}><span style={{color:"rgba(255,255,255,0.4)"}}>Ventas en efectivo</span><span style={{fontWeight:600,color:"#10b981"}}>{fmt(cEfectivo)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",marginBottom:"8px"}}><span style={{color:"rgba(255,255,255,0.4)"}}>Egresos en efectivo</span><span style={{fontWeight:600,color:"#ff6b6b"}}>-{fmt(cEgresosEfectivo)}</span></div>
          <div style={{height:"1px",background:"rgba(255,255,255,0.08)",margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"15px",fontWeight:700}}><span>Efectivo esperado</span><span style={{color:"#D4AF37"}}>{fmt(cEfectivoEsperado)}</span></div>
        </div>
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"10px",letterSpacing:"1px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>¿CUÁNTO EFECTIVO HAY EN CAJA?</div>
          <input className="inp" type="number" placeholder="$ Monto real en efectivo" value={efectivoCaja} onChange={e=>setEfectivoCaja(e.target.value)} style={{fontSize:"18px",padding:"14px 16px",textAlign:"center"}}/>
          {efectivoCaja&&<div style={{marginTop:"8px",textAlign:"center"}}>
            {(()=>{const diff=parseFloat(efectivoCaja)-cEfectivoEsperado;return<div style={{fontSize:"14px",fontWeight:700,color:diff>=0?"#10b981":Math.abs(diff)<50?"#f0c040":"#ff6b6b"}}>{diff>=0?"+":""}{fmt(diff)} {diff===0?"Cuadra perfecto":diff>0?"Sobrante":"Faltante"}</div>;})()}
          </div>}
        </div>
        <div style={{display:"flex",gap:"10px"}}><button className="btn-ghost" onClick={()=>{setShowCierreCaja(false);setEfectivoCaja("");}} style={{flex:1,padding:"13px"}}>Cancelar</button><button className="btn-gold" onClick={cerrarCaja} disabled={savingCierre||!efectivoCaja} style={{flex:2,padding:"13px",fontSize:"15px"}}>{savingCierre?"Cerrando...":"✓ Cerrar Caja"}</button></div>
      </div></div>}

      {view==="pos"&&<div style={{flex:1,display:"grid",gridTemplateColumns:showAgenda&&fechaCita&&!esDom?"380px 1fr 380px":"1fr 380px",overflow:"hidden"}}>
        {showAgenda&&fechaCita&&!esDom&&<div style={{borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",background:"rgba(0,0,0,0.15)",overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:"11px",letterSpacing:"1px",color:"rgba(255,255,255,0.3)"}}>AGENDA DEL DÍA</div><button onClick={()=>setShowAgenda(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"16px"}}>×</button></div>
          <div style={{flex:1,overflow:"auto"}}><MiniAgendaDia session={session} fecha={fechaCita} onSelectHora={h=>setHoraCita(h)} horaSeleccionada={horaCita} duracion={tipoSvc.duracion}/></div>
        </div>}

        <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
            <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>{FILTROS.map(f=><button key={f} onClick={()=>setFiltro(f)} style={{padding:"6px 14px",borderRadius:"20px",border:"1px solid",fontSize:"12px",fontWeight:500,cursor:"pointer",transition:"all 0.15s",background:filtro===f?"#D4AF37":"transparent",borderColor:filtro===f?"#D4AF37":"rgba(255,255,255,0.12)",color:filtro===f?"#0C0D1A":"rgba(255,255,255,0.45)"}}>{f}</button>)}</div>
            <input className="inp" placeholder="Buscar servicio..." value={busq} onChange={e=>setBusq(e.target.value)} style={{padding:"8px 14px",fontSize:"12px"}}/>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
            {itemsFilt.map(item=>{const ec=carrito.find(x=>x.nombre===item.nombre);return(
              <div key={item.nombre} onClick={()=>sel(item)} style={{background:ec?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${ec?"rgba(212,175,55,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:"12px",padding:"14px 14px 12px",cursor:"pointer",transition:"all 0.15s",position:"relative"}} onMouseEnter={e=>{if(!ec)e.currentTarget.style.background="rgba(255,255,255,0.06)";}} onMouseLeave={e=>{e.currentTarget.style.background=ec?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)";}}>
                <div style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",letterSpacing:"1px",marginBottom:"5px",textTransform:"uppercase"}}>{item.categoria}</div>
                <div style={{fontSize:"13px",fontWeight:600,lineHeight:1.3,marginBottom:"8px",minHeight:"36px"}}>{item.nombre}</div>
                <div style={{fontSize:"16px",fontWeight:700,color:"#D4AF37"}}>{fmt(item.precio)}</div>
                {item.msi?.length>0&&<div style={{fontSize:"9px",color:"rgba(255,255,255,0.25)",marginTop:"3px"}}>hasta {Math.max(...item.msi)} MSI</div>}
                {ec&&<div style={{position:"absolute",top:"8px",right:"8px",width:"22px",height:"22px",borderRadius:"50%",background:"#D4AF37",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:"#0C0D1A"}}>✓</div>}
              </div>);})}
          </div></div>
        </div>

        {/* SIDEBAR */}
        <div style={{borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",background:"rgba(0,0,0,0.2)",overflowY:"auto"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>NUEVO TICKET</div></div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 18px",display:"flex",flexDirection:"column",gap:"14px"}}>
            {/* 1 Servicio */}
            <div><div style={{fontSize:"9px",letterSpacing:"1px",color:pOk?"#10b981":"rgba(255,255,255,0.25)",marginBottom:"6px",display:"flex",alignItems:"center",gap:"5px"}}><div style={{width:"16px",height:"16px",borderRadius:"50%",background:pOk?"#10b981":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:700,color:pOk?"#fff":"rgba(255,255,255,0.25)",flexShrink:0}}>1</div>SERVICIO</div>
              {!pOk?<div style={{color:"rgba(255,255,255,0.1)",fontSize:"11px",padding:"10px",textAlign:"center",border:"1px dashed rgba(255,255,255,0.06)",borderRadius:"8px"}}>← Selecciona del menú</div>:
              <div style={{padding:"10px 12px",background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"12px",fontWeight:600}}>{carrito[0].nombre}</div><div style={{fontSize:"14px",fontWeight:700,color:"#D4AF37",marginTop:"2px"}}>{fmt(carrito[0].precio)}</div></div><button onClick={()=>setCarrito([])} style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.3)",borderRadius:"6px",color:"#ff6b6b",cursor:"pointer",padding:"3px 8px",fontSize:"10px"}}>✕</button></div>}
            </div>
            {/* 2 Cliente */}
            {pOk&&<div><div style={{fontSize:"9px",letterSpacing:"1px",color:dOk?"#10b981":"rgba(255,255,255,0.25)",marginBottom:"6px",display:"flex",alignItems:"center",gap:"5px"}}><div style={{width:"16px",height:"16px",borderRadius:"50%",background:dOk?"#10b981":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:700,color:dOk?"#fff":"rgba(255,255,255,0.25)",flexShrink:0}}>2</div>CLIENTE</div>
              <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>{[{v:"nueva",l:"🆕 Nuevo"},{v:"recompra",l:"🔄 Recurrente"}].map(o=><button key={o.v} onClick={()=>{setTipoTicket(o.v);setClientaSel(null);setBusqCli("");setCliResults([]);}} style={{flex:1,padding:"7px",borderRadius:"8px",border:"1px solid",fontSize:"11px",fontWeight:600,cursor:"pointer",background:tipoTicket===o.v?o.v==="recompra"?"rgba(73,184,211,0.15)":"#D4AF37":"transparent",borderColor:tipoTicket===o.v?o.v==="recompra"?"#49B8D3":"#D4AF37":"rgba(255,255,255,0.1)",color:tipoTicket===o.v?o.v==="nueva"?"#0C0D1A":"#fff":"rgba(255,255,255,0.35)"}}>{o.l}</button>)}</div>
              {tipoTicket==="recompra"?<div>
                <div style={{position:"relative",marginBottom:"6px"}}><input className="inp" placeholder="Buscar cliente existente..." value={busqCli} onChange={e=>{setBusqCli(e.target.value);buscarCliPOS(e.target.value);setClientaSel(null);}} style={{fontSize:"12px",padding:"8px 12px"}}/>
                  {cliResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1a1b2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",zIndex:20,overflow:"hidden",marginTop:"4px"}}>{cliResults.map(c=><div key={c.id} className="clienta-sugg" onClick={()=>selCliPOS(c)}><div style={{fontSize:"13px",fontWeight:500}}>{c.nombre}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{c.telefono||"—"}</div></div>)}</div>}
                </div>
                {clientaSel&&<div style={{padding:"10px 12px",background:"rgba(73,184,211,0.1)",border:"1px solid rgba(73,184,211,0.3)",borderRadius:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"24px",height:"24px",borderRadius:"50%",background:"rgba(73,184,211,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:"#49B8D3"}}>{clientaSel.nombre?.charAt(0)?.toUpperCase()}</div><div style={{fontSize:"12px",fontWeight:600}}>✓ {clientaSel.nombre}</div><button onClick={()=>{setClientaSel(null);setBusqCli("");}} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"14px"}}>×</button></div>
                </div>}
              </div>:
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                <input className="inp" placeholder="Nombre completo *" value={nombreCli} onChange={e=>setNombreCli(e.target.value)} style={{fontSize:"12px",padding:"8px 12px"}}/>
                <input className="inp" placeholder="Teléfono / WhatsApp" value={telCli} onChange={e=>setTelCli(e.target.value)} style={{fontSize:"12px",padding:"8px 12px"}}/>
                <div><div style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",marginBottom:"4px"}}>FECHA DE NACIMIENTO</div>
                  <div style={{display:"flex",gap:"6px"}}><select className="inp" value={nacDia} onChange={e=>setNacDia(e.target.value)} style={{fontSize:"11px",padding:"7px 8px",flex:"0 0 58px"}}><option value="">Día</option>{dias.map(d=><option key={d} value={d}>{d}</option>)}</select><select className="inp" value={nacMes} onChange={e=>setNacMes(e.target.value)} style={{fontSize:"11px",padding:"7px 8px",flex:1}}><option value="">Mes</option>{MESES_ES.map((m,i)=><option key={m} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select><select className="inp" value={nacAnio} onChange={e=>setNacAnio(e.target.value)} style={{fontSize:"11px",padding:"7px 8px",flex:"0 0 68px"}}><option value="">Año</option>{anios.map(a=><option key={a} value={a}>{a}</option>)}</select></div></div>
                <div><div style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",marginBottom:"4px"}}>¿CÓMO NOS CONOCIÓ?</div><div style={{display:"flex",gap:"6px"}}>{["Redes sociales","Recomendación","Pasaba por aquí"].map(c=><button key={c} onClick={()=>setComoNos(comoNos===c?"":c)} style={{flex:1,padding:"7px",borderRadius:"8px",border:"1px solid",fontSize:"10px",fontWeight:500,cursor:"pointer",background:comoNos===c?"#D4AF37":"transparent",borderColor:comoNos===c?"#D4AF37":"rgba(255,255,255,0.1)",color:comoNos===c?"#0C0D1A":"rgba(255,255,255,0.35)"}}>{c==="Redes sociales"?"📱 Redes":c==="Recomendación"?"🗣 Recom.":"🚶 Pasaba"}</button>)}</div></div>
              </div>}
            </div>}
            {/* 3 Estilista + Agendar */}
            {pOk&&dOk&&<div><div style={{fontSize:"9px",letterSpacing:"1px",color:aOk?"#10b981":"rgba(255,255,255,0.25)",marginBottom:"6px",display:"flex",alignItems:"center",gap:"5px"}}><div style={{width:"16px",height:"16px",borderRadius:"50%",background:aOk?"#10b981":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:700,color:aOk?"#fff":"rgba(255,255,255,0.25)",flexShrink:0}}>3</div>ESTILISTA Y CITA</div>
              <div style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",marginBottom:"4px"}}>ESTILISTA</div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"8px"}}>{estilistasDisp.map(e=><button key={e} onClick={()=>setEstilista(estilista===e?"":e)} style={{padding:"6px 12px",borderRadius:"8px",border:"1px solid",fontSize:"11px",fontWeight:500,cursor:"pointer",background:estilista===e?"#D4AF37":"transparent",borderColor:estilista===e?"#D4AF37":"rgba(255,255,255,0.1)",color:estilista===e?"#0C0D1A":"rgba(255,255,255,0.35)"}}>{e}</button>)}</div>
              <input type="date" className="inp" value={fechaCita} min={hoy()} onChange={e=>{setFechaCita(e.target.value);setHoraCita("");if(e.target.value)setShowAgenda(true);}} style={{fontSize:"12px",padding:"8px 12px",colorScheme:"dark",marginBottom:"6px"}}/>
              {fechaCita&&!esDom&&<div>
                <button className="btn-ghost" style={{width:"100%",fontSize:"11px",marginBottom:"6px",borderColor:showAgenda?"#D4AF37":"rgba(255,255,255,0.1)",color:showAgenda?"#fff":"rgba(255,255,255,0.4)"}} onClick={()=>setShowAgenda(!showAgenda)}>{showAgenda?"📅 Viendo agenda":"📅 Ver agenda del día"}</button>
                {!showAgenda&&<input type="time" className="inp" value={horaCita} onChange={e=>setHoraCita(e.target.value)} style={{fontSize:"12px",padding:"8px 12px",colorScheme:"dark"}}/>}
                {aOk&&<div style={{padding:"8px 10px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"8px",marginTop:"6px",fontSize:"11px",color:"#10b981"}}>✓ {estilista} · {new Date(fechaCita+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"})} · {horaCita} – {horaFin(horaCita,tipoSvc.duracion)}</div>}
              </div>}
              {esDom&&<div style={{fontSize:"11px",color:"#ff6b6b",padding:"6px 0"}}>⚠ Domingo — cerrado</div>}
            </div>}
          </div>
          {todo&&!esDom&&<div style={{padding:"12px 18px",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}><button className="btn-gold" style={{width:"100%",padding:"13px",fontSize:"14px"}} onClick={()=>setShowConfirm(true)}>Cobrar {fmt(total)}</button></div>}
        </div>
      </div>}

      {showConfirm&&<div className="overlay"><div className="glass" style={{width:420,padding:"28px"}}>
        <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>CONFIRMAR COBRO</div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"18px"}}>
          <div style={{padding:"12px",background:"rgba(0,0,0,0.3)",borderRadius:"10px"}}><div style={{fontSize:"12px",fontWeight:600,marginBottom:"4px"}}>{carrito[0]?.nombre}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>Cliente: {nombreFinal}{tipoTicket==="recompra"?" (Recurrente)":""}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>✂️ {estilista} · 📅 {new Date(fechaCita+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"})} · {horaCita}</div></div>
          <div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"6px",letterSpacing:"1px"}}>MÉTODO DE PAGO</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>{["Efectivo","Débito","Crédito","Transferencia"].map(m=><button key={m} className="btn-ghost" style={{borderColor:metodo===m?"#D4AF37":"rgba(255,255,255,0.1)",color:metodo===m?"#fff":"rgba(255,255,255,0.4)",padding:"8px",fontSize:"11px"}} onClick={()=>{setMetodo(m);if(m!=="Crédito")setMsiSel(0);}}>{m}</button>)}</div></div>
          {metodo==="Crédito"&&msiD.length>0&&<div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"6px",letterSpacing:"1px"}}>MSI</div><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}><button className="btn-ghost" style={{borderColor:msiSel===0?"#D4AF37":"rgba(255,255,255,0.1)",color:msiSel===0?"#fff":"rgba(255,255,255,0.4)",padding:"7px 12px",fontSize:"11px"}} onClick={()=>setMsiSel(0)}>Sin MSI</button>{msiD.map(m=><button key={m} className="btn-ghost" style={{borderColor:msiSel===m?"#D4AF37":"rgba(255,255,255,0.1)",color:msiSel===m?"#fff":"rgba(255,255,255,0.4)",padding:"7px 12px",fontSize:"11px"}} onClick={()=>setMsiSel(m)}>{m} MSI</button>)}</div></div>}
          {metodo==="Efectivo"&&<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(16,185,129,0.06)",borderRadius:"8px",border:"1px solid rgba(16,185,129,0.2)"}}><span style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>Desc. 5%</span><button className="btn-ghost" style={{borderColor:descuento===5?"#10b981":"rgba(255,255,255,0.1)",color:descuento===5?"#10b981":"rgba(255,255,255,0.4)",padding:"5px 12px",fontSize:"11px"}} onClick={()=>setDescuento(descuento===5?0:5)}>{descuento===5?"✓ Aplicado":"Aplicar"}</button></div>}
          <div style={{padding:"14px",background:"rgba(0,0,0,0.3)",borderRadius:"10px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",marginBottom:"6px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>{carrito[0]?.nombre}</span><span>{fmt(total)}</span></div><div style={{height:"1px",background:"rgba(255,255,255,0.08)",marginBottom:"6px"}}/>{descuento>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#ff8a65",marginBottom:"6px"}}><span>Desc. {descuento}%</span><span>-{fmt(total*descuento/100)}</span></div>}<div style={{display:"flex",justifyContent:"space-between",fontSize:"20px",fontWeight:700}}><span>Total</span><span style={{color:"#D4AF37"}}>{fmt(totalCD)}</span></div>{msiSel>0&&<div style={{fontSize:"12px",color:"#D4AF37",textAlign:"right",marginTop:"4px"}}>{fmt(totalCD/msiSel)}/mes × {msiSel}</div>}</div>
        </div>
        <div style={{display:"flex",gap:"10px"}}><button className="btn-ghost" onClick={()=>setShowConfirm(false)} style={{flex:1,padding:"13px"}}>Cancelar</button><button className="btn-gold" onClick={cerrar} disabled={saving||!metodo} style={{flex:2,padding:"13px",fontSize:"15px"}}>{saving?"Guardando...":"✓ Confirmar cobro"}</button></div>
      </div></div>}

      {showEgreso&&<div className="overlay"><div className="glass" style={{width:400,padding:"28px"}}>
        <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>REGISTRAR EGRESO</div>
        <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
          <input className="inp" placeholder="Concepto (ej: Compra de producto, luz, renta...)" value={egresoConc} onChange={e=>setEgresoConc(e.target.value)}/>
          <input className="inp" placeholder="Monto $" type="number" value={egresoMonto} onChange={e=>setEgresoMonto(e.target.value)}/>
          <div style={{display:"flex",gap:"6px"}}>{["Efectivo","Transferencia","Tarjeta"].map(m=><button key={m} className="btn-ghost" style={{flex:1,borderColor:egresoMet===m?"#D4AF37":"rgba(255,255,255,0.1)",color:egresoMet===m?"#fff":"rgba(255,255,255,0.4)",fontSize:"11px"}} onClick={()=>setEgresoMet(m)}>{m}</button>)}</div>
        </div>
        <div style={{display:"flex",gap:"10px"}}><button className="btn-ghost" onClick={()=>setShowEgreso(false)} style={{flex:1}}>Cancelar</button><button className="btn-gold" onClick={guardarEgreso} disabled={savingEg||!egresoConc||!egresoMonto} style={{flex:2}}>{savingEg?"Guardando...":"Registrar egreso"}</button></div>
      </div></div>}

      {showExito&&<div className="overlay" style={{zIndex:300}}><div className="glass" style={{width:400,padding:"40px",textAlign:"center",borderColor:"rgba(16,185,129,0.3)"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>✅</div><div style={{fontSize:"18px",fontWeight:700,marginBottom:"6px"}}>¡Ticket creado!</div><div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)"}}>{nombreFinal} · {estilista} · Cita agendada</div></div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Vista ejecutiva con finanzas
// ══════════════════════════════════════════════════════════════════════════════
const inicioSemana=()=>{const d=new Date(),dow=d.getDay();d.setDate(d.getDate()-(dow===0?6:dow-1));return d.toISOString().slice(0,10);};
const semanaLabel=()=>{const ini=new Date(inicioSemana()+"T12:00:00"),fin=new Date(ini);fin.setDate(ini.getDate()+6);return`${ini.toLocaleDateString("es-MX",{day:"numeric",month:"short"})} – ${fin.toLocaleDateString("es-MX",{day:"numeric",month:"short"})}`;};

function Dashboard({onLogout}){
  useCSSInjection();
  const[tab,setTab]=useState("resumen");
  const[periodo,setPeriodo]=useState("semana");
  const[tickets,setTickets]=useState([]);
  const[citas,setCitas]=useState([]);
  const[egresos,setEgresos]=useState([]);
  const[loadingDB,setLoadingDB]=useState(false);
  const[posSuc,setPosSuc]=useState(null);

  const desde=periodo==="semana"?inicioSemana():inicioMes();
  const periodoLabel=periodo==="semana"?semanaLabel():mesLabel();

  const cargarDatos=async()=>{
    setLoadingDB(true);
    const[{data:tData},{data:cData},{data:eData}]=await Promise.all([
      supabase.from("tickets").select("*").gte("fecha",desde).lte("fecha",hoy()).order("created_at",{ascending:false}),
      supabase.from("citas").select("*").gte("fecha",desde).lte("fecha",hoy()),
      supabase.from("egresos").select("*").gte("fecha",desde).lte("fecha",hoy()),
    ]);
    if(tData)setTickets(tData);
    if(cData)setCitas(cData);
    if(eData)setEgresos(eData);
    setLoadingDB(false);
  };
  useEffect(()=>{cargarDatos();},[periodo]);

  // ─── Métricas globales ─────────────────────────────────────────────────────
  const ventasTotal=tickets.reduce((s,t)=>s+Number(t.total),0);
  const nuevas=tickets.filter(t=>t.tipo_clienta==="Nueva").length;
  const recompras=tickets.filter(t=>t.tipo_clienta==="Recompra").length;
  const sesionesComp=citas.filter(c=>c.estado==="completada").length;
  const sesionesAg=citas.filter(c=>c.estado==="agendada").length;
  const ticketProm=tickets.length?ventasTotal/tickets.length:0;
  const totalVentas=nuevas+recompras;
  const recompRatio=totalVentas>0?((recompras/totalVentas)*100).toFixed(0):"0";

  // ─── Corte de caja (por método de pago) ──────────────────────────────────
  const porMetodo={};tickets.forEach(t=>{const m=(t.metodo_pago||"").split(" ")[0];porMetodo[m]=(porMetodo[m]||0)+Number(t.total);});
  const efectivo=porMetodo["Efectivo"]||0;
  const debito=porMetodo["Débito"]||0;
  const credito=porMetodo["Crédito"]||0;
  const transferencia=porMetodo["Transferencia"]||0;
  const tarjeta=debito+credito;

  // ─── Comisiones bancarias ─────────────────────────────────────────────────
  const comDebito=debito*COMISION_DEBITO;
  const comCredito=credito*COMISION_CREDITO;
  const comBancariaTotal=comDebito+comCredito;

  // ─── Egresos ──────────────────────────────────────────────────────────────
  const totalEgresos=egresos.reduce((s,e)=>s+Number(e.monto),0);
  const ingresoNeto=ventasTotal-comBancariaTotal-totalEgresos;

  // ─── Comisiones por estilista ─────────────────────────────────────────────
  const porEstilista={};tickets.forEach(t=>{if(t.estilista){porEstilista[t.estilista]=(porEstilista[t.estilista]||0)+Number(t.total);}});
  const estRank=Object.entries(porEstilista).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({nombre:n,ventas:v,comision:v*COMISION_ESTILISTA}));

  // ─── Relación citas → ingresos ────────────────────────────────────────────
  const citasCompletadas=citas.filter(c=>c.estado==="completada");
  const citasConIngreso=citasCompletadas.filter(c=>c.es_cobro);
  const citasSinIngreso=citasCompletadas.filter(c=>!c.es_cobro);

  // ─── Por sucursal ──────────────────────────────────────────────────────────
  const porSuc=SUCURSALES_NAMES.map(n=>{
    const tks=tickets.filter(t=>t.sucursal_nombre===n);
    const cts=citas.filter(c=>c.sucursal_nombre===n);
    const egs=egresos.filter(e=>e.sucursal_nombre===n);
    const v=tks.reduce((s,t)=>s+Number(t.total),0);
    const nv=tks.filter(t=>t.tipo_clienta==="Nueva").length;
    const rc=tks.filter(t=>t.tipo_clienta==="Recompra").length;
    const sc=cts.filter(c=>c.estado==="completada").length;
    const sa=cts.filter(c=>c.estado==="agendada").length;
    const eg=egs.reduce((s,e)=>s+Number(e.monto),0);
    const ef=tks.filter(t=>(t.metodo_pago||"").startsWith("Efectivo")).reduce((s,t)=>s+Number(t.total),0);
    const tj=tks.filter(t=>(t.metodo_pago||"").startsWith("Débito")||(t.metodo_pago||"").startsWith("Crédito")).reduce((s,t)=>s+Number(t.total),0);
    return{nombre:n,ventas:v,nuevas:nv,recompras:rc,sesComp:sc,sesAg:sa,tickets:tks.length,egresos:eg,efectivo:ef,tarjeta:tj};
  });
  const maxV=Math.max(...porSuc.map(s=>s.ventas),1);

  // ─── Servicios ─────────────────────────────────────────────────────────────
  const sc={};tickets.forEach(t=>{(t.servicios||[]).forEach(s=>{sc[s]=(sc[s]||0)+1;});});const topS=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,10);const maxSvc=topS[0]?.[1]||1;
  const topM=Object.entries(porMetodo).sort((a,b)=>b[1]-a[1]);
  const vD={};tickets.forEach(t=>{vD[t.fecha]=(vD[t.fecha]||0)+Number(t.total);});const dM=Object.entries(vD).sort((a,b)=>a[0].localeCompare(b[0]));const maxD=Math.max(...dM.map(d=>d[1]),1);

  if(posSuc)return<POS session={posSuc} onSwitchSucursal={()=>setPosSuc(null)} isAdmin={true}/>;
  return(
    <div style={{minHeight:"100vh",background:"#0C0D1A",color:"#fff"}}>
      {/* Topbar */}
      <div style={{padding:"0 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
          <div style={{fontSize:"18px",fontWeight:700,letterSpacing:"3px",color:"#D4AF37"}}>BEAUTY DESIGN</div>
          <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,0.1)"}}/>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>DASHBOARD</div>
          <div style={{display:"flex"}}>
            {["resumen","corte","comisiones","sucursales","servicios","pos"].map(t=><div key={t} className="tab-dash" style={{borderBottomColor:tab===t?"#D4AF37":"transparent",color:tab===t?"#fff":"rgba(255,255,255,0.35)"}} onClick={()=>setTab(t)}>
              {{resumen:"📊 Resumen",corte:"💰 Corte de Caja",comisiones:"👩‍🔬 Comisiones",sucursales:"📍 Sucursales",servicios:"✂️ Servicios",pos:"🖥 POS"}[t]}</div>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{display:"flex",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",overflow:"hidden"}}>
            {[{v:"semana",l:"Semana"},{v:"mes",l:"Mes"}].map(p=><button key={p.v} onClick={()=>setPeriodo(p.v)} style={{padding:"5px 14px",fontSize:"11px",fontWeight:600,cursor:"pointer",border:"none",background:periodo===p.v?"#D4AF37":"transparent",color:periodo===p.v?"#0C0D1A":"rgba(255,255,255,0.35)",fontFamily:"'Albert Sans',sans-serif"}}>{p.l}</button>)}
          </div>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",textTransform:"capitalize"}}>{periodoLabel}</div>
          <button className="btn-ghost" onClick={()=>cargarDatos()}>↻</button>
          <button className="btn-ghost" onClick={onLogout}>Salir</button>
        </div>
      </div>

      <div style={{padding:"24px 28px",maxWidth:"1400px",margin:"0 auto"}}>

        {/* ═══ RESUMEN ═══ */}
        {tab==="resumen"&&<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"14px"}}>
            {[
              {l:"INGRESOS BRUTOS",v:fmt(ventasTotal),s:`${fmtN(tickets.length)} tickets`,cls:"hi",cl:"#D4AF37"},
              {l:"CLIENTES NUEVOS",v:nuevas,s:`${nuevas>0?Math.round(nuevas/Math.max(tickets.length,1)*100):0}% del total`,cls:"green",cl:"#10b981"},
              {l:"RECURRENTES",v:recompras,s:`${recompRatio}% recompra`,cls:"",cl:"#49B8D3"},
              {l:"CITAS",v:sesionesComp,s:`${sesionesAg} por atender`,cls:"",cl:"#fff"},
              {l:"TICKET PROMEDIO",v:fmt(ticketProm),s:"por venta",cls:"",cl:"#fff"},
            ].map(k=><div key={k.l} className={`kpi ${k.cls}`}><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.l}</div><div style={{fontSize:"28px",fontWeight:700,color:k.cl}}>{k.v}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{k.s}</div></div>)}
          </div>
          {/* Ingreso neto vs egresos */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
            {[
              {l:"INGRESO NETO",v:fmt(ingresoNeto),s:"después de comisiones y egresos",cl:ingresoNeto>0?"#10b981":"#ff6b6b",cls:ingresoNeto>0?"green":"red"},
              {l:"EGRESOS",v:fmt(totalEgresos),s:`${egresos.length} registros`,cl:"#ff6b6b",cls:"red"},
              {l:"COMISIÓN BANCARIA",v:fmt(comBancariaTotal),s:`${pct(comBancariaTotal,ventasTotal)}% del ingreso`,cl:"#f97316",cls:""},
              {l:"COMISIÓN ESTILISTAS",v:fmt(estRank.reduce((s,e)=>s+e.comision,0)),s:`${(COMISION_ESTILISTA*100).toFixed(0)}% del servicio`,cl:"#a855f7",cls:""},
            ].map(k=><div key={k.l} className={`kpi ${k.cls}`}><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.l}</div><div style={{fontSize:"28px",fontWeight:700,color:k.cl}}>{k.v}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{k.s}</div></div>)}
          </div>
          {/* Relación citas → ingresos */}
          <div className="glass" style={{padding:"20px 24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"6px"}}>RELACIÓN CITAS → INGRESOS</div><div style={{display:"flex",alignItems:"baseline",gap:"24px"}}><div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>Citas con cobro</div><div style={{fontSize:"24px",fontWeight:700,color:"#10b981"}}>{citasConIngreso.length}</div></div><div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>Citas sin cobro</div><div style={{fontSize:"24px",fontWeight:700,color:"#f0c040"}}>{citasSinIngreso.length}</div></div><div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>Tasa de monetización</div><div style={{fontSize:"24px",fontWeight:700,color:parseFloat(pct(citasConIngreso.length,citasCompletadas.length))>=70?"#10b981":"#f0c040"}}>{pct(citasConIngreso.length,citasCompletadas.length)}%</div></div></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)"}}>Total citas completadas: {citasCompletadas.length}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)"}}>Canceladas: {citas.filter(c=>c.estado==="cancelada").length}</div></div>
            </div>
          </div>
          {/* Gráfica ventas por día */}
          <div className="glass" style={{padding:"24px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>VENTAS POR DÍA</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"4px",height:"140px"}}>
              {dM.map(([f,m])=>{const p=m/maxD;return<div key={f} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}><div style={{fontSize:"9px",fontWeight:600,color:"#D4AF37",marginBottom:"4px"}}>{m>=1000?`${(m/1000).toFixed(0)}k`:m}</div><div style={{width:"100%",maxWidth:"28px",height:`${Math.max(p*100,4)}%`,background:"linear-gradient(180deg,#D4AF37,#B8860B)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>{new Date(f+"T12:00:00").toLocaleDateString("es-MX",{weekday:"narrow",day:"numeric"})}</div></div>;})}
            </div>
          </div>
        </div>}

        {/* ═══ CORTE DE CAJA ═══ */}
        {tab==="corte"&&<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
            {[
              {l:"EFECTIVO",v:fmt(efectivo),cl:"#10b981",icon:"💵"},
              {l:"DÉBITO",v:fmt(debito),cl:"#49B8D3",icon:"💳"},
              {l:"CRÉDITO",v:fmt(credito),cl:"#f472b6",icon:"💳"},
              {l:"TRANSFERENCIA",v:fmt(transferencia),cl:"#a855f7",icon:"🏦"},
            ].map(k=><div key={k.l} className="kpi"><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.icon} {k.l}</div><div style={{fontSize:"28px",fontWeight:700,color:k.cl}}>{k.v}</div></div>)}
          </div>
          {/* Totales y comisiones */}
          <div className="glass" style={{padding:"24px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>RESUMEN CORTE · {periodoLabel}</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {[
                {l:"Total cobrado en tarjeta (débito + crédito)",v:fmt(tarjeta),c:"#49B8D3"},
                {l:`Comisión débito (${(COMISION_DEBITO*100).toFixed(1)}%)`,v:`-${fmt(comDebito)}`,c:"#ff8a65"},
                {l:`Comisión crédito (${(COMISION_CREDITO*100).toFixed(1)}%)`,v:`-${fmt(comCredito)}`,c:"#ff8a65"},
                {l:"Total comisiones bancarias",v:`-${fmt(comBancariaTotal)}`,c:"#ff6b6b",bold:true},
              ].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.5)"}}>{r.l}</span><span style={{fontWeight:r.bold?700:500,color:r.c}}>{r.v}</span></div>)}
              <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",fontSize:"16px",fontWeight:700}}>
                <span>Ingreso bruto total</span><span style={{color:"#D4AF37"}}>{fmt(ventasTotal)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"14px 16px",background:"rgba(16,185,129,0.06)",borderRadius:"10px",border:"1px solid rgba(16,185,129,0.2)",fontSize:"16px",fontWeight:700}}>
                <span>Ingreso real (- comisiones - egresos)</span><span style={{color:"#10b981"}}>{fmt(ingresoNeto)}</span>
              </div>
            </div>
          </div>
          {/* Egresos del periodo */}
          <div className="glass" style={{padding:"24px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>EGRESOS · {periodoLabel}</div>
            {egresos.length===0&&<div style={{fontSize:"12px",color:"rgba(255,255,255,0.15)",textAlign:"center",padding:"20px"}}>Sin egresos registrados</div>}
            {egresos.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div><div style={{fontSize:"13px",fontWeight:500}}>{e.concepto}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{e.sucursal_nombre} · {e.metodo_pago} · {new Date(e.fecha+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</div></div>
              <div style={{fontSize:"15px",fontWeight:700,color:"#ff6b6b"}}>-{fmt(e.monto)}</div>
            </div>)}
            {egresos.length>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",fontSize:"15px",fontWeight:700,borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:"8px"}}><span>Total egresos</span><span style={{color:"#ff6b6b"}}>-{fmt(totalEgresos)}</span></div>}
          </div>
        </div>}

        {/* ═══ COMISIONES POR ESTILISTA ═══ */}
        {tab==="comisiones"&&<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div className="glass" style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>COMISIONES POR ESTILISTA · {periodoLabel} · {(COMISION_ESTILISTA*100).toFixed(0)}%</div></div>
            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 120px 120px 120px",padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {["#","Estilista","Ventas","Comisión","Servicios"].map(h=><div key={h} style={{fontSize:"10px",letterSpacing:"1px",color:"rgba(255,255,255,0.25)"}}>{h}</div>)}
            </div>
            {estRank.map((e,i)=>{const tksEst=tickets.filter(t=>t.estilista===e.nombre).length;return(
              <div key={e.nombre} style={{display:"grid",gridTemplateColumns:"32px 1fr 120px 120px 120px",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",alignItems:"center"}} onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                <div style={{fontSize:"14px",fontWeight:700,color:"#D4AF37"}}>{i+1}</div>
                <div style={{fontSize:"13px",fontWeight:600}}>{e.nombre}</div>
                <div style={{fontSize:"13px",fontWeight:700,color:"#D4AF37"}}>{fmt(e.ventas)}</div>
                <div style={{fontSize:"13px",fontWeight:700,color:"#a855f7"}}>{fmt(e.comision)}</div>
                <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>{tksEst} tickets</div>
              </div>);
            })}
            {estRank.length===0&&<div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.15)",fontSize:"13px"}}>Sin datos de estilistas</div>}
          </div>
          {estRank.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(estRank.length,4)},1fr)`,gap:"14px"}}>
            {estRank.map(e=><div key={e.nombre} className="glass" style={{padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:700,color:"#D4AF37"}}>{e.nombre.charAt(0)}</div><div style={{fontSize:"14px",fontWeight:700}}>{e.nombre}</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",fontSize:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"rgba(255,255,255,0.4)"}}>Ventas</span><span style={{fontWeight:600,color:"#D4AF37"}}>{fmt(e.ventas)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"rgba(255,255,255,0.4)"}}>Comisión</span><span style={{fontWeight:600,color:"#a855f7"}}>{fmt(e.comision)}</span></div>
                <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",marginTop:"4px"}}><div style={{width:`${(e.ventas/estRank[0].ventas)*100}%`,height:"100%",background:"#D4AF37",borderRadius:"2px"}}/></div>
              </div>
            </div>)}
          </div>}
        </div>}

        {/* ═══ SUCURSALES ═══ */}
        {tab==="sucursales"&&<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div className="glass" style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>RENDIMIENTO POR SUCURSAL · {periodoLabel}</div></div>
            <div style={{display:"grid",gridTemplateColumns:"32px 160px 1fr 90px 90px 80px 100px 100px",padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {["#","Sucursal","Ventas","Nuevos","Recur.","Citas","Efectivo","Tarjeta"].map(h=><div key={h} style={{fontSize:"10px",letterSpacing:"1px",color:"rgba(255,255,255,0.25)"}}>{h}</div>)}
            </div>
            {porSuc.sort((a,b)=>b.ventas-a.ventas).map((s,i)=><div key={s.nombre} style={{display:"grid",gridTemplateColumns:"32px 160px 1fr 90px 90px 80px 100px 100px",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{fontSize:"14px",fontWeight:700,color:COLORES[s.nombre]}}>{i+1}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"8px",height:"8px",borderRadius:"2px",background:COLORES[s.nombre]}}/><span style={{fontSize:"13px",fontWeight:600}}>{s.nombre}</span></div>
              <div style={{paddingRight:"12px"}}><div style={{height:"6px",background:"rgba(255,255,255,0.04)",borderRadius:"3px"}}><div style={{width:`${(s.ventas/maxV)*100}%`,height:"100%",background:COLORES[s.nombre],borderRadius:"3px"}}/></div><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginTop:"3px"}}>{fmt(s.ventas)}</div></div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#10b981"}}>{s.nuevas}</div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#49B8D3"}}>{s.recompras}</div>
              <div style={{fontSize:"13px"}}><span style={{fontWeight:600}}>{s.sesComp}</span><span style={{color:"rgba(255,255,255,0.3)",fontSize:"10px"}}> +{s.sesAg}</span></div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#10b981"}}>{fmt(s.efectivo)}</div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#49B8D3"}}>{fmt(s.tarjeta)}</div>
            </div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px"}}>
            {porSuc.map(s=><div key={s.nombre} className="glass" style={{padding:"20px",borderColor:`${COLORES[s.nombre]}33`}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}><div style={{width:"8px",height:"8px",borderRadius:"2px",background:COLORES[s.nombre]}}/><span style={{fontSize:"16px",fontWeight:700}}>{s.nombre}</span></div>
              <div style={{fontSize:"26px",fontWeight:700,color:COLORES[s.nombre],marginBottom:"12px"}}>{fmt(s.ventas)}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Nuevos</span><span style={{color:"#10b981",fontWeight:600}}>{s.nuevas}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Recurrentes</span><span style={{color:"#49B8D3",fontWeight:600}}>{s.recompras}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Citas completadas</span><span style={{fontWeight:600}}>{s.sesComp}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Egresos</span><span style={{color:"#ff6b6b",fontWeight:600}}>{fmt(s.egresos)}</span></div>
              </div>
            </div>)}
          </div>
        </div>}

        {/* ═══ SERVICIOS ═══ */}
        {tab==="servicios"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
          <div className="glass" style={{padding:"24px"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>TOP SERVICIOS</div>{topS.map(([svc,cnt],i)=><div key={svc} style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}><div style={{fontSize:"12px",fontWeight:700,color:"rgba(255,255,255,0.3)",width:"20px"}}>{i+1}</div><div style={{flex:1}}><div style={{fontSize:"12px",fontWeight:500,marginBottom:"4px"}}>{svc}</div><div style={{height:"4px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}><div style={{width:`${(cnt/maxSvc)*100}%`,height:"100%",background:"#D4AF37",borderRadius:"2px"}}/></div></div><div style={{fontSize:"13px",fontWeight:700}}>{cnt}</div></div>)}</div>
          <div className="glass" style={{padding:"24px"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>MÉTODOS DE PAGO</div>{topM.map(([m,v])=><div key={m} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><div style={{fontSize:"13px",fontWeight:500}}>{m||"—"}</div><div style={{fontSize:"13px",fontWeight:700,color:"#D4AF37"}}>{fmt(v)}</div></div>)}</div>
        </div>}

        {/* ═══ VER POS ═══ */}
        {tab==="pos"&&<div style={{display:"flex",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)"}}>SELECCIONA SUCURSAL</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px"}}>{USUARIOS.filter(u=>u.rol==="sucursal").map(s=><div key={s.id} className="glass" style={{padding:"28px 24px",cursor:"pointer",borderColor:`${s.color}44`,textAlign:"center"}} onClick={()=>setPosSuc(s)} onMouseEnter={e=>e.currentTarget.style.borderColor=s.color} onMouseLeave={e=>e.currentTarget.style.borderColor=`${s.color}44`}><div style={{width:"48px",height:"48px",borderRadius:"14px",background:`${s.color}22`,border:`1px solid ${s.color}44`,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>{s.nombre.includes("Barbería")?"💈":"✂️"}</div><div style={{fontSize:"17px",fontWeight:700,marginBottom:"4px"}}>{s.nombre}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>Ver POS →</div></div>)}</div></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  useCSSInjection();
  const[session,setSession]=useState(null);const[user,setUser]=useState("");const[pass,setPass]=useState("");const[err,setErr]=useState("");
  function login(){const f=USUARIOS.find(u=>u.usuario===user.trim()&&u.password===pass);if(f){setSession(f);setErr("");}else setErr("Usuario o contraseña incorrectos");}
  if(!session)return(
    <div style={{minHeight:"100vh",background:"#0C0D1A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Albert Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"#D4AF37",opacity:0.06,filter:"blur(100px)",top:"-150px",left:"-150px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"#49B8D3",opacity:0.04,filter:"blur(80px)",bottom:"0px",right:"0px",pointerEvents:"none"}}/>
      <div className="glass" style={{width:420,padding:"52px 44px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}><div style={{fontSize:"10px",letterSpacing:"5px",color:"#D4AF37",marginBottom:"10px",fontWeight:500}}>SISTEMA INTERNO</div><div style={{fontSize:"32px",fontWeight:700,color:"#fff",letterSpacing:"4px",lineHeight:1}}>BEAUTY</div><div style={{fontSize:"32px",fontWeight:300,color:"#D4AF37",letterSpacing:"4px",lineHeight:1,marginTop:"2px"}}>DESIGN</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.25)",marginTop:"10px",letterSpacing:"1px"}}>Salón & Barbería</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"}}><input className="inp" placeholder="Usuario" value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={{padding:"13px 16px",fontSize:"14px",borderRadius:"12px"}}/><input className="inp" type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={{padding:"13px 16px",fontSize:"14px",borderRadius:"12px"}}/>{err&&<div style={{color:"#ff6b6b",fontSize:"13px",textAlign:"center"}}>{err}</div>}</div>
        <button className="btn-gold" style={{width:"100%",padding:"14px",fontSize:"15px",borderRadius:"12px"}} onClick={login}>Entrar →</button>
        <div style={{marginTop:"20px",fontSize:"10px",color:"rgba(255,255,255,0.1)",textAlign:"center",letterSpacing:"2px"}}>ACCESO RESTRINGIDO</div>
      </div>
    </div>
  );
  if(session.rol==="admin")return<Dashboard onLogout={()=>setSession(null)}/>;
  return<POS session={session} onSwitchSucursal={()=>setSession(null)} isAdmin={false}/>;
}
