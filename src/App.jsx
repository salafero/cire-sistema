import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const META_TOKEN   = import.meta.env.VITE_META_TOKEN;
const META_ACCOUNT = import.meta.env.VITE_META_ACCOUNT;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
const USUARIOS = [
  { id:1, nombre:"Coapa",    usuario:"coapa",      password:"cire2026",    rol:"sucursal", color:"#2721E8" },
  { id:2, nombre:"Valle",    usuario:"valle",      password:"cire2026",    rol:"sucursal", color:"#49B8D3" },
  { id:3, nombre:"Oriente",  usuario:"oriente",    password:"cire2026",    rol:"sucursal", color:"#2721E8" },
  { id:4, nombre:"Polanco",  usuario:"polanco",    password:"cire2026",    rol:"sucursal", color:"#49B8D3" },
  { id:5, nombre:"Metepec",  usuario:"metepec",    password:"cire2026",    rol:"sucursal", color:"#2721E8" },
  { id:0, nombre:"Admin",    usuario:"cire.admin", password:"cire.admin2026", rol:"admin", color:"#a855f7" },
];

// ─── CONSTANTES COMPARTIDAS ───────────────────────────────────────────────────
const SUCURSALES_NAMES = ["Coapa","Valle","Oriente","Polanco","Metepec"];
const COLORES = { Coapa:"#2721E8", Valle:"#49B8D3", Oriente:"#a855f7", Polanco:"#f97316", Metepec:"#10b981" };
const fmt  = (n) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(n||0);
const fmtN = (n) => new Intl.NumberFormat("es-MX").format(n||0);
const hoy  = () => new Date().toISOString().slice(0,10);
const inicioMes = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; };
const mesLabel  = () => new Date().toLocaleDateString("es-MX",{month:"long",year:"numeric"});

// ─── CATÁLOGO POS ─────────────────────────────────────────────────────────────
const CATALOGO = [
  { categoria:"Combos Láser", items:[
    { nombre:"Full Body (8 ses)",           precio:10000, msi:[3,6,9] },
    { nombre:"Combo Rostro (8 ses)",        precio:9000,  msi:[3,6,9] },
    { nombre:"Combo Sexy (8 ses)",          precio:8000,  msi:[3,6,9] },
    { nombre:"Combo Playa (8 ses)",         precio:6500,  msi:[3,6] },
    { nombre:"Combo Piernas (8 ses)",       precio:6500,  msi:[3,6] },
    { nombre:"Combo Bikini (8 ses)",        precio:5500,  msi:[3,6] },
    { nombre:"Combo Axilas (8 ses)",        precio:5500,  msi:[3,6] },
  ]},
  { categoria:"Zonas Individuales", items:[
    { nombre:"Piernas Completas (8 ses)",   precio:3500, msi:[3] },
    { nombre:"Medias Piernas (8 ses)",      precio:2500, msi:[3] },
    { nombre:"Brazos (8 ses)",              precio:3500, msi:[3] },
    { nombre:"Medios Brazos (8 ses)",       precio:2500, msi:[3] },
    { nombre:"Axilas (8 ses)",              precio:1500, msi:[3] },
    { nombre:"Espalda Completa (8 ses)",    precio:4000, msi:[3] },
    { nombre:"Media Espalda (8 ses)",       precio:2500, msi:[3] },
    { nombre:"Glúteos (8 ses)",             precio:2500, msi:[3] },
    { nombre:"Zona Interglútea (8 ses)",    precio:1500, msi:[3] },
    { nombre:"Abdomen (8 ses)",             precio:2500, msi:[3] },
    { nombre:"Línea Abdomen (8 ses)",       precio:1500, msi:[3] },
    { nombre:"Pecho (8 ses)",               precio:2500, msi:[3] },
  ]},
  { categoria:"Facial Láser", items:[
    { nombre:"Rostro Completo (8 ses)",     precio:2500, msi:[3] },
    { nombre:"Medio Rostro (8 ses)",        precio:2000, msi:[3] },
    { nombre:"Bigote/Mentón/Patillas (8s)", precio:1000, msi:[3] },
    { nombre:"Bikini Brazilian (8 ses)",    precio:3500, msi:[3] },
    { nombre:"French Bikini (8 ses)",       precio:3000, msi:[3] },
    { nombre:"Sexy Bikini (8 ses)",         precio:2500, msi:[3] },
    { nombre:"Bikini Básico (8 ses)",       precio:2000, msi:[3] },
  ]},
  { categoria:"Faciales", items:[
    { nombre:"Baby Clean (1 ses)",          precio:549,  msi:[] },
    { nombre:"FullFace (1 ses)",            precio:849,  msi:[] },
    { nombre:"5 ses FullFace",              precio:3500, msi:[3] },
    { nombre:"10 ses FullFace",             precio:6000, msi:[3] },
  ]},
  { categoria:"HIFU 4D", items:[
    { nombre:"HIFU 1 persona",              precio:3000, msi:[3] },
    { nombre:"HIFU 2 personas",             precio:5000, msi:[3] },
  ]},
  { categoria:"Corporal", items:[
    { nombre:"Moldeo 1ª sesión",            precio:699,  msi:[] },
    { nombre:"Moldeo Subsecuente",          precio:999,  msi:[] },
    { nombre:"6 ses Moldeo",                precio:3999, msi:[3] },
    { nombre:"12 ses Moldeo + Facial",      precio:6999, msi:[3] },
    { nombre:"Anticelulítico 1ª ses",       precio:699,  msi:[] },
    { nombre:"6 ses Anticelulítico",        precio:3999, msi:[3] },
    { nombre:"Moldeo Brasileño 1ª ses",     precio:699,  msi:[] },
    { nombre:"6 ses Moldeo Brasileño",      precio:3999, msi:[3] },
    { nombre:"Aparatología 1 zona",         precio:649,  msi:[] },
  ]},
  { categoria:"Post Operatorio", items:[
    { nombre:"Post Op 1ª ses",              precio:999,  msi:[] },
    { nombre:"10 ses Post Op",              precio:9999, msi:[3] },
    { nombre:"15 ses Post Op",              precio:13999,msi:[3] },
    { nombre:"20 ses Post Op + Facial",     precio:17999,msi:[3] },
  ]},
];

