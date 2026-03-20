import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════ */
const T = {
  cream:"#F5F0E8", black:"#0D0D0D", ink:"#1A1A2E",
  coral:"#FF4D3D", sage:"#8FAF7E", blush:"#F2C4B0",
  lilac:"#C8B8D8", gold:"#C9A84C", fog:"#E8E3DA", mist:"#D4CFC6",
  subtle:"#888",
};

/* ══════════════════════════════════════════
   API LAYER
   All endpoints match your Spring Boot backend.
   Set BASE to "" if serving React from same origin,
   or "http://localhost:8080" for local dev.
══════════════════════════════════════════ */
const BASE = import.meta.env.VITE_API_BASE;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
const api = {
  // ── Auth (redirects to Spring Security OAuth2)
  loginGithub: () => { window.location.href = `${BASE}/oauth2/authorization/github`; },
  loginGoogle: () => { window.location.href = `${BASE}/oauth2/authorization/google`; },
  logout: () => fetch(`${BASE}/logout`, { method:"POST", credentials:"include" }),

  // ── Profile  GET /api/profile/me
  getMyProfile: () =>
    fetch(`${BASE}/api/profile/me`, { credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Profile  PUT /api/profile
  updateProfile: (body) =>
    fetch(`${BASE}/api/profile`, {
      method:"PUT", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body),
    }).then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Profile  DELETE /api/profile
  deleteProfile: () =>
    fetch(`${BASE}/api/profile`, { method:"DELETE", credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); }),

  // ── Image  POST /api/profile/image
  uploadImage: (file) => {
    const fd = new FormData(); fd.append("file", file);
    return fetch(`${BASE}/api/profile/image`, { method:"POST", credentials:"include", body:fd })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); });
  },

  // ── Public profile  GET /u/{slug}
  getPublicProfile: (slug) =>
    fetch(`${BASE}/u/${slug}`, { credentials:"include" })
      .then(r => { if(r.status===403) throw new Error("PRIVATE"); if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Public projects  GET /u/{slug}/projects
  getPublicProjects: (slug) =>
    fetch(`${BASE}/u/${slug}/projects`, { credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Coding stats  GET /u/{slug}/coding-stats
  getCodingStats: (slug) =>
    fetch(`${BASE}/u/${slug}/coding-stats`, { credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Themes  GET /api/themes
  getThemes: () =>
    fetch(`${BASE}/api/themes`, { credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Add project  POST /api/project
  addProject: (body) =>
    fetch(`${BASE}/api/project`, {
      method:"POST", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body),
    }).then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Delete project  DELETE /api/projects/{id}
  deleteProject: (id) =>
    fetch(`${BASE}/api/projects/${id}`, { method:"DELETE", credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); }),

  // ── Reorder  PUT /api/projects/order
  reorderProjects: (orders) =>
    fetch(`${BASE}/api/projects/order`, {
      method:"PUT", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(orders),
    }).then(r => { if(!r.ok) throw new Error(String(r.status)); }),

  // ── Feature  PUT /api/projects/{id}/featured
  featureProject: (id) =>
    fetch(`${BASE}/api/projects/${id}/featured`, { method:"PUT", credentials:"include" })
      .then(r => { if(!r.ok) throw new Error(String(r.status)); }),

  // ── Payment  POST /api/payment/create-order
  createPaymentOrder: (amount) =>
    fetch(`${BASE}/api/payment/create-order?amount=${amount}`, {
      method:"POST", credentials:"include"
    }).then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),

  // ── Payment  POST /api/payment/verify
  verifyPayment: (body) =>
    fetch(`${BASE}/api/payment/verify`, {
      method:"POST", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body),
    }).then(r => { if(!r.ok) throw new Error(String(r.status)); return r.json(); }),
};

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Poppins:wght@400;600;700;800&family=Press+Start+2P&family=VT323&family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@400;700;800&family=Noto+Serif+JP:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{font-family:'DM Sans',sans-serif;background:#F5F0E8;color:#0D0D0D;-webkit-font-smoothing:antialiased;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes growRight{from{width:0}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
 .fu{animation:fadeUp .5s ease forwards}
 .fu2{animation:fadeUp .5s .08s ease forwards}
 .fu3{animation:fadeUp .5s .16s ease forwards}
 .fu4{animation:fadeUp .5s .24s ease forwards}
 .fu5{animation:fadeUp .5s .32s ease forwards}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;border:1.5px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s;letter-spacing:.01em;white-space:nowrap;}
  .btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.12);}
  .btn:active{transform:scale(.97);}
  .btn:disabled{opacity:.4;pointer-events:none;cursor:not-allowed;}
  .btn-primary{background:#0D0D0D;color:#F5F0E8;border-color:#0D0D0D;}
  .btn-coral{background:#FF4D3D;color:#fff;border-color:#FF4D3D;}
  .btn-outline{background:transparent;color:#0D0D0D;border-color:#0D0D0D;}
  .btn-ghost{background:#E8E3DA;color:#0D0D0D;}
  .btn-sage{background:#8FAF7E;color:#0D0D0D;border-color:#8FAF7E;}
  .btn-danger{background:#fff5f5;color:#FF4D3D;border-color:#FF4D3D;}
  .btn-sm{padding:7px 14px;font-size:11px;}
  .btn-lg{padding:14px 30px;font-size:15px;}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:600;letter-spacing:.04em;}
  .badge-coral{background:#FFE8E6;color:#FF4D3D;border:1.5px solid #FFCCC8;}
  .badge-sage{background:#E6F0E1;color:#5A8A4A;border:1.5px solid #BCDAB3;}
  .badge-lilac{background:#EDE7F5;color:#7B5EA7;border:1.5px solid #D0BDE8;}
  .badge-gold{background:#FBF2DC;color:#9A7028;border:1.5px solid #E8D49A;}
  .badge-black{background:#0D0D0D;color:#F5F0E8;}
  .card{border:1.5px solid #0D0D0D;border-radius:22px;overflow:hidden;transition:transform .18s,box-shadow .18s;background:#fff;}
  .card:hover{transform:translateY(-2px);box-shadow:0 16px 44px rgba(0,0,0,.09);}
  .inp{width:100%;padding:10px 14px;border:1.5px solid #0D0D0D;border-radius:13px;font-family:'DM Sans',sans-serif;font-size:13px;background:#fff;color:#0D0D0D;outline:none;transition:border-color .18s,box-shadow .18s;}
  .inp:focus{border-color:#FF4D3D;box-shadow:0 0 0 3px rgba(255,77,61,.1);}
  .inp::placeholder{color:#ccc;}
  .toggle{width:40px;height:22px;border-radius:11px;border:1.5px solid #0D0D0D;background:#E8E3DA;position:relative;cursor:pointer;transition:background .18s,border-color .18s;flex-shrink:0;}
  .toggle.on{background:#FF4D3D;border-color:#FF4D3D;}
  .toggle-knob{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .18s cubic-bezier(.4,0,.2,1);box-shadow:0 1px 4px rgba(0,0,0,.18);}
  .toggle.on .toggle-knob{left:19px;}
  .pbar{width:100%;height:6px;background:#E8E3DA;border-radius:3px;overflow:hidden;}
  .pbar-fill{height:100%;border-radius:3px;animation:growRight .9s cubic-bezier(.4,0,.2,1) both;}
  .skel{background:linear-gradient(90deg,#e8e3da 25%,#f0ebe2 50%,#e8e3da 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;}
  .tag{padding:5px 12px;border-radius:100px;font-size:12px;font-weight:500;border:1.5px solid #0D0D0D;cursor:pointer;transition:all .13s;display:inline-flex;align-items:center;gap:4px;background:transparent;}
  .tag:hover,.tag.on{background:#0D0D0D;color:#F5F0E8;}
  .sbl{display:flex;align-items:center;gap:9px;width:100%;padding:9px 11px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all .13s;background:transparent;color:#888;text-align:left;}
  .sbl:hover{background:#E8E3DA;color:#0D0D0D;}
  .sbl.on{background:#0D0D0D;color:#F5F0E8;}
  .sec-lbl{font-size:9px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#bbb;padding:12px 11px 4px;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-thumb{background:#D4CFC6;border-radius:3px;}

  @media (max-width: 1024px) {
    body{font-size:15px;}
  }
  @media (max-width: 768px) {
    .btn{font-size:12px;padding:8px 16px;}
    .btn-lg{font-size:14px;padding:12px 24px;}
    .btn-sm{font-size:10px;padding:6px 12px;}
    body{font-size:14px;}
    h1{font-size:28px !important;}
    h2{font-size:22px !important;}
  }
  @media (max-width: 480px) {
    .btn{font-size:11px;padding:7px 14px;}
    .btn-lg{font-size:13px;padding:10px 20px;}
    body{font-size:13px;}
    h1{font-size:24px !important;}
    h2{font-size:18px !important;}
  }
  video{max-width:100%;height:auto;display:block;}
  img{max-width:100%;height:auto;}

`;

/* ══════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════ */
const LANG_COLORS = {Java:"#b07219",TypeScript:"#2b7489",JavaScript:"#f1e05a",Python:"#3572A5",Go:"#00ADD8",Rust:"#dea584",Kotlin:"#7F52FF","C++":"#f34b7d"};

function Spinner({size=18,color=T.coral}){
  return <div style={{width:size,height:size,border:`2px solid ${T.fog}`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>;
}
function Skel({h=20,w="100%",r=8}){
  return <div className="skel" style={{height:h,width:w,borderRadius:r}}/>;
}
function Avatar({name="?",size=60,imageUrl}){
  const cols=[T.blush,T.lilac,T.sage,T.gold];
  const bg=cols[(name?.charCodeAt(0)||0)%cols.length];
  const ini=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(imageUrl) return <img src={imageUrl} alt={name} style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${T.black}`,objectFit:"cover",flexShrink:0}}/>;
  return(
    <div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${T.black}`,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:size*.32,color:T.black,flexShrink:0,userSelect:"none"}}>
      {ini}
    </div>
  );
}
function Toggle({on,onChange}){
  return <div className={`toggle${on?" on":""}`} onClick={()=>onChange(!on)}><div className="toggle-knob"/></div>;
}
function LangDot({lang}){
  return(
    <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.subtle,fontWeight:500}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:LANG_COLORS[lang]||T.mist,display:"inline-block",flexShrink:0}}/>
      {lang||"Unknown"}
    </span>
  );
}
function Toast({msg,type="success",onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3200);return()=>clearTimeout(t);},[onClose]);
  return(
    <div style={{position:"fixed",bottom:24,right:24,background:type==="error"?T.coral:T.black,color:T.cream,padding:"11px 18px",borderRadius:13,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 8px 28px rgba(0,0,0,.2)",display:"flex",alignItems:"center",gap:10,animation:"fadeUp .3s ease both"}}>
      <span>{type==="error"?"⚠":"✓"}</span>{msg}
      <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:15,marginLeft:4}}>×</button>
    </div>
  );
}
function Confirm({title,desc,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9998,backdropFilter:"blur(3px)"}}>
      <div style={{background:T.cream,border:`1.5px solid ${T.black}`,borderRadius:22,padding:30,maxWidth:360,width:"90%",animation:"fadeUp .3s ease both"}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,marginBottom:9}}>{title}</div>
        <div style={{fontSize:13,color:T.subtle,marginBottom:22,lineHeight:1.6}}>{desc}</div>
        <div style={{display:"flex",gap:9}}>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1,justifyContent:"center"}}>Delete</button>
          <button className="btn btn-ghost" onClick={onCancel} style={{flex:1,justifyContent:"center"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
function Mascot({mood="cool",size=60}){
  return(
    <div style={{textAlign:"center",userSelect:"none",display:"inline-block",width:"100%",maxWidth:size*2}}>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          width:"100%",
          maxWidth:size*2,
          height:"auto",
          objectFit:"contain",
          borderRadius:8,
          display:"block",
          margin:"0 auto"
        }}
        onError={(e) => {
          console.error('Video failed to load');
          // Fallback to emoji if video fails
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.innerHTML = '🤖';
          fallback.style.fontSize = `${size*.55}px`;
          e.target.parentNode.appendChild(fallback);
        }}
      >
        <source src="/Devloper.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

/* ── Project card ── */
function ProjCard({project,editable,onDelete,onFeature}){
  return(
    <div className="card">
      <div style={{height:5,background:project.featured?T.coral:LANG_COLORS[project.language]||T.mist}}/>
      <div style={{padding:"15px 17px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14}}>{project.name}</span>
            {project.featured&&<span className="badge badge-coral">⭐ Featured</span>}
          </div>
          {editable&&(
            <div style={{display:"flex",gap:5}}>
              {!project.featured&&<button className="btn btn-ghost btn-sm" onClick={()=>onFeature(project.id)} title="Mark featured">★</button>}
              <button className="btn btn-danger btn-sm" onClick={()=>onDelete(project.id)}>×</button>
            </div>
          )}
        </div>
        <p style={{fontSize:12,color:T.subtle,lineHeight:1.55,marginBottom:11}}>{project.description||"No description."}</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <LangDot lang={project.language}/>
          <div style={{display:"flex",gap:10,fontSize:11,color:T.subtle}}>
            <span>⭐{project.stars||0}</span>
            <span>🍴{project.forks||0}</span>
            {project.repoUrl&&<a href={project.repoUrl} target="_blank" rel="noreferrer" style={{color:T.coral,textDecoration:"none",fontWeight:600}}>↗</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════ */
function Landing({go}){
  const feats=[
    {i:"🔗",t:"One Link, Everything",d:"Projects, LeetCode stats, CF rating, and your stack — one clean URL."},
    {i:"🎨",t:"Themed Portfolios",d:"FREE and PRO themes. Make your page look like you, not a template."},
    {i:"📊",t:"Auto Coding Stats",d:"LeetCode + Codeforces data pulled automatically."},
    {i:"⚡",t:"GitHub Sync",d:"Projects sync nightly. Stars, forks, language — always fresh."},
    {i:"🔒",t:"Public or Private",d:"Toggle visibility. Recruiter mode: on. Otherwise: locked."},
    {i:"👑",t:"PRO Tier",d:"More project slots, premium themes, full customization."},
  ];
  return(
    <div style={{minHeight:"100vh",background:T.cream}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"17px 44px",borderBottom:`1.5px solid ${T.black}`,position:"sticky",top:0,background:T.cream,zIndex:100}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,letterSpacing:-.5,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:T.coral,display:"inline-block",animation:"blink 2s infinite"}}/>DevFolio
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>go("login")}>Log in</button>
          <button className="btn btn-coral" onClick={()=>go("login")}>Get Started →</button>
        </div>
      </nav>

      <section style={{maxWidth:1060,margin:"0 auto",padding:"72px 44px 56px",display:"grid",gridTemplateColumns:"1fr 360px",gap:60,alignItems:"center"}}>
        <div>
          <div className="fu" style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:T.subtle,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:20,height:1.5,background:T.coral,display:"inline-block"}}/>for developers, by developers
          </div>
          <h1 className="fu2" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(44px,5.5vw,76px)",lineHeight:.92,letterSpacing:-3,marginBottom:22}}>
            Your dev<br/><em style={{color:T.coral,fontStyle:"normal"}}>identity.</em><br/>One link.
          </h1>
          <p className="fu3" style={{fontSize:14,color:T.subtle,lineHeight:1.65,maxWidth:380,marginBottom:28}}>
            DevFolio is your shareable developer profile. Like Linktree, but built for coders. Projects, stats, themes. All in one place.
          </p>
          <div className="fu4" style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:24}}>
            <button className="btn btn-primary btn-lg" onClick={()=>go("login")}>Create your page ↗</button>
            <button className="btn btn-outline btn-lg" onClick={()=>go("portfolio:demo")}>View demo</button>
          </div>
          <div className="fu5" style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {["Free to start","GitHub OAuth","Google OAuth","No credit card"].map(t=>(
              <span key={t} style={{fontSize:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",padding:"4px 11px",border:`1.5px solid ${T.black}`,borderRadius:100}}>✓ {t}</span>
            ))}
          </div>
        </div>
        {/* phone */}
        <div className="fu3" style={{display:"flex",justifyContent:"center"}}>
          <div style={{width:240,background:T.black,borderRadius:30,padding:7,boxShadow:"0 36px 72px rgba(0,0,0,.24)"}}>
            <div style={{background:T.cream,borderRadius:24,padding:"20px 16px"}}>
              <div style={{width:48,height:4,background:T.black,borderRadius:2,margin:"0 auto 18px"}}/>
              <div style={{textAlign:"center",marginBottom:12}}>
                <Avatar name="Aryan Mehta" size={50}/>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,marginTop:8}}>Aryan Mehta</div>
                <div style={{fontSize:9,color:T.subtle,marginTop:2}}>devfolio.app/u/aryan-m42</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",marginBottom:11}}>
                {["React","Java","MongoDB"].map(t=><span key={t} className="tag" style={{fontSize:9,padding:"3px 8px"}}>{t}</span>)}
              </div>
              {[{n:"DevFolio",s:84,l:"Java"},{n:"AlgoViz",s:231,l:"TypeScript"}].map(p=>(
                <div key={p.n} style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:11,padding:"9px 11px",marginBottom:6}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12}}>{p.n}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <LangDot lang={p.l}/><span style={{fontSize:10,color:T.subtle}}>⭐{p.s}</span>
                  </div>
                </div>
              ))}
              <div style={{marginTop:9,background:T.fog,borderRadius:9,padding:"8px 11px",display:"flex",justifyContent:"space-between"}}>
                {[{v:"347",l:"LeetCode",c:T.coral},{v:"1523",l:"CF",c:T.sage},{v:"1.2k",l:"Visits",c:T.black}].map(s=>(
                  <div key={s.l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:8,color:T.subtle,textTransform:"uppercase",letterSpacing:".04em"}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ticker */}
      <div style={{borderTop:`1.5px solid ${T.black}`,borderBottom:`1.5px solid ${T.black}`,padding:"10px 0",background:T.black,overflow:"hidden"}}>
        <div style={{display:"flex",gap:32,whiteSpace:"nowrap",color:T.cream,fontSize:10,fontWeight:600,letterSpacing:".08em",opacity:.45}}>
          {Array(8).fill(["aryan-m42","priya-d99","kiran-x07","dev-z55","rahul-k03","amie-v12"]).flat().map((s,i)=>(
            <span key={i}>devfolio.app/u/{s}</span>
          ))}
        </div>
      </div>

      {/* features */}
      <section style={{maxWidth:1060,margin:"0 auto",padding:"72px 44px"}}>
        <div style={{marginBottom:44,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:14}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:36,letterSpacing:-1.5,lineHeight:1}}>Everything a<br/><span style={{color:T.coral}}>dev needs.</span></h2>
          <p style={{fontSize:12,color:T.subtle,maxWidth:220,textAlign:"right",lineHeight:1.6}}>No bloat. Just the things that matter for your dev identity.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
          {feats.map((f,i)=>(
            <div key={i} className="card" style={{padding:"24px 20px",background:i===0?T.black:"#fff"}}>
              <div style={{fontSize:24,marginBottom:12}}>{f.i}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:6,color:i===0?T.cream:T.black}}>{f.t}</div>
              <div style={{fontSize:12,color:i===0?"rgba(245,240,232,.4)":T.subtle,lineHeight:1.6}}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{maxWidth:1060,margin:"0 auto 72px",padding:"0 44px"}}>
        <div style={{background:T.coral,borderRadius:26,padding:"52px 44px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1.5px solid ${T.black}`,flexWrap:"wrap",gap:28}}>
          <div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:32,color:"#fff",lineHeight:1.05,letterSpacing:-1.5,marginBottom:12}}>Stop sharing random<br/>GitHub links. 💀</div>
            <p style={{fontSize:13,color:"rgba(255,255,255,.75)",marginBottom:22,lineHeight:1.6}}>Recruiters want one link. Give them one. Make it unforgettable.</p>
            <button className="btn btn-lg" style={{background:"#fff",color:T.black,borderColor:"#fff"}} onClick={()=>go("login")}>Build my DevFolio →</button>
          </div>
          <div style={{fontSize:80,animation:"float 3s ease-in-out infinite"}}>🚀</div>
        </div>
      </section>

      <footer style={{background:T.black,color:T.cream,padding:"32px 44px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,letterSpacing:-.5}}>DevFolio</div>
          <div style={{fontSize:10,opacity:.3,marginTop:2}}>Built with ☕ for devs who ship.</div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {["Spring Boot","MongoDB","Cloudinary","OAuth2"].map(t=>(
            <span key={t} style={{padding:"3px 11px",border:"1px solid rgba(255,255,255,.1)",borderRadius:100,fontSize:10}}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════ */
function Login({go}){
  return(
    <div style={{minHeight:"100vh",background:T.cream,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <button className="btn btn-ghost btn-sm" style={{position:"fixed",top:18,left:18}} onClick={()=>go("landing")}>← Back</button>
      <div style={{textAlign:"center",marginBottom:36,animation:"fadeUp .5s ease both"}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:30,letterSpacing:-1,marginBottom:8}}>
          <span style={{color:T.coral}}>Dev</span>Folio
        </div>
        <div style={{fontSize:14,color:T.subtle}}>Sign in to build your developer page</div>
      </div>
      <div style={{width:"100%",maxWidth:360,animation:"fadeUp .5s .1s ease both"}}>
        <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:22,padding:28,marginBottom:12}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              style={{width:"100%",maxWidth:320,height:"auto",objectFit:"contain",borderRadius:12,display:"block",margin:"0 auto"}}
              onError={(e) => {
                console.error('Video failed to load');
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            >
              <source src="/Login page video.mp4" type="video/mp4" />
            </video>
            <div style={{display:'none'}}><Mascot mood="cool" size={68}/></div>
          </div>
          <button className="btn btn-primary btn-lg" style={{width:"100%",justifyContent:"center",marginBottom:11,display:"flex",alignItems:"center",gap:10}} onClick={api.loginGithub}>
            <img src="/Github.png" alt="GitHub" style={{width:20,height:20}} onError={(e)=>{e.target.style.display='none';e.target.nextSibling.style.display='inline';}}/>
            <span style={{fontSize:17,display:"none"}}>🐙</span>
            <span>Continue with GitHub</span>
          </button>
          <button className="btn btn-outline btn-lg" style={{width:"100%",justifyContent:"center",display:"flex",alignItems:"center",gap:10}} onClick={api.loginGoogle}>
            <img src="/Google logo.jpg" alt="Google" style={{width:20,height:20}} onError={(e)=>{e.target.style.display='none';e.target.nextSibling.style.display='inline';}}/>
            <span style={{fontSize:17,display:"none"}}>🔵</span>
            <span>Continue with Google</span>
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:11,color:T.mist,lineHeight:1.6}}>
          By signing in you agree to our Terms. Your profile is private by default.
        </p>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PUBLIC PORTFOLIO  /u/{slug}
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   SAMURAI LAYOUT — 武士道
   Easter eggs: katana cursor, avatar quote,
   sword slash on project hover, hidden kamon
══════════════════════════════════════════ */
function SamuraiLayout({p,projects,stats,statsLoading,socials,go,loggedIn,DEMO_SLUG,copied,setCopied}){
  const SERIF = "Noto Serif JP, serif";
  const [showQuote,setShowQuote]=useState(false);
  const [slashProj,setSlashProj]=useState(null);
  const [petalCount,setPetalCount]=useState(8);
  const [swordPos,setSwordPos]=useState({x:0,y:0});
  const [showSword,setShowSword]=useState(false);

  const quotes=[
    "武士道とは死ぬことと見つけたり — The way of the samurai is found in death.",
    "七転び八起き — Fall seven times, rise eight.",
    "剣は心なり — The sword is the mind.",
    "一期一会 — One time, one meeting — treasure every encounter.",
    "不動心 — Immovable mind — let nothing disturb your focus.",
  ];
  const [quoteIdx]=useState(Math.floor(Math.random()*quotes.length));

  useEffect(()=>{
    const move=(e)=>{ setSwordPos({x:e.clientX,y:e.clientY}); setShowSword(true); };
    const leave=()=>setShowSword(false);
    document.addEventListener("mousemove",move);
    document.addEventListener("mouseleave",leave);
    return()=>{ document.removeEventListener("mousemove",move); document.removeEventListener("mouseleave",leave); };
  },[]);

  const KAMON="⚜";
  const petals=Array.from({length:petalCount},(_,i)=>i);

  return(
    <div style={{minHeight:"100vh",background:"#f5f0e8",fontFamily:"SERIF",color:"#1a0a00",position:"relative",cursor:"none",userSelect:"none"}}>

      {/* ── Custom katana cursor ── */}
      {showSword&&<div style={{position:"fixed",left:swordPos.x,top:swordPos.y,pointerEvents:"none",zIndex:99999,transform:"translate(-4px,-4px) rotate(45deg)",fontSize:20,filter:"drop-shadow(0 0 3px #8b0000)"}}>🗡️</div>}

      {/* ── Washi paper texture overlay ── */}
      <div style={{position:"fixed",inset:0,backgroundImage:"url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%238b0000\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",pointerEvents:"none",zIndex:0}}/>

      {/* ── Falling petals & kanji ── */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
        {petals.map(i=>(
          <div key={i} style={{position:"absolute",left:`${5+i*12}%`,top:"-30px",fontSize:i%3===0?18:14,animation:`float ${5+i*.8}s ease-in-out infinite`,animationDelay:`${i*.7}s`,opacity:.5}}>
            {i%4===0?"🌸":i%4===1?"⚔️":i%4===2?"🏯":"⛩"}
          </div>
        ))}
        {/* background kanji watermarks */}
        {["武","道","士","剣","龍","鬼","侍","忍"].map((k,i)=>(
          <div key={k} style={{position:"absolute",left:`${10+i*12}%`,top:`${15+i*10}%`,fontSize:80,color:"#8b000008",fontWeight:900,transform:`rotate(${-15+i*5}deg)`}}>{k}</div>
        ))}
      </div>

      {/* ── Nav ── */}
      <div style={{background:"rgba(245,240,232,0.97)",borderBottom:"3px solid #8b0000",padding:"12px 22px",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(8px)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:"2px solid #8b0000",borderRadius:4,padding:"5px 14px",cursor:"none",color:"#8b0000",fontFamily:"SERIF",fontSize:12,fontWeight:700,letterSpacing:1}}>← 戻る</button>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#5c3a1e"}}>
          <span style={{fontSize:16}}>⛩</span>
          <span style={{letterSpacing:1}}>devfolio.app/u/{DEMO_SLUG}</span>
        </div>
        <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"#8b0000",border:"none",borderRadius:4,padding:"5px 14px",cursor:"none",color:"#ffd700",fontFamily:"SERIF",fontSize:12,fontWeight:700}}>
          {copied?"✓ 完了":"リンクをコピー"}
        </button>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 100px",position:"relative",zIndex:2}}>

        {/* ── Hero scroll card ── */}
        <div style={{background:"rgba(255,252,245,0.96)",border:"2px solid #8b0000",borderRadius:4,padding:"28px 28px 22px",marginBottom:24,boxShadow:"4px 4px 0 #8b000033,8px 8px 0 #8b000011",position:"relative",overflow:"hidden"}}
          onClick={()=>{if(!showQuote){setShowQuote(true);setTimeout(()=>setShowQuote(false),4000);}setPetalCount(c=>Math.min(c+4,20));}}>

          {/* corner kamon stamps */}
          <div style={{position:"absolute",top:8,left:8,fontSize:20,color:"#8b0000",opacity:.6}}>{KAMON}</div>
          <div style={{position:"absolute",top:8,right:8,fontSize:20,color:"#8b0000",opacity:.6}}>{KAMON}</div>
          <div style={{position:"absolute",bottom:8,left:8,fontSize:16,color:"#8b0000",opacity:.4}}>{KAMON}</div>
          <div style={{position:"absolute",bottom:8,right:8,fontSize:16,color:"#8b0000",opacity:.4}}>{KAMON}</div>

          {/* red top bar */}
          <div style={{background:"linear-gradient(90deg,#8b0000,#dc2626,#8b0000)",height:4,borderRadius:2,marginBottom:20}}/>

          {/* profile */}
          <div style={{display:"flex",gap:22,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{width:96,height:96,borderRadius:4,border:"3px solid #8b0000",overflow:"hidden",boxShadow:"3px 3px 0 #8b000044",cursor:"none",position:"relative"}} title="Click for samurai wisdom">
                <Avatar name={p.name} size={96} imageUrl={p.photoUrl}/>
                {showQuote&&<div style={{position:"absolute",inset:0,background:"rgba(26,10,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:8,borderRadius:2}}>
                  <div style={{fontSize:10,color:"#ffd700",textAlign:"center",lineHeight:1.5,fontStyle:"italic"}}>{quotes[quoteIdx]}</div>
                </div>}
              </div>
              {/* red stamp */}
              <div style={{position:"absolute",bottom:-8,right:-8,width:30,height:30,background:"#8b0000",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",color:"#ffd700",fontSize:11,fontWeight:700,transform:"rotate(-8deg)",boxShadow:"2px 2px 4px rgba(0,0,0,.3)"}}>武</div>
              <div style={{fontSize:9,color:"#5c3a1e",textAlign:"center",marginTop:12,letterSpacing:2}}>Click for wisdom ↑</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,color:"#8b0000",letterSpacing:".25em",textTransform:"uppercase",marginBottom:4,fontFamily:"SERIF"}}>武士 — Samurai Developer</div>
              <h1 style={{fontFamily:"SERIF",fontWeight:800,fontSize:24,color:"#1a0a00",marginBottom:6,letterSpacing:-0.5,lineHeight:1.1}}>{p.name||"侍"}</h1>
              {p.bio&&<p style={{fontSize:13,color:"#5c3a1e",lineHeight:1.7,marginBottom:10,fontStyle:"italic"}}>「{p.bio}」</p>}
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {p.location&&<span style={{background:"#8b000011",border:"1px solid #8b000044",borderRadius:2,padding:"3px 10px",fontSize:11,color:"#8b0000",letterSpacing:1}}>📍 {p.location}</span>}
                {p.profileVisits>0&&<span style={{background:"#8b000011",border:"1px solid #8b000044",borderRadius:2,padding:"3px 10px",fontSize:11,color:"#5c3a1e"}}>👁 {p.profileVisits} 訪問</span>}
                <span style={{background:"#ffd70022",border:"1px solid #ffd70066",borderRadius:2,padding:"3px 10px",fontSize:11,color:"#8b6914",fontWeight:700}}>⚔️ 武士道 RANK {Math.floor((stats?.leetcodeSolved||0)/50)+1}</span>
              </div>
            </div>
          </div>

          {/* katana divider */}
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 14px"}}>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#8b0000,transparent)"}}/>
            <span style={{color:"#8b0000",fontSize:16}}>⚔️</span>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#8b0000,transparent)"}}/>
          </div>

          {/* bushido quote */}
          <div style={{textAlign:"center",color:"#5c3a1e",fontSize:11,fontStyle:"italic",letterSpacing:1}}>
            「武士道とは死ぬことと見つけたり」
          </div>
        </div>

        {/* ── Samurai Skills (Tech Stack) ── */}
        {p.showTechStack!==false&&p.techStack?.length>0&&(
          <div style={{background:"rgba(255,252,245,0.96)",border:"2px solid #8b0000",borderRadius:4,padding:22,marginBottom:20,boxShadow:"4px 4px 0 #8b000022"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
              <span style={{color:"#8b0000",fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase"}}>⚔ 武芸 — Samurai Skills</span>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
              {p.techStack.map((t,i)=>{
                const ranks=["初段","二段","三段","四段","五段","六段","七段","八段","九段","十段"];
                const rank=ranks[i%ranks.length];
                return(
                  <div key={t} style={{background:"#2d1a00",border:"2px solid #ffd700",borderRadius:3,padding:"6px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"none",transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px #8b000044";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#ffd700",letterSpacing:1}}>{t}</span>
                    <span style={{fontSize:8,color:"#8b6914",letterSpacing:1}}>{rank}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Battle Records (Coding Stats) ── */}
        {p.showCodingStats!==false&&stats&&(
          <div style={{background:"rgba(255,252,245,0.96)",border:"2px solid #8b0000",borderRadius:4,padding:22,marginBottom:20,boxShadow:"4px 4px 0 #8b000022"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
              <span style={{color:"#8b0000",fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase"}}>🏯 戦績 — Battle Records</span>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {lb:"LeetCode 斬り",v:stats.leetcodeSolved,ic:"⚔️",c:"#8b0000",desc:"Enemies slain"},
                {lb:"CF Rating 力",v:stats.codeforcesRating,ic:"🏯",c:"#b45309",desc:"Battle power"},
                {lb:"CF Rank 位",v:stats.codeforcesRank,ic:"🥷",c:"#166534",desc:"Warrior rank"},
              ].filter(s=>s.v!=null).map(s=>(
                <div key={s.lb} style={{background:"#2d1a00",border:"2px solid #ffd70055",borderRadius:3,padding:"14px 10px",textAlign:"center",transition:"all .15s",cursor:"none"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#ffd700";e.currentTarget.style.boxShadow="0 0 12px #ffd70033";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#ffd70055";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{fontSize:22,marginBottom:4}}>{s.ic}</div>
                  <div style={{fontFamily:"SERIF",fontWeight:800,fontSize:20,color:"#ffd700"}}>{s.v}</div>
                  <div style={{fontSize:9,color:"#8b6914",marginTop:3,letterSpacing:1}}>{s.lb}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dojo Network (Social Links) ── */}
        {p.showSocialLinks!==false&&socials.length>0&&(
          <div style={{background:"rgba(255,252,245,0.96)",border:"2px solid #8b0000",borderRadius:4,padding:22,marginBottom:20,boxShadow:"4px 4px 0 #8b000022"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
              <span style={{color:"#8b0000",fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase"}}>⛩ 道場 — Dojo Network</span>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {socials.map(lk=>(
                <a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer"
                  style={{display:"flex",alignItems:"center",gap:8,background:"#2d1a00",border:"2px solid #8b000066",borderRadius:3,padding:"9px 16px",textDecoration:"none",color:"#ffd700",fontSize:12,fontWeight:700,letterSpacing:1,cursor:"none",transition:"all .15s",position:"relative",overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#ffd700";e.currentTarget.style.background="#3d2a00";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#8b000066";e.currentTarget.style.background="#2d1a00";e.currentTarget.style.transform="none";}}>
                  <span style={{fontSize:16}}>{lk.ic}</span>
                  <span>{lk.lb}</span>
                  <span style={{fontSize:9,color:"#8b6914",marginLeft:4}}>⛩</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Katana Missions (Projects) ── */}
        {p.showProjects!==false&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
              <span style={{color:"#8b0000",fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase"}}>🗡️ 任務 — Katana Missions</span>
              <div style={{flex:1,height:1,background:"#8b000033"}}/>
            </div>
            {projects.length===0
              ?<div style={{textAlign:"center",padding:24,background:"rgba(255,252,245,0.96)",border:"2px solid #8b000044",borderRadius:4,color:"#5c3a1e",fontSize:12,fontStyle:"italic"}}>「任務なし — No missions yet」</div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
                {projects.map((pr,i)=>(
                  <div key={pr.id}
                    style={{background:"rgba(255,252,245,0.96)",border:"2px solid #8b0000",borderRadius:3,overflow:"hidden",cursor:"none",position:"relative",transition:"all .15s",boxShadow:"3px 3px 0 #8b000022"}}
                    onMouseEnter={e=>{setSlashProj(pr.id);e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="5px 5px 0 #8b000044";}}
                    onMouseLeave={e=>{setSlashProj(null);e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="3px 3px 0 #8b000022";}}>
                    {/* slash animation overlay */}
                    {slashProj===pr.id&&(
                      <div style={{position:"absolute",inset:0,zIndex:10,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{fontSize:48,animation:"float .3s ease",transform:"rotate(45deg)",opacity:.3,color:"#8b0000"}}>⚔️</div>
                      </div>
                    )}
                    {/* rank banner */}
                    <div style={{background:"#8b0000",padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:9,fontWeight:800,color:"#ffd700",letterSpacing:2}}>任務 {String(i+1).padStart(2,"0")}</span>
                      <span style={{fontSize:10,color:"#ffd70099"}}>⭐{pr.stars||0}</span>
                    </div>
                    {pr.image&&<img src={pr.image} alt={pr.name} style={{width:"100%",height:90,objectFit:"cover",filter:"sepia(30%)"}} onError={e=>e.target.style.display="none"}/>}
                    <div style={{padding:"11px 13px"}}>
                      <div style={{fontFamily:"SERIF",fontWeight:700,fontSize:13,color:"#1a0a00",marginBottom:4}}>{pr.name}</div>
                      {pr.description&&<p style={{fontSize:11,color:"#5c3a1e",lineHeight:1.5,marginBottom:7,fontStyle:"italic",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pr.description}</p>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        {pr.language&&<span style={{background:"#2d1a00",color:"#ffd700",borderRadius:2,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:1}}>{pr.language}</span>}
                        {pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#8b0000",textDecoration:"none",fontWeight:700,cursor:"none"}}>見る 🗡️</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ── Footer scroll ── */}
        <div style={{textAlign:"center",marginTop:36,paddingTop:20,borderTop:"2px solid #8b000033",position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{flex:1,height:1,background:"#8b000033"}}/>
            <span style={{color:"#8b0000",fontSize:14}}>⚔️</span>
            <div style={{flex:1,height:1,background:"#8b000033"}}/>
          </div>
          <div style={{fontFamily:"SERIF",fontWeight:700,fontSize:14,color:"#8b0000",marginBottom:4,letterSpacing:2}}>⚜ DevFolio ⚜</div>
          <div style={{fontSize:10,color:"#5c3a1e",marginBottom:12,fontStyle:"italic",letterSpacing:1}}>「一期一会」— Treasure every encounter</div>
          <button onClick={()=>go("login")} style={{background:"#8b0000",border:"2px solid #ffd700",borderRadius:3,padding:"9px 24px",cursor:"none",color:"#ffd700",fontFamily:"SERIF",fontSize:12,fontWeight:700,letterSpacing:2,boxShadow:"3px 3px 0 #2d1a00"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#dc2626";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#8b0000";}}>
            汝の道場を建てよ →
          </button>
          <div style={{marginTop:16,fontSize:9,color:"#8b000066",letterSpacing:2}}>
            🗡️ Hover projects for sword slash &nbsp;|&nbsp; Click avatar for wisdom &nbsp;|&nbsp; Click card for more petals 🌸
          </div>
        </div>
      </div>
    </div>
  );
}

function Portfolio({go, slug, loggedIn=false}){
    const DEMO_SLUG = (slug && slug !== "demo") ? slug : "aryan-m42";
  const [profile,setProfile]=useState(null);
  const [projects,setProjects]=useState([]);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [statsLoading,setStatsLoading]=useState(false);
  const [error,setError]=useState(null);
  const [copied,setCopied]=useState(false);
  const hasLoadedRef=useRef(false);

  const load=useCallback(async()=>{
    setLoading(true); setError(null);
    try{
      const p=await api.getPublicProfile(DEMO_SLUG);
      setProfile(p);
      const projs=await api.getPublicProjects(DEMO_SLUG).catch(()=>[]);
      setProjects(projs);
      setStatsLoading(true);
      api.getCodingStats(DEMO_SLUG).then(s=>setStats(s)).catch(()=>setStats(null)).finally(()=>setStatsLoading(false));
    }catch(e){
      setError(e.message==="PRIVATE"?"PRIVATE":"Could not load profile.");
    }finally{ setLoading(false); }
  },[DEMO_SLUG]);

  useEffect(()=>{
    if(!hasLoadedRef.current){
      hasLoadedRef.current=true;
      load();
    }
  },[load]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:T.cream}}>
      <div style={{display:"flex",justifyContent:"space-between",padding:"13px 22px",borderBottom:`1px solid ${T.fog}`}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>go(loggedIn?"dashboard":"landing")}>← Back</button>
        <Skel h={18} w={130} r={9}/>
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"44px 22px"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div className="skel" style={{width:80,height:80,borderRadius:"50%",margin:"0 auto 14px"}}/>
          <Skel h={22} w={160} r={8}/>
        </div>
        {[1,2,3].map(i=><div key={i} style={{marginBottom:11}}><Skel h={66} r={16}/></div>)}
      </div>
    </div>
  );

  if(error==="PRIVATE") return(
    <div style={{minHeight:"100vh",background:T.cream,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <button className="btn btn-ghost btn-sm" style={{position:"fixed",top:18,left:18}} onClick={()=>go(loggedIn?"dashboard":"landing")}>← Back</button>
      <div style={{textAlign:"center"}}><div style={{fontSize:60,marginBottom:14}}>🔒</div>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,marginBottom:7}}>Profile is private</div>
        <div style={{fontSize:13,color:T.subtle}}>This developer hasn't made their profile public yet.</div>
      </div>
    </div>
  );
  if(error) return(
    <div style={{minHeight:"100vh",background:T.cream,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <button className="btn btn-ghost btn-sm" style={{position:"fixed",top:18,left:18}} onClick={()=>go(loggedIn?"dashboard":"landing")}>← Back</button>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>😵</div>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,marginBottom:7}}>Something went wrong</div>
        <div style={{fontSize:12,color:T.subtle,marginBottom:16}}>{error}</div>
        <button className="btn btn-coral" onClick={load}>Retry</button>
      </div>
    </div>
  );

  const p=profile||{};

  const THEMES={
    "Terminal Dark":{bg:"#0D1117",nav:"#0D1117",navBorder:"#30363D",card:"#161B22",border:"#30363D",text:"#E6EDF3",subtle:"#8B949E",accent:"#58A6FF",tagBg:"#21262D",tagText:"#58A6FF",statBg:"#161B22",statText:"#E6EDF3",linkBg:"#161B22",linkText:"#E6EDF3",footerBorder:"#21262D",font:"'Fira Code',monospace",badge:"#1F6FEB22",badgeText:"#58A6FF"},
    "Clean Minimal":{bg:"#FAFAFA",nav:"#fff",navBorder:"#E5E7EB",card:"#fff",border:"#E5E7EB",text:"#111827",subtle:"#6B7280",accent:"#111827",tagBg:"#F3F4F6",tagText:"#374151",statBg:"#F9FAFB",statText:"#111827",linkBg:"#F3F4F6",linkText:"#111827",footerBorder:"#E5E7EB",font:"'Inter',sans-serif",badge:"#11182711",badgeText:"#374151"},
    "Ocean Blue":{bg:"#0A1628",nav:"#0A1628",navBorder:"#1E3A5F",card:"#0F2040",border:"#1E3A5F",text:"#E0F0FF",subtle:"#7BA7CC",accent:"#4FC3F7",tagBg:"#0F2040",tagText:"#4FC3F7",statBg:"#0F2040",statText:"#E0F0FF",linkBg:"#0F2040",linkText:"#E0F0FF",footerBorder:"#1E3A5F",font:"'DM Sans',sans-serif",badge:"#1565C033",badgeText:"#4FC3F7"},
    "Glassmorphism":{bg:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",nav:"rgba(255,255,255,0.05)",navBorder:"rgba(255,255,255,0.1)",card:"rgba(255,255,255,0.07)",border:"rgba(255,255,255,0.15)",text:"#fff",subtle:"rgba(255,255,255,0.6)",accent:"#a78bfa",tagBg:"rgba(255,255,255,0.1)",tagText:"#e9d5ff",statBg:"rgba(255,255,255,0.07)",statText:"#fff",linkBg:"rgba(255,255,255,0.08)",linkText:"#fff",footerBorder:"rgba(255,255,255,0.1)",font:"'DM Sans',sans-serif",badge:"rgba(167,139,250,0.2)",badgeText:"#e9d5ff",glass:true},
    "Cyberpunk":{bg:"#0A0014",nav:"#0A0014",navBorder:"#FF00FF33",card:"#13001F",border:"#FF00FF44",text:"#00FFFF",subtle:"#FF00AA99",accent:"#FF00FF",tagBg:"#1A0028",tagText:"#FF00FF",statBg:"#13001F",statText:"#00FFFF",linkBg:"#13001F",linkText:"#00FFFF",footerBorder:"#FF00FF33",font:"'Fira Code',monospace",badge:"#FF00FF22",badgeText:"#FF00FF",neon:true},
    "Aurora":{bg:"#0F172A",nav:"#0F172A",navBorder:"#1E293B",card:"#1E293B",border:"#334155",text:"#F1F5F9",subtle:"#94A3B8",accent:"#34D399",tagBg:"#1E293B",tagText:"#34D399",statBg:"#1E293B",statText:"#F1F5F9",linkBg:"#1E293B",linkText:"#F1F5F9",footerBorder:"#334155",font:"'DM Sans',sans-serif",badge:"#064E3B44",badgeText:"#34D399"},
    "Pokémon":{bg:"linear-gradient(180deg,#87CEEB 0%,#98D8C8 60%,#7EC8A0 100%)",nav:"rgba(255,255,255,0.9)",navBorder:"#ef4444",card:"#fff",border:"#3b82f6",text:"#1e3a5f",subtle:"#64748b",accent:"#ef4444",tagBg:"#dbeafe",tagText:"#1d4ed8",statBg:"#fff",statText:"#1e3a5f",linkBg:"#fff",linkText:"#1e3a5f",footerBorder:"#bfdbfe",font:"'Poppins',sans-serif",badge:"#fef3c7",badgeText:"#92400e",pokemon:true},
    "Game Console":{bg:"#8BAC0F",nav:"#306230",navBorder:"#0f380f",card:"#306230",border:"#0f380f",text:"#0f380f",subtle:"#306230",accent:"#0f380f",tagBg:"#8BAC0F",tagText:"#0f380f",statBg:"#8BAC0F",statText:"#0f380f",linkBg:"#306230",linkText:"#8BAC0F",footerBorder:"#0f380f",font:"'VT323',monospace",badge:"#0f380f",badgeText:"#8BAC0F",gameboy:true},
    "GitHub":{bg:"#0d1117",nav:"#161b22",navBorder:"#30363d",card:"#161b22",border:"#30363d",text:"#e6edf3",subtle:"#8b949e",accent:"#238636",tagBg:"#238636",tagText:"#ffffff",statBg:"#0d1117",statText:"#e6edf3",linkBg:"#161b22",linkText:"#58a6ff",footerBorder:"#21262d",font:"'Inter',sans-serif",badge:"#23863622",badgeText:"#238636",github:true},
    "Terminal":{bg:"#020617",nav:"#0f172a",navBorder:"#1e293b",card:"#0f172a",border:"#1e293b",text:"#22c55e",subtle:"#475569",accent:"#22c55e",tagBg:"#022c22",tagText:"#22c55e",statBg:"#0f172a",statText:"#22c55e",linkBg:"#0f172a",linkText:"#38bdf8",footerBorder:"#1e293b",font:"'JetBrains Mono',monospace",badge:"#02471722",badgeText:"#22c55e",terminal:true},
    "Samurai":{bg:"#f5f0e8",nav:"rgba(245,240,232,0.97)",navBorder:"#8b0000",card:"rgba(255,252,245,0.95)",border:"#8b000044",text:"#1a0a00",subtle:"#5c3a1e",accent:"#8b0000",tagBg:"#2d1a00",tagText:"#ffd700",statBg:"rgba(255,252,245,0.9)",statText:"#1a0a00",linkBg:"rgba(255,252,245,0.9)",linkText:"#8b0000",footerBorder:"#8b000033",font:"serif",badge:"#8b000022",badgeText:"#8b0000",samurai:true},
    "Ghibli":{bg:"linear-gradient(180deg,#dbeafe 0%,#dcfce7 60%,#a7f3d0 100%)",nav:"rgba(255,255,255,0.8)",navBorder:"#86efac",card:"rgba(255,255,255,0.9)",border:"#86efac",text:"#14532d",subtle:"#166534",accent:"#34d399",tagBg:"rgba(167,243,208,0.5)",tagText:"#166534",statBg:"rgba(255,255,255,0.7)",statText:"#14532d",linkBg:"rgba(255,255,255,0.7)",linkText:"#166534",footerBorder:"#86efac",font:"Georgia,serif",badge:"rgba(167,243,208,0.6)",badgeText:"#166534",ghibli:true},
    "F1 Racing":{bg:"#0A0A0A",panel:"#141414",red:"#FF1801",yellow:"#FFD500",green:"#00FF9C",nav:"#0A0A0A",navBorder:"#1A1A1A",card:"#141414",border:"#1A1A1A",text:"#F5F5F5",subtle:"#888888",accent:"#FF1801",darkGray:"#1A1A1A",accentRed:"#D10000",font:"'Rajdhani',sans-serif",f1:true},
  };
  const TH=THEMES[p.theme]||THEMES["Clean Minimal"];

  const socials=[
    p.github&&{ic:"🐙",lb:"GitHub",sub:(p.github||"").replace("https://github.com/",""),url:`https://github.com/${(p.github||"").replace("https://github.com/","")}`,bg:TH.linkBg,col:TH.linkText},
    p.linkedin&&{ic:"💼",lb:"LinkedIn",sub:(p.linkedin||"").replace(/https?:\/\/(www\.)?linkedin\.com\/in\//,""),url:p.linkedin,bg:"#0077B5",col:"#fff"},
    p.leetcode&&{ic:"🏆",lb:"LeetCode",sub:p.leetcode,url:`https://leetcode.com/u/${p.leetcode}`,bg:TH.linkBg,col:TH.linkText},
    p.portfolio&&{ic:"🌐",lb:"Portfolio",sub:(p.portfolio||"").replace(/https?:\/\//,""),url:p.portfolio,bg:TH.linkBg,col:TH.linkText},
  ].filter(Boolean);

  const NavBar = ({children, style={}}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",position:"sticky",top:0,zIndex:50,...style}}>
      <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:`1.5px solid ${TH.accent}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",color:TH.accent,fontFamily:TH.font,fontSize:12,fontWeight:600}}>← Back</button>
      <span style={{fontSize:11,color:TH.subtle,fontWeight:600}}>devfolio.app/u/{DEMO_SLUG}</span>
      <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:TH.accent,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#fff",fontFamily:TH.font,fontSize:12,fontWeight:600}}>{copied?"✓":"Copy"}</button>
      {children}
    </div>
  );

  // ── Pokémon ──
  if(TH.pokemon) return(
    <div style={{minHeight:"100vh",background:TH.bg,fontFamily:TH.font,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {["10%,5%","85%,8%","5%,40%","90%,35%","15%,75%","80%,70%"].map((pos,i)=>(
          <div key={i} style={{position:"absolute",left:pos.split(",")[0],top:pos.split(",")[1],fontSize:i%2===0?28:18,opacity:.1,animation:`float ${3+i*.5}s ease-in-out infinite`,animationDelay:`${i*.4}s`}}>⚪</div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",background:"rgba(255,255,255,0.92)",borderBottom:"3px solid #ef4444",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(10px)"}}>
        <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:"2px solid #ef4444",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#ef4444",fontFamily:TH.font,fontSize:11,fontWeight:700}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:5}}><span>🎮</span><span style={{fontWeight:800,fontSize:11,color:"#1e3a5f"}}>devfolio.app/u/{DEMO_SLUG}</span></div>
        <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"#ef4444",border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#fff",fontFamily:TH.font,fontSize:11,fontWeight:700}}>{copied?"✓ Got it!":"Copy"}</button>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 16px 80px",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",border:"4px solid #1e3a5f",borderRadius:20,padding:22,marginBottom:18,boxShadow:"6px 6px 0 #1e3a5f",position:"relative",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(90deg,#ef4444,#3b82f6)",height:5,borderRadius:3,marginBottom:14}}/>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div style={{position:"relative"}}>
              <div style={{width:86,height:86,borderRadius:"50%",border:"4px solid #facc15",boxShadow:"0 0 0 4px #ef4444",overflow:"hidden"}}><Avatar name={p.name} size={86} imageUrl={p.photoUrl}/></div>
              <div style={{position:"absolute",bottom:-4,right:-4,background:"#facc15",border:"2px solid #1e3a5f",borderRadius:999,padding:"2px 6px",fontSize:9,fontWeight:800,color:"#1e3a5f"}}>LV{Math.floor((stats?.leetcodeSolved||0)/10)+1}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,fontWeight:700,color:"#ef4444",letterSpacing:".15em",textTransform:"uppercase"}}>TRAINER NAME:</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:20,color:"#ef4444",lineHeight:1.1}}>{p.name||"Developer"}</div>
              <div style={{fontSize:11,color:"#3b82f6",fontWeight:600,marginTop:2}}>{p.bio||"Web Developer"}{p.location?` | ${p.location}`:""}</div>
              <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                <span style={{background:"#fef3c7",border:"2px solid #f59e0b",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#92400e"}}>⭐ TRAINER</span>
                {p.profileVisits>0&&<span style={{background:"#dbeafe",border:"2px solid #3b82f6",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#1d4ed8"}}>👁{p.profileVisits}</span>}
              </div>
            </div>
          </div>
          {stats&&<div style={{marginTop:14,background:"#f1f5f9",borderRadius:8,padding:"10px 12px",border:"2px solid #e2e8f0"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,fontWeight:700,color:"#64748b",marginBottom:3}}><span>HP</span><span>{Math.min((stats.leetcodeSolved||0)*2,200)}/200</span></div>
            <div style={{background:"#e2e8f0",borderRadius:3,height:7,marginBottom:5}}><div style={{background:"linear-gradient(90deg,#22c55e,#16a34a)",height:"100%",borderRadius:3,width:`${Math.min((stats.leetcodeSolved||0)/100*100,100)}%`,transition:"width 1s"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,fontWeight:700,color:"#64748b",marginBottom:3}}><span>XP</span><span>{stats.codeforcesRating||0}/3000</span></div>
            <div style={{background:"#e2e8f0",borderRadius:3,height:7}}><div style={{background:"linear-gradient(90deg,#3b82f6,#1d4ed8)",height:"100%",borderRadius:3,width:`${Math.min((stats.codeforcesRating||0)/3000*100,100)}%`,transition:"width 1s"}}/></div>
          </div>}
        </div>
        {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{background:"#fff",border:"4px solid #1e3a5f",borderRadius:20,padding:18,marginBottom:18,boxShadow:"6px 6px 0 #1e3a5f"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><span>⭐</span><span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12,color:"#1e3a5f",textTransform:"uppercase"}}>Badge Collection</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{p.techStack.map((t,i)=>{const c=["#ef4444","#3b82f6","#22c55e","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316"][i%8];return(<div key={t} style={{background:c+"22",border:`2px solid ${c}`,borderRadius:10,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:c}}/><span style={{fontSize:12,fontWeight:700,color:c}}>{t}</span></div>);})}</div>
        </div>}
        {p.showSocialLinks!==false&&socials.length>0&&<div style={{background:"#fff",border:"4px solid #1e3a5f",borderRadius:20,padding:18,marginBottom:18,boxShadow:"6px 6px 0 #1e3a5f"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><span>📡</span><span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12,color:"#1e3a5f",textTransform:"uppercase"}}>Contact Trainer</span></div>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>{socials.map(lk=>(<a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"2px solid #1e3a5f",borderRadius:10,padding:"7px 13px",textDecoration:"none",color:"#1e3a5f",fontWeight:600,fontSize:12,boxShadow:"2px 2px 0 #1e3a5f",transition:"all .12s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="4px 4px 0 #1e3a5f"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="2px 2px 0 #1e3a5f"}}><span>{lk.ic}</span>{lk.lb}</a>))}</div>
        </div>}
        {p.showCodingStats!==false&&stats&&<div style={{background:"#fff",border:"4px solid #1e3a5f",borderRadius:20,padding:18,marginBottom:18,boxShadow:"6px 6px 0 #1e3a5f"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><span>⚔️</span><span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12,color:"#1e3a5f",textTransform:"uppercase"}}>Battle Stats</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>{[{lb:"LeetCode",v:stats.leetcodeSolved,ic:"🏆",c:"#ef4444"},{lb:"CF Rating",v:stats.codeforcesRating,ic:"⚡",c:"#3b82f6"},{lb:"CF Rank",v:stats.codeforcesRank,ic:"🥇",c:"#f59e0b"}].filter(s=>s.v!=null).map(s=>(<div key={s.lb} style={{background:s.c+"11",border:`2px solid ${s.c}`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:18,marginBottom:3}}>{s.ic}</div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:17,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#64748b",fontWeight:600,textTransform:"uppercase"}}>{s.lb}</div></div>))}</div>
        </div>}
        {p.showProjects!==false&&<div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><span>🗺️</span><span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12,color:"#1e3a5f",textTransform:"uppercase"}}>Adventures ({projects.length})</span></div>
          {projects.length===0?<div style={{textAlign:"center",padding:20,background:"#fff",border:"4px solid #1e3a5f",borderRadius:20,boxShadow:"6px 6px 0 #1e3a5f",color:"#64748b",fontSize:12}}>No adventures yet!</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>{projects.map((pr,i)=>{const cc=["#ef4444","#3b82f6","#22c55e","#8b5cf6"][i%4];return(<div key={pr.id} style={{background:"#fff",border:`3px solid ${cc}`,borderRadius:14,overflow:"hidden",boxShadow:`3px 3px 0 ${cc}`,transition:"all .12s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`5px 5px 0 ${cc}`}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`3px 3px 0 ${cc}`}}><div style={{background:cc,padding:"5px 9px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,fontWeight:800,color:"#fff",textTransform:"uppercase"}}>{pr.language||"Code"}</span><span style={{fontSize:10,color:"#fff"}}>⭐{pr.stars||0}</span></div>{pr.image&&<img src={pr.image} alt={pr.name} style={{width:"100%",height:90,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}<div style={{padding:"9px 10px"}}><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:12,color:"#1e3a5f",marginBottom:3}}>{pr.name}</div>{pr.description&&<p style={{fontSize:10,color:"#64748b",lineHeight:1.4,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pr.description}</p>}{pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{fontSize:10,fontWeight:700,color:cc,textDecoration:"none"}}>View →</a>}</div></div>);})}</div>}
        </div>}
        <div style={{textAlign:"center",marginTop:28,paddingTop:16,borderTop:"3px dashed #bfdbfe"}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:13,color:"#1e3a5f",display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}><span>🎮</span>DevFolio</div>
          <button onClick={()=>go("login")} style={{marginTop:9,background:"#ef4444",border:"3px solid #1e3a5f",borderRadius:9,padding:"7px 18px",cursor:"pointer",color:"#fff",fontFamily:TH.font,fontSize:11,fontWeight:700,boxShadow:"3px 3px 0 #1e3a5f"}}>Get yours free →</button>
        </div>
      </div>
    </div>
  );

  // ── Game Boy ──
  if(TH.gameboy) return(
    <div style={{minHeight:"100vh",background:"#1a1a1a",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px 40px",fontFamily:"'VT323',monospace"}}>
      <div style={{width:"100%",maxWidth:460,background:"#2d2d2d",borderRadius:"22px 22px 56px 56px",padding:"0 0 28px",boxShadow:"0 20px 60px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.1)"}}>
        <div style={{background:"#222",borderRadius:"22px 22px 0 0",padding:"9px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #111"}}>
          <span style={{color:"#666",fontSize:11,letterSpacing:2}}>Nintendo GAME BOY</span>
          <div style={{display:"flex",gap:5}}><div style={{width:5,height:5,borderRadius:"50%",background:"#444"}}/><div style={{width:5,height:5,borderRadius:"50%",background:"#444"}}/></div>
        </div>
        <div style={{margin:"14px 18px",background:"#1a1a2e",borderRadius:10,padding:"9px",border:"3px solid #111",boxShadow:"inset 0 4px 12px rgba(0,0,0,.6)"}}>
          <div style={{background:"#306230",padding:"5px 9px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #0f380f"}}>
            <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:"none",color:"#8BAC0F",fontFamily:"'VT323',monospace",fontSize:13,cursor:"pointer",padding:0}}>◀ BACK</button>
            <span style={{color:"#8BAC0F",fontSize:11,letterSpacing:2}}>DEVFOLIO</span>
            <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"none",border:"none",color:"#8BAC0F",fontFamily:"'VT323',monospace",fontSize:11,cursor:"pointer",padding:0}}>{copied?"✓ OK":"COPY"}</button>
          </div>
          <div style={{background:"#8BAC0F",padding:"10px 9px",position:"relative",overflow:"hidden",minHeight:380}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px)",pointerEvents:"none",zIndex:10}}/>
            <div style={{borderBottom:"2px solid #0f380f",paddingBottom:6,marginBottom:8}}><div style={{fontSize:10,color:"#0f380f",letterSpacing:2}}>DEVELOPER PORTFOLIO</div></div>
            <div style={{display:"flex",gap:9,marginBottom:9,alignItems:"flex-start"}}>
              <div style={{flexShrink:0,border:"3px solid #0f380f",padding:2,background:"#306230"}}><div style={{width:52,height:52,overflow:"hidden",border:"1px solid #0f380f"}}><Avatar name={p.name} size={52} imageUrl={p.photoUrl}/></div></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:"#0f380f",letterSpacing:1,marginBottom:1}}>{(p.name||"DEVELOPER").toUpperCase()}</div>
                <div style={{fontSize:12,color:"#306230",marginBottom:3}}>{(p.bio||"FULL-STACK DEV").toUpperCase().slice(0,22)}</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {p.profileVisits>0&&<span style={{background:"#306230",border:"1px solid #0f380f",padding:"1px 5px",fontSize:10,color:"#8BAC0F"}}>👁{p.profileVisits}</span>}
                  <span style={{background:"#306230",border:"1px solid #0f380f",padding:"1px 5px",fontSize:10,color:"#8BAC0F",animation:"gbBlink 1.5s infinite"}}>▶ ONLINE</span>
                </div>
              </div>
            </div>
            {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,color:"#0f380f",letterSpacing:2,marginBottom:3}}>♦ TECH STACK</div><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{p.techStack.map(t=>(<span key={t} style={{background:"#306230",border:"2px solid #0f380f",padding:"1px 7px",fontSize:12,color:"#8BAC0F"}}>{t.toUpperCase()}</span>))}</div></div>}
            {p.showCodingStats!==false&&stats&&<div style={{marginBottom:8}}><div style={{fontSize:10,color:"#0f380f",letterSpacing:2,marginBottom:3}}>♦ STATS</div><div style={{display:"flex",gap:5}}>{[{lb:"LC",v:stats.leetcodeSolved},{lb:"CF",v:stats.codeforcesRating},{lb:"RK",v:stats.codeforcesRank}].filter(s=>s.v!=null).map(s=>(<div key={s.lb} style={{background:"#306230",border:"2px solid #0f380f",padding:"3px 7px",flex:1,textAlign:"center"}}><div style={{fontSize:10,color:"#0f380f",letterSpacing:1}}>{s.lb}</div><div style={{fontSize:14,color:"#0f380f",fontWeight:"bold"}}>{typeof s.v==="string"?s.v.toUpperCase().slice(0,6):s.v}</div></div>))}</div></div>}
            {p.showSocialLinks!==false&&socials.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,color:"#0f380f",letterSpacing:2,marginBottom:3}}>♦ LINKS</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{socials.map(lk=>(<a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer" style={{background:"#306230",border:"2px solid #0f380f",padding:"1px 7px",fontSize:12,color:"#8BAC0F",textDecoration:"none",display:"flex",alignItems:"center",gap:3}}>{lk.ic}<span>{lk.lb.toUpperCase()}</span></a>))}</div></div>}
            {p.showProjects!==false&&projects.length>0&&<div><div style={{fontSize:10,color:"#0f380f",letterSpacing:2,marginBottom:5}}>♦ PROJECTS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{projects.map(pr=>(<div key={pr.id} style={{background:"#306230",border:"2px solid #0f380f",padding:5,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#0f380f"} onMouseLeave={e=>e.currentTarget.style.background="#306230"}><div style={{fontSize:10,color:"#0f380f",background:"#8BAC0F",padding:"1px 3px",display:"inline-block",marginBottom:1}}>VT323</div><div style={{fontSize:12,color:"#8BAC0F",lineHeight:1.1}}>{pr.name.toUpperCase().slice(0,13)}</div><div style={{fontSize:10,color:"#8BAC0F",background:"#0f380f22",padding:"0 3px",display:"inline-block",marginTop:2}}>{(pr.language||"CODE").toUpperCase()}</div>{pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"block",fontSize:10,color:"#8BAC0F",textDecoration:"none"}}>▶ VIEW</a>}</div>))}</div></div>}
            <div style={{marginTop:7,fontSize:13,color:"#0f380f",animation:"gbBlink 1s infinite"}}>█</div>
          </div>
        </div>
        <div style={{padding:"0 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{position:"relative",width:60,height:60}}><div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:18,height:18,background:"#1a1a1a",borderRadius:3}}/><div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:18,height:18,background:"#1a1a1a",borderRadius:3}}/><div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:18,height:18,background:"#1a1a1a",borderRadius:3}}/><div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:18,height:18,background:"#1a1a1a",borderRadius:3}}/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:18,height:18,background:"#1a1a1a"}}/></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}><div style={{display:"flex",gap:9}}><button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"#444",border:"none",borderRadius:7,padding:"3px 9px",color:"#999",fontSize:9,fontFamily:"'VT323',monospace",cursor:"pointer",letterSpacing:1}}>SELECT</button><button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"#444",border:"none",borderRadius:7,padding:"3px 9px",color:"#999",fontSize:9,fontFamily:"'VT323',monospace",cursor:"pointer",letterSpacing:1}}>START</button></div></div>
          <div style={{position:"relative",width:60,height:60}}><div style={{position:"absolute",right:0,top:"28%",width:20,height:20,borderRadius:"50%",background:"#8B2252",boxShadow:"0 3px 5px rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontFamily:"'VT323',monospace",cursor:"pointer"}} onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}}>A</div><div style={{position:"absolute",left:0,bottom:"18%",width:20,height:20,borderRadius:"50%",background:"#8B2252",boxShadow:"0 3px 5px rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontFamily:"'VT323',monospace",cursor:"pointer"}} onClick={()=>go(loggedIn?"dashboard":"landing")}>B</div></div>
        </div>
        <div style={{textAlign:"center",marginTop:10,paddingTop:7,borderTop:"1px solid #444"}}><div style={{fontSize:9,color:"#555",fontFamily:"'VT323',monospace",letterSpacing:2}}>Nintendo GAME BOY • DevFolio</div></div>
      </div>
    </div>
  );

  // ── GitHub style ──
  if(TH.github) return(
    <div style={{minHeight:"100vh",background:TH.bg,fontFamily:"'Inter',sans-serif",color:TH.text}}>
      <div style={{background:TH.nav,borderBottom:`1px solid ${TH.navBorder}`,padding:"12px 20px",position:"sticky",top:0,zIndex:50,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:`1px solid ${TH.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",color:TH.text,fontFamily:"'Inter',sans-serif",fontSize:12}}>← Back</button>
        <span style={{fontSize:11,color:TH.subtle,fontFamily:"'JetBrains Mono',monospace"}}>devfolio.app/u/{DEMO_SLUG}</span>
        <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:TH.accent,border:"none",borderRadius:6,padding:"5px 12px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:600}}>{copied?"✓ Copied":"Copy link"}</button>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px 80px",display:"grid",gridTemplateColumns:"260px 1fr",gap:24}}>
        {/* left sidebar */}
        <div>
          <div style={{marginBottom:16,position:"relative",display:"inline-block"}}>
            <Avatar name={p.name} size={200} imageUrl={p.photoUrl}/>
          </div>
          <h1 style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:22,marginBottom:2,color:TH.text}}>{p.name||"Developer"}</h1>
          {p.bio&&<p style={{fontSize:13,color:TH.subtle,lineHeight:1.5,marginBottom:12}}>{p.bio}</p>}
          {p.location&&<div style={{fontSize:12,color:TH.subtle,marginBottom:8}}>📍 {p.location}</div>}
          {p.profileVisits>0&&<div style={{fontSize:12,color:TH.subtle,marginBottom:14}}>👁 {p.profileVisits} profile visits</div>}
          {p.showSocialLinks!==false&&socials.length>0&&<div style={{borderTop:`1px solid ${TH.border}`,paddingTop:14,marginTop:4}}>
            {socials.map(lk=>(<a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:8,color:TH.text,textDecoration:"none",fontSize:12,marginBottom:8,transition:"color .1s"}} onMouseEnter={e=>e.currentTarget.style.color=TH.accent} onMouseLeave={e=>e.currentTarget.style.color=TH.text}><span>{lk.ic}</span><span>{lk.sub||lk.lb}</span></a>))}
          </div>}
        </div>
        {/* right content */}
        <div>
          {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{marginBottom:22}}>
            <h3 style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>Tech Stack</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{p.techStack.map(t=>(<span key={t} style={{background:TH.tagBg,color:TH.tagText,borderRadius:999,padding:"4px 12px",fontSize:12,fontWeight:600}}>{t}</span>))}</div>
          </div>}
          {p.showCodingStats!==false&&stats&&<div style={{marginBottom:22}}>
            <h3 style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>Coding Stats</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[{lb:"LeetCode Solved",v:stats.leetcodeSolved,c:"#f97316"},{lb:"CF Rating",v:stats.codeforcesRating,c:TH.accent},{lb:"CF Rank",v:stats.codeforcesRank,c:"#58a6ff"}].filter(s=>s.v!=null).map(s=>(<div key={s.lb} style={{background:TH.statBg,border:`1px solid ${TH.border}`,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:20,fontWeight:700,color:s.c,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div><div style={{fontSize:10,color:TH.subtle,marginTop:3}}>{s.lb}</div></div>))}</div>
          </div>}
          {p.showProjects!==false&&<div>
            <h3 style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>Repositories</h3>
            {projects.length===0?<div style={{fontSize:12,color:TH.subtle}}>No repositories yet.</div>
            :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{projects.map(pr=>(<div key={pr.id} style={{background:TH.card,border:`1px solid ${TH.border}`,borderRadius:8,padding:"14px 16px",transition:"border-color .15s,box-shadow .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=TH.accent;e.currentTarget.style.boxShadow=`0 0 0 1px ${TH.accent}22`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=TH.border;e.currentTarget.style.boxShadow="none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <span style={{color:"#58a6ff",fontWeight:600,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{pr.name}</span>
                <div style={{display:"flex",gap:8,fontSize:11,color:TH.subtle}}>
                  {pr.stars>0&&<span>⭐{pr.stars}</span>}{pr.forks>0&&<span>🍴{pr.forks}</span>}
                </div>
              </div>
              {pr.description&&<p style={{fontSize:11,color:TH.subtle,lineHeight:1.5,marginBottom:10}}>{pr.description}</p>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {pr.language&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:TH.subtle}}><div style={{width:10,height:10,borderRadius:"50%",background:LANG_COLORS[pr.language]||TH.subtle}}/>{pr.language}</div>}
                {pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:TH.accent,textDecoration:"none",fontWeight:600}}>View →</a>}
              </div>
            </div>))}</div>}
          </div>}
        </div>
      </div>
    </div>
  );

  // ── Terminal ──
  if(TH.terminal) return(
    <div style={{minHeight:"100vh",background:TH.bg,fontFamily:"'JetBrains Mono',monospace",color:TH.text,padding:"0 0 60px"}}>
      <div style={{background:TH.nav,borderBottom:`1px solid ${TH.navBorder}`,padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",gap:6}}><div style={{width:12,height:12,borderRadius:"50%",background:"#ff5f57",cursor:"pointer"}} onClick={()=>go(loggedIn?"dashboard":"landing")}/><div style={{width:12,height:12,borderRadius:"50%",background:"#febc2e"}}/><div style={{width:12,height:12,borderRadius:"50%",background:"#28c840"}}/></div>
        <span style={{fontSize:11,color:TH.subtle,letterSpacing:1}}>DEV_PROFILE — {DEMO_SLUG}</span>
        <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"none",border:`1px solid ${TH.accent}`,borderRadius:4,padding:"3px 10px",cursor:"pointer",color:TH.accent,fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{copied?"✓ copied":"copy link"}</button>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{color:"#475569",fontSize:12,marginBottom:20,fontFamily:"'JetBrains Mono',monospace"}}>
          <div>Last login: {new Date().toDateString()}</div>
          <div style={{marginTop:4}}>Welcome to DevFolio Terminal v1.0</div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{color:"#475569",fontSize:13,marginBottom:6}}>$ <span style={{color:"#38bdf8"}}>whoami</span></div>
          <div style={{display:"flex",alignItems:"center",gap:14,background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px"}}>
            <div style={{border:`2px solid ${TH.accent}`,borderRadius:4,overflow:"hidden",flexShrink:0}}><Avatar name={p.name} size={52} imageUrl={p.photoUrl}/></div>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:2}}>{p.name||"developer"} <span style={{color:TH.accent,animation:"gbBlink 1s infinite"}}>█</span></div>
              {p.bio&&<div style={{fontSize:12,color:TH.subtle,marginBottom:3}}>{p.bio}</div>}
              {p.location&&<div style={{fontSize:12,color:"#475569"}}>📍 {p.location}</div>}
            </div>
          </div>
        </div>
        {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{marginBottom:18}}>
          <div style={{color:"#475569",fontSize:13,marginBottom:6}}>$ <span style={{color:"#38bdf8"}}>skills</span></div>
          <div style={{background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{p.techStack.map(t=>(<span key={t} style={{background:TH.tagBg,color:TH.tagText,border:`1px solid ${TH.accent}33`,borderRadius:4,padding:"3px 10px",fontSize:12}}>"{t}"</span>))}</div>
          </div>
        </div>}
        {p.showCodingStats!==false&&stats&&<div style={{marginBottom:18}}>
          <div style={{color:"#475569",fontSize:13,marginBottom:6}}>$ <span style={{color:"#38bdf8"}}>stats</span></div>
          <div style={{background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>
            {stats.leetcodeSolved!=null&&<div style={{marginBottom:3}}><span style={{color:"#475569"}}>leetcode_solved: </span><span style={{color:TH.accent,fontWeight:700}}>{stats.leetcodeSolved}</span></div>}
            {stats.codeforcesRating!=null&&<div style={{marginBottom:3}}><span style={{color:"#475569"}}>cf_rating: </span><span style={{color:"#38bdf8",fontWeight:700}}>{stats.codeforcesRating}</span></div>}
            {stats.codeforcesRank&&<div><span style={{color:"#475569"}}>cf_rank: </span><span style={{color:"#a78bfa",fontWeight:700}}>"{stats.codeforcesRank}"</span></div>}
          </div>
        </div>}
        {p.showSocialLinks!==false&&socials.length>0&&<div style={{marginBottom:18}}>
          <div style={{color:"#475569",fontSize:13,marginBottom:6}}>$ <span style={{color:"#38bdf8"}}>contact</span></div>
          <div style={{background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px"}}>
            {socials.map(lk=>(<a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer" style={{display:"block",color:"#38bdf8",textDecoration:"none",fontSize:13,marginBottom:5,transition:"color .1s"}} onMouseEnter={e=>e.currentTarget.style.color=TH.accent} onMouseLeave={e=>e.currentTarget.style.color="#38bdf8"}><span style={{color:"#475569"}}>{lk.ic} </span>{lk.url||lk.sub}</a>))}
          </div>
        </div>}
        {p.showProjects!==false&&<div>
          <div style={{color:"#475569",fontSize:13,marginBottom:6}}>$ <span style={{color:"#38bdf8"}}>projects</span></div>
          {projects.length===0?<div style={{background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px",fontSize:12,color:TH.subtle}}>// no projects found</div>
          :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{projects.map(pr=>(<div key={pr.id} style={{background:TH.nav,border:`1px solid ${TH.border}`,borderRadius:6,padding:"12px 14px",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=TH.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=TH.border}>
            <div style={{color:"#38bdf8",fontWeight:700,fontSize:13,marginBottom:4}}>|&gt; PROJECT: {pr.name.toUpperCase()}</div>
            {pr.description&&<div style={{color:TH.subtle,fontSize:11,marginBottom:5}}>| DESC: {pr.description.slice(0,50)}</div>}
            {pr.language&&<div style={{color:TH.text,fontSize:11,marginBottom:5}}>| STACK: {pr.language}</div>}
            {pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{color:TH.accent,fontSize:11,textDecoration:"underline"}}>| LINK: {pr.repoUrl.replace("https://","")}</a>}
          </div>))}</div>}
        </div>}
        <div style={{marginTop:22,color:"#475569",fontSize:12}}>$ <span style={{color:TH.accent}}>exit</span> <span style={{color:TH.text,animation:"gbBlink 1s infinite"}}>█</span></div>
      </div>
    </div>
  );

  // ── Samurai ──
  if(TH.samurai) return(
    <SamuraiLayout p={p} projects={projects} stats={stats} statsLoading={statsLoading} socials={socials} go={go} loggedIn={loggedIn} DEMO_SLUG={DEMO_SLUG} copied={copied} setCopied={setCopied}/>
  );
  // ── Ghibli ──
  if(TH.ghibli) return(
    <div style={{minHeight:"100vh",background:TH.bg,fontFamily:"Georgia,serif",color:TH.text,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {[..."🍃🍃🍃🍃🍃🍃🍃🍃"].map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${5+i*13}%`,top:"-20px",fontSize:14,opacity:.5,animation:`float ${5+i*.8}s ease-in-out infinite`,animationDelay:`${i*.6}s`}}>🍃</div>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.8)",borderBottom:`2px solid ${TH.navBorder}`,padding:"12px 22px",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(12px)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>go(loggedIn?"dashboard":"landing")} style={{background:"none",border:`1.5px solid ${TH.accent}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",color:TH.accent,fontFamily:"Georgia,serif",fontSize:12}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:7}}><span>🌿</span><span style={{fontSize:11,color:TH.subtle}}>devfolio.app/u/{DEMO_SLUG}</span></div>
        <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:TH.accent,border:"none",borderRadius:20,padding:"5px 14px",cursor:"pointer",color:"#fff",fontFamily:"Georgia,serif",fontSize:12}}>{copied?"✓ Saved!":"Copy link"}</button>
      </div>
      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px",position:"relative",zIndex:1}}>
        <div style={{background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:24,padding:28,marginBottom:22,boxShadow:"0 8px 32px rgba(52,211,153,.12)"}}>
          <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{position:"relative"}}>
              <div style={{width:90,height:90,borderRadius:"50%",border:`4px solid ${TH.accent}`,boxShadow:`0 0 0 8px rgba(167,243,208,.3)`,overflow:"hidden"}}><Avatar name={p.name} size={90} imageUrl={p.photoUrl}/></div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:TH.subtle,letterSpacing:".15em",textTransform:"uppercase",marginBottom:4}}>Developer</div>
              <h1 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:26,color:TH.text,marginBottom:6,letterSpacing:-0.5}}>{p.name||"Developer"}</h1>
              {p.bio&&<p style={{fontSize:13,color:TH.subtle,lineHeight:1.7,marginBottom:10,fontFamily:"'Inter',sans-serif"}}>{p.bio}</p>}
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {p.location&&<span style={{background:"rgba(167,243,208,.4)",border:`1px solid ${TH.border}`,borderRadius:999,padding:"3px 12px",fontSize:11,color:TH.accent,fontFamily:"'Inter',sans-serif"}}>🌿 {p.location}</span>}
                {p.profileVisits>0&&<span style={{background:"rgba(167,243,208,.4)",border:`1px solid ${TH.border}`,borderRadius:999,padding:"3px 12px",fontSize:11,color:TH.subtle,fontFamily:"'Inter',sans-serif"}}>👁 {p.profileVisits} visits</span>}
              </div>
            </div>
          </div>
        </div>
        {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:20,padding:22,marginBottom:18,boxShadow:"0 4px 20px rgba(52,211,153,.08)"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:15,color:TH.accent,marginBottom:12}}>🍃 Tech Stack</h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{p.techStack.map((t,i)=>{const cols=["#34d399","#60a5fa","#facc15","#f472b6","#a78bfa","#fb923c"];const c=cols[i%6];return(<span key={t} style={{background:c+"22",border:`1.5px solid ${c}`,borderRadius:999,padding:"5px 14px",fontSize:12,color:TH.text,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>🍀</span>{t}</span>);})}</div>
        </div>}
        {p.showSocialLinks!==false&&socials.length>0&&<div style={{background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:20,padding:22,marginBottom:18,boxShadow:"0 4px 20px rgba(52,211,153,.08)"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:15,color:TH.accent,marginBottom:12}}>🌿 Connect</h2>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{socials.map(lk=>(<a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,background:"rgba(167,243,208,.2)",border:`1.5px solid ${TH.border}`,borderRadius:12,padding:"8px 14px",textDecoration:"none",color:TH.text,fontSize:12,fontFamily:"'Inter',sans-serif",transition:"all .14s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,243,208,.4)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,243,208,.2)";e.currentTarget.style.transform="none"}}><span>{lk.ic}</span>{lk.lb}</a>))}</div>
        </div>}
        {p.showCodingStats!==false&&stats&&<div style={{background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:20,padding:22,marginBottom:18,boxShadow:"0 4px 20px rgba(52,211,153,.08)"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:15,color:TH.accent,marginBottom:12}}>✨ Skills</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[{lb:"LeetCode",v:stats.leetcodeSolved,c:"#34d399"},{lb:"CF Rating",v:stats.codeforcesRating,c:"#60a5fa"},{lb:"CF Rank",v:stats.codeforcesRank,c:"#facc15"}].filter(s=>s.v!=null).map(s=>(<div key={s.lb} style={{background:s.c+"22",border:`1.5px solid ${s.c}55`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:TH.subtle,marginTop:3,fontFamily:"'Inter',sans-serif"}}>{s.lb}</div></div>))}</div>
        </div>}
        {p.showProjects!==false&&<div>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:15,color:TH.accent,marginBottom:14}}>🌸 Projects</h2>
          {projects.length===0?<div style={{textAlign:"center",padding:20,background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:18,color:TH.subtle,fontSize:12,fontFamily:"'Inter',sans-serif"}}>No projects yet...</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14}}>{projects.map(pr=>(<div key={pr.id} style={{background:"rgba(255,255,255,0.88)",border:`1.5px solid ${TH.border}`,borderRadius:16,overflow:"hidden",transition:"all .18s",boxShadow:"0 4px 14px rgba(52,211,153,.08)"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(52,211,153,.15)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 14px rgba(52,211,153,.08)"}}>
            {pr.image&&<img src={pr.image} alt={pr.name} style={{width:"100%",height:100,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
            <div style={{padding:"12px 13px"}}>
              <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:13,color:TH.text,marginBottom:4}}>{pr.name}</div>
              {pr.description&&<p style={{fontSize:11,color:TH.subtle,lineHeight:1.5,marginBottom:7,fontFamily:"'Inter',sans-serif",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pr.description}</p>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {pr.language&&<span style={{background:"rgba(167,243,208,.3)",color:TH.accent,borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>{pr.language}</span>}
                {pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:TH.accent,textDecoration:"none",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>View →</a>}
              </div>
            </div>
          </div>))}</div>}
        </div>}
        <div style={{textAlign:"center",marginTop:32,paddingTop:18,borderTop:`1px solid ${TH.border}`}}>
          <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:14,color:TH.accent,marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span>🌿</span>DevFolio</div>
          <button onClick={()=>go("login")} style={{background:TH.accent,border:"none",borderRadius:999,padding:"8px 22px",cursor:"pointer",color:"#fff",fontFamily:"Georgia,serif",fontSize:12,fontWeight:600}}>Get yours free →</button>
        </div>
      </div>
    </div>
  );

  // ── F1 Racing ──
  if(TH.f1) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px 60px",fontFamily:TH.font}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes race-stripe { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      <div style={{width:"100%",maxWidth:420,background:TH.bg,borderRadius:24,overflow:"hidden",border:`2px solid ${TH.darkGray}`,color:TH.text,position:"relative",boxShadow:"0 20px 60px rgba(255, 24, 1, 0.15)"}}>
        {/* Background racing grid */}
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundImage:`linear-gradient(45deg, ${TH.darkGray} 25%, transparent 25%), linear-gradient(-45deg, ${TH.darkGray} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${TH.darkGray} 75%), linear-gradient(-45deg, transparent 75%, ${TH.darkGray} 75%)`,backgroundSize:"40px 40px",backgroundPosition:"0 0, 0 20px, 20px -20px, -20px 0px",opacity:0.03,pointerEvents:"none"}}/>

        {/* Top racing stripe */}
        <div style={{height:3,background:`linear-gradient(90deg, ${TH.red} 0%, ${TH.yellow} 100%)`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`linear-gradient(90deg, transparent, ${TH.text}, transparent)`,animation:"race-stripe 2s infinite"}}/>
        </div>

        <div style={{padding:28,position:"relative"}}>
          {/* DRIVER PROFILE HEADER */}
          <div style={{marginBottom:28,borderBottom:`1px solid ${TH.darkGray}`,paddingBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
              {p.photoUrl&&<div style={{width:64,height:64,borderRadius:8,overflow:"hidden",border:`2px solid ${TH.red}`,boxShadow:`0 0 20px ${TH.red}40`}}>
                <img src={p.photoUrl} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>}
              <div style={{flex:1}}>
                <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:TH.subtle,marginBottom:4,fontWeight:600}}>DRIVER</div>
                <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:24,fontWeight:800,letterSpacing:-0.5,color:TH.text,textTransform:"uppercase",lineHeight:1.1}}>{p.name||"Developer"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <div style={{background:TH.panel,padding:"6px 12px",borderRadius:6,border:`1px solid ${TH.darkGray}`,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>
                <span style={{color:TH.subtle}}>POSITION: </span>
                <span style={{color:TH.text}}>{p.bio||"Full Stack Engineer"}</span>
              </div>
              {p.profileVisits>0&&<div style={{background:TH.panel,padding:"6px 12px",borderRadius:6,border:`1px solid ${TH.darkGray}`,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>
                <span style={{color:TH.subtle}}>VISITS: </span>
                <span style={{color:TH.green}}>{p.profileVisits}</span>
              </div>}
            </div>
          </div>

          {/* ENGINE PERFORMANCE (Skills) */}
          {p.showTechStack!==false&&p.techStack?.length>0&&<div style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:16,background:TH.red,borderRadius:2}}/>
              <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:TH.text}}>ENGINE PERFORMANCE</div>
            </div>
            <div style={{background:TH.panel,borderRadius:12,padding:16,border:`1px solid ${TH.darkGray}`}}>
              {p.techStack.slice(0,6).map((skill,i)=>{
                const perc=Math.max(100-(i*(100/(p.techStack.length+2))),60);
                return(<div key={skill} style={{marginBottom:i<Math.min(p.techStack.length,6)-1?12:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:11,fontWeight:600,color:TH.text,textTransform:"uppercase",letterSpacing:0.5}}>{skill}</div>
                    <div style={{fontSize:10,fontWeight:700,color:TH.green}}>{Math.round(perc)}%</div>
                  </div>
                  <div style={{width:"100%",height:6,background:TH.darkGray,borderRadius:3,overflow:"hidden",position:"relative"}}>
                    <div style={{height:"100%",width:`${perc}%`,background:`linear-gradient(90deg, ${TH.red}, ${TH.yellow})`,position:"relative",boxShadow:`0 0 10px ${TH.red}80`}}>
                      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`linear-gradient(90deg, transparent, ${TH.text}40, transparent)`,animation:"shine 2s infinite"}}/>
                    </div>
                  </div>
                </div>);
              })}
            </div>
          </div>}

          {/* TELEMETRY (Coding Stats) */}
          {p.showCodingStats!==false&&stats&&<div style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:16,background:TH.green,borderRadius:2}}/>
              <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:TH.text}}>TELEMETRY</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {stats.leetcodeSolved!=null&&<div style={{background:TH.panel,borderRadius:10,padding:14,border:`1px solid ${TH.darkGray}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:TH.green,opacity:0.6}}/>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:TH.subtle,marginBottom:6,fontWeight:600}}>LEETCODE</div>
                <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:26,fontWeight:900,color:TH.green,letterSpacing:-0.5,lineHeight:1,textShadow:`0 0 10px ${TH.green}40`}}>{stats.leetcodeSolved}</div>
              </div>}
              {stats.codeforcesRating!=null&&<div style={{background:TH.panel,borderRadius:10,padding:14,border:`1px solid ${TH.darkGray}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:TH.yellow,opacity:0.6}}/>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:TH.subtle,marginBottom:6,fontWeight:600}}>CODEFORCES</div>
                <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:26,fontWeight:900,color:TH.yellow,letterSpacing:-0.5,lineHeight:1,textShadow:`0 0 10px ${TH.yellow}40`}}>{stats.codeforcesRating}</div>
              </div>}
              <div style={{background:TH.panel,borderRadius:10,padding:14,border:`1px solid ${TH.darkGray}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:TH.red,opacity:0.6}}/>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:TH.subtle,marginBottom:6,fontWeight:600}}>VISITS</div>
                <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:26,fontWeight:900,color:TH.red,letterSpacing:-0.5,lineHeight:1,textShadow:`0 0 10px ${TH.red}40`}}>{p.profileVisits||0}</div>
              </div>
              {stats.leetcodeRanking!=null&&<div style={{background:TH.panel,borderRadius:10,padding:14,border:`1px solid ${TH.darkGray}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:TH.text,opacity:0.6}}/>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:TH.subtle,marginBottom:6,fontWeight:600}}>LC RANK</div>
                <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:22,fontWeight:900,color:TH.text,letterSpacing:-0.5,lineHeight:1}}>#{stats.leetcodeRanking.toLocaleString()}</div>
              </div>}
            </div>
          </div>}

          {/* RACE PROJECTS */}
          {p.showProjects!==false&&projects.length>0&&<div style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:16,background:TH.yellow,borderRadius:2}}/>
              <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:TH.text}}>RACE PROJECTS</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {projects.slice(0,4).map((pr,idx)=><a key={pr.id||idx} href={pr.repoUrl} target="_blank" rel="noopener noreferrer" style={{background:TH.panel,borderRadius:10,padding:14,border:`1px solid ${TH.darkGray}`,transition:"all 0.3s",cursor:"pointer",textDecoration:"none",display:"block"}}
                onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${TH.red}`;e.currentTarget.style.boxShadow=`0 0 20px ${TH.red}40`;}}
                onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${TH.darkGray}`;e.currentTarget.style.boxShadow="none";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron', sans-serif",fontSize:13,fontWeight:700,color:TH.text,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>{pr.name}</div>
                    {pr.description&&<div style={{fontSize:11,color:TH.subtle,marginBottom:8,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pr.description}</div>}
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      {pr.language&&<div style={{fontSize:10,color:TH.yellow,fontFamily:"'JetBrains Mono', monospace",fontWeight:600}}>{pr.language}</div>}
                      {pr.stars!=null&&<div style={{fontSize:10,color:TH.subtle,display:"flex",alignItems:"center",gap:3}}><span>⭐</span><span style={{fontWeight:600}}>{pr.stars}</span></div>}
                      {pr.forks!=null&&<div style={{fontSize:10,color:TH.subtle,display:"flex",alignItems:"center",gap:3}}><span>🍴</span><span style={{fontWeight:600}}>{pr.forks}</span></div>}
                    </div>
                  </div>
                  <div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,background:TH.darkGray,fontSize:12}}>→</div>
                </div>
              </a>)}
            </div>
          </div>}

          {/* SOCIAL LINKS */}
          {p.showSocialLinks!==false&&socials.length>0&&<div style={{background:TH.panel,borderRadius:12,padding:16,border:`1px solid ${TH.darkGray}`}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:8}}>
              {p.github&&<a href={`https://github.com/${p.github.replace("https://github.com/","")}`} target="_blank" rel="noopener noreferrer" style={{background:TH.darkGray,borderRadius:8,padding:"10px 12px",border:`1px solid ${TH.darkGray}`,transition:"all 0.3s",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${TH.text}15`;e.currentTarget.style.borderColor=TH.text;}}
                onMouseLeave={e=>{e.currentTarget.style.background=TH.darkGray;e.currentTarget.style.borderColor=TH.darkGray;}}>
                <span style={{fontSize:14}}>⚡</span>
                <span style={{fontSize:11,fontWeight:600,color:TH.subtle,letterSpacing:0.5}}>GitHub</span>
              </a>}
              {p.linkedin&&<a href={p.linkedin} target="_blank" rel="noopener noreferrer" style={{background:TH.darkGray,borderRadius:8,padding:"10px 12px",border:`1px solid ${TH.darkGray}`,transition:"all 0.3s",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${TH.green}15`;e.currentTarget.style.borderColor=TH.green;}}
                onMouseLeave={e=>{e.currentTarget.style.background=TH.darkGray;e.currentTarget.style.borderColor=TH.darkGray;}}>
                <span style={{fontSize:14}}>🔗</span>
                <span style={{fontSize:11,fontWeight:600,color:TH.subtle,letterSpacing:0.5}}>LinkedIn</span>
              </a>}
              {p.leetcode&&<a href={`https://leetcode.com/u/${p.leetcode}`} target="_blank" rel="noopener noreferrer" style={{background:TH.darkGray,borderRadius:8,padding:"10px 12px",border:`1px solid ${TH.darkGray}`,transition:"all 0.3s",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${TH.yellow}15`;e.currentTarget.style.borderColor=TH.yellow;}}
                onMouseLeave={e=>{e.currentTarget.style.background=TH.darkGray;e.currentTarget.style.borderColor=TH.darkGray;}}>
                <span style={{fontSize:14}}>💻</span>
                <span style={{fontSize:11,fontWeight:600,color:TH.subtle,letterSpacing:0.5}}>LeetCode</span>
              </a>}
              {p.codeforces&&<a href={`https://codeforces.com/profile/${p.codeforces}`} target="_blank" rel="noopener noreferrer" style={{background:TH.darkGray,borderRadius:8,padding:"10px 12px",border:`1px solid ${TH.darkGray}`,transition:"all 0.3s",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${TH.red}15`;e.currentTarget.style.borderColor=TH.red;}}
                onMouseLeave={e=>{e.currentTarget.style.background=TH.darkGray;e.currentTarget.style.borderColor=TH.darkGray;}}>
                <span style={{fontSize:14}}>🏆</span>
                <span style={{fontSize:11,fontWeight:600,color:TH.subtle,letterSpacing:0.5}}>Codeforces</span>
              </a>}
            </div>
          </div>}
        </div>

        {/* Bottom racing stripe */}
        <div style={{height:3,background:`linear-gradient(90deg, ${TH.yellow} 0%, ${TH.red} 100%)`}}/>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"20px 28px 28px",background:TH.panel}}>
          <div style={{fontFamily:"'Orbitron', sans-serif",fontWeight:800,fontSize:13,color:TH.text,marginBottom:6,letterSpacing:1}}>⚡ DEVFOLIO RACING</div>
          <button onClick={()=>go("login")} style={{background:`linear-gradient(90deg, ${TH.red}, ${TH.accentRed})`,border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",color:"#fff",fontFamily:"'Rajdhani', sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",boxShadow:`0 4px 14px ${TH.red}40`,transition:"all 0.3s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${TH.red}60`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 14px ${TH.red}40`;}}>
            Start Your Engine →
          </button>
          <div style={{marginTop:12,fontSize:10,color:TH.subtle,letterSpacing:0.5}}>Premium F1 Telemetry Theme</div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:TH.bg,color:TH.text,fontFamily:TH.font}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:`1px solid ${TH.navBorder}`,position:"sticky",top:0,background:TH.glass?"rgba(255,255,255,0.04)":TH.nav,backdropFilter:TH.glass?"blur(20px)":"none",zIndex:50}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>go(loggedIn?"dashboard":"landing")}>← Back</button>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:11,color:TH.subtle}}>devfolio.app/u/{DEMO_SLUG}</div>
        <button className="btn btn-outline btn-sm" onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${DEMO_SLUG}`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
          {copied?"✓ Copied!":"Copy link"}
        </button>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"40px 20px 76px"}}>
        {/* hero */}
        <div className="fu" style={{textAlign:"center",marginBottom:26}}>
          <div style={{marginBottom:13,position:"relative",display:"inline-block"}}>
            <Avatar name={p.name} size={80} imageUrl={p.photoUrl}/>
            {p.profilePublic&&<div style={{position:"absolute",bottom:-2,right:-2,width:19,height:19,borderRadius:"50%",background:TH.accent,border:`2px solid ${TH.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:TH.bg}}>✓</div>}
          </div>
          <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:26,letterSpacing:-1,marginBottom:4,color:TH.text}}>{p.name||"Developer"}</h1>
          {p.location&&<div style={{fontSize:11,color:TH.subtle,marginBottom:9}}>📍 {p.location}</div>}
          {p.bio&&<p style={{fontSize:13,color:TH.subtle,lineHeight:1.65,maxWidth:340,margin:"0 auto 14px"}}>{p.bio}</p>}
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            <span className="badge badge-coral">● Available</span>
            {p.profileVisits!=null&&<span style={{fontSize:11,color:TH.subtle}}>👁 {(p.profileVisits||0).toLocaleString()} visits</span>}
          </div>
        </div>

        {/* social links */}
        {p.showSocialLinks!==false&&socials.length>0&&(
          <div className="fu2" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
            {socials.map(lk=>(
              <a key={lk.lb} href={lk.url} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 17px",borderRadius:15,background:lk.bg,color:lk.col,border:`1px solid ${TH.border}`,textDecoration:"none",transition:"transform .14s,box-shadow .14s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,.12)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:17}}>{lk.ic}</span>
                  <div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13}}>{lk.lb}</div>
                    <div style={{fontSize:10,opacity:.5,marginTop:1}}>{lk.sub}</div>
                  </div>
                </div>
                <span style={{opacity:.4,fontSize:15}}>↗</span>
              </a>
            ))}
          </div>
        )}

        {/* tech stack */}
        {p.showTechStack!==false&&p.techStack?.length>0&&(
          <div className="fu3" style={{marginBottom:22}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:TH.subtle,marginBottom:9}}>Tech Stack</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{p.techStack.map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:500,border:`1px solid ${TH.border}`,background:TH.tagBg,color:TH.tagText,display:"inline-flex",alignItems:"center"}}>{t}</span>)}</div>
          </div>
        )}

        {/* coding stats */}
        {p.showCodingStats!==false&&(
          <div className="fu4" style={{marginBottom:22}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:TH.subtle,marginBottom:9}}>Coding Stats</div>
            {statsLoading
              ?<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>{[1,2,3].map(i=><Skel key={i} h={68} r={13}/>)}</div>
              :stats
                ?<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
                  {[
                    {lb:"LeetCode",v:stats.leetcodeSolved,c:T.coral},
                    {lb:"CF Rating",v:stats.codeforcesRating,c:T.sage},
                    {lb:"CF Rank",v:stats.codeforcesRank,c:T.gold},
                  ].filter(s=>s.v!=null).map(s=>(
                    <div key={s.lb} style={{background:TH.statBg,border:`1px solid ${TH.border}`,borderRadius:13,padding:"13px 15px",backdropFilter:TH.glass?"blur(10px)":"none"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:19,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:9,color:TH.subtle,textTransform:"uppercase",letterSpacing:".07em",marginTop:2}}>{s.lb}</div>
                    </div>
                  ))}
                </div>
                :<div style={{fontSize:12,color:TH.subtle}}>No coding stats yet.</div>
            }
          </div>
        )}

        {/* projects */}
        {p.showProjects!==false&&(
          <div className="fu5">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:TH.subtle}}>Projects</div>
              <span className="badge badge-black">{projects.length} repos</span>
            </div>
            {projects.length===0
              ?<div style={{fontSize:12,color:TH.subtle}}>No projects added yet.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                {projects.map(pr=>(
                  <div key={pr.id} style={{background:TH.card,border:`1px solid ${TH.border}`,borderRadius:16,overflow:"hidden",transition:"transform .15s,box-shadow .15s",backdropFilter:TH.glass?"blur(10px)":"none"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,.1)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
                    {pr.image&&<img src={pr.image} alt={pr.name} style={{width:"100%",height:140,objectFit:"cover",display:"block",borderBottom:`1px solid ${TH.border}`}} onError={e=>e.target.style.display="none"}/>}
                    <div style={{padding:"13px 15px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                        <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:TH.text}}>{pr.name}</span>
                        <div style={{display:"flex",gap:8,fontSize:11,color:TH.subtle,flexShrink:0,marginLeft:8}}>
                          {pr.stars>0&&<span>⭐{pr.stars}</span>}
                          {pr.forks>0&&<span>🍴{pr.forks}</span>}
                        </div>
                      </div>
                      {pr.description&&<p style={{fontSize:12,color:TH.subtle,lineHeight:1.55,marginBottom:9}}>{pr.description}</p>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        {pr.language&&<LangDot lang={pr.language}/>}
                        {pr.repoUrl&&<a href={pr.repoUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:TH.accent,textDecoration:"none",fontWeight:600}}>View repo →</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* brand footer */}
        <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:`1px solid ${TH.footerBorder}`}}>
          <div style={{fontSize:10,color:TH.subtle,marginBottom:6}}>Powered by</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,display:"flex",alignItems:"center",gap:5,justifyContent:"center",color:TH.text}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:T.coral,display:"inline-block",animation:"blink 2s infinite"}}/>DevFolio
          </div>
          <button className="btn btn-coral btn-sm" style={{marginTop:10}} onClick={()=>go("login")}>Get yours free</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function Dashboard({go}){
  const [tab,setTab]=useState("profile");
  const [profile,setProfile]=useState(null);
  const [projects,setProjects]=useState([]);
  const [themes,setThemes]=useState([]);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [addingProj,setAddingProj]=useState(false);
  const [newRepo,setNewRepo]=useState("");
  const [addLoading,setAddLoading]=useState(false);
  const fileRef=useRef();

  const show=(msg,type="success")=>setToast({msg,type});

  /* initial load */
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const [p,th]=await Promise.all([api.getMyProfile(),api.getThemes()]);
        setProfile(p);
        setThemes(th||[]);
        if(p.slug){
          const projs=await api.getPublicProjects(p.slug).catch(()=>[]);
          setProjects(projs);
          api.getCodingStats(p.slug).then(s=>setStats(s)).catch(()=>{});
        }
      }catch(e){
        if(["401","403"].includes(e.message)) go("login");
        else show("Could not load profile. Are you logged in?","error");
      }finally{ setLoading(false); }
    })();
  },[]);

  /* save profile */
  const save=async()=>{
    if(!profile) return;
    setSaving(true);
    try{
      await api.updateProfile({
        name:profile.name,
        bio:profile.bio,
        location:profile.location,
        techStack:profile.techStack||[],
        profilePublic:!!profile.profilePublic,
        showProjects:!!profile.showProjects,
        showCodingStats:!!profile.showCodingStats,
        showSocialLinks:!!profile.showSocialLinks,
        showTechStack:!!profile.showTechStack,
        socialHandels:{
          github:profile.github||null,
          linkedin:profile.linkedin||null,
          leetcode:profile.leetcode||null,
          codeforces:profile.codeforces||null,
          portfolio:profile.portfolio||null,
        },
        themeConfig:profile.theme?{
          themeName:profile.theme,
          fontStyle:profile.fontStyle||null,
          fontcolor:profile.fontcolor||null,
        }:null,
      });
      const updated = await api.getMyProfile();
      setProfile(updated);
      show("Profile saved! ✓");
    }catch(e){ show("Save failed: "+e.message,"error"); }
    finally{ setSaving(false); }
  };

  /* upload image */
  const uploadImg=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    try{
      const res=await api.uploadImage(file);
      setProfile(p=>({...p,photoUrl:res.imageUrl}));
      show("Photo updated!");
    }catch(e){ show("Image upload failed. Max 2MB, images only.","error"); }
  };

  /* add project */
  const addProj=async()=>{
    if(!newRepo.trim()) return;
    setAddLoading(true);
    try{
      const np=await api.addProject({repoUrl:newRepo});
      setProjects(prev=>[...prev,np]);
      setNewRepo(""); setAddingProj(false);
      show("Project added!");
    }catch(e){
      const errorMsg = e.message || String(e);

      // Handle project limit errors from backend
      if(errorMsg.includes("Maximum 4 projects allowed")) {
        show("⚠️ Project Limit Reached! You have 4 projects (FREE limit). Upgrade to PRO for 6 projects!","error");
      } else if(errorMsg.includes("Maximum 6 projects allowed")) {
        show("⚠️ Project Limit Reached! You have 6 projects (PRO limit).","error");
      } else {
        show("Could not add project. Check the GitHub URL.","error");
      }
    }
    finally{ setAddLoading(false); }
  };

  /* delete project */
  const delProj=async(id)=>{
    try{
      await api.deleteProject(id);
      setProjects(prev=>prev.filter(p=>p.id!==id));
      show("Project deleted.");
    }catch(e){ show("Delete failed.","error"); }
    finally{ setConfirm(null); }
  };

  /* feature project */
  const featProj=async(id)=>{
    try{
      await api.featureProject(id);
      setProjects(prev=>prev.map(p=>({...p,featured:p.id===id})));
      show("Featured project updated!");
    }catch(e){ show("Failed.","error"); }
  };

  /* delete account */
  const delAccount=async()=>{
    try{ await api.deleteProfile(); await api.logout(); go("landing"); }
    catch(e){ show("Deletion failed.","error"); }
    finally{ setConfirm(null); }
  };

  /* select theme */
  const pickTheme=(t)=>{
    if(t.tier==="PRO"&&profile?.subscriptionTier!=="PRO"){ show("Upgrade to PRO to unlock this theme!","error"); return; }
    setProfile(p=>({...p,theme:t.themeName}));
  };

  const TABS=[{id:"profile",lb:"Profile",ic:"👤"},{id:"projects",lb:"Projects",ic:"📦"},{id:"themes",lb:"Themes",ic:"🎨"},{id:"stats",lb:"Stats",ic:"📊"},{id:"settings",lb:"Settings",ic:"⚙️"}];

  if(loading) return(
    <div style={{minHeight:"100vh",background:T.cream,display:"grid",gridTemplateColumns:"210px 1fr"}}>
      <div style={{borderRight:`1.5px solid ${T.black}`,padding:22}}><Skel h={22} w={90} r={7}/><div style={{marginTop:28,display:"flex",flexDirection:"column",gap:9}}>{[1,2,3,4,5].map(i=><Skel key={i} h={34} r={9}/>)}</div></div>
      <div style={{padding:44}}><Skel h={28} w={200} r={9}/><div style={{marginTop:22,display:"flex",flexDirection:"column",gap:12}}>{[1,2,3].map(i=><Skel key={i} h={76} r={16}/>)}</div></div>
    </div>
  );

  const p=profile||{};
  const mascotMood=saving?"thinking":tab==="projects"?"coding":tab==="themes"?"happy":"cool";

  return(
    <div style={{minHeight:"100vh",background:T.cream,display:"grid",gridTemplateColumns:"210px 1fr",fontFamily:"DM Sans,sans-serif"}}>

      {/* SIDEBAR */}
      <aside style={{borderRight:`1.5px solid ${T.black}`,padding:"22px 0",position:"sticky",top:0,height:"100vh",display:"flex",flexDirection:"column",overflow:"auto"}}>
        <div style={{padding:"0 16px 18px",borderBottom:`1px solid ${T.fog}`}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,letterSpacing:-.5,display:"flex",alignItems:"center",gap:7,marginBottom:16}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.coral,display:"inline-block",animation:"blink 2s infinite"}}/>DevFolio
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Avatar name={p.name||"?"} size={32} imageUrl={p.photoUrl}/>
            <div style={{overflow:"hidden"}}>
              <div style={{fontWeight:600,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name||"Your Name"}</div>
              <div style={{fontSize:9,color:T.subtle}}>/{p.slug||"..."}</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          <div className="sec-lbl">Dashboard</div>
          {TABS.map(t=>(
            <button key={t.id} className={`sbl${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <span>{t.ic}</span>{t.lb}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:`1px solid ${T.fog}`}}>
          <button className="btn btn-outline btn-sm" style={{width:"100%",justifyContent:"center",marginBottom:6}} onClick={()=>go("portfolio:"+(p.slug||""))}>👁 View my page</button>
          <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center",fontSize:11,color:T.subtle}} onClick={async()=>{await api.logout();go("landing");}}>Sign out</button>
          <div style={{textAlign:"center",marginTop:16}}>
            <Mascot mood={mascotMood} size={52}/>
            <div style={{fontSize:9,color:T.mist,marginTop:2,fontFamily:"monospace"}}>{saving?"saving...":tab==="projects"?"ship it 🚀":"looking good!"}</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{padding:"32px 40px",overflowY:"auto"}}>

        {/* ──── PROFILE TAB ──── */}
        {tab==="profile"&&(
          <div style={{animation:"slideIn .3s ease both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:T.coral,marginBottom:4}}>01 — Profile</div>
                <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,letterSpacing:-1}}>Edit your profile</h2>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {p.subscriptionTier==="PRO"?
                  <span className="badge badge-gold" style={{fontSize:11,padding:"6px 12px"}}>✨ PRO Member</span>:
                  <button className="btn btn-outline" onClick={()=>go("subscription")} style={{fontSize:12,padding:"8px 16px"}}>
                    🚀 Upgrade to PRO
                  </button>
                }
                <button className="btn btn-coral" onClick={save} disabled={saving}>
                  {saving?<><Spinner size={13} color="#fff"/> Saving...</>:"Save changes"}
                </button>
              </div>
            </div>

            {/* photo + basics */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:24,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,paddingBottom:18,borderBottom:`1px solid ${T.fog}`}}>
                <Avatar name={p.name||"?"} size={64} imageUrl={p.photoUrl}/>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:3}}>Profile Photo</div>
                  <div style={{fontSize:11,color:T.subtle,marginBottom:8}}>JPG or PNG · max 2MB</div>
                  <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={uploadImg}/>
                  <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current?.click()}>Upload photo</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
                {[{lb:"Name *",k:"name",ph:"Your full name"},{lb:"Location",k:"location",ph:"City, Country"}].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:11,fontWeight:600,display:"block",marginBottom:4,letterSpacing:".04em"}}>{f.lb}</label>
                    <input className="inp" value={p[f.k]||""} onChange={e=>setProfile(pr=>({...pr,[f.k]:e.target.value}))} placeholder={f.ph}/>
                  </div>
                ))}
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,display:"block",marginBottom:4,letterSpacing:".04em"}}>Bio</label>
                <textarea className="inp" rows={3} value={p.bio||""} onChange={e=>setProfile(pr=>({...pr,bio:e.target.value}))} placeholder="Tell recruiters who you are..." style={{resize:"vertical",fontFamily:"DM Sans,sans-serif"}}/>
              </div>
            </div>

            {/* tech stack */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:24,marginBottom:16}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:4}}>Tech Stack</div>
              <div style={{fontSize:11,color:T.subtle,marginBottom:11}}>Click suggestions or type your own</div>

              {/* Popular suggestions */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:600,color:T.mist,marginBottom:6,letterSpacing:".05em"}}>POPULAR</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["React","TypeScript","JavaScript","Node.js","Python","Java","Spring Boot","MongoDB","PostgreSQL","MySQL","Docker","Kubernetes","AWS","Git","REST API","GraphQL","Redis","Tailwind CSS","Next.js","Express"].map(tech=>{
                    const hasIt=(p.techStack||[]).includes(tech);
                    return(
                      <button key={tech} onClick={()=>{
                        if(hasIt) setProfile(pr=>({...pr,techStack:(pr.techStack||[]).filter(t=>t!==tech)}));
                        else setProfile(pr=>({...pr,techStack:[...(pr.techStack||[]),tech]}));
                      }} style={{background:hasIt?T.coral:"#fff",color:hasIt?"#fff":T.black,border:`1.5px solid ${hasIt?T.coral:T.fog}`,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:hasIt?600:500,cursor:"pointer",transition:"all .15s ease"}}>{hasIt?"✓ ":""}{tech}</button>
                    );
                  })}
                </div>
              </div>

              {/* Custom input */}
              <div style={{position:"relative"}}>
                <input className="inp" placeholder="Type to add custom skill..." onKeyDown={e=>{
                  if(e.key==="Enter"&&e.target.value.trim()){
                    e.preventDefault();
                    const val=e.target.value.trim();
                    if(!((p.techStack||[]).includes(val))){
                      setProfile(pr=>({...pr,techStack:[...(pr.techStack||[]),val]}));
                    }
                    e.target.value="";
                  }
                }} style={{paddingRight:80}}/>
                <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:9,color:T.mist,pointerEvents:"none"}}>Press Enter</div>
              </div>

              {/* Selected chips */}
              {(p.techStack||[]).length>0&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.fog}`}}>
                  <div style={{fontSize:10,fontWeight:600,color:T.mist,marginBottom:8,letterSpacing:".05em"}}>YOUR SKILLS ({(p.techStack||[]).length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {(p.techStack||[]).map((t,i)=>(
                      <span key={i} style={{background:T.sage,color:"#fff",fontSize:11,padding:"6px 10px",borderRadius:8,display:"inline-flex",alignItems:"center",gap:6,fontWeight:500}}>
                        {t}
                        <button onClick={()=>setProfile(pr=>({...pr,techStack:(pr.techStack||[]).filter((_,idx)=>idx!==i)}))} style={{background:"rgba(0,0,0,.2)",border:"none",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:"#fff",padding:0,lineHeight:1}}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* social links */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:24,marginBottom:16}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:16}}>Social Links</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  {lb:"🐙 GitHub URL",k:"github",ph:"https://github.com/username"},
                  {lb:"💼 LinkedIn URL",k:"linkedin",ph:"https://linkedin.com/in/username"},
                  {lb:"🏆 LeetCode",k:"leetcode",ph:"username or full URL"},
                  {lb:"⚡ Codeforces",k:"codeforces",ph:"username or full URL"},
                  {lb:"🌐 Portfolio",k:"portfolio",ph:"https://yoursite.dev"},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:11,fontWeight:600,display:"block",marginBottom:4}}>{f.lb}</label>
                    <input className="inp" value={p[f.k]||""} onChange={e=>setProfile(pr=>({...pr,[f.k]:e.target.value}))} placeholder={f.ph}/>
                  </div>
                ))}
              </div>
            </div>

            {/* visibility */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:24}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:16}}>Visibility Settings</div>
              {[
                {k:"profilePublic",lb:"Public profile",d:"Anyone with the link can view your page"},
                {k:"showProjects",lb:"Show projects",d:"Display your GitHub projects"},
                {k:"showCodingStats",lb:"Show coding stats",d:"LeetCode + Codeforces"},
                {k:"showTechStack",lb:"Show tech stack",d:"Your skill tags"},
                {k:"showSocialLinks",lb:"Show social links",d:"GitHub, LinkedIn, Portfolio, etc."},
              ].map((item,i,arr)=>(
                <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${T.fog}`:"none"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{item.lb}</div>
                    <div style={{fontSize:11,color:T.subtle}}>{item.d}</div>
                  </div>
                  <Toggle on={!!p[item.k]} onChange={v=>setProfile(pr=>({...pr,[item.k]:v}))}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── PROJECTS TAB ──── */}
        {tab==="projects"&&(
          <div style={{animation:"slideIn .3s ease both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:T.coral,marginBottom:4}}>02 — Projects</div>
                <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,letterSpacing:-1}}>Your projects</h2>
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <span className={`badge ${projects.length>=(p.subscriptionTier==="PRO"?6:4)?"badge-coral":"badge-gold"}`}>
                  {projects.length}/{p.subscriptionTier==="PRO"?6:4} {p.subscriptionTier==="PRO"?"PRO":"FREE"} slots
                </span>
                <button className="btn btn-coral" onClick={()=>setAddingProj(v=>!v)}>
                  {addingProj?"✕ Cancel":"+ Add project"}
                </button>
              </div>
            </div>

            {addingProj&&(
              <div style={{background:T.black,borderRadius:20,padding:22,marginBottom:16,border:`1.5px solid ${T.black}`}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:T.cream,marginBottom:12}}>Paste a GitHub repo URL</div>
                <div style={{display:"flex",gap:8}}>
                  <input className="inp" value={newRepo} onChange={e=>setNewRepo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProj()}
                    placeholder="https://github.com/username/repo-name"
                    style={{flex:1,background:"rgba(255,255,255,.07)",borderColor:"rgba(255,255,255,.15)",color:T.cream}}/>
                  <button className="btn btn-coral" onClick={addProj} disabled={addLoading}>
                    {addLoading?<><Spinner size={13} color="#fff"/>Fetching...</>:"Fetch & Add"}
                  </button>
                </div>
                <div style={{fontSize:10,color:"rgba(245,240,232,.3)",marginTop:6}}>We'll auto-fetch name, description, stars, forks & language from GitHub.</div>
              </div>
            )}

            {/* slot bar */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:16,padding:"12px 17px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:500,marginBottom:4}}>
                  <span>Project slots</span>
                  <span style={{color:projects.length>=(p.subscriptionTier==="PRO"?6:4)?T.coral:T.black}}>
                    {projects.length}/{p.subscriptionTier==="PRO"?6:4}
                  </span>
                </div>
                <div className="pbar">
                  <div className="pbar-fill" style={{
                    width:`${(projects.length/(p.subscriptionTier==="PRO"?6:4))*100}%`,
                    background:projects.length>=(p.subscriptionTier==="PRO"?6:4)?T.coral:T.sage
                  }}/>
                </div>
              </div>
              {projects.length>=(p.subscriptionTier==="PRO"?6:4)&&<span className="badge badge-coral">Limit reached</span>}
            </div>

            {projects.length===0
              ?<div style={{textAlign:"center",padding:"52px 22px",border:`1.5px dashed ${T.mist}`,borderRadius:20}}>
                <div style={{fontSize:40,marginBottom:11}}>📦</div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:16,marginBottom:6}}>No projects yet</div>
                <div style={{fontSize:12,color:T.subtle,marginBottom:16}}>Add a GitHub repo to show off your work.</div>
                <button className="btn btn-coral" onClick={()=>setAddingProj(true)}>+ Add first project</button>
              </div>
              :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {projects.map(pr=>(
                  <ProjCard key={pr.id} project={pr} editable
                    onDelete={id=>setConfirm({type:"project",id})}
                    onFeature={featProj}/>
                ))}
              </div>
            }
          </div>
        )}

        {/* ──── THEMES TAB ──── */}
        {tab==="themes"&&(
          <div style={{animation:"slideIn .3s ease both"}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:T.coral,marginBottom:4}}>03 — Themes</div>
              <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,letterSpacing:-1}}>Pick your vibe</h2>
              <p style={{fontSize:12,color:T.subtle,marginTop:4}}>FREE themes available to everyone. PRO themes require an upgrade.</p>
            </div>

            {themes.length===0
              ?<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>{[1,2,3,4,5,6].map(i=><Skel key={i} h={120} r={16}/>)}</div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {themes.map(t=>{
                  const isActive=p.theme===t.themeName;
                  const isLocked=t.tier==="PRO"&&p.subscriptionTier!=="PRO";
                  const thBgs={
                    "Clean Minimal":T.cream,"Ocean Blue":"#1A2A4A",
                    "Glassmorphism":"linear-gradient(135deg,#6366F1,#8B5CF6)",
                    "Cyberpunk":"#0A0014","Aurora":"#0F172A",
                    "Pokémon":"linear-gradient(135deg,#87CEEB,#7EC8A0)",
                    "Game Console":"#8BAC0F",
                    "GitHub":"#0d1117","Terminal":"#020617",
                    "Samurai":"linear-gradient(135deg,#f5f0e8,#e8dcc8)","Ghibli":"linear-gradient(135deg,#dbeafe,#dcfce7)",
                  };
                  return(
                    <div key={t.themeName} onClick={()=>pickTheme(t)}
                      style={{border:`1.5px solid ${isActive?T.coral:T.black}`,borderRadius:16,overflow:"hidden",cursor:isLocked?"not-allowed":"pointer",opacity:isLocked?.6:1,transition:"transform .14s",boxShadow:isActive?`0 0 0 3px ${T.coral}33`:""}}
                      onMouseEnter={e=>{if(!isLocked)e.currentTarget.style.transform="translateY(-2px)"}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none"}}>
                      <div style={{height:64,background:thBgs[t.themeName]||T.black,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        {(t.fontColors||["#FF4D3D","#8FAF7E","#C8B8D8"]).slice(0,3).map((c,i)=>(
                          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:c,border:"1.5px solid rgba(255,255,255,.25)"}}/>
                        ))}
                        {isLocked&&<span style={{fontSize:16}}>🔒</span>}
                      </div>
                      <div style={{padding:"10px 13px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12}}>{t.themeName}</div>
                          {isActive&&<div style={{fontSize:9,color:T.coral,fontWeight:600}}>● ACTIVE</div>}
                        </div>
                        <span className={`badge ${t.tier==="PRO"?"badge-gold":"badge-sage"}`}>{t.tier==="PRO"?"👑 PRO":"FREE"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            }

            <div style={{marginTop:18,background:T.black,borderRadius:18,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:T.cream,marginBottom:3}}>Unlock PRO themes 👑</div>
                <div style={{fontSize:11,color:"rgba(245,240,232,.4)"}}>Glassmorphism, Cyberpunk, Aurora and more.</div>
              </div>
              <button className="btn btn-coral">Upgrade to PRO</button>
            </div>
            <div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}>
              <button className="btn btn-coral" onClick={save} disabled={saving}>
                {saving?<><Spinner size={13} color="#fff"/>Saving...</>:"Save theme"}
              </button>
            </div>
          </div>
        )}

        {/* ──── STATS TAB ──── */}
        {tab==="stats"&&(
          <div style={{animation:"slideIn .3s ease both"}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:T.coral,marginBottom:4}}>04 — Stats</div>
              <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,letterSpacing:-1}}>Analytics & coding stats</h2>
            </div>

            {/* visits */}
            <div style={{background:T.black,borderRadius:20,padding:"22px 26px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,color:"rgba(245,240,232,.45)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Profile Visits</div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:42,color:T.cream,letterSpacing:-2}}>{(p.profileVisits||0).toLocaleString()}</div>
              </div>
              <div style={{fontSize:48,animation:"float 3s ease-in-out infinite"}}>👁</div>
            </div>

            {/* LeetCode card */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:22,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:38,height:38,borderRadius:10,background:"#FFA116",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏆</div>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15}}>LeetCode</div>
                  <div style={{fontSize:11,color:T.subtle}}>{p.leetcode ? `@${p.leetcode}` : "No username saved — go to Profile tab"}</div>
                </div>
                {p.leetcode&&<a href={`https://leetcode.com/u/${p.leetcode}`} target="_blank" rel="noreferrer" style={{marginLeft:"auto",fontSize:11,color:T.coral,textDecoration:"none",fontWeight:600}}>View →</a>}
              </div>
              {stats==null ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[1,2,3].map(i=><Skel key={i} h={64} r={12}/>)}
                </div>
              ) : !p.leetcode ? (
                <div style={{textAlign:"center",padding:"18px 0",color:T.subtle,fontSize:13}}>Add your LeetCode username in the Profile tab and save</div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    {lb:"Solved",v:stats.leetcodeSolved,c:"#FFA116",max:3000},
                    {lb:"Submissions",v:stats.leetcodeSubmissions,c:T.coral,max:5000},
                    {lb:"Ranking",v:stats.leetcodeRanking?`#${stats.leetcodeRanking.toLocaleString()}`:null,c:T.sage,max:null},
                  ].map(s=>(
                    <div key={s.lb} style={{background:T.fog,borderRadius:12,padding:"13px 15px"}}>
                      <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:T.subtle,marginBottom:6}}>{s.lb}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:s.c}}>{s.v??"—"}</div>
                      {s.max&&typeof s.v==="number"&&(
                        <div className="pbar" style={{marginTop:8}}><div className="pbar-fill" style={{width:`${Math.min((s.v/s.max)*100,100)}%`,background:s.c}}/></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Codeforces card */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:22,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:38,height:38,borderRadius:10,background:"#1F8AC0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚡</div>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15}}>Codeforces</div>
                  <div style={{fontSize:11,color:T.subtle}}>{p.codeforces ? `@${p.codeforces}` : "No username saved — go to Profile tab"}</div>
                </div>
                {p.codeforces&&<a href={`https://codeforces.com/profile/${p.codeforces}`} target="_blank" rel="noreferrer" style={{marginLeft:"auto",fontSize:11,color:"#1F8AC0",textDecoration:"none",fontWeight:600}}>View →</a>}
              </div>
              {stats==null ? (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[1,2].map(i=><Skel key={i} h={64} r={12}/>)}
                </div>
              ) : !p.codeforces ? (
                <div style={{textAlign:"center",padding:"18px 0",color:T.subtle,fontSize:13}}>Add your Codeforces username in the Profile tab and save</div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {lb:"Rating",v:stats.codeforcesRating,c:"#1F8AC0",max:3000},
                    {lb:"Rank",v:stats.codeforcesRank,c:T.gold,max:null},
                  ].map(s=>(
                    <div key={s.lb} style={{background:T.fog,borderRadius:12,padding:"13px 15px"}}>
                      <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:T.subtle,marginBottom:6}}>{s.lb}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:s.c,textTransform:"capitalize"}}>{s.v??"—"}</div>
                      {s.max&&typeof s.v==="number"&&(
                        <div className="pbar" style={{marginTop:8}}><div className="pbar-fill" style={{width:`${Math.min((s.v/s.max)*100,100)}%`,background:s.c}}/></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects summary */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:16,padding:"16px 20px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13}}>📦 Projects</div>
                <span className={`badge ${p.subscriptionTier==="PRO"?"badge-gold":"badge-gold"}`}>
                  {projects.length}/{p.subscriptionTier==="PRO"?6:4} {p.subscriptionTier==="PRO"?"PRO":"FREE"} slots
                </span>
              </div>
              <div className="pbar">
                <div className="pbar-fill" style={{
                  width:`${(projects.length/(p.subscriptionTier==="PRO"?6:4))*100}%`,
                  background:T.gold
                }}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:7,fontSize:11,color:T.subtle}}>
                <span>Total ⭐ {projects.reduce((a,p)=>a+(p.stars||0),0)}</span>
                <span>Total 🍴 {projects.reduce((a,p)=>a+(p.forks||0),0)}</span>
                <span>Languages: {[...new Set(projects.map(p=>p.language).filter(Boolean))].join(", ")||"—"}</span>
              </div>
            </div>

            {/* sync status */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:16,padding:"16px 20px"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,marginBottom:12}}>Sync Status</div>
              {[
                {lb:"GitHub repos",d:"Stars, forks & language synced nightly at 2 AM"},
                {lb:"LeetCode stats",d:"Fetched live when your page is viewed"},
                {lb:"Codeforces stats",d:"Fetched live when your page is viewed"},
              ].map((item,i,arr)=>(
                <div key={item.lb} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.fog}`:"none"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500}}>{item.lb}</div>
                    <div style={{fontSize:11,color:T.subtle}}>{item.d}</div>
                  </div>
                  <span className="badge badge-sage">✓ Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── SETTINGS TAB ──── */}
        {tab==="settings"&&(
          <div style={{animation:"slideIn .3s ease both"}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:T.coral,marginBottom:4}}>05 — Settings</div>
              <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,letterSpacing:-1}}>Account settings</h2>
            </div>

            {/* public link */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:22,marginBottom:14}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:3}}>Your public link</div>
              <div style={{fontSize:11,color:T.subtle,marginBottom:12}}>Share this in your resume, LinkedIn bio, and GitHub profile.</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,padding:"10px 13px",border:`1.5px solid ${T.black}`,borderRadius:11,fontSize:12,background:T.fog,fontFamily:"monospace"}}>
                  devfolio.app/u/{p.slug||"..."}
                </div>
                <button className="btn btn-outline" onClick={()=>{navigator.clipboard.writeText(`devfolio.app/u/${p.slug}`).catch(()=>{});show("Link copied!");}}>Copy</button>
              </div>
            </div>

            {/* account info */}
            <div style={{background:"#fff",border:`1.5px solid ${T.black}`,borderRadius:20,padding:22,marginBottom:14}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,marginBottom:14}}>Account info</div>
              {[
                {lb:"Subscription",v:p.subscriptionTier==="PRO"?"👑 PRO":"FREE"},
                {lb:"Profile slug",v:`/u/${p.slug||"..."}`},
              ].map((row,i,arr)=>(
                <div key={row.lb} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${T.fog}`:"none"}}>
                  <span style={{fontSize:12,color:T.subtle}}>{row.lb}</span>
                  <span style={{fontSize:12,fontWeight:600}}>{row.v}</span>
                </div>
              ))}
              {p.subscriptionTier!=="PRO"&&(
                <button className="btn btn-sm" onClick={()=>go("subscription")} style={{marginTop:14,background:T.gold,color:T.black,borderColor:T.gold}}>Upgrade to PRO 👑</button>
              )}
            </div>

            {/* danger zone */}
            <div style={{background:"#FFF8F7",border:`1.5px solid ${T.coral}`,borderRadius:20,padding:22}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:T.coral,marginBottom:3}}>Danger zone ⚠️</div>
              <div style={{fontSize:12,color:T.subtle,marginBottom:14,lineHeight:1.6}}>Deleting your account is permanent. All your data, projects, and settings will be erased immediately. This cannot be undone.</div>
              <button className="btn btn-danger" onClick={()=>setConfirm({type:"account"})}>Delete my account</button>
            </div>
          </div>
        )}
      </main>

      {/* TOAST */}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* CONFIRM MODALS */}
      {confirm?.type==="project"&&(
        <Confirm title="Delete project?" desc="This project will be removed from your portfolio permanently." onConfirm={()=>delProj(confirm.id)} onCancel={()=>setConfirm(null)}/>
      )}
      {confirm?.type==="account"&&(
        <Confirm title="Delete your account?" desc="All your profile data, projects, and settings will be permanently deleted. This action cannot be undone." onConfirm={delAccount} onCancel={()=>setConfirm(null)}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   RAZORPAY PAYMENT HELPER
══════════════════════════════════════════ */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay SDK loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const initiateRazorpayPayment = (amount, userDetails, onSuccess, onFailure) => {
  if (!window.Razorpay) {
    console.error('Razorpay SDK not loaded!');
    onFailure(new Error('Razorpay SDK not loaded'));
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: amount * 100,
    currency: 'INR',
    name: 'DevFolio',
    description: 'PRO Subscription',
    handler: function (response) { onSuccess(response); },
    prefill: { name: userDetails.name || '', email: userDetails.email || '' },
    theme: { color: '#667eea' },
    modal: { ondismiss: function() { onFailure(new Error('Payment cancelled')); } }
  };
  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response) { onFailure(response.error); });
  rzp.open();
};

/* ══════════════════════════════════════════
   404 NOT FOUND PAGE
══════════════════════════════════════════ */
function NotFoundPage({go}) {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter, sans-serif',padding:'20px'}}>
      <div style={{textAlign:'center',color:'#fff',maxWidth:500}}>
        <div style={{fontSize:120,fontWeight:900,lineHeight:1,marginBottom:20,textShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>404</div>
        <h1 style={{fontSize:32,fontWeight:700,marginBottom:16}}>Page Not Found</h1>
        <p style={{fontSize:18,opacity:0.9,marginBottom:32,lineHeight:1.6}}>Oops! The page you're looking for doesn't exist.</p>
        <button onClick={()=>go('landing')} style={{background:'#fff',color:'#667eea',border:'none',padding:'14px 32px',fontSize:16,fontWeight:600,borderRadius:8,cursor:'pointer',boxShadow:'0 4px 14px rgba(0,0,0,0.2)'}}>← Back to Home</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PRIVATE PROFILE PAGE
══════════════════════════════════════════ */
function PrivateProfilePage({go,slug}) {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter, sans-serif',padding:'20px'}}>
      <div style={{textAlign:'center',maxWidth:500,background:'#fff',padding:60,borderRadius:20,boxShadow:'0 20px 60px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize:80,marginBottom:20}}>🔒</div>
        <h1 style={{fontSize:28,fontWeight:700,color:'#1a202c',marginBottom:16}}>This Profile is Private</h1>
        <p style={{fontSize:16,color:'#718096',lineHeight:1.6,marginBottom:32}}>The owner of <strong>devfolio.app/u/{slug}</strong> has set their profile to private.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button onClick={()=>go('landing')} style={{background:'#667eea',color:'#fff',border:'none',padding:'12px 24px',fontSize:15,fontWeight:600,borderRadius:8,cursor:'pointer'}}>Go Home</button>
          <button onClick={()=>go('login')} style={{background:'#fff',color:'#667eea',border:'2px solid #667eea',padding:'12px 24px',fontSize:15,fontWeight:600,borderRadius:8,cursor:'pointer'}}>Create Your Profile</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SUBSCRIPTION/PRICING PAGE
══════════════════════════════════════════ */
function SubscriptionPage({go,currentTier,onUpgrade}) {
  const [loading,setLoading]=useState(false);
  const handleUpgrade=async()=>{ setLoading(true); try{ await onUpgrade(); }catch(e){ alert('Payment failed. Please try again.'); }finally{ setLoading(false); } };
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',padding:'60px 20px',fontFamily:'Inter, sans-serif'}}>
      <div style={{textAlign:'center',marginBottom:60}}>
        <h1 style={{fontSize:48,fontWeight:900,color:'#fff',marginBottom:16}}>Choose Your Plan</h1>
        <p style={{fontSize:20,color:'#94a3b8',maxWidth:600,margin:'0 auto'}}>Start for free, upgrade to unlock premium themes</p>
      </div>
      <div style={{maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:30}}>
        <div style={{background:'#1e293b',borderRadius:20,padding:40,border:'2px solid #334155'}}>
          <div style={{fontSize:14,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>FREE</div>
          <div style={{marginBottom:24}}><span style={{fontSize:48,fontWeight:900,color:'#fff'}}>₹0</span><span style={{fontSize:18,color:'#64748b',marginLeft:8}}>/forever</span></div>
          <div style={{fontSize:16,color:'#94a3b8',marginBottom:32,lineHeight:1.6}}>Perfect for getting started</div>
          <div style={{marginBottom:32}}>
            {['Custom portfolio URL','GitHub integration','LeetCode & Codeforces stats','Project showcase','10+ basic themes','Profile analytics'].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,color:'#cbd5e1'}}><span style={{color:'#22c55e',fontSize:18}}>✓</span><span>{f}</span></div>
            ))}
          </div>
          {currentTier==='FREE'&&<div style={{background:'#334155',color:'#94a3b8',padding:'14px 24px',borderRadius:10,textAlign:'center',fontWeight:600}}>Current Plan</div>}
        </div>
        <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',borderRadius:20,padding:40,border:'2px solid #8b5cf6',transform:'scale(1.05)',boxShadow:'0 20px 60px rgba(139, 92, 246, 0.4)',position:'relative'}}>
          <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#22c55e',color:'#fff',padding:'6px 20px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Most Popular</div>
          <div style={{fontSize:14,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:1,marginBottom:16,opacity:0.9}}>PRO</div>
          <div style={{marginBottom:24}}><span style={{fontSize:48,fontWeight:900,color:'#fff'}}>₹1</span><span style={{fontSize:18,color:'#e9d5ff',marginLeft:8}}>/month</span></div>
          <div style={{fontSize:16,color:'#e9d5ff',marginBottom:32,lineHeight:1.6}}>Unlock premium themes and features</div>
          <div style={{marginBottom:32}}>
            {['Everything in FREE','🏎️ F1 Racing Theme','🌸 Ghibli Theme','🌈 Aurora Theme','Priority support','Custom domain','Advanced analytics','Remove branding'].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,color:'#fff'}}><span style={{color:'#22c55e',fontSize:18,fontWeight:700}}>✓</span><span style={{fontWeight:i<4?600:400}}>{f}</span></div>
            ))}
          </div>
          {currentTier==='PRO'?<div style={{background:'rgba(255,255,255,0.2)',color:'#fff',padding:'14px 24px',borderRadius:10,textAlign:'center',fontWeight:600,backdropFilter:'blur(10px)'}}>Current Plan ✨</div>:
          <button onClick={handleUpgrade} disabled={loading} style={{width:'100%',background:'#fff',color:'#667eea',border:'none',padding:'14px 24px',borderRadius:10,fontSize:16,fontWeight:700,cursor:loading?'not-allowed':'pointer',boxShadow:'0 4px 14px rgba(0,0,0,0.2)',opacity:loading?0.7:1}}>{loading?'Processing...':'Upgrade to PRO →'}</button>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYMENT SUCCESS PAGE
══════════════════════════════════════════ */
function PaymentSuccessPage({go}) {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter, sans-serif',padding:'20px'}}>
      <div style={{textAlign:'center',background:'#fff',padding:60,borderRadius:24,maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{width:100,height:100,background:'#22c55e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:48,color:'#fff'}}>✓</div>
        <h1 style={{fontSize:32,fontWeight:700,color:'#1a202c',marginBottom:16}}>Welcome to PRO! 🎉</h1>
        <p style={{fontSize:18,color:'#718096',lineHeight:1.6,marginBottom:32}}>Your payment was successful! You now have access to all PRO themes.</p>
        <div style={{background:'#f7fafc',padding:20,borderRadius:12,marginBottom:32,textAlign:'left'}}>
          <div style={{fontSize:14,color:'#718096',marginBottom:8}}>What's unlocked:</div>
          {['🏎️ F1 Racing Theme','🌸 Ghibli Theme','🌈 Aurora Theme','✨ Priority Support'].map((item,i)=>(
            <div key={i} style={{fontSize:16,color:'#1a202c',marginBottom:6}}>{item}</div>
          ))}
        </div>
        <button onClick={()=>go('dashboard')} style={{width:'100%',background:'#667eea',color:'#fff',border:'none',padding:'16px',fontSize:16,fontWeight:600,borderRadius:10,cursor:'pointer'}}>Go to Dashboard →</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYMENT FAILED PAGE
══════════════════════════════════════════ */
function PaymentFailedPage({go,retry}) {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter, sans-serif',padding:'20px'}}>
      <div style={{textAlign:'center',background:'#fff',padding:60,borderRadius:24,maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,0.1)'}}>
        <div style={{width:100,height:100,background:'#fee2e2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:48,color:'#dc2626'}}>✕</div>
        <h1 style={{fontSize:32,fontWeight:700,color:'#1a202c',marginBottom:16}}>Payment Failed</h1>
        <p style={{fontSize:18,color:'#718096',lineHeight:1.6,marginBottom:32}}>Your payment could not be processed. Please try again.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button onClick={retry} style={{background:'#667eea',color:'#fff',border:'none',padding:'14px 28px',fontSize:16,fontWeight:600,borderRadius:10,cursor:'pointer'}}>Try Again</button>
          <button onClick={()=>go('dashboard')} style={{background:'#fff',color:'#667eea',border:'2px solid #667eea',padding:'14px 28px',fontSize:16,fontWeight:600,borderRadius:10,cursor:'pointer'}}>Go Back</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   APP ROOT — simple client-side router
══════════════════════════════════════════ */
export default function App(){
  const urlSlug = window.location.pathname.startsWith("/u/")
    ? window.location.pathname.replace("/u/","")
    : null;

  const [page, setPage] = useState(urlSlug ? "portfolio:"+urlSlug : "landing");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(()=>{
    api.getMyProfile()
      .then((profile)=>{
        setLoggedIn(true);
        setUserProfile(profile);
        if(!urlSlug) setPage("dashboard");
      })
      .catch(()=>{});
  },[]);

  const handleUpgradeToPro = async () => {
    try {
      // Load Razorpay SDK if not already loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Could not load payment system. Please check your internet connection and try again.');
        return;
      }

      const profile = userProfile || await api.getMyProfile();

      initiateRazorpayPayment(
        1,
        { name: profile.name, email: profile.email || 'fortesting997@gmail.com' },
        async (paymentResponse) => {
          try {
            console.log('✅ Payment successful! Response:', paymentResponse);
            console.log('🔄 Verifying payment with backend...');

            const verification = await api.verifyPayment({
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpaySignature: paymentResponse.razorpay_signature
            });

            console.log('📝 Verification response:', verification);

            if (verification.success) {
              console.log('✅ Payment verified! Upgrading to PRO...');
              await api.updateProfile({ subscriptionTier: 'PRO' });
              setUserProfile({...profile, subscriptionTier: 'PRO'});
              console.log('🎉 User upgraded to PRO successfully!');
              setPage('payment-success');
            } else {
              console.error('❌ Payment verification failed');
              setPage('payment-failed');
            }
          } catch (error) {
            console.error('❌ Verification error:', error);
            setPage('payment-failed');
          }
        },
        (error) => {
          console.error('Payment error:', error);
          setPage('payment-failed');
        }
      );
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const go=(p)=>{
    if(p==="dashboard") setLoggedIn(true);
    if(p?.startsWith("portfolio:")){
      const s=p.split(":")[1];
      window.history.pushState(null,"",s?"/u/"+s:"/");
    } else {
      window.history.pushState(null,"","/");
    }
    setPage(p);
  };

  return(
    <>
      <style>{STYLES}</style>
      {page==="landing"   && <Landing  go={go}/>}
      {page==="login"     && <Login    go={go}/>}
      {page==="notfound"  && <NotFoundPage go={go}/>}
      {page==="private"   && <PrivateProfilePage go={go} slug={page.split(":")[1] || "unknown"}/>}
      {page==="subscription" && <SubscriptionPage go={go} currentTier={userProfile?.subscriptionTier || 'FREE'} onUpgrade={handleUpgradeToPro}/>}
      {page==="payment-success" && <PaymentSuccessPage go={go}/>}
      {page==="payment-failed" && <PaymentFailedPage go={go} retry={handleUpgradeToPro}/>}
      {page?.startsWith("portfolio") && <Portfolio go={go} slug={page.split(":")[1]} loggedIn={loggedIn}/>}
      {page==="dashboard" && <Dashboard go={go}/>}
    </>
  );
}