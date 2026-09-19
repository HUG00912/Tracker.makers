// ---------- Endurecimiento (auditoría de seguridad) ----------
// Anti-clickjacking: GitHub Pages no permite el encabezado X-Frame-Options,
// así que si la página se carga dentro de otra, no se muestra.
(function antiFraming() {
  let enMarco = false;
  try { enMarco = window.top !== window.self; } catch (e) { enMarco = true; }
  if (!enMarco) return;
  document.body.textContent = "";
  const a = document.createElement("a");
  a.href = window.location.href; a.target = "_blank"; a.rel = "noopener noreferrer";
  a.textContent = "Abrir la aplicación en una pestaña nueva";
  a.style.cssText = "display:block; margin:40px auto; text-align:center; font-family:sans-serif;";
  document.body.appendChild(a);
  throw new Error("Bloqueado: la página no puede mostrarse dentro de un marco.");
})();

// Solo se aceptan enlaces https (evita javascript:, data:, http: en los enlaces guardados en la base de datos).
function urlSegura(valor) {
  try {
    const u = new URL(String(valor || "").trim());
    return u.protocol === "https:" ? u.href : null;
  } catch (e) { return null; }
}
function hostDe(url) { try { return new URL(url).hostname; } catch (e) { return ""; } }

  // ---------- Configuración de conexión ----------
  const SUPABASE_URL = "https://bmemugrucwmgbhxglagd.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZW11Z3J1Y3dtZ2JoeGdsYWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTE1NzksImV4cCI6MjEwNDg4NzU3OX0.MBDkDeuq1w57cSYdYX1CYRHinD_IwSjyOc2YwdR1dy8";

  // El login que ve la gente es solo con nombre; por dentro, Supabase sigue
  // necesitando un correo. Este mapeo traduce uno al otro sin que se note.
  const NOMBRE_A_CORREO = {
    hugo: "gmhugo12@gmail.com",
    valezka: "valezkamedina23@gmail.com",
    demo: "gmhugo12+demo@gmail.com",
  };

  if (typeof window.supabase === "undefined") {
    document.getElementById("app").innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color:#E8EAED; text-align:center;">
        <div>
          <div style="font-size:15px; font-weight:600; margin-bottom:8px;">No se pudo cargar la librería de Supabase</div>
          <div style="font-size:12px; color:#8B95A3; max-width:340px;">
            Esta página necesita conexión a internet para cargar el conector de la base de datos.
            Revisa tu conexión, o si tienes un bloqueador de anuncios/scripts activo, desactívalo para este archivo y recarga.
          </div>
        </div>
      </div>`;
    document.getElementById("conn-label").textContent = "Sin conexión";
    document.getElementById("conn-dot").style.background = "var(--bad)";
    throw new Error("Supabase SDK no disponible");
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const STAGES = [
    { id: "idea", label: "Idea" },
    { id: "guion", label: "Guion" },
    { id: "filmacion", label: "Producción" },
    { id: "edicion", label: "Edición" },
    { id: "copy", label: "Copy" },
    { id: "programado", label: "Programado" },
    { id: "entregado", label: "Entregado" },
  ];

  // Qué etapas aplican según el tipo de contenido, y cómo se llama la etapa
  // "filmacion" en cada caso (se reutiliza la misma columna, solo cambia el nombre).
  const STAGES_ACTIVAS_POR_TIPO = {
    video: ["idea", "guion", "filmacion", "edicion", "copy", "programado", "entregado"],
    fotografia: ["idea", "filmacion", "edicion", "copy", "programado", "entregado"],
    estatico: ["idea", "filmacion", "copy", "programado", "entregado"],
  };

  function etiquetaEtapa(id, tipo) {
    if (id === "filmacion") return (TIPOS[tipo] || TIPOS.video).fechaLabel;
    return (STAGES.find((s) => s.id === id) || {}).label || id;
  }

  function opcionesEtapaHTML(tipo, selectedId) {
    const activas = STAGES_ACTIVAS_POR_TIPO[tipo] || STAGES_ACTIVAS_POR_TIPO.video;
    return activas.map((id) => `<option value="${id}" ${id === selectedId ? "selected" : ""}>${escapeHtml(etiquetaEtapa(id, tipo))}</option>`).join("");
  }

  function actualizarSelectEtapa(selectEl, tipo, etapaActual) {
    const activas = STAGES_ACTIVAS_POR_TIPO[tipo] || STAGES_ACTIVAS_POR_TIPO.video;
    const valorFinal = activas.includes(etapaActual) ? etapaActual : activas[0];
    selectEl.innerHTML = opcionesEtapaHTML(tipo, valorFinal);
    return valorFinal;
  }

  // Color con significado por etapa (psicología del color):
  // azul = calma/planeación, morado = misterio creativo, naranja = energía de producción,
  // rosa = cuidado y sensibilidad, amarillo = energía del mensaje, café = confiabilidad,
  // verde = armonía de un proyecto cerrado.
  const STAGE_COLORS = {
    idea: "var(--st-idea)",
    guion: "var(--st-guion)",
    filmacion: "var(--st-filmacion)",
    edicion: "var(--st-edicion)",
    copy: "var(--st-copy)",
    programado: "var(--st-programado)",
    entregado: "var(--st-entregado)",
  };

  const TIPOS = {
    video: { label: "Video", iconName: "film", fechaLabel: "Filmación" },
    fotografia: { label: "Fotografía", iconName: "camera", fechaLabel: "Sesión de fotos" },
    estatico: { label: "Contenido estático", iconName: "image", fechaLabel: "Creación" },
  };

  const CLIENT_STAGES = [
    { ids: ["idea", "guion", "filmacion"], label: "En preparación" },
    { ids: ["edicion", "copy"], label: "En producción" },
    { ids: ["programado"], label: "Listo para publicar" },
    { ids: ["entregado"], label: "Publicado" },
  ];

  const TOOLS = [
    { name: "CapCut", url: "https://www.capcut.com", note: "Edición y silencios" },
    { name: "Meta Business Suite", url: "https://business.facebook.com", note: "Programar publicaciones" },
    { name: "Higgsfield", url: "https://higgsfield.ai", note: "Tomas generadas con IA" },
  ];

  // ---------- Indicador de conexión ----------
  function setConnStatus(status, label) {
    const dot = document.getElementById("conn-dot");
    const lbl = document.getElementById("conn-label");
    if (!dot || !lbl) return;
    const colors = { online: "var(--ok)", offline: "var(--bad)", checking: "var(--muted)" };
    dot.style.background = colors[status] || colors.checking;
    lbl.textContent = label;
  }

  async function checkConnection() {
    if (!navigator.onLine) { setConnStatus("offline", "Sin internet"); return; }
    try {
      const { error } = await sb.from("clientes").select("id").limit(1);
      if (error) throw error;
      setConnStatus("online", "En línea");
    } catch (err) {
      setConnStatus("offline", "Servidor no responde");
    }
  }

  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", () => setConnStatus("offline", "Sin internet"));
  setInterval(checkConnection, 20000);

  // ---------- Estado ----------
  let state = {
    session: null,      // { userId, nombre, rol, clienteId }
    videos: [],
    clientes: [],
    eventos: [],
    comentariosPorVideo: {},
    mainView: "tablero", // "tablero" | "calendario"
    view: "equipo",
    teamClientFilter: "Todos",
    selectedClient: null,
    showForm: false,
    selectedVideoId: null,
    detailComments: [],
    liveStatus: "",
    loginError: "",
    showClientes: false,
    showBulk: false,
    showPendientes: false,
    showDeleteConfirm: false,
    deleteError: "",
    showEliminados: false,
    eliminaciones: [],
    config: { whatsapp: "" },
    pendientesOcultos: {},
    clienteSeccion: "inicio",
    newClienteNombre: "",
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(), // 0-11
    selectedDay: null, // "YYYY-MM-DD"
    showEventForm: false,
  };
  let realtimeChannel = null;

  const app = document.getElementById("app");
  function render() { app.innerHTML = state.session ? trackerView() : loginView(); attachHandlers(); }

  // ---------- Vista: login ----------
  function loginView() {
    return `
      <div class="login">
        <div class="login-brand">
          <div>${wordmark(46, "var(--ivory)", "var(--lime)")}</div>
          <div class="login-claim">Hacemos crecer<br/>lo que creas.</div>
          <div class="login-foot">PANEL DE PRODUCCIÓN · ESTRATEGIA Y CRECIMIENTO</div>
        </div>
        <div class="login-form">
          <form id="login-form" class="login-card">
            <h1>Iniciar sesión</h1>
            <div class="sm muted" style="margin-bottom:20px;">Accede al panel de producción</div>
            <div class="field">
              <label class="f" for="login-email">Usuario</label>
              <input class="input" type="text" id="login-email" required autocomplete="username" />
            </div>
            <div class="field">
              <label class="f" for="login-password">Contraseña</label>
              <input class="input" type="password" id="login-password" required autocomplete="current-password" />
            </div>
            ${state.loginError ? `<div class="error-text" style="margin-bottom:10px;">${escapeHtml(state.loginError)}</div>` : ""}
            <button type="submit" class="btn primary block">Entrar</button>
            <div class="hint" style="margin-top:12px;">¿No tienes cuenta? Pídele a Hugo que la cree.</div>
          </form>
        </div>
      </div>`;
  }

  // ---------- Vista: tablero ----------
  function trackerView() {
    const isEquipo = state.session.rol === "equipo";
    const teamVideos = state.teamClientFilter === "Todos"
      ? state.videos
      : state.videos.filter(v => v.cliente_id === state.teamClientFilter);
    const clientVideos = state.videos.filter(v => v.cliente_id === state.selectedClient);
    const nombreCliente = id => (state.clientes.find(c => c.id === id) || {}).nombre || "—";
    const inicial = (state.session.nombre || "?").charAt(0).toUpperCase();
    const { total: totalPend } = isEquipo ? construirPendientes() : { total: 0 };

    const nav = (id, ic, label, badge) => `
      <button class="nav ${state.mainView === id ? "on" : ""}" data-main="${id}">
        ${icon(ic, 16)}<span class="grow">${label}</span>
        ${badge ? `<span class="badge">${badge}</span>` : ""}
      </button>`;

    const railEquipo = `
      <div class="grp">TRABAJO</div>
      ${nav("tablero", "board", "Tablero")}
      ${nav("calendario", "calendar", "Calendario")}
      ${nav("portal", "home", "Portal del cliente")}
      <div class="grp">GESTIÓN</div>
      ${nav("clientes", "users2", "Clientes")}
      ${nav("eliminados", "close", "Eliminados")}
      <div class="rail-foot">
        <div class="grp" style="margin:0 0 6px;">PENDIENTES ${totalPend ? `<span class="badge">${totalPend}</span>` : ""}</div>
        ${pendientesRail()}
      </div>`;

    const railCliente = `
      <div class="grp">MI CUENTA</div>
      ${nav("inicio", "home", "Inicio")}
      ${nav("proyectos", "board", "Mis proyectos", pendientesClienteCount(clientVideos) || null)}
      ${nav("soporte", "chat", "Soporte")}`;

    return `
      <div class="shell">
        <header class="top">
          ${wordmark(24, "var(--ivory)", "var(--lime)")}
          <div class="sep"></div>
          <div class="eyebrow">${isEquipo ? "PRODUCCIÓN" : "PORTAL DEL CLIENTE"}</div>
          <div class="who">
            <div style="text-align:right;">
              <div class="nm">${escapeHtml(state.session.nombre)}</div>
              <div class="rl">${isEquipo ? "Equipo" : "Cliente"}${state.liveStatus ? " · " + escapeHtml(state.liveStatus) : ""}</div>
            </div>
            <div class="avatar-top">${inicial}</div>
            <button id="signout-btn" class="btn tiny">Salir</button>
          </div>
        </header>

        <aside class="rail">${isEquipo ? railEquipo : railCliente}</aside>

        <main class="main">${isEquipo ? mainEquipo(teamVideos, clientVideos, nombreCliente) : mainCliente(clientVideos)}</main>
      </div>

      ${state.showForm ? newProjectModal() : ""}
      ${state.selectedVideoId ? detailModal() : ""}
      ${state.showBulk ? bulkModal() : ""}`;
  }

  function pendientesClienteCount(videos) {
    return videos.filter((v) => {
      const fase = ["idea", "guion"].includes(v.etapa) ? "idea" : v.etapa === "programado" ? "final" : null;
      if (!fase) return false;
      return (fase === "idea" ? v.estado_aprobacion_idea : v.estado_aprobacion_final) === "pendiente";
    }).length;
  }

  // ---------- Área de trabajo: equipo ----------
  function mainEquipo(teamVideos, clientVideos, nombreCliente) {
    if (state.mainView === "calendario") {
      return `<div class="page">
        <div class="ph"><div><h1>Calendario</h1><div class="desc">Producciones, entregas y plazos de aprobación.</div></div></div>
        ${calendarioView()}
      </div>`;
    }
    if (state.mainView === "clientes") return `<div class="page">${clientesPage()}</div>`;
    if (state.mainView === "eliminados") return `<div class="page">${eliminadosPage()}</div>`;
    if (state.mainView === "portal") {
      return `<div class="page">
        <div class="ph">
          <div><h1>Portal del cliente</h1><div class="desc">Así ve el cliente su cuenta. Solo vista previa.</div></div>
          <div class="acts">
            ${state.clientes.map(c => `<button class="btn tiny client-select ${state.selectedClient === c.id ? "primary" : ""}" data-id="${c.id}">${escapeHtml(c.nombre)}</button>`).join("")}
          </div>
        </div>
        <div style="border:1px dashed var(--line-light,#C4BCA6); border-radius:12px; padding:18px; background:var(--surface2);">
          ${clientePortalContenido(clientVideos, "inicio-preview")}
        </div>
      </div>`;
    }

    const hoy = fechaISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const activos = state.videos.filter((v) => v.etapa !== "entregado").length;
    const esperando = state.videos.filter((v) =>
      (["idea", "guion"].includes(v.etapa) && v.estado_aprobacion_idea === "pendiente") ||
      (v.etapa === "programado" && v.estado_aprobacion_final === "pendiente")).length;
    const estaSemana = state.videos.filter((v) => v.fecha_filmacion && v.fecha_filmacion >= hoy).length;
    const ayuda = state.videos.filter((v) => v.necesita_ayuda).length;

    return `<div class="page">
      <div class="ph">
        <div><h1>Tablero de producción</h1><div class="desc">Todo el contenido en curso, por etapa.</div></div>
        <div class="acts">
          <button id="new-project-btn" class="btn primary">${icon("plus", 14)} Nuevo posteo</button>
          <button id="bulk-btn" class="btn">${icon("layers", 14)} Cargar mes</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat" style="--bar:var(--blue);"><div class="v">${activos}</div><div class="l">En producción</div></div>
        <div class="stat" style="--bar:var(--warn);"><div class="v">${esperando}</div><div class="l">Esperando al cliente</div></div>
        <div class="stat" style="--bar:var(--st-filmacion);"><div class="v">${estaSemana}</div><div class="l">Producciones por venir</div></div>
        <div class="stat" style="--bar:${ayuda ? "var(--bad)" : "var(--ok)"};"><div class="v">${ayuda}</div><div class="l">Necesitan ayuda</div></div>
      </div>

      <div class="panel" style="padding:14px 16px; margin-bottom:16px;">
        <div class="tools">
          ${TOOLS.map(t => `<a class="tool" href="${t.url}" target="_blank" rel="noopener noreferrer"><span class="n">${escapeHtml(t.name)}</span><span class="d">${escapeHtml(t.note)}</span></a>`).join("")}
        </div>
      </div>

      ${equipoBoard(teamVideos, nombreCliente)}
    </div>`;
  }

  function equipoBoard(teamVideos, nombreCliente) {
    return `
      <div style="display:flex; gap:7px; margin-bottom:14px; flex-wrap:wrap;">
        <button class="btn tiny team-filter ${state.teamClientFilter === "Todos" ? "primary" : ""}" data-id="Todos">Todos</button>
        ${state.clientes.map(c => `<button class="btn tiny team-filter ${state.teamClientFilter === c.id ? "primary" : ""}" data-id="${c.id}">${escapeHtml(c.nombre)}</button>`).join("")}
      </div>
      <div class="kan" style="grid-template-columns:repeat(${STAGES.length}, minmax(168px,1fr));">
        ${STAGES.map(stage => {
          const items = teamVideos.filter(v => v.etapa === stage.id);
          const col = STAGE_COLORS[stage.id];
          return `
            <div class="kcol">
              <div class="kcol-h" style="--kc:${col};">
                <span class="t">${escapeHtml(stage.label)}</span><span class="n">${items.length}</span>
              </div>
              ${items.map(v => videoCard(v, nombreCliente(v.cliente_id))).join("") || `<div class="kcol-empty">—</div>`}
            </div>`;
        }).join("")}
      </div>`;
  }

  // ---------- Área de trabajo: cliente ----------
  function mainCliente(videos) {
    const sec = ["inicio", "proyectos", "soporte"].includes(state.mainView) ? state.mainView : "inicio";
    return `<div class="page">${clientePortalContenido(videos, sec)}</div>`;
  }

  function clientePortalContenido(videos, sec) {
    if (sec === "proyectos") return clienteProyectos(videos);
    if (sec === "soporte") return clienteSoporte();
    return clienteInicio(videos);
  }

  function clienteInicio(videos) {
    const pendientes = videos.filter((v) => {
      const fase = ["idea", "guion"].includes(v.etapa) ? "idea" : v.etapa === "programado" ? "final" : null;
      if (!fase) return false;
      return (fase === "idea" ? v.estado_aprobacion_idea : v.estado_aprobacion_final) === "pendiente";
    });

    const proximo = pendientes.slice().sort((a, b) => {
      const fa = ["idea", "guion"].includes(a.etapa) ? a.fecha_limite_idea : a.fecha_limite_final;
      const fb = ["idea", "guion"].includes(b.etapa) ? b.fecha_limite_idea : b.fecha_limite_final;
      return (fa || "9999").localeCompare(fb || "9999");
    })[0];

    const barColors = ["var(--blue)", "var(--st-edicion)", "var(--st-programado)", "var(--ok)"];

    return `
      <div class="ph">
        <div>
          <h1>Bienvenido, ${escapeHtml(state.session.nombre)}</h1>
          <div class="desc">Aquí ves el avance de tu contenido y lo que necesitamos de ti.</div>
        </div>
      </div>

      <div class="stats">
        ${CLIENT_STAGES.map((g, i) => `
          <div class="stat" style="--bar:${barColors[i]};">
            <div class="v">${videos.filter(v => g.ids.includes(v.etapa)).length}</div>
            <div class="l">${g.label}</div>
          </div>`).join("")}
      </div>

      <div class="panel dark" style="padding:22px 24px;">
        ${proximo ? `
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.1em; color:var(--lime); margin-bottom:9px;">TU PRÓXIMO PASO</div>
          <h2 style="font-size:19px; margin-bottom:6px;">Revisar "${escapeHtml(proximo.titulo)}"</h2>
          <div class="sm muted" style="margin-bottom:16px;">
            ${["idea", "guion"].includes(proximo.etapa) ? "La idea y el guion están listos para tu aprobación." : "El video final está listo para tu aprobación."}
            ${plazoTextoCliente(proximo)}
          </div>
          <button class="btn lime ir-a-proyectos-btn" type="button">Ir a revisar${icon("arrowRight", 14)}</button>
        ` : `
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.1em; color:var(--lime); margin-bottom:9px;">TODO AL DÍA</div>
          <h2 style="font-size:19px; margin-bottom:6px;">No tienes nada pendiente</h2>
          <div class="sm muted">Seguimos trabajando en tu contenido. Te avisamos cuando necesitemos tu visto bueno.</div>
        `}
      </div>

      <div class="panel" style="margin-top:14px;">
        <div class="panel-h"><h2>¿Necesitas algo?</h2></div>
        <div class="sm" style="color:var(--ink2); margin-bottom:14px;">Coordina una reunión con el equipo cuando lo necesites.</div>
        ${botonAgendar()}
      </div>`;
  }

  function plazoTextoCliente(v) {
    const fase = ["idea", "guion"].includes(v.etapa) ? "idea" : "final";
    const plazo = fase === "idea" ? v.fecha_limite_idea : v.fecha_limite_final;
    if (!plazo) return "";
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dias = Math.round((new Date(plazo + "T00:00:00") - hoy) / 86400000);
    if (dias > 1) return ` Tienes ${dias} días para responder.`;
    if (dias === 1) return " Es tu último día para responder.";
    if (dias === 0) return " El plazo vence hoy.";
    return " El plazo ya venció.";
  }

  function botonAgendar() {
    const n = (state.config.whatsapp || "").replace(/\D/g, "");
    if (!n) return `<div class="sm muted">Todavía no hay un número configurado.</div>`;
    const url = `https://wa.me/${n}?text=${encodeURIComponent(`Hola, soy ${state.session.nombre}. Quiero agendar una reunión.`)}`;
    return `<a class="btn primary" href="${url}" target="_blank" rel="noopener noreferrer">${icon("chat", 14)} Agendar reunión por WhatsApp</a>`;
  }

  function clienteSoporte() {
    return `
      <div class="ph"><div><h1>Soporte</h1><div class="desc">Estamos a un mensaje de distancia.</div></div></div>
      <div class="panel">
        <div class="panel-h"><h2>Hablar con el equipo</h2></div>
        <div class="sm" style="color:var(--ink2); margin-bottom:16px;">¿Tienes dudas sobre el proceso, quieres proponer una idea o coordinar una grabación? Escríbenos directo por WhatsApp.</div>
        ${botonAgendar()}
      </div>
      <div class="panel">
        <div class="panel-h"><h2>Cómo funciona el proceso</h2></div>
        <div class="lst">
          ${[["1","Aprobación de la idea","Te compartimos el guion o concepto. Tú lo apruebas o pides cambios."],
             ["2","Producción","Grabamos, editamos y preparamos el copy del posteo."],
             ["3","Aprobación final","Te compartimos el material terminado para tu visto bueno."],
             ["4","Publicación","Programamos y publicamos en tus redes."]].map(([k,t,d]) => `
            <div class="lrow">
              <div class="av" style="background:var(--blue); color:#fff;">${k}</div>
              <div><div class="t">${t}</div><div class="s">${d}</div></div>
            </div>`).join("")}
        </div>
      </div>`;
  }

  function clienteProyectos(videos) {
    return `
      <div class="ph"><div><h1>Mis proyectos</h1><div class="desc">Todo tu contenido y en qué punto va.</div></div></div>
      <div class="kan" style="grid-template-columns:repeat(${CLIENT_STAGES.length}, minmax(200px,1fr));">
        ${CLIENT_STAGES.map((group, i) => {
          const items = videos.filter(v => group.ids.includes(v.etapa));
          const cols = ["var(--blue)", "var(--st-edicion)", "var(--st-programado)", "var(--ok)"];
          return `
            <div class="kcol">
              <div class="kcol-h" style="--kc:${cols[i]};"><span class="t">${group.label}</span><span class="n">${items.length}</span></div>
              ${items.map(v => clientCard(v)).join("") || `<div class="kcol-empty">—</div>`}
            </div>`;
        }).join("")}
      </div>`;
  }

  function clientCard(v) {
    const comentarios = (state.comentariosPorVideo || {})[v.id] || [];
    const fase = ["idea", "guion"].includes(v.etapa) ? "idea" : v.etapa === "programado" ? "final" : null;
    const estado = fase === "idea" ? v.estado_aprobacion_idea : fase === "final" ? v.estado_aprobacion_final : null;
    const col = fase
      ? (estado === "aprobado" ? "var(--ok)" : estado === "cambios" ? "var(--bad)" : "var(--blue)")
      : (v.etapa === "entregado" ? "var(--ok)" : "var(--line)");
    const t = TIPOS[v.tipo] || TIPOS.video;

    return `
      <div class="tcard" style="--kc:${col}; cursor:default;">
        <div class="cl">${icon(t.iconName, 12)} ${t.label}</div>
        <div class="ti">${escapeHtml(v.titulo)}</div>
        <div class="dline">${icon("package", 11)} Entrega: ${v.fecha_entrega || "por confirmar"}</div>

        ${fase === "idea" ? `
          <div class="sec" style="margin-top:2px; padding-top:10px;">
            <div class="sec-t" style="margin-bottom:7px;">Idea / guion</div>
            <div style="font-size:12px; background:var(--surface2); border:1px solid var(--line2); border-radius:var(--r-sm); padding:9px 11px; white-space:pre-wrap; max-height:150px; overflow-y:auto;">${escapeHtml(v.guion) || `<span class="muted">Todavía no se ha cargado el guion.</span>`}</div>
          </div>` : ""}

        ${fase === "final" ? `
          <div class="sec" style="margin-top:2px; padding-top:10px;">
            ${urlSegura(v.link_revision)
              ? `<a class="btn block" href="${escapeHtml(urlSegura(v.link_revision))}" target="_blank" rel="noopener noreferrer" style="color:var(--blue); border-color:var(--blue-line);">${icon("play", 13)} Ver video final</a><div class="sm muted" style="margin-top:5px; text-align:center;">Se abre en ${escapeHtml(hostDe(urlSegura(v.link_revision)))}</div>`
              : `<div class="sm muted">El enlace del video todavía no está listo.</div>`}
          </div>` : ""}

        ${fase ? `
          <div class="sec" style="padding-top:11px;">
            <div style="margin-bottom:9px;">
              <span class="chip ${estado === "aprobado" ? "ok" : estado === "cambios" ? "bad" : "info"}">
                ${estado === "aprobado" ? icon("check", 11) + " Aprobado" : estado === "cambios" ? icon("edit", 11) + " Cambios pedidos" : "Pendiente de tu revisión"}
              </span>
            </div>
            ${estado === "pendiente" ? `<div class="hint" style="margin-bottom:9px;">${icon("clock", 11)}${plazoTextoCliente(v) || " Sin plazo definido."}</div>` : ""}
            ${estado !== "aprobado" ? `
              <div style="display:flex; gap:6px;">
                <button class="btn tiny aprobar-btn" data-id="${v.id}" data-fase="${fase}" style="flex:1; color:var(--ok); border-color:var(--ok);">${icon("check", 12)} Aprobar</button>
                <button class="btn tiny cambios-btn" data-id="${v.id}" data-fase="${fase}" style="flex:1; color:var(--bad); border-color:var(--bad);">${icon("edit", 12)} Cambios</button>
              </div>` : ""}
          </div>` : `
          <div class="sec" style="padding-top:11px;">
            <span class="chip ${v.etapa === "entregado" ? "ok" : ""}">${v.etapa === "entregado" ? icon("check", 11) + " Publicado" : "En producción"}</span>
          </div>`}

        <div class="sec" style="padding-top:11px;">
          ${comentarios.length ? `<div class="cmts" style="max-height:110px; margin-bottom:8px;">
            ${comentarios.map(c => `<div class="cmt" style="padding:6px 9px;"><div class="w">${escapeHtml(c.autor)}</div><div class="x" style="font-size:11.5px;">${escapeHtml(c.contenido)}</div></div>`).join("")}
          </div>` : ""}
          <form class="cliente-comment-form cmt-form" data-video="${v.id}">
            <input class="input" style="font-size:11.5px; padding:6px 9px;" placeholder="Escribir un comentario…" />
            <button type="submit" class="btn tiny ib">${icon("send", 12)}</button>
          </form>
        </div>
      </div>`;
  }

  function construirPendientes() {
    const ahora = new Date();
    const hoy = fechaISO(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const mesActual = ahora.getMonth(), anioActual = ahora.getFullYear();
    const mesSig = mesActual === 11 ? 0 : mesActual + 1;
    const anioSig = mesActual === 11 ? anioActual + 1 : anioActual;

    const nombreCliente = (id) => (state.clientes.find((c) => c.id === id) || {}).nombre || "—";
    const mesDe = (fechaStr) => { const [y, m] = fechaStr.split("-").map(Number); return { y, m: m - 1 }; };

    // Un pendiente queda oculto solo para quien lo quitó, y vuelve a aparecer
    // si el posteo cambia después de haberlo ocultado.
    const ocultos = state.pendientesOcultos || {};
    const estaOculto = (clave, refIso) => {
      const oc = ocultos[clave];
      if (!oc) return false;
      return !refIso || new Date(oc) >= new Date(refIso);
    };

    const hoyItems = [], esteMesItems = [], proximoMesItems = [], novedades = [];

    state.videos.forEach((v) => {
      const tipoInfo = TIPOS[v.tipo] || TIPOS.video;
      const ref = v.updated_at;

      const agregarFecha = (fechaStr, icono, etiqueta, sufijo) => {
        if (!fechaStr) return;
        const clave = `${sufijo}:${v.id}:${fechaStr}`;
        if (estaOculto(clave, ref)) return;
        const item = { clave, videoId: v.id, icono, color: "var(--ink2)", texto: `${etiqueta} — ${nombreCliente(v.cliente_id)}: ${v.titulo}`, fecha: fechaStr };
        if (fechaStr === hoy) { item.color = "var(--blue)"; hoyItems.push(item); return; }
        if (fechaStr < hoy) return;
        const { y, m } = mesDe(fechaStr);
        if (y === anioActual && m === mesActual) esteMesItems.push(item);
        else if (y === anioSig && m === mesSig) proximoMesItems.push(item);
      };

      agregarFecha(v.fecha_filmacion, tipoInfo.iconName, tipoInfo.fechaLabel, "prod");
      agregarFecha(v.fecha_entrega, "package", "Entrega", "entrega");
      if (v.estado_aprobacion_idea === "pendiente") agregarFecha(v.fecha_limite_idea, "clock", "Vence aprobación de idea", "plazoidea");
      if (v.estado_aprobacion_final === "pendiente") agregarFecha(v.fecha_limite_final, "clock", "Vence aprobación final", "plazofinal");

      const nov = (sufijo, icono, color, texto) => {
        const clave = `${sufijo}:${v.id}`;
        if (estaOculto(clave, ref)) return;
        novedades.push({ clave, videoId: v.id, icono, color, texto });
      };

      if (v.necesita_ayuda) nov("ayuda", "alert", "var(--bad)", `Necesita ayuda — ${nombreCliente(v.cliente_id)}: ${v.titulo}`);
      if ((new Date() - new Date(v.updated_at)) / 86400000 <= 3) {
        if (v.estado_aprobacion_idea === "aprobado") nov("ideaok", "check", "var(--ok)", `Idea aprobada — ${nombreCliente(v.cliente_id)}: ${v.titulo}`);
        if (v.estado_aprobacion_idea === "cambios") nov("ideacamb", "edit", "var(--bad)", `Cambios en la idea — ${nombreCliente(v.cliente_id)}: ${v.titulo}`);
        if (v.estado_aprobacion_final === "aprobado") nov("finalok", "check", "var(--ok)", `Video aprobado — ${nombreCliente(v.cliente_id)}: ${v.titulo}`);
        if (v.estado_aprobacion_final === "cambios") nov("finalcamb", "edit", "var(--bad)", `Cambios en el video — ${nombreCliente(v.cliente_id)}: ${v.titulo}`);
      }
    });

    [hoyItems, esteMesItems, proximoMesItems].forEach((arr) => arr.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || "")));
    return { hoyItems, esteMesItems, proximoMesItems, novedades, total: hoyItems.length + novedades.length };
  }

  function pendientesRail() {
    const { hoyItems, esteMesItems, novedades } = construirPendientes();
    const lista = [...hoyItems, ...novedades, ...esteMesItems].slice(0, 8);
    const ocultosN = Object.keys(state.pendientesOcultos || {}).length;
    const pie = ocultosN ? `<button id="pend-restaurar" class="btn tiny ghost" style="width:100%; margin-top:6px; color:var(--muted);">Restaurar ${ocultosN} oculto${ocultosN === 1 ? "" : "s"}</button>` : "";
    if (!lista.length) return `<div class="pend-empty">${icon("check", 12)} Sin pendientes.</div>${pie}`;
    return `<div class="pend">
      ${lista.map((it) => `
        <div class="pend-i">
          <span class="pendiente-item" data-id="${it.videoId}" style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;" title="${escapeHtml(it.texto)}">
            <span style="color:${it.color}; display:flex;">${icon(it.icono, 13)}</span>
            <span class="x">${escapeHtml(it.texto)}</span>
            ${it.fecha ? `<span class="d">${it.fecha.slice(5)}</span>` : ""}
          </span>
          <button class="pend-x" data-clave="${escapeHtml(it.clave)}" title="Quitar de mi lista">${icon("check", 12)}</button>
        </div>`).join("")}
    </div>${pie}`;
  }

  function plazoBadge(v) {
    const fase = ["idea", "guion"].includes(v.etapa) ? "idea" : v.etapa === "programado" ? "final" : null;
    if (!fase) return "";
    const estado = fase === "idea" ? v.estado_aprobacion_idea : v.estado_aprobacion_final;
    const plazo = fase === "idea" ? v.fecha_limite_idea : v.fecha_limite_final;
    if (estado !== "pendiente" || !plazo) return "";
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dias = Math.round((new Date(plazo + "T00:00:00") - hoy) / 86400000);
    const cls = dias <= 1 ? "bad" : dias <= 3 ? "warn" : "";
    const texto = dias > 1 ? `Cliente: ${dias} días` : dias === 1 ? "Cliente: último día" : dias === 0 ? "Cliente: vence hoy" : "Plazo vencido";
    return `<div style="margin-bottom:8px;"><span class="chip ${cls}" style="font-size:10px;">${icon("clock", 11)} ${texto}</span></div>`;
  }

  function videoCard(v, clienteNombre) {
    const pct = Math.round((v.checklist_done / Math.max(1, v.checklist_total)) * 100);
    const initial = (v.responsable || "?").charAt(0).toUpperCase();
    const t = TIPOS[v.tipo] || TIPOS.video;
    return `
      <div class="tcard video-card-click" data-id="${v.id}" style="--kc:${STAGE_COLORS[v.etapa] || "var(--line)"};">
        <div class="cl">
          ${icon(t.iconName, 12)}<span class="grow nowrap" style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(clienteNombre)}</span>
          ${v.necesita_ayuda ? `<span class="chip bad" style="padding:1px 6px; font-size:9.5px;">AYUDA</span>` : ""}
        </div>
        <div class="ti">${escapeHtml(v.titulo)}</div>
        ${plazoBadge(v)}
        ${v.fecha_filmacion ? `<div class="dline">${icon(t.iconName, 11)} ${t.fechaLabel}: ${v.fecha_filmacion}</div>` : ""}
        <div class="prog">
          <div class="tr"><div class="fl ${pct === 100 ? "done" : ""}" style="width:${pct}%;"></div></div>
          <span class="n">${v.checklist_done}/${v.checklist_total}</span>
        </div>
        <div class="meta">
          <span class="num">${v.fecha_entrega || "Sin fecha"}</span>
          <div class="av" title="${escapeHtml(v.responsable || "")}">${initial}</div>
        </div>
      </div>`;
  }

  function newProjectModal() {
    return `
      <div class="ov" id="modal-overlay">
        <form id="new-project-form" class="dlg">
          <div class="dlg-h"><div class="grow"><div class="eyebrow">Crear</div><h2>Nuevo posteo</h2></div>
            <button type="button" id="np-close" class="btn tiny ib ghost">${icon("close", 14)}</button></div>
          <div class="dlg-b">
            <div class="field"><label class="f">Cliente</label>
              <select class="input" id="np-cliente">${state.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join("")}</select></div>
            <div class="field"><label class="f">Tipo de contenido</label>
              <select class="input" id="np-tipo">${Object.entries(TIPOS).map(([id, t]) => `<option value="${id}">${t.label}</option>`).join("")}</select></div>
            <div class="field"><label class="f">Título</label>
              <input class="input" id="np-titulo" placeholder="Ej. Testimonial paciente" /></div>
            <div class="row2">
              <div class="field"><label class="f">Etapa inicial</label>
                <select class="input" id="np-etapa">${opcionesEtapaHTML("video", "idea")}</select></div>
              <div class="field"><label class="f">Responsable</label>
                <select class="input" id="np-responsable"><option value="Hugo">Hugo</option><option value="Valezka">Valezka</option></select></div>
            </div>
            <div class="field" style="margin-bottom:0;"><label class="f">Fecha de entrega</label>
              <input class="input" type="date" id="np-fecha" /></div>
          </div>
          <div class="dlg-f"><button type="button" id="np-cancel" class="btn">Cancelar</button><button type="submit" class="btn primary">Crear posteo</button></div>
        </form>
      </div>`;
  }

  function bulkModal() {
    return `
      <div class="ov" id="bulk-overlay">
        <form id="bulk-form" class="dlg wide">
          <div class="dlg-h"><div class="grow"><div class="eyebrow">Carga en lote</div><h2>Cargar el mes</h2>
            <div class="hint">Todos entran en "Idea", listos para escribirles el guion.</div></div>
            <button type="button" id="bulk-close" class="btn tiny ib ghost">${icon("close", 14)}</button></div>
          <div class="dlg-b">
            <div class="row2">
              <div class="field"><label class="f">Cliente</label>
                <select class="input" id="bulk-cliente">${state.clientes.map((c) => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join("")}</select></div>
              <div class="field"><label class="f">Tipo</label>
                <select class="input" id="bulk-tipo">${Object.entries(TIPOS).map(([id, t]) => `<option value="${id}">${t.label}</option>`).join("")}</select></div>
            </div>
            <div class="field"><label class="f">Responsable por defecto</label>
              <select class="input" id="bulk-responsable"><option value="Hugo">Hugo</option><option value="Valezka">Valezka</option></select></div>
            <label class="f">Títulos</label>
            <div id="bulk-titulos" style="display:flex; flex-direction:column; gap:7px; margin-bottom:9px;">
              ${[1,2,3,4,5].map((n) => `<input class="input bulk-titulo-input" placeholder="Título ${n}" />`).join("")}
            </div>
            <button type="button" id="bulk-add-row" class="btn tiny">${icon("plus", 12)} Agregar fila</button>
          </div>
          <div class="dlg-f"><button type="button" id="bulk-cancel" class="btn">Cancelar</button><button type="submit" class="btn primary">Crear todos</button></div>
        </form>
      </div>`;
  }

  function clientesPage() {
    return `
      <div class="ph"><div><h1>Clientes</h1><div class="desc">Cuentas activas y datos de contacto.</div></div></div>

      <div class="panel" style="margin-bottom:14px;">
        <div class="panel-h"><h2>Ajustes de la agencia</h2></div>
        <div class="field" style="max-width:320px; margin:0;">
          <label class="f">WhatsApp de la agencia</label>
          <input class="input" id="config-whatsapp-input" value="${escapeHtml(state.config.whatsapp || "")}" placeholder="50688887777" />
          <div class="hint">El cliente usa este número para agendar reuniones desde su portal.</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-h"><h2>Cartera</h2><span class="chip">${state.clientes.length}</span></div>
        <div class="lst" style="margin-bottom:14px;">
          ${state.clientes.map((c) => {
            const n = state.videos.filter(v => v.cliente_id === c.id).length;
            return `
            <div class="lrow" style="align-items:flex-start;">
              <div class="av" style="background:var(--blue); color:#fff; width:30px; height:30px; font-size:12px;">${escapeHtml(c.nombre).charAt(0).toUpperCase()}</div>
              <div class="grow">
                <div class="t">${escapeHtml(c.nombre)}</div>
                <div class="s">${n} posteo${n === 1 ? "" : "s"}</div>
                <input class="input cliente-telefono-input" style="margin-top:7px; max-width:260px; font-size:12px; padding:6px 9px;" data-id="${c.id}" value="${escapeHtml(c.telefono || "")}" placeholder="Teléfono WhatsApp (ej. 50688887777)" />
              </div>
              <button class="delete-cliente-btn btn tiny danger" data-id="${c.id}">Eliminar</button>
            </div>`;
          }).join("") || `<div class="kcol-empty">Todavía no hay clientes.</div>`}
        </div>
        <form id="new-cliente-form" style="display:flex; gap:8px; max-width:420px;">
          <input class="input" id="new-cliente-nombre" placeholder="Nombre del cliente nuevo" />
          <button type="submit" class="btn primary">Agregar</button>
        </form>
      </div>`;
  }

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  function fechaISO(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function eventosCombinados() {
    // Combina eventos sueltos con las fechas que ya viven en los videos del Tablero,
    // así el Calendario nunca se desincroniza: lee la misma fuente de verdad.
    const combinados = state.eventos.map((e) => ({ ...e, origen: "libre", editable: true }));
    state.videos.forEach((v) => {
      const clienteNombre = (state.clientes.find((c) => c.id === v.cliente_id) || {}).nombre || "";
      if (v.fecha_filmacion) {
        combinados.push({
          id: "vid-film-" + v.id, fecha: v.fecha_filmacion, titulo: (v.tipo === "fotografia" ? "📷 " : v.tipo === "estatico" ? "🖼️ " : "🎬 ") + v.titulo,
          contacto: null, lugar: null, notas: clienteNombre, hora_inicio: null, hora_fin: null,
          origen: "video", editable: false, videoId: v.id, tipo: "Filmación",
        });
      }
      if (v.fecha_entrega) {
        combinados.push({
          id: "vid-entrega-" + v.id, fecha: v.fecha_entrega, titulo: "📦 " + v.titulo,
          contacto: null, lugar: null, notas: clienteNombre, hora_inicio: null, hora_fin: null,
          origen: "video", editable: false, videoId: v.id, tipo: "Entrega",
        });
      }
      // Plazos de aprobación todavía pendientes: se resaltan aparte para dar seguimiento al cliente.
      if (v.fecha_limite_idea && v.estado_aprobacion_idea === "pendiente") {
        combinados.push({
          id: "vid-plazo-idea-" + v.id, fecha: v.fecha_limite_idea, titulo: "⏳ Vence idea: " + v.titulo,
          contacto: null, lugar: null, notas: clienteNombre, hora_inicio: null, hora_fin: null,
          origen: "plazo", editable: false, videoId: v.id, tipo: "Plazo de idea",
        });
      }
      if (v.fecha_limite_final && v.estado_aprobacion_final === "pendiente") {
        combinados.push({
          id: "vid-plazo-final-" + v.id, fecha: v.fecha_limite_final, titulo: "⏳ Vence aprobación: " + v.titulo,
          contacto: null, lugar: null, notas: clienteNombre, hora_inicio: null, hora_fin: null,
          origen: "plazo", editable: false, videoId: v.id, tipo: "Plazo final",
        });
      }
    });
    return combinados;
  }

  function calendarioView() {
    const y = state.calYear, m = state.calMonth;
    const primerDiaSemana = new Date(y, m, 1).getDay();
    const diasEnMes = new Date(y, m + 1, 0).getDate();
    const hoy = fechaISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const porDia = {};
    eventosCombinados().forEach((e) => { (porDia[e.fecha] = porDia[e.fecha] || []).push(e); });

    let celdas = "";
    for (let i = 0; i < primerDiaSemana; i++) celdas += `<div></div>`;
    for (let d = 1; d <= diasEnMes; d++) {
      const iso = fechaISO(y, m, d);
      const evs = porDia[iso] || [];
      celdas += `
        <div class="cal-d cal-day ${iso === hoy ? "today" : ""} ${state.selectedDay === iso ? "on" : ""}" data-day="${iso}">
          <div class="dn">${d}</div>
          ${evs.slice(0, 2).map((e) => `<div class="ev ${e.origen}">${escapeHtml(e.titulo)}</div>`).join("")}
          ${evs.length > 2 ? `<div class="cal-more">+${evs.length - 2} más</div>` : ""}
        </div>`;
    }

    const delDia = state.selectedDay ? (porDia[state.selectedDay] || []) : [];

    return `
      <div class="panel">
        <div class="cal-h">
          <button id="cal-prev" class="btn ib">${icon("arrowLeft", 15)}</button>
          <div class="m">${MESES[m]} ${y}</div>
          <button id="cal-next" class="btn ib">${icon("arrowRight", 15)}</button>
        </div>
        <div class="cal-dow">${DIAS_SEMANA.map((d) => `<div>${d}</div>`).join("")}</div>
        <div class="cal-grid">${celdas}</div>
      </div>

      ${state.selectedDay ? `
        <div class="panel">
          <div class="panel-h">
            <h2>${state.selectedDay}</h2>
            <div class="acts"><button id="add-evento-btn" class="btn primary tiny">${icon("plus", 12)} Agregar evento</button></div>
          </div>
          <div class="lst">
            ${delDia.map((e) => e.origen === "video" ? `
              <div class="lrow video-card-click" data-id="${e.videoId}" style="cursor:pointer;">
                <span style="color:var(--ink2); display:flex;">${icon("film", 15)}</span>
                <div class="grow"><div class="t">${escapeHtml(e.titulo)}</div>
                  <div class="s">${e.tipo} · ${escapeHtml(e.notas || "")} · clic para abrir el posteo</div></div>
              </div>` : e.origen === "plazo" ? `
              <div class="lrow video-card-click" data-id="${e.videoId}" style="cursor:pointer; border-color:var(--bad);">
                <span style="color:var(--bad); display:flex;">${icon("clock", 15)}</span>
                <div class="grow"><div class="t" style="color:var(--bad);">${escapeHtml(e.titulo)}</div>
                  <div class="s">${e.tipo} · ${escapeHtml(e.notas || "")} · si no responde, se aprueba solo</div></div>
              </div>` : `
              <div class="lrow">
                <span style="color:var(--blue); display:flex;">${icon("calendar", 15)}</span>
                <div class="grow"><div class="t">${escapeHtml(e.titulo)}</div>
                  <div class="s">${[e.hora_inicio ? (e.hora_inicio + (e.hora_fin ? " – " + e.hora_fin : "")) : "", e.contacto, e.lugar, e.notas].filter(Boolean).map(escapeHtml).join(" · ") || "Sin detalles"}</div></div>
                <div class="acts"><button class="delete-evento-btn btn tiny ib danger" data-id="${e.id}">${icon("close", 12)}</button></div>
              </div>`).join("") || `<div class="kcol-empty">Sin eventos este día.</div>`}
          </div>
        </div>` : `<div class="panel"><div class="kcol-empty">Toca un día del calendario para ver o agregar eventos.</div></div>`}

      ${state.showEventForm ? eventoModal() : ""}`;
  }

  function eventoModal() {
    return `
      <div class="ov" id="evento-overlay">
        <form id="new-evento-form" class="dlg">
          <div class="dlg-h"><div class="grow"><div class="eyebrow">${state.selectedDay}</div><h2>Nuevo evento</h2></div>
            <button type="button" id="ev-close" class="btn tiny ib ghost">${icon("close", 14)}</button></div>
          <div class="dlg-b">
            <div class="field"><label class="f">Vincular a un posteo (opcional)</label>
              <select class="input" id="ev-video">
                <option value="">— Evento general —</option>
                ${state.videos.map((v) => `<option value="${v.id}">${escapeHtml((state.clientes.find((c) => c.id === v.cliente_id) || {}).nombre || "")} — ${escapeHtml(v.titulo)}</option>`).join("")}
              </select>
              <div class="hint">Si lo vinculas, actualiza la fecha de ese posteo en vez de crear un evento aparte.</div></div>
            <div class="field" id="ev-tipo-wrap" style="display:none;"><label class="f">¿Qué fecha es?</label>
              <select class="input" id="ev-tipo"><option value="fecha_filmacion">Fecha de producción</option><option value="fecha_entrega">Fecha de entrega</option></select></div>
            <div class="field"><label class="f">Título</label><input class="input" id="ev-titulo" placeholder="Ej. Reunión de kickoff" required /></div>
            <div class="field"><label class="f">Cliente</label>
              <select class="input" id="ev-cliente"><option value="">— Sin cliente —</option>
                ${state.clientes.map((c) => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join("")}</select></div>
            <div class="row2">
              <div class="field"><label class="f">Hora inicio</label><input class="input" type="time" id="ev-hora-inicio" /></div>
              <div class="field"><label class="f">Hora fin</label><input class="input" type="time" id="ev-hora-fin" /></div>
            </div>
            <div class="field"><label class="f">Contacto</label><input class="input" id="ev-contacto" placeholder="Nombre y/o teléfono" /></div>
            <div class="field"><label class="f">Lugar</label><input class="input" id="ev-lugar" placeholder="Dirección o punto de encuentro" /></div>
            <div class="field" style="margin-bottom:0;"><label class="f">Notas</label><input class="input" id="ev-notas" placeholder="Detalles adicionales" /></div>
          </div>
          <div class="dlg-f"><button type="button" id="ev-cancel" class="btn">Cancelar</button><button type="submit" class="btn primary">Guardar</button></div>
        </form>
      </div>`;
  }

  function eliminadosPage() {
    return `
      <div class="ph"><div><h1>Eliminados</h1><div class="desc">Registro permanente de lo que se ha borrado.</div></div></div>
      <div class="panel">
        <div class="lst">
          ${state.eliminaciones.map((e) => `
            <div class="lrow">
              <span style="color:var(--bad); display:flex;">${icon("close", 15)}</span>
              <div class="grow">
                <div class="t">${escapeHtml(e.titulo)}</div>
                <div class="s">${escapeHtml(e.cliente_nombre || "—")} · eliminado por ${escapeHtml(e.eliminado_por)} · ${new Date(e.eliminado_en).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>`).join("") || `<div class="kcol-empty">Todavía no se ha eliminado nada.</div>`}
        </div>
      </div>`;
  }


  function deleteConfirmModal() {
    const v = state.videos.find((x) => x.id === state.selectedVideoId);
    if (!v) return "";
    return `
      <div class="ov" id="delete-confirm-overlay" style="z-index:70;">
        <form id="delete-confirm-form" class="dlg" style="width:340px;">
          <div class="dlg-h"><span style="color:var(--bad); display:flex; margin-top:2px;">${icon("alert", 18)}</span>
            <div class="grow"><div class="eyebrow" style="color:var(--bad);">Acción irreversible</div><h2>Eliminar posteo</h2></div></div>
          <div class="dlg-b">
            <div class="sm" style="color:var(--ink2); margin-bottom:14px;">Vas a eliminar <b>"${escapeHtml(v.titulo)}"</b>. Quedará registrado quién lo hizo, pero el posteo no se puede recuperar.</div>
            <div class="field" style="margin-bottom:0;"><label class="f">Confirma con tu contraseña</label>
              <input class="input" type="password" id="delete-password" required autofocus /></div>
            ${state.deleteError ? `<div class="error-text" style="margin-top:9px;">${escapeHtml(state.deleteError)}</div>` : ""}
          </div>
          <div class="dlg-f"><button type="button" id="delete-cancel" class="btn">Cancelar</button>
            <button type="submit" class="btn" style="background:var(--bad); border-color:var(--bad); color:#fff; font-weight:600;">Eliminar</button></div>
        </form>
      </div>`;
  }


  function detailModal() {
    const v = state.videos.find((x) => x.id === state.selectedVideoId);
    if (!v) return "";
    const cliente = state.clientes.find((c) => c.id === v.cliente_id);
    const clienteNombreVal = (cliente || {}).nombre || "—";
    const t = TIPOS[v.tipo] || TIPOS.video;
    const faseDetail = ["idea", "guion"].includes(v.etapa) ? "idea" : v.etapa === "programado" ? "final" : null;
    const plazoDetail = faseDetail === "idea" ? v.fecha_limite_idea : faseDetail === "final" ? v.fecha_limite_final : null;
    const guionResumen = v.guion ? (v.guion.length > 100 ? v.guion.slice(0, 100).trim() + "…" : v.guion.trim()) : "";
    const msg = faseDetail === "idea"
      ? `Hola ${cliente ? cliente.nombre : ""}, la idea/guion de "${v.titulo}" ya está lista para tu aprobación.${guionResumen ? ` Resumen: "${guionResumen}"` : ""} Agradecemos que nos confirmes o nos avises si necesitas algún cambio.${plazoDetail ? ` Tienes hasta el ${plazoDetail} para validarla.` : ""}`
      : faseDetail === "final"
      ? `Hola ${cliente ? cliente.nombre : ""}, el video "${v.titulo}" ya está listo para tu aprobación final (era sobre "${guionResumen || v.titulo}").${urlSegura(v.link_revision) ? ` Puedes verlo aquí: ${urlSegura(v.link_revision)}` : ""} Agradecemos que nos confirmes o nos avises si necesitas algún cambio.${plazoDetail ? ` Tienes hasta el ${plazoDetail} para validarlo.` : ""}`
      : `Hola ${cliente ? cliente.nombre : ""}, te escribo sobre "${v.titulo}" — está en etapa "${etiquetaEtapa(v.etapa, v.tipo)}". ¿Me confirmas cuando puedas?`;
    const waUrl = cliente && cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}` : null;

    const bloqueAprob = (n, titulo, campo, estado, auto, plazo, plazoId, extra) => `
      <div class="sec">
        <div class="sec-t"><span class="k">${n}</span> ${titulo}</div>
        ${extra}
        <div class="field"><label class="f">Plazo para responder</label>
          <input class="input" type="date" id="${plazoId}" value="${plazo || ""}" /></div>
        <div style="margin-bottom:9px;">${badgeAprobacion(estado, auto)}</div>
        ${estado !== "aprobado" ? `
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn tiny manual-aprobar-btn" data-fase="${campo}" style="flex:1; color:var(--ok); border-color:var(--ok);">Marcar aprobado</button>
            <button type="button" class="btn tiny manual-cambios-btn" data-fase="${campo}" style="flex:1; color:var(--bad); border-color:var(--bad);">Marcar cambios</button>
          </div>
          <div class="hint">Úsalo si el cliente confirmó por WhatsApp o llamada.</div>` : ""}
      </div>`;

    return `
      <div class="ov" id="detail-overlay">
        <div class="dlg wide">
          <div class="dlg-h">
            <div class="grow">
              <div class="eyebrow">${icon(t.iconName, 12)} ${escapeHtml(clienteNombreVal)} · ${t.label}</div>
              <h2>${escapeHtml(v.titulo)}</h2>
            </div>
            <button id="detail-close" class="btn tiny ib ghost">${icon("close", 14)}</button>
          </div>

          <div class="dlg-b">
            ${waUrl ? `<a class="btn block" href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--ok); border-color:var(--ok); margin-bottom:15px;">${icon("chat", 14)} ${faseDetail ? "Pedir aprobación por WhatsApp" : "Escribir por WhatsApp"}</a>`
              : `<div class="hint" style="margin-bottom:15px;">Agrega el teléfono de este cliente en Clientes para escribirle desde aquí.</div>`}

            <div class="sec">
              <div class="sec-t">Producción</div>
              <div class="row2">
                <div class="field"><label class="f">Tipo</label>
                  <select class="input" id="d-tipo">${Object.entries(TIPOS).map(([id, ti]) => `<option value="${id}" ${id === v.tipo ? "selected" : ""}>${ti.label}</option>`).join("")}</select></div>
                <div class="field"><label class="f">Etapa</label>
                  <select class="input" id="d-etapa">${opcionesEtapaHTML(v.tipo, v.etapa)}</select></div>
              </div>
              <div class="row2">
                <div class="field"><label class="f">Responsable</label>
                  <select class="input" id="d-responsable">
                    <option value="Hugo" ${v.responsable === "Hugo" ? "selected" : ""}>Hugo</option>
                    <option value="Valezka" ${v.responsable === "Valezka" ? "selected" : ""}>Valezka</option></select></div>
                <div class="field"><label class="f">Avance</label>
                  <div style="display:flex; gap:6px; align-items:center;">
                    <input class="input" type="number" min="0" id="d-done" value="${v.checklist_done}" style="text-align:center;" />
                    <span class="muted sm">de</span>
                    <input class="input" type="number" min="1" id="d-total" value="${v.checklist_total}" style="text-align:center;" /></div></div>
              </div>
              <div class="row2">
                <div class="field"><label class="f">Fecha de ${t.fechaLabel.toLowerCase()}</label>
                  <input class="input" type="date" id="d-fecha-filmacion" value="${v.fecha_filmacion || ""}" /></div>
                <div class="field"><label class="f">Fecha de entrega</label>
                  <input class="input" type="date" id="d-fecha-entrega" value="${v.fecha_entrega || ""}" /></div>
              </div>
              <label style="display:flex; align-items:center; gap:9px; font-size:12.5px; cursor:pointer; padding:9px 11px; border-radius:var(--r-sm); background:${v.necesita_ayuda ? "var(--bad-soft)" : "var(--surface2)"};">
                <input type="checkbox" id="d-ayuda" ${v.necesita_ayuda ? "checked" : ""} />
                <span style="color:${v.necesita_ayuda ? "var(--bad)" : "var(--ink2)"}; font-weight:${v.necesita_ayuda ? "600" : "400"};">Necesita ayuda de alguien más</span>
              </label>
            </div>

            ${bloqueAprob(1, "Aprobación de la idea", "idea", v.estado_aprobacion_idea, v.aprobado_idea_auto, v.fecha_limite_idea, "d-plazo-idea", `
              <div class="field">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
                  <label class="f" style="margin:0;">Guion / idea que verá el cliente</label>
                  <button type="button" id="d-dictar-guion" class="btn tiny ghost">${icon("mic", 11)} Dictar</button>
                </div>
                <textarea class="input" id="d-guion" rows="4" style="resize:vertical;" placeholder="Escribe o dicta la idea…">${escapeHtml(v.guion || "")}</textarea>
              </div>`)}

            ${bloqueAprob(2, "Aprobación final", "final", v.estado_aprobacion_final, v.aprobado_final_auto, v.fecha_limite_final, "d-plazo-final", `
              <div class="field"><label class="f">Enlace del material terminado</label>
                <input class="input" id="d-link" value="${escapeHtml(v.link_revision || "")}" placeholder="https://drive.google.com/…" /></div>`)}

            <div class="sec">
              <div class="sec-t">Comentarios internos</div>
              <div class="cmts" id="d-comments">
                ${(state.detailComments || []).map((c) => `
                  <div class="cmt"><div class="w">${escapeHtml(c.autor)} · ${new Date(c.created_at).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div><div class="x">${escapeHtml(c.contenido)}</div></div>`).join("")
                  || `<div class="pend-empty">Sin comentarios todavía.</div>`}
              </div>
              <form id="d-comment-form" class="cmt-form">
                <input class="input" id="d-comment-text" placeholder="Escribe un avance…" />
                <button type="submit" class="btn">Enviar</button>
              </form>
            </div>

            <div class="sec">
              <button type="button" id="delete-video-btn" class="btn block danger">${icon("close", 13)} Eliminar este posteo</button>
            </div>
          </div>
        </div>
        ${state.showDeleteConfirm ? deleteConfirmModal() : ""}
      </div>`;
  }

  // ---------- Dictado por voz (nativo del navegador, sin costo ni API externa) ----------
  let reconocimiento = null;
  let dictando = false;

  function alternarDictado(textareaId, btnEl) {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("El dictado por voz solo funciona en Chrome por ahora.");
      return;
    }
    const textarea = document.getElementById(textareaId);
    if (dictando) {
      reconocimiento && reconocimiento.stop();
      dictando = false;
      btnEl.innerHTML = icon("mic", 11) + " Dictar";
      btnEl.style.color = "";
      btnEl.style.borderColor = "";
      return;
    }
    reconocimiento = new SpeechRecognitionAPI();
    reconocimiento.lang = "es-CR";
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;
    reconocimiento.onresult = (e) => {
      let texto = "";
      for (let i = e.resultIndex; i < e.results.length; i++) texto += e.results[i][0].transcript;
      if (texto.trim()) textarea.value = (textarea.value ? textarea.value.trim() + " " : "") + texto.trim();
    };
    reconocimiento.onerror = () => { dictando = false; btnEl.innerHTML = icon("mic", 11) + " Dictar"; btnEl.style.color = ""; btnEl.style.borderColor = ""; };
    reconocimiento.onend = () => { if (dictando) reconocimiento.start(); }; // se reinicia solo mientras esté activo
    reconocimiento.start();
    dictando = true;
    btnEl.textContent = "■ Detener";
    btnEl.style.color = "var(--bad)";
    btnEl.style.borderColor = "var(--bad)";
  }

  async function loadComments(videoId) {
    const { data } = await sb.from("comentarios").select("*").eq("video_id", videoId).order("created_at", { ascending: true });
    state.detailComments = data || [];
    render();
  }

  async function updateVideoField(id, patch) {
    const { error } = await sb.from("videos").update(patch).eq("id", id);
    if (error) alert("No se pudo guardar: " + error.message);
    // La suscripción en vivo refresca la vista sola.
  }

  function restarDias(fechaISOStr, dias) {
    const d = new Date(fechaISOStr + "T00:00:00");
    d.setDate(d.getDate() - dias);
    return d.toISOString().slice(0, 10);
  }

  function badgeAprobacion(estado, esAuto) {
    const cls = estado === "aprobado" ? "ok" : estado === "cambios" ? "bad" : "";
    const txt = estado === "aprobado"
      ? (esAuto ? icon("clock", 11) + " Aprobado automático (venció el plazo)" : icon("check", 11) + " Aprobado por el cliente")
      : estado === "cambios" ? icon("edit", 11) + " Cliente pidió cambios" : "Pendiente de revisión";
    return `<span class="chip ${cls}">${txt}</span>`;
  }

  // Wordmark oficial de la marca (SVG vectorial, del manual de identidad).
  function wordmark(height, colorTexto, colorPunto) {
    const h = height || 34;
    const w = h * (874.9648 / 264.8848);
    return `<svg viewBox="-60.3424 -60.3424 874.9648 264.8848" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;"><g fill="${colorTexto}"><path d="M62 0V528H189L191 373H211Q225 430 248.0 467.5Q271 505 304.0 523.5Q337 542 381 542Q427 542 457.5 522.5Q488 503 506.0 465.5Q524 428 530 373H547Q563 432 589.0 469.5Q615 507 651.0 524.5Q687 542 729 542Q774 542 807.5 524.5Q841 507 863.5 472.5Q886 438 897.0 386.5Q908 335 908 267V0H746V247Q746 300 737.5 335.0Q729 370 711.0 387.5Q693 405 665 405Q633 405 610.5 384.0Q588 363 576.0 325.5Q564 288 564 241V0H406V244Q406 299 396.5 334.0Q387 369 368.5 387.0Q350 405 322 405Q290 405 268.0 384.0Q246 363 234.5 325.5Q223 288 223 241V0Z" transform="translate(-12.40,144.20) scale(0.20000,-0.20000)"/><path d="M186 -14Q142 -14 108.0 3.5Q74 21 55.0 54.5Q36 88 36 136Q36 181 53.5 210.5Q71 240 104.5 257.5Q138 275 185.0 286.5Q232 298 292 307Q321 312 340.5 316.5Q360 321 370.0 331.0Q380 341 380 360Q380 385 362.0 403.0Q344 421 304 421Q276 421 253.5 411.0Q231 401 215.0 382.0Q199 363 191 336L49 378Q62 420 85.5 451.0Q109 482 142.0 502.5Q175 523 217.5 532.5Q260 542 308 542Q388 542 438.5 516.5Q489 491 513.5 437.5Q538 384 538 300V219Q538 183 539.5 146.5Q541 110 543.5 73.5Q546 37 550 0H408Q404 23 400.0 55.5Q396 88 394 122H375Q361 84 334.5 52.5Q308 21 270.5 3.5Q233 -14 186 -14ZM259 100Q277 100 295.5 106.5Q314 113 331.0 124.5Q348 136 362.0 153.0Q376 170 383 190L381 253Q372 248 361 245Q338 238 314.5 234.0Q291 230 268.5 225.5Q246 221 228.5 214.0Q211 207 201.0 195.0Q191 183 191 162Q191 134 210.0 117.0Q229 100 259 100Z" transform="translate(172.20,144.20) scale(0.20000,-0.20000)"/><path d="M62 0V721H220V323Q249 344 274.5 368.0Q300 392 321.5 418.0Q343 444 360.5 471.5Q378 499 391 528H575Q562 489 539.0 450.5Q516 412 483.0 379.5Q450 347 404.5 324.0Q359 301 302 293V275Q374 289 420.5 275.5Q467 262 495.0 232.0Q523 202 538.0 162.0Q553 122 563 83L584 0H409L399 50Q389 99 375.5 134.0Q362 169 337.0 188.5Q312 208 265 208H220V0Z" transform="translate(283.20,144.20) scale(0.20000,-0.20000)"/><path d="M313 -14Q247 -14 195.0 3.5Q143 21 106.5 55.0Q70 89 51.0 139.0Q32 189 32 254Q32 317 50.5 370.0Q69 423 103.5 461.5Q138 500 188.5 521.0Q239 542 302 542Q366 542 414.5 521.5Q463 501 494.5 461.0Q526 421 541.0 363.5Q556 306 551 232L187 229Q192 168 222 138Q257 101 312 101Q339 101 357.0 108.5Q375 116 386.5 127.5Q398 139 404.5 153.0Q411 167 415 180L555 150Q547 113 529.5 83.0Q512 53 482.5 31.0Q453 9 411.5 -2.5Q370 -14 313 -14ZM191 313 404 315Q404 340 396 359Q383 390 358.0 404.5Q333 419 304 419Q269 419 242.5 400.0Q216 381 201 345Q195 331 191 313Z" transform="translate(396.20,144.20) scale(0.20000,-0.20000)"/><path d="M62 0V528H194L197 349H217Q224 419 243.5 460.5Q263 502 299.5 521.0Q336 540 390 540Q398 540 408.0 539.5Q418 539 431 537L425 365Q409 373 390.5 375.5Q372 378 358 378Q319 378 290.5 363.0Q262 348 245.5 317.0Q229 286 224 239V0Z" transform="translate(505.60,144.20) scale(0.20000,-0.20000)"/><path d="M278 -14Q225 -14 182.0 -4.5Q139 5 107.0 23.0Q75 41 54.5 66.5Q34 92 26 123L146 176Q153 159 170.5 141.5Q188 124 217.5 113.0Q247 102 289 102Q329 102 351.5 113.5Q374 125 374 147Q374 163 361.5 172.5Q349 182 324.0 189.5Q299 197 262 204Q224 212 185.0 222.5Q146 233 112.0 251.5Q78 270 57.5 300.5Q37 331 37 378Q37 427 63.0 463.5Q89 500 140.5 521.0Q192 542 266 542Q332 542 382.0 525.0Q432 508 465.5 476.5Q499 445 512 401L383 355Q378 377 362.5 393.0Q347 409 323.5 417.5Q300 426 268 426Q229 426 207.5 414.0Q186 402 186 382Q186 366 200.5 355.5Q215 345 242.0 338.0Q269 331 306 323Q345 315 383.5 304.5Q422 294 453.5 276.5Q485 259 503.5 230.5Q522 202 522 157Q522 104 494.0 65.5Q466 27 411.5 6.5Q357 -14 278 -14Z" transform="translate(586.80,144.20) scale(0.20000,-0.20000)"/></g><circle cx="727.24" cy="117.16" r="27.04" fill="${colorPunto}"/></svg>`;
  }

  // ---------- Set de iconos propios ----------
  function icon(name, size, color) {
    const s = size || 14;
    const c = color || "currentColor";
    const base = `width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px; flex-shrink:0;"`;
    const paths = {
      film: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>`,
      package: `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>`,
      clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
      chat: `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>`,
      check: `<path d="M20 6 9 17l-5-5"/>`,
      edit: `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>`,
      alert: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>`,
      close: `<path d="M18 6 6 18M6 6l12 12"/>`,
      arrowLeft: `<path d="M19 12H5M12 19l-7-7 7-7"/>`,
      arrowRight: `<path d="M5 12h14M12 5l7 7-7 7"/>`,
      pin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
      user: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>`,
      play: `<path d="M6 4v16l14-8Z"/>`,
      send: `<path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/>`,
      mic: `<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/>`,
      calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
      board: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>`,
      home: `<path d="M3 9.5 12 3l9 6.5"/><path d="M5 8v12a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V8"/>`,
      plus: `<path d="M12 5v14M5 12h14"/>`,
      layers: `<path d="m12 2 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>`,
      users2: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
      camera: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/>`,
      image: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>`,
      logo: `<rect x="1" y="1" width="22" height="22" rx="5" fill="var(--blue)" stroke="none"/><path d="M6 16.5v-9h2.1v1.6a2.9 2.9 0 0 1 2.6-1.8c1.2 0 2 .6 2.4 1.8a3 3 0 0 1 2.7-1.8c1.7 0 2.6 1.2 2.6 3.3v5.9h-2.2v-5.4c0-1.1-.4-1.7-1.2-1.7-.9 0-1.5.8-1.5 2.1v5h-2.2v-5.4c0-1.1-.4-1.7-1.2-1.7-.9 0-1.5.8-1.5 2.1v5Z" fill="var(--ivory)" stroke="none"/><circle cx="18.6" cy="15.2" r="1.5" fill="var(--lime)" stroke="none"/>`,
    };
    return `<svg ${base}>${paths[name] || ""}</svg>`;
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  // ---------- Carga y suscripción en vivo ----------
  async function cargarDatos() {
    state.liveStatus = "Actualizando…";
    render();
    try {
      const isEquipo = state.session.rol === "equipo";
      const { data: videosData, error: videosErr } = await sb.from("videos").select("*").order("created_at", { ascending: false });
      if (videosErr) throw videosErr;

      let clientesQuery = sb.from("clientes").select("*").order("nombre", { ascending: true });
      if (!isEquipo) clientesQuery = sb.from("clientes").select("*").eq("id", state.session.clienteId);
      const { data: clientesData, error: clientesErr } = await clientesQuery;
      if (clientesErr) throw clientesErr;

      state.videos = videosData || [];
      state.clientes = clientesData || [];

      const { data: configData } = await sb.from("configuracion_agencia").select("*").eq("id", 1).maybeSingle();
      if (configData) state.config = configData;

      if (isEquipo) {
        const { data: eventosData, error: eventosErr } = await sb.from("eventos").select("*").order("fecha", { ascending: true });
        if (!eventosErr) state.eventos = eventosData || [];
        const { data: elimData, error: elimErr } = await sb.from("eliminaciones_log").select("*").order("eliminado_en", { ascending: false }).limit(50);
        if (!elimErr) state.eliminaciones = elimData || [];
        const { data: ocuData } = await sb.from("pendientes_ocultos").select("clave, oculto_en").eq("usuario_id", state.session.userId);
        const mapa = {};
        (ocuData || []).forEach((o) => { mapa[o.clave] = o.oculto_en; });
        state.pendientesOcultos = mapa;
      } else {
        const idsVideos = (videosData || []).map((v) => v.id);
        if (idsVideos.length) {
          const { data: comentariosData } = await sb.from("comentarios").select("*").in("video_id", idsVideos).eq("visible_cliente", true).order("created_at", { ascending: true });
          const agrupado = {};
          (comentariosData || []).forEach((c) => { (agrupado[c.video_id] = agrupado[c.video_id] || []).push(c); });
          state.comentariosPorVideo = agrupado;
        }
      }
      if (!isEquipo && !state.selectedClient && clientesData[0]) state.selectedClient = clientesData[0].id;
      state.liveStatus = "En vivo";
    } catch (err) {
      state.liveStatus = "Error: " + err.message;
    }
    render();
  }

  function suscribirTiempoReal() {
    if (realtimeChannel) sb.removeChannel(realtimeChannel);
    realtimeChannel = sb
      .channel("videos-en-vivo")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "eliminaciones_log" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "configuracion_agencia" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "pendientes_ocultos" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "comentarios" }, () => {
        if (state.selectedVideoId) loadComments(state.selectedVideoId);
        if (state.session.rol !== "equipo") cargarDatos();
      })
      .subscribe();
  }

  // ---------- Manejadores de eventos ----------
  function attachHandlers() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        state.loginError = "";
        const nombreEscrito = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;
        const email = NOMBRE_A_CORREO[nombreEscrito];
        if (!email) {
          state.loginError = "Usuario no reconocido.";
          render();
          return;
        }
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = /invalid login credentials/i.test(error.message)
            ? "Usuario o contraseña incorrectos."
            : /email not confirmed/i.test(error.message)
            ? "Esta cuenta no está confirmada. Pídele a Hugo que la marque como 'Auto Confirm User' en Supabase."
            : error.message;
          state.loginError = msg;
          render();
          return;
        }
        const { data: perfilRows, error: perfilErr } = await sb.from("usuarios").select("*").eq("id", data.user.id);
        if (perfilErr || !perfilRows || !perfilRows[0]) {
          state.loginError = "No se encontró un perfil para este usuario.";
          render();
          return;
        }
        const perfil = perfilRows[0];
        state.session = { userId: data.user.id, nombre: perfil.nombre, rol: perfil.rol, clienteId: perfil.cliente_id, email };
        state.mainView = perfil.rol === "equipo" ? "tablero" : "inicio";
        await cargarDatos();
        suscribirTiempoReal();
      });
      return;
    }

    const signout = document.getElementById("signout-btn");
    if (signout) signout.addEventListener("click", async () => {
      await sb.auth.signOut();
      if (realtimeChannel) sb.removeChannel(realtimeChannel);
      state = { ...state, session: null, videos: [], clientes: [], selectedClient: null };
      render();
    });


    document.querySelectorAll(".team-filter").forEach(btn => {
      btn.addEventListener("click", () => { state.teamClientFilter = btn.dataset.id; render(); });
    });

    document.querySelectorAll(".client-select").forEach(btn => {
      btn.addEventListener("click", () => { state.selectedClient = btn.dataset.id; render(); });
    });

    const newBtn = document.getElementById("new-project-btn");
    if (newBtn) newBtn.addEventListener("click", () => { state.showForm = true; render(); });

    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.addEventListener("click", (e) => { if (e.target !== e.currentTarget) return; state.showForm = false; render(); });

    const npClose = document.getElementById("np-close");
    if (npClose) npClose.addEventListener("click", () => { state.showForm = false; render(); });
    const bulkClose = document.getElementById("bulk-close");
    if (bulkClose) bulkClose.addEventListener("click", () => { state.showBulk = false; render(); });
    const evClose = document.getElementById("ev-close");
    if (evClose) evClose.addEventListener("click", () => { state.showEventForm = false; render(); });
    const cancelBtn = document.getElementById("np-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", () => { state.showForm = false; render(); });

    const npTipoSelect = document.getElementById("np-tipo");
    if (npTipoSelect) npTipoSelect.addEventListener("change", () => {
      const etapaSelect = document.getElementById("np-etapa");
      actualizarSelectEtapa(etapaSelect, npTipoSelect.value, "idea");
    });

    const npForm = document.getElementById("new-project-form");
    if (npForm) npForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const clienteId = document.getElementById("np-cliente").value;
      const tipo = document.getElementById("np-tipo").value;
      const titulo = document.getElementById("np-titulo").value.trim();
      const etapa = document.getElementById("np-etapa").value;
      const responsable = document.getElementById("np-responsable").value;
      const fecha = document.getElementById("np-fecha").value;
      if (!clienteId || !titulo) return;
      const { error } = await sb.from("videos").insert({
        cliente_id: clienteId, tipo, titulo, etapa, responsable,
        fecha_entrega: fecha || null, checklist_done: 0, checklist_total: 1,
      });
      if (error) { alert("Error creando el proyecto: " + error.message); return; }
      state.showForm = false;
      // No hace falta recargar manualmente: la suscripción en vivo lo hace sola.
    });

    document.querySelectorAll(".video-card-click").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedVideoId = card.dataset.id;
        state.detailComments = [];
        render();
        loadComments(card.dataset.id);
      });
    });

    const detailOverlay = document.getElementById("detail-overlay");
    if (detailOverlay) detailOverlay.addEventListener("click", (e) => { if (e.target !== e.currentTarget) return; state.selectedVideoId = null; render(); });

    const detailClose = document.getElementById("detail-close");
    if (detailClose) detailClose.addEventListener("click", () => { state.selectedVideoId = null; render(); });

    const dTipo = document.getElementById("d-tipo");
    if (dTipo) dTipo.addEventListener("change", () => {
      const etapaSelect = document.getElementById("d-etapa");
      const etapaAjustada = actualizarSelectEtapa(etapaSelect, dTipo.value, etapaSelect.value);
      updateVideoField(state.selectedVideoId, { tipo: dTipo.value, etapa: etapaAjustada });
    });

    const dEtapa = document.getElementById("d-etapa");
    if (dEtapa) dEtapa.addEventListener("change", () => updateVideoField(state.selectedVideoId, { etapa: dEtapa.value }));

    const dResponsable = document.getElementById("d-responsable");
    if (dResponsable) dResponsable.addEventListener("change", () => updateVideoField(state.selectedVideoId, { responsable: dResponsable.value }));

    const dFilmacion = document.getElementById("d-fecha-filmacion");
    if (dFilmacion) dFilmacion.addEventListener("change", async () => {
      const patch = { fecha_filmacion: dFilmacion.value || null };
      const plazoIdeaInput = document.getElementById("d-plazo-idea");
      if (dFilmacion.value && plazoIdeaInput && !plazoIdeaInput.value) {
        patch.fecha_limite_idea = restarDias(dFilmacion.value, 4);
      }
      await updateVideoField(state.selectedVideoId, patch);
    });

    const dEntrega = document.getElementById("d-fecha-entrega");
    if (dEntrega) dEntrega.addEventListener("change", async () => {
      const patch = { fecha_entrega: dEntrega.value || null };
      const plazoFinalInput = document.getElementById("d-plazo-final");
      if (dEntrega.value && plazoFinalInput && !plazoFinalInput.value) {
        patch.fecha_limite_final = restarDias(dEntrega.value, 4);
      }
      await updateVideoField(state.selectedVideoId, patch);
    });

    const dDone = document.getElementById("d-done");
    if (dDone) dDone.addEventListener("change", () => updateVideoField(state.selectedVideoId, { checklist_done: parseInt(dDone.value, 10) || 0 }));

    const dTotal = document.getElementById("d-total");
    if (dTotal) dTotal.addEventListener("change", () => updateVideoField(state.selectedVideoId, { checklist_total: Math.max(1, parseInt(dTotal.value, 10) || 1) }));

    const dAyuda = document.getElementById("d-ayuda");
    if (dAyuda) dAyuda.addEventListener("change", () => updateVideoField(state.selectedVideoId, { necesita_ayuda: dAyuda.checked }));

    const dDictarGuion = document.getElementById("d-dictar-guion");
    if (dDictarGuion) dDictarGuion.addEventListener("click", () => alternarDictado("d-guion", dDictarGuion));

    const dGuion = document.getElementById("d-guion");
    if (dGuion) dGuion.addEventListener("blur", () => {
      const v = state.videos.find((x) => x.id === state.selectedVideoId);
      const patch = { guion: dGuion.value };
      if (v && v.estado_aprobacion_idea === "cambios" && dGuion.value !== v.guion) patch.estado_aprobacion_idea = "pendiente";
      updateVideoField(state.selectedVideoId, patch);
    });

    const dLink = document.getElementById("d-link");
    if (dLink) dLink.addEventListener("blur", () => {
      const v = state.videos.find((x) => x.id === state.selectedVideoId);
      const nuevoLink = dLink.value.trim() || null;
      if (nuevoLink && !urlSegura(nuevoLink)) {
        alert("El enlace debe empezar con https:// (por ejemplo, un enlace de Google Drive).");
        dLink.value = (v && v.link_revision) || "";
        return;
      }
      const patch = { link_revision: nuevoLink };
      if (v && v.estado_aprobacion_final === "cambios" && nuevoLink !== v.link_revision) patch.estado_aprobacion_final = "pendiente";
      updateVideoField(state.selectedVideoId, patch);
    });

    const dPlazoIdea = document.getElementById("d-plazo-idea");
    if (dPlazoIdea) dPlazoIdea.addEventListener("change", () => updateVideoField(state.selectedVideoId, { fecha_limite_idea: dPlazoIdea.value || null }));

    const dPlazoFinal = document.getElementById("d-plazo-final");
    if (dPlazoFinal) dPlazoFinal.addEventListener("change", () => updateVideoField(state.selectedVideoId, { fecha_limite_final: dPlazoFinal.value || null }));

    document.querySelectorAll(".manual-aprobar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const campo = btn.dataset.fase === "idea" ? "estado_aprobacion_idea" : "estado_aprobacion_final";
        updateVideoField(state.selectedVideoId, { [campo]: "aprobado" });
      });
    });
    document.querySelectorAll(".manual-cambios-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const campo = btn.dataset.fase === "idea" ? "estado_aprobacion_idea" : "estado_aprobacion_final";
        updateVideoField(state.selectedVideoId, { [campo]: "cambios" });
      });
    });

    const deleteVideoBtn = document.getElementById("delete-video-btn");
    if (deleteVideoBtn) deleteVideoBtn.addEventListener("click", () => { state.showDeleteConfirm = true; state.deleteError = ""; render(); });

    const deleteOverlay = document.getElementById("delete-confirm-overlay");
    if (deleteOverlay) deleteOverlay.addEventListener("click", (e) => { if (e.target !== e.currentTarget) return; state.showDeleteConfirm = false; render(); });

    const deleteCancel = document.getElementById("delete-cancel");
    if (deleteCancel) deleteCancel.addEventListener("click", () => { state.showDeleteConfirm = false; render(); });

    const deleteForm = document.getElementById("delete-confirm-form");
    if (deleteForm) deleteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const password = document.getElementById("delete-password").value;
      const { error: authError } = await sb.auth.signInWithPassword({ email: state.session.email, password });
      if (authError) {
        state.deleteError = "Contraseña incorrecta.";
        render();
        return;
      }
      const v = state.videos.find((x) => x.id === state.selectedVideoId);
      const cliente = state.clientes.find((c) => c.id === v.cliente_id);
      await sb.from("eliminaciones_log").insert({
        titulo: v.titulo, cliente_nombre: cliente ? cliente.nombre : null,
        tipo: v.tipo, etapa: v.etapa, eliminado_por: state.session.nombre,
      });
      const { error } = await sb.from("videos").delete().eq("id", v.id);
      if (error) { state.deleteError = "No se pudo eliminar: " + error.message; render(); return; }
      state.showDeleteConfirm = false;
      state.selectedVideoId = null;
    });

    const dCommentForm = document.getElementById("d-comment-form");
    if (dCommentForm) dCommentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("d-comment-text");
      const contenido = input.value.trim();
      if (!contenido) return;
      const { error } = await sb.from("comentarios").insert({
        video_id: state.selectedVideoId, autor: state.session.nombre, contenido,
      });
      if (error) { alert("No se pudo enviar el comentario: " + error.message); return; }
      input.value = "";
      loadComments(state.selectedVideoId);
    });

    // --- Navegación principal (Tablero / Calendario) ---
    document.querySelectorAll(".nav[data-main]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mainView = btn.dataset.main;
        if (state.mainView === "portal" && !state.selectedClient && state.clientes[0]) state.selectedClient = state.clientes[0].id;
        render();
      });
    });

    // --- Modal de clientes ---
    const irAProyectosBtn = document.querySelector(".ir-a-proyectos-btn");
    if (irAProyectosBtn) irAProyectosBtn.addEventListener("click", () => { state.mainView = "proyectos"; render(); });






    // --- Carga masiva ---
    document.querySelectorAll(".pend-x").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const clave = btn.dataset.clave;
        state.pendientesOcultos[clave] = new Date().toISOString();
        render();
        const { error } = await sb.from("pendientes_ocultos")
          .upsert({ usuario_id: state.session.userId, clave, oculto_en: new Date().toISOString() });
        if (error) { delete state.pendientesOcultos[clave]; render(); alert("No se pudo guardar: " + error.message); }
      });
    });

    const pendRestaurar = document.getElementById("pend-restaurar");
    if (pendRestaurar) pendRestaurar.addEventListener("click", async () => {
      state.pendientesOcultos = {};
      render();
      const { error } = await sb.from("pendientes_ocultos").delete().eq("usuario_id", state.session.userId);
      if (error) { cargarDatos(); alert("No se pudo restaurar: " + error.message); }
    });

    document.querySelectorAll(".pendiente-item").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedVideoId = el.dataset.id;
        state.detailComments = [];
        render();
        loadComments(el.dataset.id);
      });
    });

    const bulkBtn = document.getElementById("bulk-btn");
    if (bulkBtn) bulkBtn.addEventListener("click", () => { state.showBulk = true; render(); });

    const bulkOverlay = document.getElementById("bulk-overlay");
    if (bulkOverlay) bulkOverlay.addEventListener("click", (e) => { if (e.target !== e.currentTarget) return; state.showBulk = false; render(); });

    const bulkCancel = document.getElementById("bulk-cancel");
    if (bulkCancel) bulkCancel.addEventListener("click", () => { state.showBulk = false; render(); });

    const bulkAddRow = document.getElementById("bulk-add-row");
    if (bulkAddRow) bulkAddRow.addEventListener("click", () => {
      const wrap = document.getElementById("bulk-titulos");
      const input = document.createElement("input");
      input.className = "input bulk-titulo-input";
      input.style.marginTop = "0";
      input.placeholder = "Título del video " + (wrap.children.length + 1);
      wrap.appendChild(input);
    });

    const bulkForm = document.getElementById("bulk-form");
    if (bulkForm) bulkForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const clienteId = document.getElementById("bulk-cliente").value;
      const tipo = document.getElementById("bulk-tipo").value;
      const responsable = document.getElementById("bulk-responsable").value;
      const titulos = Array.from(document.querySelectorAll(".bulk-titulo-input"))
        .map((el) => el.value.trim())
        .filter(Boolean);
      if (!clienteId || !titulos.length) return;
      const filas = titulos.map((titulo) => ({
        cliente_id: clienteId, tipo, titulo, etapa: "idea", responsable,
        checklist_done: 0, checklist_total: 1,
      }));
      const { error } = await sb.from("videos").insert(filas);
      if (error) { alert("No se pudo crear el lote: " + error.message); return; }
      state.showBulk = false;
    });

    document.querySelectorAll(".delete-cliente-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este cliente? También se eliminarán todos sus videos.")) return;
        const { error } = await sb.from("clientes").delete().eq("id", btn.dataset.id);
        if (error) alert("No se pudo eliminar: " + error.message);
      });
    });

    document.querySelectorAll(".cliente-telefono-input").forEach((input) => {
      input.addEventListener("blur", async () => {
        const { error } = await sb.from("clientes").update({ telefono: input.value.trim() || null }).eq("id", input.dataset.id);
        if (error) alert("No se pudo guardar el teléfono: " + error.message);
      });
    });

    const configWhatsappInput = document.getElementById("config-whatsapp-input");
    if (configWhatsappInput) configWhatsappInput.addEventListener("blur", async () => {
      const { error } = await sb.from("configuracion_agencia").update({ whatsapp: configWhatsappInput.value.trim() || null }).eq("id", 1);
      if (error) alert("No se pudo guardar: " + error.message);
    });

    const newClienteForm = document.getElementById("new-cliente-form");
    if (newClienteForm) newClienteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("new-cliente-nombre");
      const nombre = input.value.trim();
      if (!nombre) return;
      const { error } = await sb.from("clientes").insert({ nombre });
      if (error) { alert("No se pudo agregar: " + error.message); return; }
      input.value = "";
    });

    // --- Calendario ---
    const calPrev = document.getElementById("cal-prev");
    if (calPrev) calPrev.addEventListener("click", () => {
      state.calMonth--; if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
      render();
    });
    const calNext = document.getElementById("cal-next");
    if (calNext) calNext.addEventListener("click", () => {
      state.calMonth++; if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
      render();
    });

    document.querySelectorAll(".cal-day").forEach((cell) => {
      cell.addEventListener("click", () => { state.selectedDay = cell.dataset.day; render(); });
    });

    const addEventoBtn = document.getElementById("add-evento-btn");
    if (addEventoBtn) addEventoBtn.addEventListener("click", () => { state.showEventForm = true; render(); });

    const evOverlay = document.getElementById("evento-overlay");
    if (evOverlay) evOverlay.addEventListener("click", (e) => { if (e.target !== e.currentTarget) return; state.showEventForm = false; render(); });

    const evCancel = document.getElementById("ev-cancel");
    if (evCancel) evCancel.addEventListener("click", () => { state.showEventForm = false; render(); });

    const newEventoForm = document.getElementById("new-evento-form");
    if (newEventoForm) newEventoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const videoId = document.getElementById("ev-video").value;

      if (videoId) {
        // Vinculado a un proyecto: actualiza la fecha directo en el video del Tablero,
        // no crea una copia aparte.
        const campo = document.getElementById("ev-tipo").value;
        const { error } = await sb.from("videos").update({ [campo]: state.selectedDay }).eq("id", videoId);
        if (error) { alert("No se pudo vincular: " + error.message); return; }
        state.showEventForm = false;
        return;
      }

      const titulo = document.getElementById("ev-titulo").value.trim();
      if (!titulo) return;
      const { error } = await sb.from("eventos").insert({
        titulo,
        fecha: state.selectedDay,
        cliente_id: document.getElementById("ev-cliente").value || null,
        hora_inicio: document.getElementById("ev-hora-inicio").value || null,
        hora_fin: document.getElementById("ev-hora-fin").value || null,
        contacto: document.getElementById("ev-contacto").value.trim() || null,
        lugar: document.getElementById("ev-lugar").value.trim() || null,
        notas: document.getElementById("ev-notas").value.trim() || null,
      });
      if (error) { alert("No se pudo guardar el evento: " + error.message); return; }
      state.showEventForm = false;
    });

    const evVideoSelect = document.getElementById("ev-video");
    if (evVideoSelect) evVideoSelect.addEventListener("change", () => {
      const tipoWrap = document.getElementById("ev-tipo-wrap");
      const camposGenerales = ["ev-titulo", "ev-cliente", "ev-contacto", "ev-lugar", "ev-notas", "ev-hora-inicio", "ev-hora-fin"];
      const esVinculado = !!evVideoSelect.value;
      tipoWrap.style.display = esVinculado ? "block" : "none";
      camposGenerales.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.closest("label").style.display = esVinculado ? "none" : "block";
      });
      document.getElementById("ev-titulo").required = !esVinculado;
    });

    document.querySelectorAll(".delete-evento-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const { error } = await sb.from("eventos").delete().eq("id", btn.dataset.id);
        if (error) alert("No se pudo eliminar: " + error.message);
      });
    });

    document.querySelectorAll(".aprobar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const campo = btn.dataset.fase === "idea" ? "estado_aprobacion_idea" : "estado_aprobacion_final";
        updateVideoField(btn.dataset.id, { [campo]: "aprobado" });
      });
    });
    document.querySelectorAll(".cambios-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const campo = btn.dataset.fase === "idea" ? "estado_aprobacion_idea" : "estado_aprobacion_final";
        updateVideoField(btn.dataset.id, { [campo]: "cambios" });
      });
    });

    document.querySelectorAll(".cliente-comment-form").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        const contenido = input.value.trim();
        if (!contenido) return;
        const { error } = await sb.from("comentarios").insert({
          video_id: form.dataset.video, autor: state.session.nombre, contenido, visible_cliente: true,
        });
        if (error) { alert("No se pudo enviar: " + error.message); return; }
        input.value = "";
      });
    });
  }

  // ---------- Intro ----------
  (function intro() {
    const sp = document.getElementById("splash");
    if (!sp) return;
    // Solo en la primera carga de la sesión del navegador, no en cada recarga de trabajo.
    try {
      if (sessionStorage.getItem("mk_intro")) { sp.remove(); return; }
      sessionStorage.setItem("mk_intro", "1");
    } catch (e) { /* sin sessionStorage: se muestra igual */ }
    setTimeout(() => {
      sp.classList.add("out");
      setTimeout(() => sp.remove(), 600);
    }, 2700);
  })();

  // ---------- Arranque ----------
  (async function init() {
    checkConnection();
    try {
      const { data: { session: existing }, error: sessErr } = await sb.auth.getSession();
      if (sessErr) throw sessErr;
      if (existing) {
        const { data: perfilRows, error: perfilErr } = await sb.from("usuarios").select("*").eq("id", existing.user.id);
        if (perfilErr) throw perfilErr;
        if (perfilRows && perfilRows[0]) {
          const perfil = perfilRows[0];
          state.session = { userId: existing.user.id, nombre: perfil.nombre, rol: perfil.rol, clienteId: perfil.cliente_id, email: existing.user.email };
          state.mainView = perfil.rol === "equipo" ? "tablero" : "inicio";
          await cargarDatos();
          suscribirTiempoReal();
          return;
        }
      }
      render();
    } catch (err) {
      document.getElementById("app").innerHTML = `
        <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color:#E8EAED; text-align:center;">
          <div>
            <div style="font-size:15px; font-weight:600; margin-bottom:8px;">No se pudo iniciar la aplicación</div>
            <div style="font-size:12px; color:#8B95A3; max-width:340px;">${escapeHtml(err.message || String(err))}</div>
          </div>
        </div>`;
    }
  })();