// ─── AGENDA CONSTANTS ─────────────────────────────────────────────────────────
const TIPOS_SVC = [
  { id:"laser",       label:"Láser",          duracion:60, color:"#2721E8" },
  { id:"facial_baby", label:"Baby Clean",      duracion:60, color:"#49B8D3" },
  { id:"facial_full", label:"FullFace",        duracion:90, color:"#49B8D3" },
  { id:"corporal",    label:"Corporal/Moldeo", duracion:60, color:"#a855f7" },
  { id:"hifu",        label:"HIFU 4D",         duracion:90, color:"#f97316" },
  { id:"post_op",     label:"Post operatorio", duracion:60, color:"#10b981" },
];
const HORARIOS = {1:{a:"10:00",c:"20:00"},2:{a:"10:00",c:"20:00"},3:{a:"10:00",c:"20:00"},4:{a:"10:00",c:"20:00"},5:{a:"10:00",c:"20:00"},6:{a:"09:00",c:"16:00"},0:null};
const DIAS_L   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function generarBloques(fecha, dur) {
  const dow=new Date(fecha+"T12:00:00").getDay(), h=HORARIOS[dow];
  if(!h) return [];
  const bl=[], [hA,mA]=h.a.split(":").map(Number), [hC,mC]=h.c.split(":").map(Number);
  let m=hA*60+mA; const fin=hC*60+mC;
  while(m+dur<=fin){
    const hh=Math.floor(m/60),mm=m%60,hf=Math.floor((m+dur)/60),mf=(m+dur)%60;
    bl.push({ini:`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`,fin:`${String(hf).padStart(2,"0")}:${String(mf).padStart(2,"0")}`});
    m+=30;
  }
  return bl;
}
function semanaD(fecha){
  const base=new Date(fecha+"T12:00:00"),dow=base.getDay(),l=new Date(base);
  l.setDate(base.getDate()-(dow===0?6:dow-1));
  return Array.from({length:6},(_,i)=>{const d=new Date(l);d.setDate(l.getDate()+i);return d.toISOString().slice(0,10);});
}
const lFecha=(f)=>new Date(f+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"});
const colorT=(t)=>TIPOS_SVC.find(x=>x.id===t)?.color||"#2721E8";

// ─── CSS GLOBAL ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0C0D1A;font-family:'Albert Sans',sans-serif;}
  ::-webkit-scrollbar{width:4px;height:4px;background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
  .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;}
  .glass-dark{background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:12px;}
  .kpi{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px 22px;}
  .kpi.hi{border-color:rgba(39,33,232,0.5);background:rgba(39,33,232,0.08);}
  .kpi.green{border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.06);}
  .kpi.orange{border-color:rgba(249,115,22,0.4);background:rgba(249,115,22,0.06);}
  .inp{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#fff;font-family:'Albert Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:border 0.2s;}
  .inp:focus{border-color:#2721E8;}
  .inp::placeholder{color:rgba(255,255,255,0.2);}
  .btn-blue{background:#2721E8;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-family:'Albert Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-blue:hover{background:#3d38f0;}
  .btn-blue:disabled{background:rgba(39,33,232,0.3);cursor:default;}
  .btn-ghost{background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 16px;font-family:'Albert Sans',sans-serif;font-size:12px;cursor:pointer;transition:all 0.2s;}
  .btn-ghost:hover{border-color:#2721E8;color:#fff;}
  .nav-tab{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,0.35);transition:all 0.18s;}
  .nav-tab.active{color:#fff;border-bottom-color:#2721E8;}
  .nav-tab:hover{color:rgba(255,255,255,0.7);}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;}
  .tab-dash{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,0.35);transition:all 0.18s;}
  .tab-dash.active{color:#fff;border-bottom-color:#2721E8;}
  .tab-dash:hover{color:rgba(255,255,255,0.7);}
  .rank-row{display:grid;grid-template-columns:32px 110px 1fr 110px 110px 100px;gap:0;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);align-items:center;}
  .rank-row:hover{background:rgba(255,255,255,0.02);}
  .cita-card{border-radius:8px;padding:8px 10px;margin-bottom:4px;cursor:pointer;transition:opacity 0.15s;border-left:3px solid;}
  .cita-card:hover{opacity:0.8;}
  .bloque-btn{padding:8px 6px;border-radius:8px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid;transition:all 0.15s;text-align:center;}
  .clienta-sugg{padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;}
  .clienta-sugg:hover{background:rgba(39,33,232,0.2);}
  .paq-card{padding:12px;border-radius:10px;border:1px solid;cursor:pointer;transition:all 0.15s;margin-bottom:8px;}
  .paq-card:hover{border-color:#2721E8;}
  .tipo-btn{padding:10px 14px;border-radius:10px;border:1px solid;cursor:pointer;transition:all 0.15s;text-align:center;}
  .paso-ind{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}
  .item-cat{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s;border:1px solid transparent;}
  .item-cat:hover{background:rgba(255,255,255,0.04);}
  .item-cat.selected{background:rgba(39,33,232,0.12);border-color:rgba(39,33,232,0.3);}
`;

// ══════════════════════════════════════════════════════════════════════════════
// AGENDA COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function Agenda({ session }) {
  const [semana,setSemana]=useState(semanaD(hoy()));
  const [citas,setCitas]=useState([]);
  const [modal,setModal]=useState(false);
  const [detalle,setDetalle]=useState(null);
  const [busqueda,setBusqueda]=useState("");
  const [clientasEnc,setClientasEnc]=useState([]);
  const [clientaSel,setClientaSel]=useState(null);
  const [paquetesSel,setPaquetesSel]=useState([]);
  const [paqElegido,setPaqElegido]=useState(null);
  const [tipoSvc,setTipoSvc]=useState(null);
  const [fechaCita,setFechaCita]=useState(hoy());
  const [bloqueSel,setBloqueSel]=useState(null);
  const [bloques,setBloques]=useState([]);
  const [notas,setNotas]=useState("");
  const [esNueva,setEsNueva]=useState(true);
  const [nombreN,setNombreN]=useState("");
  const [telN,setTelN]=useState("");
  const [saving,setSaving]=useState(false);
  const [paso,setPaso]=useState(1);

  const cargarCitas=async()=>{
    const {data}=await supabase.from("citas").select("*").eq("sucursal_id",session.id).gte("fecha",semana[0]).lte("fecha",semana[5]).order("hora_inicio");
    if(data) setCitas(data);
  };
  useEffect(()=>{cargarCitas();},[semana,session]);
  useEffect(()=>{if(tipoSvc&&fechaCita){setBloques(generarBloques(fechaCita,tipoSvc.duracion));setBloqueSel(null);}},[tipoSvc,fechaCita]);

  const buscarC=async(q)=>{if(q.length<2){setClientasEnc([]);return;}const{data}=await supabase.from("clientas").select("*").ilike("nombre",`%${q}%`).eq("sucursal_id",session.id).limit(5);setClientasEnc(data||[]);};
  const selC=async(c)=>{setClientaSel(c);setClientasEnc([]);setBusqueda(c.nombre);setEsNueva(false);const{data}=await supabase.from("paquetes").select("*").eq("clienta_id",c.id).eq("activo",true);setPaquetesSel(data||[]);setPaqElegido(null);};
  const selPaq=(p)=>{
    setPaqElegido(p);
    const n=p.servicio.toLowerCase();
    let t=TIPOS_SVC[0];
    if(n.includes("baby"))t=TIPOS_SVC[1];
    else if(n.includes("fullface")||n.includes("facial"))t=TIPOS_SVC[2];
    else if(n.includes("hifu"))t=TIPOS_SVC[4];
    else if(n.includes("post"))t=TIPOS_SVC[5];
    else if(n.includes("moldeo")||n.includes("corporal")||n.includes("anticel"))t=TIPOS_SVC[3];
    setTipoSvc(t);
  };
  const ocupado=(b)=>citas.filter(c=>c.fecha===fechaCita).some(c=>(b.ini>=c.hora_inicio&&b.ini<c.hora_fin)||(b.fin>c.hora_inicio&&b.fin<=c.hora_fin));

  const guardarCita=async()=>{
    if(!bloqueSel)return; setSaving(true);
    try{
      let cId=clientaSel?.id,cNom=clientaSel?.nombre;
      if(esNueva&&!clientaSel){const{data:nc}=await supabase.from("clientas").insert([{nombre:nombreN,telefono:telN,sucursal_id:session.id,sucursal_nombre:session.nombre}]).select();cId=nc[0].id;cNom=nc[0].nombre;}
      const sNum=paqElegido?paqElegido.sesiones_usadas+1:1;
      const esCobro=!paqElegido||paqElegido.sesiones_usadas===0;
      await supabase.from("citas").insert([{clienta_id:cId,clienta_nombre:cNom,paquete_id:paqElegido?.id||null,sucursal_id:session.id,sucursal_nombre:session.nombre,servicio:paqElegido?.servicio||tipoSvc.label,tipo_servicio:tipoSvc.id,duracion_min:tipoSvc.duracion,fecha:fechaCita,hora_inicio:bloqueSel.ini,hora_fin:bloqueSel.fin,sesion_numero:sNum,es_cobro:esCobro,estado:"agendada",notas}]);
      if(paqElegido){const ns=paqElegido.sesiones_usadas+1;await supabase.from("paquetes").update({sesiones_usadas:ns,activo:ns<paqElegido.total_sesiones}).eq("id",paqElegido.id);}
      resetM();cargarCitas();
    }catch(e){console.error(e);}
    setSaving(false);
  };
  const marcarOk=async(id)=>{await supabase.from("citas").update({estado:"completada"}).eq("id",id);cargarCitas();};
  const cancelC=async(id,pId,sU)=>{await supabase.from("citas").update({estado:"cancelada"}).eq("id",id);if(pId)await supabase.from("paquetes").update({sesiones_usadas:Math.max(0,sU-1),activo:true}).eq("id",pId);setDetalle(null);cargarCitas();};
  const resetM=()=>{setModal(false);setPaso(1);setBusqueda("");setClientaSel(null);setClientasEnc([]);setPaquetesSel([]);setPaqElegido(null);setTipoSvc(null);setFechaCita(hoy());setBloqueSel(null);setBloques([]);setNotas("");setEsNueva(true);setNombreN("");setTelN("");};
  const semAnt=()=>{const d=new Date(semana[0]+"T12:00:00");d.setDate(d.getDate()-7);setSemana(semanaD(d.toISOString().slice(0,10)));};
  const semSig=()=>{const d=new Date(semana[0]+"T12:00:00");d.setDate(d.getDate()+7);setSemana(semanaD(d.toISOString().slice(0,10)));};
  const citasDia=(f)=>citas.filter(c=>c.fecha===f).sort((a,b)=>a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <div style={{padding:"20px 24px",overflowY:"auto",height:"calc(100vh - 64px)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div>
          <div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"2px"}}>AGENDA SEMANAL</div>
          <div style={{fontSize:"15px",fontWeight:600}}>{session.nombre}</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <button className="btn-ghost" onClick={semAnt}>← Anterior</button>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",padding:"0 6px"}}>{lFecha(semana[0])} — {lFecha(semana[5])}</div>
          <button className="btn-ghost" onClick={semSig}>Siguiente →</button>
          <button className="btn-blue" onClick={()=>setModal(true)}>+ Nueva cita</button>
        </div>
      </div>
      <div style={{display:"flex",gap:"10px",marginBottom:"12px",flexWrap:"wrap"}}>
        {TIPOS_SVC.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"10px",color:"rgba(255,255,255,0.35)"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"2px",background:t.color}}/>{t.label}
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"10px",color:"rgba(255,255,255,0.35)"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"2px",background:"#f0c040"}}/>💰 Cobro
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"8px"}}>
        {semana.map(fecha=>{
          const dow=new Date(fecha+"T12:00:00").getDay(),ab=HORARIOS[dow]!==null,ef=fecha===hoy(),cd=citasDia(fecha);
          return(
            <div key={fecha} className="glass" style={{padding:"10px",minHeight:"200px",opacity:ab?1:0.35,borderColor:ef?"rgba(39,33,232,0.6)":"rgba(255,255,255,0.08)"}}>
              <div style={{marginBottom:"8px"}}>
                <div style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",letterSpacing:"1px"}}>{DIAS_L[dow]}</div>
                <div style={{fontSize:"15px",fontWeight:700,color:ef?"#49B8D3":"#fff"}}>{fecha.slice(8)}</div>
                {!ab&&<div style={{fontSize:"9px",color:"rgba(255,80,80,0.5)"}}>Cerrado</div>}
                {ab&&<div style={{fontSize:"8px",color:"rgba(255,255,255,0.2)"}}>{HORARIOS[dow].a}–{HORARIOS[dow].c}</div>}
              </div>
              {cd.length===0&&ab&&<div style={{fontSize:"10px",color:"rgba(255,255,255,0.12)",textAlign:"center",paddingTop:"16px"}}>Sin citas</div>}
              {cd.map(c=>(
                <div key={c.id} className="cita-card" style={{background:`${colorT(c.tipo_servicio)}15`,borderLeftColor:c.es_cobro?"#f0c040":colorT(c.tipo_servicio),opacity:c.estado==="cancelada"?0.35:1}} onClick={()=>setDetalle(c)}>
                  <div style={{fontSize:"9px",color:"rgba(255,255,255,0.35)"}}>{c.hora_inicio}–{c.hora_fin}</div>
                  <div style={{fontSize:"11px",fontWeight:600,lineHeight:1.2,marginTop:"1px"}}>{c.clienta_nombre}</div>
                  <div style={{fontSize:"9px",color:colorT(c.tipo_servicio),marginTop:"1px"}}>{c.servicio}</div>
                  <div style={{display:"flex",gap:"3px",marginTop:"3px",flexWrap:"wrap"}}>
                    {c.es_cobro&&<span style={{fontSize:"8px",background:"rgba(240,192,64,0.2)",color:"#f0c040",padding:"1px 4px",borderRadius:"3px"}}>💰</span>}
                    <span style={{fontSize:"8px",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.35)",padding:"1px 4px",borderRadius:"3px"}}>S{c.sesion_numero}</span>
                    {c.estado==="completada"&&<span style={{fontSize:"8px",background:"rgba(16,185,129,0.2)",color:"#10b981",padding:"1px 4px",borderRadius:"3px"}}>✓</span>}
                    {c.estado==="cancelada"&&<span style={{fontSize:"8px",background:"rgba(255,80,80,0.2)",color:"#ff6b6b",padding:"1px 4px",borderRadius:"3px"}}>✗</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {detalle&&(
        <div className="overlay" onClick={()=>setDetalle(null)}>
          <div className="glass" style={{width:360,padding:"26px",borderColor:`${colorT(detalle.tipo_servicio)}44`}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"18px"}}>
              <div><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"3px"}}>CITA</div><div style={{fontSize:"17px",fontWeight:700}}>{detalle.clienta_nombre}</div></div>
              <button onClick={()=>setDetalle(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:"20px"}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"9px",background:"rgba(0,0,0,0.3)",borderRadius:"10px",padding:"13px",marginBottom:"16px"}}>
              {[["Servicio",detalle.servicio],["Fecha",new Date(detalle.fecha+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})],["Horario",`${detalle.hora_inicio} – ${detalle.hora_fin}`],["Sesión",`${detalle.sesion_numero} de 8`]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}><span style={{color:"rgba(255,255,255,0.4)"}}>{l}</span><span style={{fontWeight:500}}>{v}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
                <span style={{color:"rgba(255,255,255,0.4)"}}>Tipo</span>
                <span style={{background:detalle.es_cobro?"rgba(240,192,64,0.2)":"rgba(16,185,129,0.15)",color:detalle.es_cobro?"#f0c040":"#10b981",padding:"2px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600}}>{detalle.es_cobro?"💰 Con cobro":"✓ Seguimiento"}</span>
              </div>
              {detalle.notas&&<div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"8px"}}>{detalle.notas}</div>}
            </div>
            {detalle.estado==="agendada"&&(<div style={{display:"flex",gap:"8px"}}>
              <button className="btn-ghost" style={{flex:1,color:"#ff6b6b",borderColor:"rgba(255,80,80,0.3)"}} onClick={()=>cancelC(detalle.id,detalle.paquete_id,detalle.sesion_numero)}>Cancelar</button>
              <button className="btn-blue" style={{flex:2}} onClick={()=>{marcarOk(detalle.id);setDetalle(null);}}>✓ Completada</button>
            </div>)}
            {detalle.estado!=="agendada"&&<div style={{textAlign:"center",fontSize:"13px",color:"rgba(255,255,255,0.3)"}}>Cita {detalle.estado}</div>}
          </div>
        </div>
      )}
      {modal&&(
        <div className="overlay">
          <div className="glass" style={{width:500,maxHeight:"88vh",overflow:"auto",padding:"26px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"22px"}}>
              {[{n:1,l:"Clienta"},{n:2,l:"Servicio"},{n:3,l:"Horario"}].map((p,i)=>(
                <div key={p.n} style={{display:"flex",alignItems:"center",gap:"8px",flex:i<2?1:"auto"}}>
                  <div className="paso-ind" style={{background:paso>=p.n?"#2721E8":"rgba(255,255,255,0.06)",color:paso>=p.n?"#fff":"rgba(255,255,255,0.3)",flexShrink:0}}>{p.n}</div>
                  <div style={{fontSize:"12px",color:paso===p.n?"#fff":"rgba(255,255,255,0.3)",fontWeight:paso===p.n?600:400}}>{p.l}</div>
                  {i<2&&<div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>}
                </div>
              ))}
              <button onClick={resetM} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:"20px",marginLeft:"auto"}}>×</button>
            </div>
            {paso===1&&(
              <div>
                <div style={{fontSize:"14px",fontWeight:600,marginBottom:"14px"}}>¿Quién viene?</div>
                <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
                  <button className="btn-ghost" style={{flex:1,borderColor:!esNueva?"#2721E8":"rgba(255,255,255,0.1)",color:!esNueva?"#fff":"rgba(255,255,255,0.4)"}} onClick={()=>setEsNueva(false)}>Clienta existente</button>
                  <button className="btn-ghost" style={{flex:1,borderColor:esNueva?"#2721E8":"rgba(255,255,255,0.1)",color:esNueva?"#fff":"rgba(255,255,255,0.4)"}} onClick={()=>{setEsNueva(true);setClientaSel(null);setBusqueda("");}}>Nueva clienta</button>
                </div>
                {!esNueva?(
                  <div style={{position:"relative"}}>
                    <input className="inp" placeholder="Buscar por nombre..." value={busqueda} onChange={e=>{setBusqueda(e.target.value);buscarC(e.target.value);setClientaSel(null);}}/>
                    {clientasEnc.length>0&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1a1b2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",zIndex:10,overflow:"hidden",marginTop:"4px"}}>
                        {clientasEnc.map(c=>(<div key={c.id} className="clienta-sugg" onClick={()=>selC(c)}><div style={{fontSize:"13px",fontWeight:500}}>{c.nombre}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{c.telefono}</div></div>))}
                      </div>
                    )}
                    {clientaSel&&(
                      <div style={{marginTop:"10px",padding:"12px",background:"rgba(39,33,232,0.08)",border:"1px solid rgba(39,33,232,0.25)",borderRadius:"10px"}}>
                        <div style={{fontSize:"13px",fontWeight:600,marginBottom:"8px"}}>✓ {clientaSel.nombre}</div>
                        {paquetesSel.length>0?(
                          <div>
                            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",marginBottom:"8px",letterSpacing:"1px"}}>PAQUETES ACTIVOS</div>
                            {paquetesSel.map(p=>(
                              <div key={p.id} className="paq-card" style={{borderColor:paqElegido?.id===p.id?"#49B8D3":"rgba(255,255,255,0.08)",background:paqElegido?.id===p.id?"rgba(73,184,211,0.08)":"rgba(0,0,0,0.2)"}} onClick={()=>selPaq(p)}>
                                <div style={{fontSize:"12px",fontWeight:600}}>{p.servicio}</div>
                                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>Sesión {p.sesiones_usadas+1} de {p.total_sesiones}</div>
                                <div style={{margin:"6px 0 3px",height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px"}}><div style={{width:`${(p.sesiones_usadas/p.total_sesiones)*100}%`,height:"100%",background:"#49B8D3",borderRadius:"2px"}}/></div>
                                {paqElegido?.id===p.id&&<div style={{fontSize:"10px",color:p.sesiones_usadas===0?"#f0c040":"#10b981",fontWeight:600,marginTop:"4px"}}>{p.sesiones_usadas===0?"💰 Primera sesión — se cobra":"✓ Seguimiento — ya pagó"}</div>}
                              </div>
                            ))}
                          </div>
                        ):<div style={{fontSize:"11px",color:"#f0c040"}}>⚠ Sin paquetes activos — nueva compra</div>}
                      </div>
                    )}
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
                    <input className="inp" placeholder="Nombre completo *" value={nombreN} onChange={e=>setNombreN(e.target.value)}/>
                    <input className="inp" placeholder="Teléfono (opcional)" value={telN} onChange={e=>setTelN(e.target.value)}/>
                    <div style={{fontSize:"11px",color:"#f0c040",padding:"10px",background:"rgba(240,192,64,0.06)",borderRadius:"8px",border:"1px solid rgba(240,192,64,0.15)"}}>💰 Nueva clienta — cobrar en POS</div>
                  </div>
                )}
                <button className="btn-blue" style={{width:"100%",marginTop:"18px",padding:"12px"}} disabled={esNueva?!nombreN:!clientaSel} onClick={()=>setPaso(2)}>Continuar →</button>
              </div>
            )}
            {paso===2&&(
              <div>
                <div style={{fontSize:"14px",fontWeight:600,marginBottom:"4px"}}>Tipo de servicio</div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",marginBottom:"14px"}}>{paqElegido?`Paquete: ${paqElegido.servicio}`:"Nueva clienta"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px",marginBottom:"16px"}}>
                  {TIPOS_SVC.map(t=>(
                    <div key={t.id} className="tipo-btn" style={{borderColor:tipoSvc?.id===t.id?t.color:"rgba(255,255,255,0.08)",background:tipoSvc?.id===t.id?`${t.color}15`:"rgba(0,0,0,0.2)"}} onClick={()=>setTipoSvc(t)}>
                      <div style={{fontSize:"13px",fontWeight:600,color:tipoSvc?.id===t.id?t.color:"#fff"}}>{t.label}</div>
                      <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{t.duracion} min</div>
                    </div>
                  ))}
                </div>
                <textarea className="inp" rows={2} placeholder="Notas (zona específica, alergias...)" value={notas} onChange={e=>setNotas(e.target.value)} style={{resize:"none",marginBottom:"14px"}}/>
                <div style={{display:"flex",gap:"8px"}}>
                  <button className="btn-ghost" style={{flex:1}} onClick={()=>setPaso(1)}>← Atrás</button>
                  <button className="btn-blue" style={{flex:2,padding:"12px"}} disabled={!tipoSvc} onClick={()=>setPaso(3)}>Continuar →</button>
                </div>
              </div>
            )}
            {paso===3&&(
              <div>
                <div style={{fontSize:"14px",fontWeight:600,marginBottom:"14px"}}>Fecha y hora</div>
                <input type="date" className="inp" value={fechaCita} min={hoy()} onChange={e=>setFechaCita(e.target.value)} style={{colorScheme:"dark",marginBottom:"14px"}}/>
                {new Date(fechaCita+"T12:00:00").getDay()===0&&<div style={{fontSize:"12px",color:"#ff6b6b",marginBottom:"10px"}}>⚠ Domingo — cerrado</div>}
                {bloques.length>0&&(
                  <div>
                    <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"8px",letterSpacing:"1px"}}>HORARIOS · {tipoSvc?.duracion} min</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",maxHeight:"180px",overflowY:"auto",paddingRight:"4px",marginBottom:"14px"}}>
                      {bloques.map(b=>{const oc=ocupado(b),sl=bloqueSel?.ini===b.ini;return(
                        <div key={b.ini} className="bloque-btn" style={{borderColor:oc?"rgba(255,80,80,0.25)":sl?"#2721E8":"rgba(255,255,255,0.08)",background:oc?"rgba(255,80,80,0.04)":sl?"rgba(39,33,232,0.2)":"rgba(0,0,0,0.2)",color:oc?"rgba(255,80,80,0.4)":sl?"#fff":"rgba(255,255,255,0.5)",cursor:oc?"not-allowed":"pointer"}} onClick={()=>!oc&&setBloqueSel(b)}>
                          <div style={{fontSize:"12px",fontWeight:sl?700:400}}>{b.ini}</div>
                          {oc&&<div style={{fontSize:"8px",marginTop:"1px",color:"rgba(255,80,80,0.4)"}}>Ocupado</div>}
                        </div>
                      );})}
                    </div>
                  </div>
                )}
                {bloqueSel&&(
                  <div style={{padding:"12px",background:"rgba(39,33,232,0.1)",border:"1px solid rgba(39,33,232,0.3)",borderRadius:"10px",marginBottom:"14px"}}>
                    <div style={{fontSize:"13px",fontWeight:600}}>{new Date(fechaCita+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</div>
                    <div style={{fontSize:"16px",fontWeight:700,color:"#49B8D3",marginTop:"2px"}}>{bloqueSel.ini} – {bloqueSel.fin}</div>
                    <div style={{fontSize:"11px",marginTop:"6px",fontWeight:600,color:(!paqElegido||paqElegido.sesiones_usadas===0)?"#f0c040":"#10b981"}}>
                      {(!paqElegido||paqElegido.sesiones_usadas===0)?"💰 Se cobrará":"✓ Seguimiento — no se cobra"}
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:"8px"}}>
                  <button className="btn-ghost" style={{flex:1}} onClick={()=>setPaso(2)}>← Atrás</button>
                  <button className="btn-blue" style={{flex:2,padding:"12px"}} disabled={!bloqueSel||saving} onClick={guardarCita}>{saving?"Guardando...":"✓ Confirmar cita"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// POS COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function POS({ session, onSwitchSucursal, isAdmin }) {
  const [view,setView]           = useState("pos");
  const [carrito,setCarrito]     = useState([]);
  const [busq,setBusq]           = useState("");
  const [metodo,setMetodo]       = useState("");
  const [msiSel,setMsiSel]       = useState(0);
  const [descuento,setDescuento] = useState(0);
  const [tipoClienta,setTipoClienta]=useState("Nueva");
  const [showConfirm,setShowConfirm]=useState(false);
  const [saving,setSaving]       = useState(false);
  const [tickets,setTickets]     = useState([]);
  const [loadingT,setLoadingT]   = useState(false);
  const [catAbierta,setCatAbierta]=useState(null);

  const agregar=(item)=>{
    setCarrito(c=>{const ex=c.find(x=>x.nombre===item.nombre);return ex?c.map(x=>x.nombre===item.nombre?{...x,qty:x.qty+1}:x):[...c,{...item,qty:1}];});
  };
  const quitar=(nombre)=>setCarrito(c=>c.map(x=>x.nombre===nombre?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0));
  const total=carrito.reduce((s,i)=>s+i.precio*i.qty,0);
  const totalConDesc=Math.round(total*(1-descuento/100));
  const msiDisponibles=[...new Set(carrito.flatMap(i=>i.msi||[]))].sort((a,b)=>a-b);
  const filtradas=CATALOGO.map(cat=>({...cat,items:cat.items.filter(it=>it.nombre.toLowerCase().includes(busq.toLowerCase()))})).filter(cat=>cat.items.length>0);

  const cerrarTicket=async()=>{
    setSaving(true);
    try{
      const {data}=await supabase.from("tickets").insert([{
        sucursal_id:session.id,sucursal_nombre:session.nombre,
        servicios:carrito.map(i=>i.nombre),
        total:totalConDesc,metodo_pago:metodo+(msiSel>0?` ${msiSel}MSI`:""),
        descuento,tipo_clienta:tipoClienta,fecha:hoy(),
      }]).select();

      // Crear paquetes para sesiones láser/servicios con múltiples sesiones
      if(data&&data[0]){
        const ticketId=data[0].id;
        for(const item of carrito){
          if(item.nombre.includes("ses")){
            const sesMatch=item.nombre.match(/(\d+)\s*ses/);
            const totalSes=sesMatch?parseInt(sesMatch[1]):8;
            for(let q=0;q<item.qty;q++){
              await supabase.from("paquetes").insert([{
                clienta_id:null,clienta_nombre:"—",
                sucursal_id:session.id,sucursal_nombre:session.nombre,
                servicio:item.nombre,total_sesiones:totalSes,
                sesiones_usadas:0,precio:item.precio,
                ticket_id:ticketId,fecha_compra:hoy(),activo:true,
              }]);
            }
          }
        }
      }

      setCarrito([]);setMetodo("");setMsiSel(0);setDescuento(0);setTipoClienta("Nueva");setShowConfirm(false);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  const cargarTickets=async(sid)=>{
    setLoadingT(true);
    const{data}=await supabase.from("tickets").select("*").eq("sucursal_id",sid).eq("fecha",hoy()).order("created_at",{ascending:false});
    if(data)setTickets(data);
    setLoadingT(false);
  };

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0C0D1A",color:"#fff"}}>
      {/* Topbar POS */}
      <div style={{height:"64px",padding:"0 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{fontSize:"18px",fontWeight:700,letterSpacing:"4px"}}>CIRE</div>
          <div style={{width:"1px",height:"18px",background:"rgba(255,255,255,0.1)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:session.color}}/>
            <div style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",fontWeight:300}}>Punto de Venta · {session.nombre}</div>
          </div>
          <div style={{display:"flex"}}>
            {["pos","agenda","historial"].map(v=>(
              <div key={v} className="nav-tab" style={{borderBottomColor:view===v?"#2721E8":"transparent",color:view===v?"#fff":"rgba(255,255,255,0.35)"}}
                onClick={()=>{setView(v);if(v==="historial")cargarTickets(session.id);}}>
                {v==="pos"?"Punto de Venta":v==="agenda"?"📅 Agenda":"Historial de Hoy"}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          {isAdmin&&(
            <button className="btn-ghost" onClick={onSwitchSucursal} style={{fontSize:"11px"}}>⚙ Cambiar sucursal</button>
          )}
        </div>
      </div>

      {/* Vista Agenda */}
      {view==="agenda"&&<Agenda session={session}/>}

      {/* Vista Historial */}
      {view==="historial"&&(
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>HISTORIAL DE HOY · {session.nombre}</div>
          {loadingT&&<div style={{color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"40px"}}>Cargando...</div>}
          {!loadingT&&tickets.length===0&&<div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"40px",fontSize:"13px"}}>Sin tickets hoy</div>}
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {tickets.map(t=>(
              <div key={t.id} className="glass" style={{padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>{new Date(t.created_at).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})} · {t.tipo_clienta}</div>
                    <div style={{fontSize:"13px",fontWeight:500}}>{(t.servicios||[]).join(", ")}</div>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{t.metodo_pago}{t.descuento>0?` · ${t.descuento}% desc`:""}</div>
                  </div>
                  <div style={{fontSize:"20px",fontWeight:700,color:"#49B8D3"}}>{fmt(t.total)}</div>
                </div>
              </div>
            ))}
          </div>
          {tickets.length>0&&(
            <div style={{marginTop:"16px",padding:"16px 20px",background:"rgba(39,33,232,0.08)",border:"1px solid rgba(39,33,232,0.2)",borderRadius:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>{tickets.length} tickets · {tickets.filter(t=>t.tipo_clienta==="Nueva").length} nuevas</div>
              <div style={{fontSize:"20px",fontWeight:700}}>{fmt(tickets.reduce((s,t)=>s+Number(t.total),0))}</div>
            </div>
          )}
        </div>
      )}

      {/* Vista POS */}
      {view==="pos"&&(
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 360px",overflow:"hidden"}}>
          {/* Catálogo */}
          <div style={{padding:"20px 24px",overflowY:"auto"}}>
            <input className="inp" placeholder="Buscar servicio..." value={busq} onChange={e=>setBusq(e.target.value)} style={{marginBottom:"16px"}}/>
            {filtradas.map(cat=>(
              <div key={cat.categoria} style={{marginBottom:"8px"}}>
                <div onClick={()=>setCatAbierta(catAbierta===cat.categoria?null:cat.categoria)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:"10px",cursor:"pointer",background:catAbierta===cat.categoria?"rgba(39,33,232,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${catAbierta===cat.categoria?"rgba(39,33,232,0.3)":"rgba(255,255,255,0.06)"}`,marginBottom:"4px"}}>
                  <div style={{fontSize:"13px",fontWeight:600}}>{cat.categoria}</div>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>{catAbierta===cat.categoria?"▲":"▼"}</div>
                </div>
                {(catAbierta===cat.categoria||busq)&&cat.items.map(item=>(
                  <div key={item.nombre} className="item-cat" style={{background:carrito.find(x=>x.nombre===item.nombre)?"rgba(39,33,232,0.08)":"",borderColor:carrito.find(x=>x.nombre===item.nombre)?"rgba(39,33,232,0.25)":"transparent"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:500}}>{item.nombre}</div>
                      {item.msi?.length>0&&<div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>hasta {Math.max(...item.msi)} MSI</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                      <div style={{fontSize:"14px",fontWeight:600,color:"#49B8D3"}}>{fmt(item.precio)}</div>
                      <button onClick={()=>agregar(item)} style={{width:"28px",height:"28px",borderRadius:"8px",background:"#2721E8",border:"none",color:"#fff",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Carrito */}
          <div style={{borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",background:"rgba(0,0,0,0.2)"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"13px",fontWeight:600}}>
              Carrito {carrito.length>0&&<span style={{background:"#2721E8",color:"#fff",borderRadius:"10px",padding:"1px 8px",fontSize:"11px",marginLeft:"6px"}}>{carrito.reduce((s,i)=>s+i.qty,0)}</span>}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
              {carrito.length===0&&<div style={{color:"rgba(255,255,255,0.15)",textAlign:"center",paddingTop:"40px",fontSize:"13px"}}>Agrega servicios al carrito</div>}
              {carrito.map(item=>(
                <div key={item.nombre} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"12px",fontWeight:500,lineHeight:1.3}}>{item.nombre}</div>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{fmt(item.precio)} c/u</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <button onClick={()=>quitar(item.nombre)} style={{width:"24px",height:"24px",borderRadius:"6px",background:"rgba(255,255,255,0.06)",border:"none",color:"#fff",cursor:"pointer",fontSize:"14px"}}>−</button>
                    <span style={{fontSize:"13px",fontWeight:600,minWidth:"16px",textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>agregar(item)} style={{width:"24px",height:"24px",borderRadius:"6px",background:"rgba(255,255,255,0.06)",border:"none",color:"#fff",cursor:"pointer",fontSize:"14px"}}>+</button>
                    <span style={{fontSize:"13px",fontWeight:600,color:"#49B8D3",minWidth:"70px",textAlign:"right"}}>{fmt(item.precio*item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
            {carrito.length>0&&(
              <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
                  {["Nueva","Recurrente"].map(t=>(
                    <button key={t} onClick={()=>setTipoClienta(t)} className="btn-ghost" style={{flex:1,borderColor:tipoClienta===t?"#2721E8":"rgba(255,255,255,0.1)",color:tipoClienta===t?"#fff":"rgba(255,255,255,0.4)",fontSize:"11px",padding:"6px"}}>
                      {t}
                    </button>
                  ))}
                </div>
                <button className="btn-blue" style={{width:"100%",padding:"14px",fontSize:"15px"}} onClick={()=>setShowConfirm(true)}>
                  Cobrar {fmt(total*(1-descuento/100))}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal confirmar */}
      {showConfirm&&(
        <div className="overlay">
          <div className="glass" style={{width:420,padding:"28px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>CONFIRMAR COBRO</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"18px"}}>
              <div>
                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"6px",letterSpacing:"1px"}}>MÉTODO DE PAGO</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                  {["Efectivo","Débito","Crédito","Transferencia","Depósito"].map(m=>(
                    <button key={m} className="btn-ghost" style={{borderColor:metodo===m?"#2721E8":"rgba(255,255,255,0.1)",color:metodo===m?"#fff":"rgba(255,255,255,0.4)",padding:"8px",fontSize:"11px"}} onClick={()=>{setMetodo(m);if(m!=="Crédito")setMsiSel(0);}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {metodo==="Crédito"&&msiDisponibles.length>0&&(
                <div>
                  <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"6px",letterSpacing:"1px"}}>MSI</div>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    <button className="btn-ghost" style={{borderColor:msiSel===0?"#2721E8":"rgba(255,255,255,0.1)",color:msiSel===0?"#fff":"rgba(255,255,255,0.4)",padding:"7px 12px",fontSize:"11px"}} onClick={()=>setMsiSel(0)}>Sin MSI</button>
                    {msiDisponibles.map(m=>(
                      <button key={m} className="btn-ghost" style={{borderColor:msiSel===m?"#2721E8":"rgba(255,255,255,0.1)",color:msiSel===m?"#fff":"rgba(255,255,255,0.4)",padding:"7px 12px",fontSize:"11px"}} onClick={()=>setMsiSel(m)}>{m} MSI</button>
                    ))}
                  </div>
                </div>
              )}
              {metodo==="Efectivo"&&(
                <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(16,185,129,0.06)",borderRadius:"8px",border:"1px solid rgba(16,185,129,0.2)"}}>
                  <span style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>Desc. efectivo 5%</span>
                  <button className="btn-ghost" style={{borderColor:descuento===5?"#10b981":"rgba(255,255,255,0.1)",color:descuento===5?"#10b981":"rgba(255,255,255,0.4)",padding:"5px 12px",fontSize:"11px"}} onClick={()=>setDescuento(descuento===5?0:5)}>
                    {descuento===5?"✓ Aplicado":"Aplicar"}
                  </button>
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:"8px",padding:"14px",background:"rgba(0,0,0,0.3)",borderRadius:"10px"}}>
                {carrito.map(i=>(
                  <div key={i.nombre} style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
                    <span style={{color:"rgba(255,255,255,0.5)"}}>{i.nombre}{i.qty>1?` ×${i.qty}`:""}</span>
                    <span>{fmt(i.precio*i.qty)}</span>
                  </div>
                ))}
                <div style={{height:"1px",background:"rgba(255,255,255,0.08)"}}/>
                {descuento>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#ff8a65"}}><span>Descuento {descuento}%</span><span>-{fmt(total*descuento/100)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"20px",fontWeight:700}}><span>Total</span><span style={{color:"#49B8D3"}}>{fmt(totalConDesc)}</span></div>
                {msiSel>0&&<div style={{fontSize:"12px",color:"#49B8D3",textAlign:"right"}}>{fmt(totalConDesc/msiSel)}/mes por {msiSel} meses</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button className="btn-ghost" onClick={()=>setShowConfirm(false)} style={{flex:1,padding:"13px"}}>Cancelar</button>
              <button className="btn-blue" onClick={cerrarTicket} disabled={saving||!metodo} style={{flex:2,padding:"13px",fontSize:"15px"}}>{saving?"Guardando...":"✓ Confirmar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ onVerPOS, onLogout }) {
  const [tab,setTab]             = useState("resumen");
  const [tickets,setTickets]     = useState([]);
  const [loadingDB,setLoadingDB] = useState(false);
  const [metaData,setMetaData]   = useState(null);
  const [loadingMeta,setLoadingMeta]=useState(false);
  const [metaError,setMetaError] = useState("");
  const [posSucursal,setPosSucursal]=useState(null); // sucursal seleccionada para ver POS

  const cargarTickets=async()=>{
    setLoadingDB(true);
    const{data,error}=await supabase.from("tickets").select("*").gte("fecha",inicioMes()).lte("fecha",hoy()).order("created_at",{ascending:false});
    if(!error&&data)setTickets(data);
    setLoadingDB(false);
  };
  const cargarMeta=async()=>{
    setLoadingMeta(true);setMetaError("");
    try{
      const since=inicioMes(),until=hoy(),fields="adset_name,spend,actions,impressions,clicks,reach";
      const url=`https://graph.facebook.com/v19.0/act_${META_ACCOUNT}/insights?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&level=adset&limit=200&access_token=${META_TOKEN}`;
      const res=await fetch(url);const json=await res.json();
      if(json.error){setMetaError(json.error.message);setLoadingMeta(false);return;}
      const rows=json.data||[];
      const getM=(actions)=>{const f=(t)=>{const a=(actions||[]).find(x=>x.action_type===t);return a?Number(a.value):0;};return f("onsite_conversion.messaging_conversation_started_7d")||f("onsite_conversion.total_messaging_connection")||f("onsite_conversion.messaging_first_reply")||f("contact");};
      let tS=0,tM=0,tI=0,tC=0,tA=0;
      const pS={};SUCURSALES_NAMES.forEach(s=>{pS[s]={spend:0,mensajes:0,impresiones:0,clics:0};});
      rows.forEach(row=>{
        const sp=Number(row.spend||0),ms=getM(row.actions),im=Number(row.impressions||0),cl=Number(row.clicks||0),al=Number(row.reach||0),nm=(row.adset_name||"").toLowerCase();
        tS+=sp;tM+=ms;tI+=im;tC+=cl;tA+=al;
        SUCURSALES_NAMES.forEach(suc=>{if(nm.includes(suc.toLowerCase())){pS[suc].spend+=sp;pS[suc].mensajes+=ms;pS[suc].impresiones+=im;pS[suc].clics+=cl;}});
      });
      setMetaData({spend:tS,mensajes:tM,impresiones:tI,clics:tC,alcance:tA,porSucursal:pS});
    }catch(e){setMetaError("Error al conectar con Meta.");}
    setLoadingMeta(false);
  };
  useEffect(()=>{cargarTickets();cargarMeta();},[]);

  const ventasMes=tickets.reduce((s,t)=>s+Number(t.total),0);
  const nuevasMes=tickets.filter(t=>t.tipo_clienta==="Nueva").length;
  const recurrentesMes=tickets.filter(t=>t.tipo_clienta==="Recurrente").length;
  const ticketProm=tickets.length?ventasMes/tickets.length:0;
  const inversion=metaData?.spend||0;
  const mensajes=metaData?.mensajes||0;
  const cpa=nuevasMes>0&&inversion>0?inversion/nuevasMes:0;
  const roas=inversion>0?ventasMes/inversion:0;
  const convPct=mensajes>0?((nuevasMes/mensajes)*100).toFixed(1):"—";
  const ventasSuc=SUCURSALES_NAMES.map(nombre=>({nombre,ventas:tickets.filter(t=>t.sucursal_nombre===nombre).reduce((s,t)=>s+Number(t.total),0),nuevas:tickets.filter(t=>t.sucursal_nombre===nombre&&t.tipo_clienta==="Nueva").length,tickets:tickets.filter(t=>t.sucursal_nombre===nombre).length}));
  const maxVenta=Math.max(...ventasSuc.map(s=>s.ventas),1);
  const metaSuc=SUCURSALES_NAMES.map(nombre=>{const vS=ventasSuc.find(v=>v.nombre===nombre),mS=metaData?.porSucursal?.[nombre],sp=mS?.spend||0,ms=mS?.mensajes||0,nv=vS?.nuevas||0;return{nombre,spend:sp,mensajes:ms,nuevas:nv,cpa:nv>0&&sp>0?sp/nv:0};}).sort((a,b)=>b.mensajes-a.mensajes);
  const maxMensajes=Math.max(...metaSuc.map(s=>s.mensajes),1);
  const svcsCount={};tickets.forEach(t=>{(t.servicios||[]).forEach(s=>{svcsCount[s]=(svcsCount[s]||0)+1;});});
  const topSvcs=Object.entries(svcsCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxSvc=topSvcs[0]?.[1]||1;
  const metodos={};tickets.forEach(t=>{const m=(t.metodo_pago||"").split(" ")[0];metodos[m]=(metodos[m]||0)+Number(t.total);});
  const topMetodos=Object.entries(metodos).sort((a,b)=>b[1]-a[1]);
  const ventasDia={};tickets.forEach(t=>{ventasDia[t.fecha]=(ventasDia[t.fecha]||0)+Number(t.total);});
  const diasMes=Object.entries(ventasDia).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxDia=Math.max(...diasMes.map(d=>d[1]),1);

  // Si admin eligió ver POS de una sucursal
  if(posSucursal) return <POS session={posSucursal} onSwitchSucursal={()=>setPosSucursal(null)} isAdmin={true}/>;

  return(
    <div style={{minHeight:"100vh",background:"#0C0D1A",color:"#fff"}}>
      {/* Topbar */}
      <div style={{padding:"0 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
          <div style={{fontSize:"20px",fontWeight:700,letterSpacing:"4px"}}>CIRE</div>
          <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,0.1)"}}/>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>DASHBOARD EJECUTIVO</div>
          <div style={{display:"flex"}}>
            {["resumen","sucursales","servicios","meta","pos"].map(t=>(
              <div key={t} className="tab-dash" style={{borderBottomColor:tab===t?"#2721E8":"transparent",color:tab===t?"#fff":"rgba(255,255,255,0.35)"}} onClick={()=>setTab(t)}>
                {{resumen:"Resumen",sucursales:"Sucursales",servicios:"Servicios",meta:"Meta Ads",pos:"🖥 Ver POS"}[t]}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          {loadingMeta?<div style={{fontSize:"11px",padding:"4px 10px",borderRadius:"20px",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.4)"}}>⟳ Meta...</div>
            :metaError?<div style={{fontSize:"11px",padding:"4px 10px",borderRadius:"20px",background:"rgba(255,80,80,0.1)",color:"#ff6b6b",border:"1px solid rgba(255,80,80,0.3)"}}>⚠ Meta error</div>
            :metaData?<div style={{fontSize:"11px",padding:"4px 10px",borderRadius:"20px",background:"rgba(16,185,129,0.1)",color:"#10b981",border:"1px solid rgba(16,185,129,0.3)"}}>● Meta conectado</div>:null}
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",textTransform:"capitalize"}}>{mesLabel()}</div>
          <button className="btn-ghost" onClick={()=>{cargarTickets();cargarMeta();}}>↻ Actualizar</button>
          <button className="btn-ghost" onClick={onLogout}>Salir</button>
        </div>
      </div>

      <div style={{padding:"24px 28px",maxWidth:"1400px",margin:"0 auto"}}>

        {/* ── RESUMEN ── */}
        {tab==="resumen"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
              {[
                {label:"VENTAS DEL MES",value:fmt(ventasMes),sub:`${fmtN(tickets.length)} tickets`,cls:"hi",color:"#2721E8"},
                {label:"NUEVAS CLIENTAS",value:nuevasMes,sub:`${recurrentesMes} recurrentes`,cls:"",color:"#fff"},
                {label:"TICKET PROMEDIO",value:fmt(ticketProm),sub:"por visita",cls:"",color:"#fff"},
                {label:"CONVERSIÓN ADS",value:convPct==="—"?"—":`${convPct}%`,sub:mensajes>0?`de ${fmtN(mensajes)} mensajes`:"Cargando Meta...",cls:parseFloat(convPct)>10?"green":"orange",color:parseFloat(convPct)>10?"#10b981":"#f97316"},
              ].map(k=>(
                <div key={k.label} className={`kpi ${k.cls}`}>
                  <div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.label}</div>
                  <div style={{fontSize:"30px",fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"6px"}}>{k.sub}</div>
                </div>
              ))}
            </div>
            {inversion>0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
                {[
                  {label:"INVERSIÓN META ADS",value:fmt(inversion),sub:"gastado este mes",color:"#f97316"},
                  {label:"COSTO POR CLIENTA NUEVA",value:fmt(cpa),sub:"costo de adquisición",color:"#a855f7"},
                  {label:"ROAS",value:`${roas.toFixed(2)}x`,sub:roas>=3?"Excelente ✓":roas>=2?"Bueno ✓":"Mejorable ⚠",color:"#10b981"},
                ].map(k=>(
                  <div key={k.label} className="glass-dark" style={{padding:"18px 22px",borderLeft:`3px solid ${k.color}`}}>
                    <div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>{k.label}</div>
                    <div style={{fontSize:"26px",fontWeight:700,color:k.color}}>{k.value}</div>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{k.sub}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="glass" style={{padding:"22px"}}>
              <div style={{marginBottom:"18px",display:"flex",justifyContent:"space-between"}}>
                <div><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>VENTAS POR DÍA</div><div style={{fontSize:"18px",fontWeight:600}}>{mesLabel()}</div></div>
                {loadingDB&&<div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>Cargando...</div>}
              </div>
              {diasMes.length===0?<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"32px",fontSize:"13px"}}>No hay datos este mes aún</div>
                :<div style={{display:"flex",alignItems:"flex-end",gap:"8px",height:"140px"}}>
                  {diasMes.map(([fecha,venta])=>{const h=Math.round((venta/maxDia)*100);return(
                    <div key={fecha} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}} title={`${fecha}: ${fmt(venta)}`}>
                      <div style={{fontSize:"9px",color:"rgba(255,255,255,0.25)"}}>{fmt(venta).replace("MX$","$")}</div>
                      <div style={{width:"100%",height:`${h}%`,background:h>80?"#2721E8":h>50?"#49B8D3":"rgba(39,33,232,0.35)",borderRadius:"3px 3px 0 0",minHeight:"4px"}}/>
                      <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>{fecha.slice(8)}</div>
                    </div>
                  );})}
                </div>}
            </div>
            <div className="glass" style={{overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"13px",fontWeight:600}}>Últimas ventas del mes</div>
              <div style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 110px 120px 90px",padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                {["TICKET","SERVICIOS","SUCURSAL","TOTAL","MÉTODO","TIPO"].map(h=>(<div key={h} style={{fontSize:"10px",letterSpacing:"1.5px",color:"rgba(255,255,255,0.2)"}}>{h}</div>))}
              </div>
              {tickets.slice(0,15).map(t=>(
                <div key={t.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 110px 120px 90px",padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.03)",alignItems:"center"}}>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{t.id?.slice(-6)}</div>
                  <div style={{fontSize:"12px",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(t.servicios||[]).join(", ")}</div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"6px",height:"6px",borderRadius:"50%",background:COLORES[t.sucursal_nombre]||"#2721E8",flexShrink:0}}/><span style={{fontSize:"12px"}}>{t.sucursal_nombre}</span></div>
                  <div style={{fontSize:"13px",fontWeight:600,color:"#49B8D3"}}>{fmt(t.total)}</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>{t.metodo_pago}</div>
                  <div><span style={{fontSize:"10px",padding:"2px 8px",borderRadius:"10px",background:t.tipo_clienta==="Nueva"?"rgba(39,33,232,0.2)":"rgba(73,184,211,0.15)",color:t.tipo_clienta==="Nueva"?"#8b85f5":"#49B8D3"}}>{t.tipo_clienta}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUCURSALES ── */}
        {tab==="sucursales"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"14px"}}>
              {ventasSuc.map(s=>(
                <div key={s.nombre} className="glass" style={{padding:"18px 20px",borderLeft:`3px solid ${COLORES[s.nombre]}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:COLORES[s.nombre]}}/><div style={{fontSize:"14px",fontWeight:600}}>{s.nombre}</div></div>
                  <div style={{fontSize:"24px",fontWeight:700,color:COLORES[s.nombre],marginBottom:"4px"}}>{fmt(s.ventas)}</div>
                  <div style={{height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",marginBottom:"10px"}}><div style={{width:`${(s.ventas/maxVenta)*100}%`,height:"100%",background:COLORES[s.nombre],borderRadius:"2px"}}/></div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>{s.tickets} tickets · {s.nuevas} nuevas</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICIOS ── */}
        {tab==="servicios"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
            <div className="glass" style={{padding:"22px"}}>
              <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"18px"}}>TOP SERVICIOS</div>
              {topSvcs.map(([svc,cnt])=>(
                <div key={svc} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}><span style={{fontWeight:500}}>{svc}</span><span style={{color:"rgba(255,255,255,0.4)"}}>{cnt}</span></div>
                  <div style={{height:"5px",background:"rgba(255,255,255,0.06)",borderRadius:"3px"}}><div style={{width:`${(cnt/maxSvc)*100}%`,height:"100%",background:"#2721E8",borderRadius:"3px"}}/></div>
                </div>
              ))}
            </div>
            <div className="glass" style={{padding:"22px"}}>
              <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"18px"}}>MÉTODOS DE PAGO</div>
              {topMetodos.map(([m,v])=>(
                <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:"13px",fontWeight:500}}>{m||"—"}</span>
                  <span style={{fontSize:"14px",fontWeight:600,color:"#49B8D3"}}>{fmt(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── META ADS ── */}
        {tab==="meta"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            {metaData&&(<>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
                {[
                  {label:"GASTO TOTAL",value:fmt(metaData.spend),color:"#f97316"},
                  {label:"ALCANCE",value:fmtN(metaData.alcance),color:"#2721E8"},
                  {label:"IMPRESIONES",value:fmtN(metaData.impresiones),color:"#49B8D3"},
                  {label:"MENSAJES",value:fmtN(metaData.mensajes),color:"#a855f7"},
                ].map(k=>(
                  <div key={k.label} className="kpi"><div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"10px"}}>{k.label}</div><div style={{fontSize:"28px",fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</div></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
                {[
                  {label:"COSTO POR CLIENTA NUEVA",value:fmt(cpa),sub:`${nuevasMes} clientas captadas`,color:"#a855f7"},
                  {label:"ROAS GLOBAL",value:`${roas.toFixed(2)}x`,sub:roas>=3?"Excelente ✓":roas>=2?"Bueno ✓":"Mejorable ⚠",color:"#10b981"},
                  {label:"CONVERSIÓN MENSAJES→VENTA",value:convPct==="—"?"Sin datos":`${convPct}%`,sub:mensajes>0?`${fmtN(mensajes)} mensajes totales`:"",color:parseFloat(convPct)>=10?"#10b981":"#f97316"},
                ].map(k=>(
                  <div key={k.label} className="glass-dark" style={{padding:"20px 22px",borderLeft:`3px solid ${k.color}`}}>
                    <div style={{fontSize:"10px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>{k.label}</div>
                    <div style={{fontSize:"30px",fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</div>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"6px"}}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div className="glass" style={{overflow:"hidden"}}>
                <div style={{padding:"18px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>RANKING SUCURSALES · META ADS</div><div style={{fontSize:"15px",fontWeight:600}}>{mesLabel()}</div></div>
                <div className="rank-row" style={{padding:"10px 20px"}}>
                  {["#","SUCURSAL","MENSAJES","INVERSIÓN","CPA","% CONV"].map(h=>(<div key={h} style={{fontSize:"10px",letterSpacing:"1.5px",color:"rgba(255,255,255,0.2)"}}>{h}</div>))}
                </div>
                {metaSuc.map((s,i)=>{
                  const pc=s.mensajes>0&&s.nuevas>0?((s.nuevas/s.mensajes)*100).toFixed(1):"—";
                  const bw=Math.round((s.mensajes/maxMensajes)*100);
                  return(
                    <div key={s.nombre} className="rank-row">
                      <div style={{fontSize:"13px",fontWeight:700,color:i===0?"#f0c040":i===1?"rgba(200,200,200,0.7)":i===2?"#cd7f32":"rgba(255,255,255,0.3)"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:COLORES[s.nombre],flexShrink:0}}/><span style={{fontSize:"13px",fontWeight:600}}>{s.nombre}</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{flex:1,height:"6px",background:"rgba(255,255,255,0.05)",borderRadius:"3px",overflow:"hidden"}}><div style={{width:`${bw}%`,height:"100%",background:COLORES[s.nombre],borderRadius:"3px"}}/></div><span style={{fontSize:"13px",fontWeight:700,color:COLORES[s.nombre],minWidth:"36px"}}>{fmtN(s.mensajes)}</span></div>
                      <div style={{fontSize:"13px",fontWeight:600,color:"#f97316"}}>{fmt(s.spend)}</div>
                      <div style={{fontSize:"13px",fontWeight:600,color:s.cpa>0&&s.cpa<40?"#10b981":s.cpa<60?"#f0c040":"#ff6b6b"}}>{s.cpa>0?fmt(s.cpa):"—"}</div>
                      <div style={{fontSize:"13px",fontWeight:600,color:parseFloat(pc)>=10?"#10b981":parseFloat(pc)>0?"#f0c040":"rgba(255,255,255,0.3)"}}>{pc==="—"?"—":`${pc}%`}</div>
                    </div>
                  );
                })}
                <div style={{padding:"12px 20px",fontSize:"11px",color:"rgba(255,255,255,0.2)",borderTop:"1px solid rgba(255,255,255,0.04)"}}>💡 CPA = inversión ÷ clientas nuevas. Verde &lt;$40 · Amarillo $40-$60 · Rojo &gt;$60</div>
              </div>
              {metaData.mensajes>0&&(
                <div className="glass" style={{padding:"24px"}}>
                  <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"20px"}}>EMBUDO GLOBAL · {mesLabel()}</div>
                  <div style={{display:"flex",alignItems:"stretch"}}>
                    {[
                      {label:"Alcance",value:fmtN(metaData.alcance),color:"#2721E8"},
                      {label:"Clics",value:fmtN(metaData.clics),color:"#49B8D3",pct:metaData.alcance>0?((metaData.clics/metaData.alcance)*100).toFixed(1):0},
                      {label:"Mensajes",value:fmtN(metaData.mensajes),color:"#a855f7",pct:metaData.clics>0?((metaData.mensajes/metaData.clics)*100).toFixed(1):0},
                      {label:"Ventas nuevas",value:fmtN(nuevasMes),color:"#10b981",pct:metaData.mensajes>0?((nuevasMes/metaData.mensajes)*100).toFixed(1):0},
                    ].map((e,i)=>(
                      <div key={e.label} style={{flex:1,padding:"20px 16px",background:`${e.color}12`,border:`1px solid ${e.color}33`,borderLeft:i>0?"none":"",borderRadius:i===0?"12px 0 0 12px":i===3?"0 12px 12px 0":"0",textAlign:"center"}}>
                        <div style={{fontSize:"24px",fontWeight:700,color:e.color}}>{e.value}</div>
                        <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",margin:"4px 0"}}>{e.label}</div>
                        {i>0&&<div style={{fontSize:"11px",color:e.color,fontWeight:600}}>{e.pct}% del anterior</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>)}
            {loadingMeta&&<div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.3)"}}>Conectando con Meta Ads...</div>}
            {!loadingMeta&&metaError&&(
              <div style={{textAlign:"center",padding:"32px",color:"#ff6b6b",background:"rgba(255,80,80,0.05)",borderRadius:"12px",border:"1px solid rgba(255,80,80,0.2)"}}>
                <div style={{fontSize:"16px",marginBottom:"8px"}}>⚠️ {metaError}</div>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>Verifica el token en Vercel — debe tener permiso ads_read</div>
              </div>
            )}
          </div>
        )}

        {/* ── VER POS ── */}
        {tab==="pos"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>SELECCIONA UNA SUCURSAL</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"14px"}}>
              {USUARIOS.filter(u=>u.rol==="sucursal").map(s=>(
                <div key={s.id} className="glass" style={{padding:"24px 20px",cursor:"pointer",borderColor:`${s.color}44`,textAlign:"center",transition:"all 0.2s"}}
                  onClick={()=>setPosSucursal(s)}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=s.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${s.color}44`}>
                  <div style={{width:"40px",height:"40px",borderRadius:"12px",background:`${s.color}22`,border:`1px solid ${s.color}44`,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🖥</div>
                  <div style={{fontSize:"15px",fontWeight:700,marginBottom:"4px"}}>{s.nombre}</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>Ver POS →</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT — LOGIN UNIFICADO
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [session,setSession] = useState(null);
  const [user,setUser]       = useState("");
  const [pass,setPass]       = useState("");
  const [err,setErr]         = useState("");

  function handleLogin() {
    const found = USUARIOS.find(u => u.usuario===user.trim() && u.password===pass);
    if(found) { setSession(found); setErr(""); }
    else setErr("Usuario o contraseña incorrectos");
  }

  if(!session) return (
    <div style={{minHeight:"100vh",background:"#0C0D1A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Albert Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"#2721E8",opacity:0.08,filter:"blur(100px)",top:"-150px",left:"-150px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"#49B8D3",opacity:0.06,filter:"blur(80px)",bottom:"0px",right:"0px",pointerEvents:"none"}}/>
      <div className="glass" style={{width:420,padding:"52px 44px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{fontSize:"10px",letterSpacing:"5px",color:"#49B8D3",marginBottom:"10px",fontWeight:500}}>SISTEMA INTERNO</div>
          <div style={{fontSize:"42px",fontWeight:700,color:"#fff",letterSpacing:"8px",lineHeight:1}}>CIRE</div>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.25)",marginTop:"8px",letterSpacing:"1px"}}>Depilación Láser</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"}}>
          <input className="inp" placeholder="Usuario" value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{padding:"13px 16px",fontSize:"14px",borderRadius:"12px"}}/>
          <input className="inp" type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{padding:"13px 16px",fontSize:"14px",borderRadius:"12px"}}/>
          {err&&<div style={{color:"#ff6b6b",fontSize:"13px",textAlign:"center"}}>{err}</div>}
        </div>
        <button className="btn-blue" style={{width:"100%",padding:"14px",fontSize:"15px",borderRadius:"12px"}} onClick={handleLogin}>Entrar →</button>
        <div style={{marginTop:"20px",fontSize:"10px",color:"rgba(255,255,255,0.1)",textAlign:"center",letterSpacing:"2px"}}>ACCESO RESTRINGIDO</div>
      </div>
    </div>
  );

  if(session.rol==="admin") return (
    <>
      <style>{CSS}</style>
      <Dashboard onLogout={()=>setSession(null)}/>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <POS session={session} onSwitchSucursal={()=>setSession(null)} isAdmin={false}/>
    </>
  );
}
