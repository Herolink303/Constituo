let utilizadorAtual = JSON.parse(localStorage.getItem("constituo_user")) || null;
let temaAtual = localStorage.getItem("constituo_tema") || "tema-predefinido";

function chaveDados() {
  return utilizadorAtual ? `constituo_v3_${utilizadorAtual.email}` : "constituo_v3_convidado";
}

function chaveHistIA() {
  return utilizadorAtual ? `constituo_hist_${utilizadorAtual.email}` : "constituo_hist_convidado";
}

let paises = JSON.parse(localStorage.getItem(chaveDados())) || [];
let historicoIA = JSON.parse(localStorage.getItem(chaveHistIA())) || [];
let paisAtualIdx = null, docAtualIdx = null, modoLer = false, estiloEscolhidoModal = "estilo-boletim", campoPickerAtual = "";
let modoBandeiraAtual = "app", imagemBandeiraBase64 = "", editandoPais = false, dirBandeiraAtual = "horizontal";

const OPCOES_PICKER = {
  governo: ["República", "República Presidencialista", "República Parlamentarista", "República Semipresidencialista", "Monarquia Constitucional", "Monarquia Parlamentarista", "Monarquia Absoluta", "Principado", "Grão-Ducado", "Império", "Teocracia", "Junta Militar"],
  ideologia: ["Democracia Liberal", "Social-Democracia", "Socialismo", "Comunismo", "Conservadorismo", "Liberalismo Clássico", "Libertarianismo", "Nacionalismo", "Democracia Cristã", "Ecologismo", "Populismo", "Anarquismo", "Autoritarismo", "Totalitarismo", "Fascismo"],
  sistema: ["Nenhum", "Democracia direta", "Tecnocracia", "Oligarquia", "Meritocracia", "Partidocracia", "Plutocracia", "Corporativismo", "Estamental", "Teocracia", "Nação sob lei marcial", "Tribalismo confederado"],
  estado: ["Estado Unitário", "Federação", "Confederação", "União Pessoal", "União Real", "União de Estados", "Condomínio"]
};

function guardar() { localStorage.setItem(chaveDados(), JSON.stringify(paises)); }
function guardarHistoricoIA() { localStorage.setItem(chaveHistIA(), JSON.stringify(historicoIA)); }

function estiloFlag(f) {
  if (f && f.img) return `url('${f.img}') center/cover no-repeat`;
  return `linear-gradient(${f.dir === "vertical" ? "90deg" : "180deg"}, ${f.c1} 0% 33.3%, ${f.c2} 33.3% 66.6%, ${f.c3} 66.6% 100%)`;
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    if (document.getElementById("modalPicker").style.display === "flex") { fecharModal("modalPicker"); return; }
    fecharModal("modalPais");
    fecharModal("modalDoc");
    fecharModal("modalExport");
    fecharModal("modalConta");
    fecharModal("modalDefinicoes");
  }
});
function aplicarTema(tema) {
  temaAtual = tema;
  localStorage.setItem("constituo_tema", tema);
  document.body.classList.remove("tema-predefinido", "tema-claro", "tema-escuro");
  document.body.classList.add(tema);
  document.querySelectorAll(".theme-opt").forEach(el => {
    el.classList.toggle("active", el.dataset.tema === tema);
  });
}

function mudarTema(tema) {
  aplicarTema(tema);
}

function atualizarUIConta() {
  const btn = document.getElementById("btnNavAuth");
  const pill = document.getElementById("pillUserNav");
  if (utilizadorAtual) {
    btn.style.display = "none";
    pill.style.display = "inline-flex";
    document.getElementById("navUserName").textContent = utilizadorAtual.nome;
    document.getElementById("navUserAvatar").textContent = utilizadorAtual.nome.charAt(0).toUpperCase();
  } else {
    btn.style.display = "inline-flex";
    pill.style.display = "none";
  }
}

function abrirModalConta() {
  const deslog = document.getElementById("bodyContaDeslogado");
  const log = document.getElementById("bodyContaLogado");
  if (utilizadorAtual) {
    deslog.style.display = "none";
    log.style.display = "flex";
    document.getElementById("perfilNome").textContent = utilizadorAtual.nome;
    document.getElementById("perfilEmail").textContent = utilizadorAtual.email;
    document.getElementById("perfilAvatarGrande").textContent = utilizadorAtual.nome.charAt(0).toUpperCase();
  } else {
    deslog.style.display = "flex";
    log.style.display = "none";
  }
  document.getElementById("modalConta").style.display = "flex";
}

function finalizarLogin(nome, email) {
  utilizadorAtual = { nome, email };
  localStorage.setItem("constituo_user", JSON.stringify(utilizadorAtual));
  paises = JSON.parse(localStorage.getItem(chaveDados())) || [];
  historicoIA = JSON.parse(localStorage.getItem(chaveHistIA())) || [];
  atualizarUIConta();
  fecharModal("modalConta");
  irHome();
}

function entrarComEmail() {
  const nome = document.getElementById("authNome").value.trim() || "Utilizador";
  const email = document.getElementById("authEmail").value.trim();
  if (!email || !email.includes("@")) return alert("Introduza um endereço de email válido.");
  finalizarLogin(nome, email);
}

function entrarComGoogle() {
  const email = prompt("Introduza a sua conta Google / Gmail para entrar:", "utilizador@gmail.com");
  if (!email) return;
  const nome = email.split("@")[0];
  finalizarLogin(nome.charAt(0).toUpperCase() + nome.slice(1), email.trim());
}

function terminarSessao() {
  utilizadorAtual = null;
  localStorage.removeItem("constituo_user");
  paises = JSON.parse(localStorage.getItem(chaveDados())) || [];
  historicoIA = JSON.parse(localStorage.getItem(chaveHistIA())) || [];
  atualizarUIConta();
  fecharModal("modalConta");
  irHome();
}
function abrirModalDefinicoes() {
  aplicarTema(temaAtual);
  renderHistoricoIA();
  document.getElementById("modalDefinicoes").style.display = "flex";
}

function renderHistoricoIA() {
  const box = document.getElementById("listaHistoricoIA");
  if (!historicoIA || historicoIA.length === 0) {
    box.innerHTML = `<p style="color:#64748b; font-size:0.84rem; text-align:center; padding:20px 0;">Ainda não existem conversas registadas com a IA.</p>`;
    return;
  }
  box.innerHTML = "";
  historicoIA.slice().reverse().forEach((item, revIdx) => {
    const realIdx = historicoIA.length - 1 - revIdx;
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-head">
        <span class="hist-pais">
          <span class="hist-flag-mini" style="background:${estiloFlag(item.flag)}"></span>
          ${item.paisNome} · ${item.docTitulo}
        </span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${item.data}</span>
          <button type="button" class="btn-del" title="Apagar esta mensagem" onclick="apagarItemHistoricoIA(${realIdx})">✕</button>
        </div>
      </div>
      <p class="hist-txt">${item.texto}</p>
    `;
    box.appendChild(div);
  });
}

function apagarItemHistoricoIA(idx) {
  historicoIA.splice(idx, 1);
  guardarHistoricoIA();
  renderHistoricoIA();
}

function limparTodoHistoricoIA() {
  if (!historicoIA.length) return;
  if (!confirm("Tem a certeza que deseja apagar todo o histórico de conversas com a IA?")) return;
  historicoIA = [];
  guardarHistoricoIA();
  renderHistoricoIA();
}

function irHome() {
  document.getElementById("viewHome").style.display = "block";
  document.getElementById("viewPais").style.display = "none";
  document.getElementById("viewEditor").style.display = "none";
  const grid = document.getElementById("gridPaises"); grid.innerHTML = "";
  paises.forEach((p, i) => {
    const el = document.createElement("div"); el.className = "pais-card"; el.onclick = () => abrirPais(i);
    el.innerHTML = `<div class="flag-box" style="background:${estiloFlag(p.flag)}"></div><div class="pais-card-head"><h3>${p.nome}</h3><span class="badge-pill">${p.docs.length} doc(s)</span></div><div class="pais-meta">${p.governo} · ${p.ideologia}</div>${p.lema ? `<p class="pais-lema">"${p.lema}"</p>` : ""}`;
    grid.appendChild(el);
  });
}
function abrirModalPais(isEdit) {
  editandoPais = !!isEdit;
  document.getElementById("tituloModalPais").textContent = editandoPais ? "Editar país" : "Fundar novo país";
  document.getElementById("btnSalvarPaisModal").textContent = editandoPais ? "Salvar alterações" : "Fundar país";

  if (editandoPais && paisAtualIdx !== null) {
    const p = paises[paisAtualIdx];
    document.getElementById("pNome").value = p.nome;
    document.getElementById("pGentilico").value = p.gentilico || "";
    document.getElementById("valGoverno").textContent = p.governo;
    document.getElementById("valIdeologia").textContent = p.ideologia;
    document.getElementById("valSistema").textContent = p.sistema || "Nenhum";
    document.getElementById("valEstado").textContent = p.estado;
    document.getElementById("pLema").value = p.lema || "";
    if (p.flag && p.flag.img) {
      imagemBandeiraBase64 = p.flag.img;
      alternarModoBandeira("pc");
    } else {
      imagemBandeiraBase64 = "";
      document.getElementById("c1").value = p.flag.c1 || "#1e3a8a";
      document.getElementById("c2").value = p.flag.c2 || "#f59e0b";
      document.getElementById("c3").value = p.flag.c3 || "#ffffff";
      mudarDirBandeira(p.flag.dir || "horizontal");
      alternarModoBandeira("app");
    }
  } else {
    document.getElementById("pNome").value = "";
    document.getElementById("pGentilico").value = "";
    document.getElementById("valGoverno").textContent = "República";
    document.getElementById("valIdeologia").textContent = "Democracia Liberal";
    document.getElementById("valSistema").textContent = "Nenhum";
    document.getElementById("valEstado").textContent = "Estado Unitário";
    document.getElementById("pLema").value = "";
    imagemBandeiraBase64 = "";
    mudarDirBandeira("horizontal");
    alternarModoBandeira("app");
  }
  document.getElementById("modalPais").style.display = "flex";
}

function fecharModal(id) { document.getElementById(id).style.display = "none"; }

function mudarDirBandeira(dir) {
  dirBandeiraAtual = dir;
  const bH = document.getElementById("btnDirHoriz");
  const bV = document.getElementById("btnDirVert");
  if (bH && bV) {
    bH.style.background = dir === "horizontal" ? "#1e3a5f" : "#fff";
    bH.style.color = dir === "horizontal" ? "#fff" : "#475569";
    bH.style.borderColor = dir === "horizontal" ? "#1e3a5f" : "#e2e8f0";
    bV.style.background = dir === "vertical" ? "#1e3a5f" : "#fff";
    bV.style.color = dir === "vertical" ? "#fff" : "#475569";
    bV.style.borderColor = dir === "vertical" ? "#1e3a5f" : "#e2e8f0";
  }
  renderFlagPrev();
}

function alternarModoBandeira(modo) {
  modoBandeiraAtual = modo;
  document.getElementById("flagControlesApp").style.display = modo === "app" ? "flex" : "none";
  document.getElementById("flagControlesPC").style.display = modo === "pc" ? "block" : "none";
  const tApp = document.getElementById("btnTabFlagApp");
  const tPC = document.getElementById("btnTabFlagPC");
  tApp.style.background = modo === "app" ? "#fff" : "transparent";
  tApp.style.color = modo === "app" ? "#0f172a" : "#64748b";
  tApp.style.boxShadow = modo === "app" ? "0 1px 3px rgba(0,0,0,0.08)" : "none";
  tPC.style.background = modo === "pc" ? "#fff" : "transparent";
  tPC.style.color = modo === "pc" ? "#0f172a" : "#64748b";
  tPC.style.boxShadow = modo === "pc" ? "0 1px 3px rgba(0,0,0,0.08)" : "none";
  renderFlagPrev();
}
function carregarBandeiraArquivo(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) { imagemBandeiraBase64 = e.target.result; renderFlagPrev(); };
  reader.readAsDataURL(file);
}

function setPreset(a, b, c) {
  imagemBandeiraBase64 = "";
  document.getElementById("c1").value = a;
  document.getElementById("c2").value = b;
  document.getElementById("c3").value = c;
  renderFlagPrev();
}

function renderFlagPrev() {
  const prev = document.getElementById("flagPrev");
  if (modoBandeiraAtual === "pc" && imagemBandeiraBase64) {
    prev.style.background = `url('${imagemBandeiraBase64}') center/cover no-repeat`;
  } else {
    prev.style.background = estiloFlag({
      dir: dirBandeiraAtual,
      c1: document.getElementById("c1").value,
      c2: document.getElementById("c2").value,
      c3: document.getElementById("c3").value
    });
  }
}

function mapIdPicker(campo) {
  if (campo === "governo") return "valGoverno";
  if (campo === "ideologia") return "valIdeologia";
  if (campo === "sistema") return "valSistema";
  return "valEstado";
}

function abrirPicker(campo) {
  campoPickerAtual = campo;
  const titulos = { governo: "Forma de governo", ideologia: "Ideologia política", sistema: "Sistema especial (opcional)", estado: "Tipo de Estado" };
  document.getElementById("pickerTitle").textContent = titulos[campo];
  const box = document.getElementById("pickerChips"); box.innerHTML = "";
  OPCOES_PICKER[campo].forEach(op => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = op;
    b.onclick = () => { document.getElementById(mapIdPicker(campo)).textContent = op; fecharModal("modalPicker"); };
    box.appendChild(b);
  });
  document.getElementById("modalPicker").style.display = "flex";
}

function usarPickerCustom() {
  const v = document.getElementById("pickerCustom").value.trim();
  if (v) document.getElementById(mapIdPicker(campoPickerAtual)).textContent = v;
  document.getElementById("pickerCustom").value = "";
  fecharModal("modalPicker");
}

function confirmarNovoPais() {
  const nome = document.getElementById("pNome").value.trim();
  const gentilico = document.getElementById("pGentilico").value.trim();
  if (!nome) return alert("O nome do país é obrigatório.");
  if (!gentilico) return alert("O gentílico é obrigatório.");

  const flagObj = (modoBandeiraAtual === "pc" && imagemBandeiraBase64)
    ? { img: imagemBandeiraBase64 }
    : { dir: dirBandeiraAtual, c1: document.getElementById("c1").value, c2: document.getElementById("c2").value, c3: document.getElementById("c3").value };

  const dadosPais = {
    nome,
    gentilico,
    governo: document.getElementById("valGoverno").textContent,
    ideologia: document.getElementById("valIdeologia").textContent,
    sistema: document.getElementById("valSistema").textContent,
    estado: document.getElementById("valEstado").textContent,
    lema: document.getElementById("pLema").value.trim(),
    flag: flagObj,
    docs: editandoPais ? paises[paisAtualIdx].docs : []
  };

  if (editandoPais) {
    paises[paisAtualIdx] = dadosPais;
    guardar();
    fecharModal("modalPais");
    abrirPais(paisAtualIdx);
  } else {
    paises.push(dadosPais);
    guardar();
    fecharModal("modalPais");
    abrirPais(paises.length - 1);
  }
}
function apagarPaisAtual() {
  if (!confirm(`Tem a certeza que quer eliminar "${paises[paisAtualIdx].nome}"?`)) return;
  paises.splice(paisAtualIdx, 1);
  guardar();
  irHome();
}

function abrirPais(idx) {
  paisAtualIdx = idx; const pais = paises[idx];
  document.getElementById("viewHome").style.display = "none";
  document.getElementById("viewPais").style.display = "block";
  document.getElementById("viewEditor").style.display = "none";
  document.getElementById("detFlag").style.background = estiloFlag(pais.flag);
  document.getElementById("detNome").textContent = pais.nome;
  document.getElementById("detGentilico").textContent = pais.gentilico || "—";
  document.getElementById("detGoverno").textContent = pais.governo;
  document.getElementById("detIdeologia").textContent = pais.ideologia;
  document.getElementById("detSistema").textContent = pais.sistema || "Nenhum";
  document.getElementById("detEstado").textContent = pais.estado;
  document.getElementById("detLema").textContent = pais.lema ? `"${pais.lema}"` : "";
  const cont = document.getElementById("docsContainer");
  if (pais.docs.length === 0) {
    cont.innerHTML = `<div class="empty-box"><p><b>Nenhum documento ainda</b></p><p style="color:#64748b;font-size:0.88rem;margin:0 0 14px 0;">Comece pela Constituição do país — ou invente um tipo de código totalmente seu.</p><button type="button" class="btn-navy" onclick="abrirModalDoc()">+ Criar primeiro documento</button></div>`;
  } else {
    const g = document.createElement("div"); g.className = "grid-docs";
    pais.docs.forEach((d, dI) => {
      const c = document.createElement("div"); c.className = "doc-card";
      c.onclick = () => abrirEditor(dI);
      c.innerHTML = `
        <button type="button" class="btn-del-doc-card" title="Eliminar documento" onclick="event.stopPropagation(); apagarDocCard(${dI})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>
        </button>
        <span class="badge-pill">${d.tipo}</span>
        <h3 style="margin:10px 0 4px 0; padding-right:24px;">${d.titulo}</h3>
        <small style="color:#64748b;">${d.titulos.length} título(s)</small>
      `;
      g.appendChild(c);
    });
    cont.innerHTML = ""; cont.appendChild(g);
  }
}

function apagarDocCard(dI) {
  const nomeDoc = paises[paisAtualIdx].docs[dI].titulo;
  if (!confirm(`Eliminar "${nomeDoc}"?`)) return;
  paises[paisAtualIdx].docs.splice(dI, 1);
  guardar();
  abrirPais(paisAtualIdx);
}

function apagarDocAtual() {
  const nomeDoc = paises[paisAtualIdx].docs[docAtualIdx].titulo;
  if (!confirm(`Eliminar "${nomeDoc}"?`)) return;
  paises[paisAtualIdx].docs.splice(docAtualIdx, 1);
  guardar();
  abrirPais(paisAtualIdx);
}

function abrirModalDoc() { document.getElementById("modalDoc").style.display = "flex"; }
function selecionarCardEstilo(st) { estiloEscolhidoModal = st; document.querySelectorAll(".sc-item").forEach(e => e.classList.toggle("selected", e.dataset.sc === st)); }

function confirmarNovoDoc() {
  let tipo = document.getElementById("dTipo").value;
  if (tipo === "Outro") tipo = document.getElementById("dTipoOutro").value.trim() || "Código Personalizado";
  const titulo = document.getElementById("dTitulo").value.trim() || tipo;
  paises[paisAtualIdx].docs.push({
    tipo,
    titulo,
    estilo: estiloEscolhidoModal,
    preambulo: "",
    titulos: [{ nome: "TÍTULO I — Dos Princípios Fundamentais", artigos: [{ epigrafe: "", texto: "" }] }]
  });
  guardar(); document.getElementById("dTitulo").value = ""; fecharModal("modalDoc"); abrirEditor(paises[paisAtualIdx].docs.length - 1);
}
function abrirEditor(dIdx) {
  docAtualIdx = dIdx; const pais = paises[paisAtualIdx], doc = pais.docs[dIdx];
  document.getElementById("viewPais").style.display = "none"; document.getElementById("viewEditor").style.display = "block";
  document.getElementById("edPaisTag").textContent = pais.nome; document.getElementById("edTipoTag").textContent = doc.tipo;
  document.getElementById("edDocName").textContent = doc.titulo; document.getElementById("folhaTitulo").textContent = doc.titulo;
  document.getElementById("txtPreambulo").value = doc.preambulo; trocarEstilo(doc.estilo); mudarModo(false);
}

function trocarEstilo(st) { paises[paisAtualIdx].docs[docAtualIdx].estilo = st; guardar(); document.getElementById("folhaEditor").className = "sheet " + st; document.querySelectorAll(".style-btn").forEach(b => b.classList.toggle("active", b.dataset.st === st)); }
function atualizarPreambulo() { paises[paisAtualIdx].docs[docAtualIdx].preambulo = document.getElementById("txtPreambulo").value; guardar(); }

function mudarModo(ler) {
  modoLer = ler; document.getElementById("tabEdicao").classList.toggle("active", !ler); document.getElementById("tabLer").classList.toggle("active", ler);
  document.getElementById("painelDireito").style.display = ler ? "none" : "flex"; document.getElementById("btnAddTitulo").style.display = ler ? "none" : "block";
  const pre = paises[paisAtualIdx].docs[docAtualIdx].preambulo; document.getElementById("txtPreambulo").style.display = ler ? "none" : "block";
  const vp = document.getElementById("viewPreambulo"); vp.style.display = ler ? "block" : "none"; vp.textContent = pre || "(Sem preâmbulo)"; renderTitulos();
}

function normArt(a) {
  return typeof a === "string" ? { epigrafe: "", texto: a } : a;
}

function renderTitulos() {
  const box = document.getElementById("listaTitulos"); box.innerHTML = ""; let nArt = 1;
  paises[paisAtualIdx].docs[docAtualIdx].titulos.forEach((t, tI) => {
    const div = document.createElement("div"); div.className = "titulo-sec";
    if (modoLer) {
      div.innerHTML = `<h3>${t.nome}</h3>` + t.artigos.map(raw => {
        const a = normArt(raw);
        return `<p>${a.epigrafe ? `<span style="display:block;font-size:0.8rem;font-weight:700;opacity:0.7;margin-bottom:2px;">(${a.epigrafe})</span>` : ""}<strong>Art. ${nArt++}.º</strong> — ${a.texto}</p>`;
      }).join("");
    } else {
      div.innerHTML = `<div class="titulo-sec-top"><input type="text" value="${t.nome}" oninput="editTit(${tI},this.value)"><button type="button" class="btn-del" onclick="delTit(${tI})">✕</button></div>`
        + t.artigos.map((raw, aI) => {
          const a = normArt(raw);
          return `<div class="art-card">
            <div class="art-card-top"><span class="art-num">Art. ${nArt++}.º</span><button type="button" class="btn-del" onclick="delArt(${tI},${aI})">✕</button></div>
            <input type="text" class="epigrafe-inp" placeholder="Epígrafe (opcional)" value="${a.epigrafe || ""}" oninput="editEpig(${tI},${aI},this.value)">
            <textarea rows="2" placeholder="Texto do artigo..." oninput="editArt(${tI},${aI},this.value)">${a.texto || ""}</textarea>
          </div>`;
        }).join("")
        + `<button type="button" class="btn-link" onclick="addArt(${tI})">+ Adicionar artigo</button>`;
    }
    box.appendChild(div);
  });
}

function editTit(tI, v) { paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].nome = v; guardar(); }
function delTit(tI) { paises[paisAtualIdx].docs[docAtualIdx].titulos.splice(tI, 1); guardar(); renderTitulos(); }
function addArt(tI) { paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos.push({ epigrafe: "", texto: "" }); guardar(); renderTitulos(); }
function editEpig(tI, aI, v) { const a = normArt(paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos[aI]); a.epigrafe = v; paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos[aI] = a; guardar(); }
function editArt(tI, aI, v) { const a = normArt(paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos[aI]); a.texto = v; paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos[aI] = a; guardar(); }
function delArt(tI, aI) { paises[paisAtualIdx].docs[docAtualIdx].titulos[tI].artigos.splice(aI, 1); guardar(); renderTitulos(); }
function addTitulo() { const n = paises[paisAtualIdx].docs[docAtualIdx].titulos.length + 1; paises[paisAtualIdx].docs[docAtualIdx].titulos.push({ nome: `TÍTULO ${n} — Novo Capítulo`, artigos: [{ epigrafe: "", texto: "" }] }); guardar(); renderTitulos(); }
function alternarIA() {
  const ligado = document.getElementById("chkIA").checked;
  document.getElementById("boxIAControles").style.display = ligado ? "block" : "none";
  document.getElementById("msgIAOff").style.display = ligado ? "none" : "block";
}

function executarIA() {
  const pais = paises[paisAtualIdx], doc = pais.docs[docAtualIdx];
  const tema = document.getElementById("inpTemaIA").value.trim() || `${pais.governo} e ${pais.ideologia}`;
  const radioSel = document.querySelector('input[name="modoIA"]:checked');
  const modo = radioSel ? radioSel.value : "preambulo";
  const tom = document.getElementById("selTomIA").value;

  historicoIA.push({
    paisNome: pais.nome,
    flag: pais.flag,
    docTitulo: doc.titulo,
    texto: tema,
    data: new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  });
  guardarHistoricoIA();

  const abertura = tom === "epico"
    ? `Sob os desígnios históricos e a glória eterna de ${pais.nome}, proclamamos este ${doc.titulo}`
    : tom === "poetico"
    ? `Entre a memória dos nossos antepassados e a esperança do amanhã, o povo de ${pais.nome} consagra este ${doc.titulo}`
    : tom === "tecnico"
    ? `Nos termos das disposições constitucionais aplicáveis a ${pais.nome}, estabelece-se o presente ${doc.titulo}`
    : tom === "moderno"
    ? `Nós, cidadãos e cidadãs de ${pais.nome}, estabelecemos este ${doc.titulo}`
    : `Nós, povo de ${pais.nome}, promulgamos este ${doc.titulo}`;

  const pre = `${abertura} sob os princípios de ${tema}, assegurando a ordem, a justiça e a soberania nacional.`;

  if (modo === "preambulo" || modo === "completo") {
    doc.preambulo = pre;
    document.getElementById("txtPreambulo").value = pre;
  }
  if (modo === "titulo" || modo === "completo") {
    doc.titulos.push({
      nome: `TÍTULO — Sobre ${tema.slice(0, 60)}`,
      artigos: [
        { epigrafe: "Princípio Geral", texto: `${pais.nome} rege-se pelos princípios fundamentais de ${tema}.` },
        { epigrafe: "Garantia Institucional", texto: `Os órgãos de soberania velam pelo estrito cumprimento desta norma.` }
      ]
    });
  }
  guardar();
  renderTitulos();
}

function abrirModalExportar() {
  const pais = paises[paisAtualIdx], doc = pais.docs[docAtualIdx]; let c = 1;
  let html = `<div class="sheet ${doc.estilo}" style="min-height:auto;"><small>${pais.nome.toUpperCase()}</small><h1>${doc.titulo}</h1>${doc.preambulo ? `<p><i>${doc.preambulo}</i></p>` : ""}`;
  doc.titulos.forEach(t => {
    html += `<h3>${t.nome}</h3>`;
    t.artigos.forEach(raw => {
      const a = normArt(raw);
      html += `<p>${a.epigrafe ? `<i>(${a.epigrafe})</i> ` : ""}<b>Art. ${c++}.º</b> — ${a.texto}</p>`;
    });
  });
  document.getElementById("previewBox").innerHTML = html + "</div>"; document.getElementById("modalExport").style.display = "flex";
}

function exportarPDF() { html2pdf().from(document.getElementById("previewBox").firstChild).save(`${paises[paisAtualIdx].docs[docAtualIdx].titulo}.pdf`); }

async function exportarDOCX() {
  const { Document, Packer, Paragraph, TextRun } = window.docx, pais = paises[paisAtualIdx], doc = pais.docs[docAtualIdx]; let c = 1;
  const paras = [new Paragraph({ children: [new TextRun({ text: pais.nome.toUpperCase(), bold: true })] }), new Paragraph({ children: [new TextRun({ text: doc.titulo, bold: true, size: 32 })] }), new Paragraph({ text: doc.preambulo || "" })];
  doc.titulos.forEach(t => {
    paras.push(new Paragraph({ children: [new TextRun({ text: t.nome, bold: true })] }));
    t.artigos.forEach(raw => {
      const a = normArt(raw);
      paras.push(new Paragraph({ text: `${a.epigrafe ? `(${a.epigrafe}) ` : ""}Art. ${c++}.º — ${a.texto}` }));
    });
  });
  const blob = await Packer.toBlob(new Document({ sections: [{ children: paras }] })); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${doc.titulo}.docx`; a.click();
}

async function exportarODT() {
  const zip = new JSZip(), pais = paises[paisAtualIdx], d = pais.docs[docAtualIdx]; let c = 1;
  let xml = `<text:h>${pais.nome} — ${d.titulo}</text:h><text:p>${d.preambulo}</text:p>`;
  d.titulos.forEach(t => {
    xml += `<text:h>${t.nome}</text:h>`;
    t.artigos.forEach(raw => {
      const a = normArt(raw);
      xml += `<text:p>${a.epigrafe ? `(${a.epigrafe}) ` : ""}Art. ${c++}.º — ${a.texto}</text:p>`;
    });
  });
  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
  zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2"><office:body><office:text>${xml}</office:text></office:body></office:document-content>`);
  const blob = await zip.generateAsync({ type: "blob" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${d.titulo}.odt`; a.click();
}

aplicarTema(temaAtual);
atualizarUIConta();
irHome();

function abrirModalDefinicoes() {
  aplicarTema(temaAtual);
  document.getElementById("modalDefinicoes").style.display = "flex";
}

function renderHistoricoPais() {
  const box = document.getElementById("listaHistoricoPais");
  if (!box || paisAtualIdx === null) return;
  const pais = paises[paisAtualIdx];
  const lista = historicoIA
    .map((item, idx) => ({ item, idx }))
    .filter(obj => obj.item.paisNome === pais.nome);

  if (lista.length === 0) {
    box.innerHTML = `<p style="color:#64748b; font-size:0.85rem; margin:6px 0;">Nenhuma conversa com a IA registada para ${pais.nome} ainda.</p>`;
    return;
  }
  box.innerHTML = "";
  lista.slice().reverse().forEach(({ item, idx }) => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-head">
        <span class="hist-pais">${item.docTitulo}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${item.data}</span>
          <button type="button" class="btn-del" title="Apagar esta conversa" onclick="apagarItemHistoricoPais(${idx})">✕</button>
        </div>
      </div>
      <p class="hist-txt">${item.texto}</p>
    `;
    box.appendChild(div);
  });
}

function apagarItemHistoricoPais(idx) {
  historicoIA.splice(idx, 1);
  guardarHistoricoIA();
  renderHistoricoPais();
}

function limparHistoricoPaisAtual() {
  const pais = paises[paisAtualIdx];
  const tem = historicoIA.some(item => item.paisNome === pais.nome);
  if (!tem) return;
  if (!confirm(`Apagar todo o histórico de conversas com a IA de "${pais.nome}"?`)) return;
  historicoIA = historicoIA.filter(item => item.paisNome !== pais.nome);
  guardarHistoricoIA();
  renderHistoricoPais();
}

const _abrirPaisOriginal = abrirPais;
abrirPais = function(idx) {
  _abrirPaisOriginal(idx);
  renderHistoricoPais();
};

function renderHistoricoPais() {
  const box = document.getElementById("listaHistoricoPais");
  if (!box || paisAtualIdx === null) return;
  const pais = paises[paisAtualIdx];
  const inpBusca = document.getElementById("inpBuscaHistIA");
  const selOrdem = document.getElementById("selOrdemHistIA");
  const termo = inpBusca ? inpBusca.value.trim().toLowerCase() : "";
  const ordem = selOrdem ? selOrdem.value : "recente";

  let lista = historicoIA
    .map((item, idx) => ({ item, idx }))
    .filter(obj => obj.item.paisNome === pais.nome);

  if (termo) {
    lista = lista.filter(({ item }) =>
      (item.texto && item.texto.toLowerCase().includes(termo)) ||
      (item.data && item.data.toLowerCase().includes(termo)) ||
      (item.docTitulo && item.docTitulo.toLowerCase().includes(termo))
    );
  }

  if (ordem === "recente") {
    lista = lista.slice().reverse();
  }

  if (lista.length === 0) {
    box.innerHTML = `<p style="color:#64748b; font-size:0.85rem; margin:6px 0;">${termo ? "Nenhuma conversa encontrada com essa pesquisa." : `Nenhuma conversa com a IA registada para ${pais.nome} ainda.`}</p>`;
    return;
  }

  box.innerHTML = "";
  lista.forEach(({ item, idx }) => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-head">
        <span class="hist-pais">${item.docTitulo}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${item.data}</span>
          <button type="button" class="btn-del" title="Apagar esta conversa" onclick="apagarItemHistoricoPais(${idx})">✕</button>
        </div>
      </div>
      <p class="hist-txt">${item.texto}</p>
    `;
    box.appendChild(div);
  });
}

const _executarIAOriginal = executarIA;
executarIA = function() {
  _executarIAOriginal();
  if (historicoIA.length > 0) {
    historicoIA[historicoIA.length - 1].data = new Date().toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    guardarHistoricoIA();
  }
};

let modoGravacao = localStorage.getItem("constituo_save_mode") || "auto";
let alteracoesPendentes = false;

function mudarModoGravacao(modo) {
  modoGravacao = modo;
  localStorage.setItem("constituo_save_mode", modo);
  document.querySelectorAll("[data-save]").forEach(el => {
    el.classList.toggle("active", el.dataset.save === modo);
  });
  atualizarBotaoGuardarManual();
}

function atualizarBotaoGuardarManual() {
  const btn = document.getElementById("btnGuardarManual");
  if (!btn) return;
  if (modoGravacao === "manual") {
    btn.style.display = "inline-flex";
    btn.textContent = alteracoesPendentes ? "Guardar alterações *" : "Guardado ✓";
    btn.style.background = alteracoesPendentes ? "#d97706" : "#1e3a5f";
  } else {
    btn.style.display = "none";
  }
}

function guardarManualAgora() {
  localStorage.setItem(chaveDados(), JSON.stringify(paises));
  alteracoesPendentes = false;
  atualizarBotaoGuardarManual();
}

const _guardarOriginal = guardar;
guardar = function() {
  const noEditor = document.getElementById("viewEditor").style.display === "block";
  if (modoGravacao === "manual" && noEditor) {
    alteracoesPendentes = true;
    atualizarBotaoGuardarManual();
    return;
  }
  _guardarOriginal();
};

const _abrirDefOriginal = abrirModalDefinicoes;
abrirModalDefinicoes = function() {
  _abrirDefOriginal();
  mudarModoGravacao(modoGravacao);
};

const _abrirEditorOriginal = abrirEditor;
abrirEditor = function(dIdx) {
  alteracoesPendentes = false;
  _abrirEditorOriginal(dIdx);
  atualizarBotaoGuardarManual();
};

const _abrirPaisAntesVoltar = abrirPais;
abrirPais = function(idx) {
  const estavaNoEditor = document.getElementById("viewEditor").style.display === "block";
  if (estavaNoEditor && modoGravacao === "manual" && alteracoesPendentes) {
    if (!confirm("Tens alterações por guardar neste documento. Queres sair sem guardar?")) {
      return;
    }
    paises = JSON.parse(localStorage.getItem(chaveDados())) || [];
    alteracoesPendentes = false;
  }
  _abrirPaisAntesVoltar(idx);
};

function eliminarContaAtual() {
  if (!utilizadorAtual) return;
  const email = utilizadorAtual.email;
  if (!confirm(`Tens a certeza que queres eliminar permanentemente a conta "${email}" e todos os seus países e documentos?`)) return;
  localStorage.removeItem(chaveDados());
  localStorage.removeItem(chaveHistIA());
  terminarSessao();
}

function editarTituloDoc(novoTitulo) {
  const pais = paises[paisAtualIdx];
  const doc = pais.docs[docAtualIdx];
  const tituloAntigo = doc.titulo;
  const tituloFinal = novoTitulo.trim() || doc.tipo;

  doc.titulo = novoTitulo;
  document.getElementById("edDocName").textContent = tituloFinal;
  document.getElementById("folhaTitulo").textContent = tituloFinal;

  historicoIA.forEach(item => {
    if (item.paisNome === pais.nome && (item.docIdx === docAtualIdx || item.docTitulo === tituloAntigo)) {
      item.docIdx = docAtualIdx;
      item.docTitulo = tituloFinal;
    }
  });
  guardarHistoricoIA();
  guardar();
}

const _execIAHistIdx = executarIA;
executarIA = function() {
  _execIAHistIdx();
  if (historicoIA.length > 0) {
    historicoIA[historicoIA.length - 1].docIdx = docAtualIdx;
    guardarHistoricoIA();
  }
};

const _abrirEditorComTitulo = abrirEditor;
abrirEditor = function(dIdx) {
  _abrirEditorComTitulo(dIdx);
  const tituloAtual = paises[paisAtualIdx].docs[dIdx].titulo || "";
  const inp = document.getElementById("inpFolhaTitulo");
  const h1 = document.getElementById("folhaTitulo");
  if (inp) {
    inp.value = tituloAtual;
    inp.style.display = "block";
  }
  if (h1) {
    h1.textContent = tituloAtual;
    h1.style.display = "none";
  }
};

function validarNomeDocumento() {
  const inp = document.getElementById("inpFolhaTitulo");
  const nome = inp ? inp.value.trim() : "";
  if (!nome) {
    alert("O documento precisa de ter um nome antes de guardar ou sair.");
    if (inp) inp.focus();
    return false;
  }
  return true;
}

const _guardarManualValidado = guardarManualAgora;
guardarManualAgora = function() {
  if (!validarNomeDocumento()) return;
  _guardarManualValidado();
};

const _abrirPaisValidado = abrirPais;
abrirPais = function(idx) {
  const estavaNoEditor = document.getElementById("viewEditor").style.display === "block";
  if (estavaNoEditor && !validarNomeDocumento()) return;
  _abrirPaisValidado(idx);
};

const _irHomeValidado = irHome;
irHome = function() {
  const estavaNoEditor = document.getElementById("viewEditor").style.display === "block";
  if (estavaNoEditor && !validarNomeDocumento()) return;
  _irHomeValidado();
};

async function carregarFicheiroIA(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  badge.style.display = "flex";
  nomeSpan.textContent = `A ler: ${file.name}...`;

  try {
    let textoExtraido = "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf" && window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cloudflare.com";
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }

    ficheiroIAAnexado = { nome: file.name, conteudo: textoExtraido.trim() };
    nomeSpan.textContent = `📄 ${file.name}`;
  } catch (err) {
    console.error(err);
    alert("Não foi possível ler este ficheiro. Tente outro PDF ou TXT.");
    removerFicheiroIA();
  }
}

document.addEventListener("click", function(e) {
  if (e.target && e.target.classList && e.target.classList.contains("modal-bg")) {
    fecharModal(e.target.id);
  }
});

function chaveBackupsHist() {
  return utilizadorAtual ? `constituo_bkp_hist_${utilizadorAtual.email}` : "constituo_bkp_hist_convidado";
}

let backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];

function guardarBackupsHistoricoIA() {
  localStorage.setItem(chaveBackupsHist(), JSON.stringify(backupsHistoricoIA));
}

function criarBackupHistoricoPais() {
  const pais = paises[paisAtualIdx];
  const conversasDoPais = historicoIA.filter(item => item.paisNome === pais.nome);
  if (conversasDoPais.length === 0) {
    return alert(`Não há conversas com a IA em "${pais.nome}" para fazer backup.`);
  }
  backupsHistoricoIA.push({
    paisNome: pais.nome,
    dataBackup: new Date().toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    }),
    total: conversasDoPais.length,
    itens: JSON.parse(JSON.stringify(conversasDoPais))
  });
  guardarBackupsHistoricoIA();
  renderBackupsPais();
  alert(`Backup criado com sucesso (${conversasDoPais.length} conversa(s))!`);
}

function restaurarBackupHistoricoPais(bkpIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp) return;
  if (!confirm(`Restaurar o backup de ${bkp.dataBackup} (${bkp.total} conversa(s)) para "${bkp.paisNome}"?`)) return;
  historicoIA = historicoIA.filter(item => item.paisNome !== bkp.paisNome).concat(JSON.parse(JSON.stringify(bkp.itens)));
  guardarHistoricoIA();
  renderHistoricoPais();
  alert("Histórico restaurado com sucesso!");
}

function eliminarBackupHistoricoPais(bkpIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp) return;
  if (!confirm(`1.ª Confirmação: Tens a certeza que queres eliminar o backup de "${bkp.paisNome}" (${bkp.dataBackup})?`)) return;
  const textoConfirmacao = prompt(`2.ª Confirmação: Escreve ELIMINAR em maiúsculas para apagar permanentemente este backup:`);
  if (textoConfirmacao !== "ELIMINAR") {
    return alert("Eliminação cancelada. O backup foi mantido.");
  }
  backupsHistoricoIA.splice(bkpIdx, 1);
  guardarBackupsHistoricoIA();
  renderBackupsPais();
}

function renderBackupsPais() {
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;
  backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];
  const pais = paises[paisAtualIdx];
  const lista = backupsHistoricoIA
    .map((bkp, idx) => ({ bkp, idx }))
    .filter(obj => obj.bkp.paisNome === pais.nome);

  if (lista.length === 0) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `<div style="font-size:0.78rem; font-weight:700; letter-spacing:0.6px; color:#64748b; margin-bottom:8px;">BACKUPS GUARDADOS (${lista.length})</div>`;
  lista.slice().reverse().forEach(({ bkp, idx }) => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.flexWrap = "wrap";
    div.style.gap = "8px";
    div.innerHTML = `
      <div>
        <strong style="font-size:0.86rem;">💾 Backup de ${bkp.dataBackup}</strong>
        <span class="badge-pill" style="margin-left:6px;">${bkp.total} conversa(s)</span>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="restaurarBackupHistoricoPais(${idx})">Restaurar</button>
        <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.78rem; padding:5px 8px;" onclick="eliminarBackupHistoricoPais(${idx})">Eliminar backup</button>
      </div>
    `;
    box.appendChild(div);
  });
}

const _renderHistComBackup = renderHistoricoPais;
renderHistoricoPais = function() {
  _renderHistComBackup();
  renderBackupsPais();
};

let backupAbertoIdx = null;

function toggleAbrirBackup(bkpIdx) {
  backupAbertoIdx = (backupAbertoIdx === bkpIdx) ? null : bkpIdx;
  renderBackupsPais();
}

function restaurarItemBackupPais(bkpIdx, itemIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp || !bkp.itens[itemIdx]) return;
  const item = bkp.itens[itemIdx];
  if (!confirm(`Restaurar esta conversa específica (${item.docTitulo} — ${item.data}) para o histórico de "${bkp.paisNome}"?`)) return;
  historicoIA.push(JSON.parse(JSON.stringify(item)));
  guardarHistoricoIA();
  renderHistoricoPais();
  alert("Conversa restaurada com sucesso!");
}

function eliminarItemBackupPais(bkpIdx, itemIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp || !bkp.itens[itemIdx]) return;
  const item = bkp.itens[itemIdx];
  if (!confirm(`1.ª Confirmação: Tens a certeza que queres eliminar esta conversa específica ("${item.docTitulo}") de dentro do backup?`)) return;
  const resp = prompt(`2.ª Confirmação: Escreve ELIMINAR em maiúsculas para apagar esta conversa do backup:`);
  if (resp !== "ELIMINAR") {
    return alert("Eliminação cancelada. A conversa foi mantida no backup.");
  }
  bkp.itens.splice(itemIdx, 1);
  bkp.total = bkp.itens.length;
  if (bkp.itens.length === 0) {
    backupsHistoricoIA.splice(bkpIdx, 1);
    backupAbertoIdx = null;
  }
  guardarBackupsHistoricoIA();
  renderBackupsPais();
}

renderBackupsPais = function() {
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;
  backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];
  const pais = paises[paisAtualIdx];
  const lista = backupsHistoricoIA
    .map((bkp, idx) => ({ bkp, idx }))
    .filter(obj => obj.bkp.paisNome === pais.nome);

  if (lista.length === 0) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `<div style="font-size:0.78rem; font-weight:700; letter-spacing:0.6px; color:#64748b; margin-bottom:8px;">BACKUPS GUARDADOS (${lista.length})</div>`;
  lista.slice().reverse().forEach(({ bkp, idx }) => {
    const aberto = backupAbertoIdx === idx;
    const div = document.createElement("div");
    div.className = "hist-item";

    let conteudoAberto = "";
    if (aberto) {
      conteudoAberto = `<div style="margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; display:flex; flex-direction:column; gap:8px;">`
        + bkp.itens.map((it, iIdx) => `
          <div style="background:rgba(148,163,184,0.12); border:1px solid rgba(148,163,184,0.3); border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px;">
              <span style="font-size:0.76rem; font-weight:700; color:#1e3a5f;">${it.docTitulo} <span style="font-weight:400; color:#64748b;">· ${it.data}</span></span>
              <div style="display:flex; gap:6px;">
                <button type="button" class="btn-outline" style="font-size:0.74rem; padding:3px 8px;" onclick="restaurarItemBackupPais(${idx}, ${iIdx})">Restaurar esta</button>
                <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.74rem; padding:3px 6px;" onclick="eliminarItemBackupPais(${idx}, ${iIdx})">Eliminar</button>
              </div>
            </div>
            <p class="hist-txt" style="font-size:0.83rem;">${it.texto}</p>
          </div>
        `).join("")
        + `</div>`;
    }

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <strong style="font-size:0.86rem;">💾 Backup de ${bkp.dataBackup}</strong>
          <span class="badge-pill" style="margin-left:6px;">${bkp.total} conversa(s)</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="toggleAbrirBackup(${idx})">${aberto ? "Fechar ▲" : "Abrir backup ▼"}</button>
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="restaurarBackupHistoricoPais(${idx})">Restaurar tudo</button>
          <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.78rem; padding:5px 8px;" onclick="eliminarBackupHistoricoPais(${idx})">Eliminar backup</button>
        </div>
      </div>
      ${conteudoAberto}
    `;
    box.appendChild(div);
  });
};

let buscaBackupTexto = "";
let ordemBackupAtual = "recente";

function atualizarFiltroBackup(texto, ordem) {
  if (texto !== null) buscaBackupTexto = texto;
  if (ordem !== null) ordemBackupAtual = ordem;
  renderBackupsPais();
  const inp = document.getElementById("inpBuscaDentroBackup");
  if (inp && texto !== null) {
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }
}

renderBackupsPais = function() {
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;
  backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];
  const pais = paises[paisAtualIdx];
  const lista = backupsHistoricoIA
    .map((bkp, idx) => ({ bkp, idx }))
    .filter(obj => obj.bkp.paisNome === pais.nome);

  if (lista.length === 0) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `<div style="font-size:0.78rem; font-weight:700; letter-spacing:0.6px; color:#64748b; margin-bottom:8px;">BACKUPS GUARDADOS (${lista.length})</div>`;
  lista.slice().reverse().forEach(({ bkp, idx }) => {
    const aberto = backupAbertoIdx === idx;
    const div = document.createElement("div");
    div.className = "hist-item";

    let conteudoAberto = "";
    if (aberto) {
      const termo = buscaBackupTexto.trim().toLowerCase();
      let itensFiltrados = bkp.itens.map((it, iIdx) => ({ it, iIdx }));

      if (termo) {
        itensFiltrados = itensFiltrados.filter(({ it }) =>
          (it.texto && it.texto.toLowerCase().includes(termo)) ||
          (it.data && it.data.toLowerCase().includes(termo)) ||
          (it.docTitulo && it.docTitulo.toLowerCase().includes(termo))
        );
      }

      if (ordemBackupAtual === "recente") {
        itensFiltrados = itensFiltrados.slice().reverse();
      }

      const listaHtml = itensFiltrados.length === 0
        ? `<p style="color:#64748b; font-size:0.82rem; margin:6px 0;">Nenhuma conversa encontrada neste backup com essa pesquisa.</p>`
        : itensFiltrados.map(({ it, iIdx }) => `
          <div style="background:rgba(148,163,184,0.12); border:1px solid rgba(148,163,184,0.3); border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px;">
              <span style="font-size:0.76rem; font-weight:700; color:#1e3a5f;">${it.docTitulo} <span style="font-weight:400; color:#64748b;">· ${it.data}</span></span>
              <div style="display:flex; gap:6px;">
                <button type="button" class="btn-outline" style="font-size:0.74rem; padding:3px 8px;" onclick="restaurarItemBackupPais(${idx}, ${iIdx})">Restaurar esta</button>
                <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.74rem; padding:3px 6px;" onclick="eliminarItemBackupPais(${idx}, ${iIdx})">Eliminar</button>
              </div>
            </div>
            <p class="hist-txt" style="font-size:0.83rem;">${it.texto}</p>
          </div>
        `).join("");

      conteudoAberto = `
        <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #cbd5e1; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <input type="text" id="inpBuscaDentroBackup" value="${buscaBackupTexto.replace(/"/g, '&quot;')}" placeholder="Pesquisar no backup por texto, data, ano ou hora (ex: 13:25)..." oninput="atualizarFiltroBackup(this.value, null)" style="flex:1; min-width:200px; padding:7px 10px; font-size:0.82rem;">
            <select onchange="atualizarFiltroBackup(null, this.value)" style="width:auto; min-width:175px; padding:7px 10px; font-size:0.82rem;">
              <option value="recente" ${ordemBackupAtual === "recente" ? "selected" : ""}>Mais recente primeiro</option>
              <option value="antigo" ${ordemBackupAtual === "antigo" ? "selected" : ""}>Mais antigo primeiro</option>
            </select>
          </div>
          ${listaHtml}
        </div>`;
    }

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <strong style="font-size:0.86rem;">💾 Backup de ${bkp.dataBackup}</strong>
          <span class="badge-pill" style="margin-left:6px;">${bkp.total} conversa(s)</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="buscaBackupTexto=''; toggleAbrirBackup(${idx})">${aberto ? "Fechar ▲" : "Abrir backup ▼"}</button>
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="restaurarBackupHistoricoPais(${idx})">Restaurar tudo</button>
          <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.78rem; padding:5px 8px;" onclick="eliminarBackupHistoricoPais(${idx})">Eliminar backup</button>
        </div>
      </div>
      ${conteudoAberto}
    `;
    box.appendChild(div);
  });
};

let acaoConfirmacaoPendente = null;
let etapaConfirmacaoAtual = 1;
let tituloConfirmacaoAlvo = "";

function abrirConfirmacaoDupla(tituloAlvo, callbackExecutar) {
  tituloConfirmacaoAlvo = tituloAlvo;
  acaoConfirmacaoPendente = callbackExecutar;
  etapaConfirmacaoAtual = 1;

  document.getElementById("confPassoBadge").textContent = "PASSO 1 DE 2";
  document.getElementById("confMensagem").textContent = `Tens a certeza que queres eliminar ${tituloAlvo}? Esta ação não pode ser desfeita.`;
  document.getElementById("confBoxInput").style.display = "none";
  document.getElementById("confInputTexto").value = "";
  document.getElementById("btnConfAvancar").textContent = "Sim, continuar →";
  document.getElementById("modalConfirmacao").style.display = "flex";
}

function avancarConfirmacaoDupla() {
  if (etapaConfirmacaoAtual === 1) {
    etapaConfirmacaoAtual = 2;
    document.getElementById("confPassoBadge").textContent = "PASSO 2 DE 2 · CONFIRMAÇÃO FINAL";
    document.getElementById("confMensagem").textContent = `Para concluir a eliminação permanente de ${tituloConfirmacaoAlvo}, escreve a palavra abaixo:`;
    document.getElementById("confBoxInput").style.display = "block";
    document.getElementById("btnConfAvancar").textContent = "Eliminar permanentemente";
    setTimeout(() => document.getElementById("confInputTexto").focus(), 50);
    return;
  }

  const digitado = document.getElementById("confInputTexto").value.trim();
  if (digitado !== "ELIMINAR") {
    const inp = document.getElementById("confInputTexto");
    inp.style.borderColor = "#dc2626";
    inp.focus();
    return;
  }

  document.getElementById("confInputTexto").style.borderColor = "";
  fecharModal("modalConfirmacao");
  if (typeof acaoConfirmacaoPendente === "function") {
    acaoConfirmacaoPendente();
  }
}

eliminarBackupHistoricoPais = function(bkpIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp) return;
  abrirConfirmacaoDupla(`o backup de ${bkp.dataBackup} (${bkp.total} conversa(s))`, function() {
    backupsHistoricoIA.splice(bkpIdx, 1);
    if (backupAbertoIdx === bkpIdx) backupAbertoIdx = null;
    guardarBackupsHistoricoIA();
    renderBackupsPais();
  });
};

eliminarItemBackupPais = function(bkpIdx, itemIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp || !bkp.itens[itemIdx]) return;
  const item = bkp.itens[itemIdx];
  abrirConfirmacaoDupla(`a conversa "${item.docTitulo}" deste backup`, function() {
    bkp.itens.splice(itemIdx, 1);
    bkp.total = bkp.itens.length;
    if (bkp.itens.length === 0) {
      backupsHistoricoIA.splice(bkpIdx, 1);
      backupAbertoIdx = null;
    }
    guardarBackupsHistoricoIA();
    renderBackupsPais();
  });
};

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    fecharModal("modalConfirmacao");
  }
});

function mostrarAvisoApp(mensagem, isErro) {
  let toast = document.getElementById("constituoToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "constituoToast";
    toast.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:300; padding:12px 18px; border-radius:10px; font-size:0.86rem; font-weight:600; box-shadow:0 10px 25px rgba(0,0,0,0.18); display:flex; align-items:center; gap:9px; transition:opacity 0.25s, transform 0.25s; opacity:0; transform:translateY(10px);";
    document.body.appendChild(toast);
  }
  toast.style.background = isErro ? "#dc2626" : "#1e3a5f";
  toast.style.color = "#fff";
  toast.textContent = (isErro ? "⚠️ " : "✓ ") + mensagem;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
  }, 3200);
}

criarBackupHistoricoPais = function() {
  const pais = paises[paisAtualIdx];
  const conversasDoPais = historicoIA.filter(item => item.paisNome === pais.nome);
  if (conversasDoPais.length === 0) {
    mostrarAvisoApp(`Não há conversas com a IA em "${pais.nome}" para fazer backup.`, true);
    return;
  }
  backupsHistoricoIA.push({
    paisNome: pais.nome,
    dataBackup: new Date().toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    }),
    total: conversasDoPais.length,
    itens: JSON.parse(JSON.stringify(conversasDoPais))
  });
  guardarBackupsHistoricoIA();
  renderBackupsPais();
  mostrarAvisoApp(`Backup criado (${conversasDoPais.length} conversa(s))!`);
};

restaurarBackupHistoricoPais = function(bkpIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp) return;
  historicoIA = historicoIA.filter(item => item.paisNome !== bkp.paisNome).concat(JSON.parse(JSON.stringify(bkp.itens)));
  guardarHistoricoIA();
  renderHistoricoPais();
  mostrarAvisoApp(`Backup de ${bkp.dataBackup} restaurado!`);
};

restaurarItemBackupPais = function(bkpIdx, itemIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp || !bkp.itens[itemIdx]) return;
  const item = bkp.itens[itemIdx];
  historicoIA.push(JSON.parse(JSON.stringify(item)));
  guardarHistoricoIA();
  renderHistoricoPais();
  mostrarAvisoApp(`Conversa "${item.docTitulo}" restaurada!`);
};

let buscaListaBackups = "";
let ordemListaBackups = "recente";
let editandoNomeBkpIdx = null;

function atualizarFiltroListaBackups(texto, ordem) {
  if (texto !== null) buscaListaBackups = texto;
  if (ordem !== null) ordemListaBackups = ordem;
  renderBackupsPais();
  const inp = document.getElementById("inpBuscaListaBackups");
  if (inp && texto !== null) {
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }
}

function ativarEdicaoNomeBackup(bkpIdx) {
  editandoNomeBkpIdx = bkpIdx;
  renderBackupsPais();
  const inp = document.getElementById("inpNomeBkpInline");
  if (inp) {
    inp.focus();
    inp.select();
  }
}

function guardarNomeBackupInline(bkpIdx, novoNome) {
  if (backupsHistoricoIA[bkpIdx]) {
    backupsHistoricoIA[bkpIdx].nome = novoNome.trim();
    guardarBackupsHistoricoIA();
  }
  editandoNomeBkpIdx = null;
  renderBackupsPais();
}

renderBackupsPais = function() {
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;
  backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];
  const pais = paises[paisAtualIdx];

  const todosDoPais = backupsHistoricoIA
    .map((bkp, idx) => ({ bkp, idx }))
    .filter(obj => obj.bkp.paisNome === pais.nome);

  if (todosDoPais.length === 0) {
    box.innerHTML = "";
    return;
  }

  const termoLista = buscaListaBackups.trim().toLowerCase();
  let lista = todosDoPais;

  if (termoLista) {
    lista = lista.filter(({ bkp }) => {
      const nomeBkp = (bkp.nome || `Backup de ${bkp.dataBackup}`).toLowerCase();
      const dataBkp = (bkp.dataBackup || "").toLowerCase();
      const bateNoConteudo = (bkp.itens || []).some(it =>
        (it.texto && it.texto.toLowerCase().includes(termoLista)) ||
        (it.docTitulo && it.docTitulo.toLowerCase().includes(termoLista)) ||
        (it.data && it.data.toLowerCase().includes(termoLista))
      );
      return nomeBkp.includes(termoLista) || dataBkp.includes(termoLista) || bateNoConteudo;
    });
  }

  if (ordemListaBackups === "recente") {
    lista = lista.slice().reverse();
  }

  box.innerHTML = `
    <div style="font-size:0.78rem; font-weight:700; letter-spacing:0.6px; color:#64748b; margin-bottom:8px;">BACKUPS GUARDADOS (${todosDoPais.length})</div>
    <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
      <input type="text" id="inpBuscaListaBackups" value="${buscaListaBackups.replace(/"/g, '&quot;')}" placeholder="Pesquisar backup por nome, data, hora/minuto ou conteúdo..." oninput="atualizarFiltroListaBackups(this.value, null)" style="flex:1; min-width:220px;">
      <select onchange="atualizarFiltroListaBackups(null, this.value)" style="width:auto; min-width:190px;">
        <option value="recente" ${ordemListaBackups === "recente" ? "selected" : ""}>Mais recente primeiro</option>
        <option value="antigo" ${ordemListaBackups === "antigo" ? "selected" : ""}>Mais antigo primeiro</option>
      </select>
    </div>
  `;

  if (lista.length === 0) {
    box.innerHTML += `<p style="color:#64748b; font-size:0.84rem; margin:6px 0;">Nenhum backup encontrado com essa pesquisa.</p>`;
    return;
  }

  lista.forEach(({ bkp, idx }) => {
    const aberto = backupAbertoIdx === idx;
    const tituloBackup = bkp.nome || `Backup de ${bkp.dataBackup}`;
    const div = document.createElement("div");
    div.className = "hist-item";

    let conteudoAberto = "";
    if (aberto) {
      const termo = buscaBackupTexto.trim().toLowerCase();
      let itensFiltrados = bkp.itens.map((it, iIdx) => ({ it, iIdx }));

      if (termo) {
        itensFiltrados = itensFiltrados.filter(({ it }) =>
          (it.texto && it.texto.toLowerCase().includes(termo)) ||
          (it.data && it.data.toLowerCase().includes(termo)) ||
          (it.docTitulo && it.docTitulo.toLowerCase().includes(termo))
        );
      }

      if (ordemBackupAtual === "recente") {
        itensFiltrados = itensFiltrados.slice().reverse();
      }

      const listaHtml = itensFiltrados.length === 0
        ? `<p style="color:#64748b; font-size:0.82rem; margin:6px 0;">Nenhuma conversa encontrada neste backup com essa pesquisa.</p>`
        : itensFiltrados.map(({ it, iIdx }) => `
          <div style="background:rgba(148,163,184,0.12); border:1px solid rgba(148,163,184,0.3); border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px;">
              <span style="font-size:0.76rem; font-weight:700; color:#1e3a5f;">${it.docTitulo} <span style="font-weight:400; color:#64748b;">· ${it.data}</span></span>
              <div style="display:flex; gap:6px;">
                <button type="button" class="btn-outline" style="font-size:0.74rem; padding:3px 8px;" onclick="restaurarItemBackupPais(${idx}, ${iIdx})">Restaurar esta</button>
                <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.74rem; padding:3px 6px;" onclick="eliminarItemBackupPais(${idx}, ${iIdx})">Eliminar</button>
              </div>
            </div>
            <p class="hist-txt" style="font-size:0.83rem;">${it.texto}</p>
          </div>
        `).join("");

      conteudoAberto = `
        <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #cbd5e1; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <input type="text" id="inpBuscaDentroBackup" value="${buscaBackupTexto.replace(/"/g, '&quot;')}" placeholder="Pesquisar no backup por texto, data, ano ou hora (ex: 13:25)..." oninput="atualizarFiltroBackup(this.value, null)" style="flex:1; min-width:200px; padding:7px 10px; font-size:0.82rem;">
            <select onchange="atualizarFiltroBackup(null, this.value)" style="width:auto; min-width:175px; padding:7px 10px; font-size:0.82rem;">
              <option value="recente" ${ordemBackupAtual === "recente" ? "selected" : ""}>Mais recente primeiro</option>
              <option value="antigo" ${ordemBackupAtual === "antigo" ? "selected" : ""}>Mais antigo primeiro</option>
            </select>
          </div>
          ${listaHtml}
        </div>`;
    }

    const blocoTitulo = editandoNomeBkpIdx === idx
      ? `<input type="text" id="inpNomeBkpInline" value="${tituloBackup.replace(/"/g, '&quot;')}" onblur="guardarNomeBackupInline(${idx}, this.value)" onkeydown="if(event.key==='Enter') guardarNomeBackupInline(${idx}, this.value)" style="width:auto; min-width:210px; padding:4px 8px; font-size:0.84rem; font-weight:600;">`
      : `<strong style="font-size:0.86rem;">💾 ${tituloBackup}</strong>
         <button type="button" class="btn-ghost" title="Dar nome a este backup" onclick="ativarEdicaoNomeBackup(${idx})" style="padding:2px 5px; font-size:0.78rem;">✏️</button>
         <span style="font-size:0.75rem; color:#64748b;">(${bkp.dataBackup})</span>`;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${blocoTitulo}
          <span class="badge-pill">${bkp.total} conversa(s)</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="buscaBackupTexto=''; toggleAbrirBackup(${idx})">${aberto ? "Fechar ▲" : "Abrir backup ▼"}</button>
          <button type="button" class="btn-outline" style="font-size:0.78rem; padding:5px 10px;" onclick="restaurarBackupHistoricoPais(${idx})">Restaurar tudo</button>
          <button type="button" class="btn-ghost" style="color:#dc2626; font-size:0.78rem; padding:5px 8px;" onclick="eliminarBackupHistoricoPais(${idx})">Eliminar backup</button>
        </div>
      </div>
      ${conteudoAberto}
    `;
    box.appendChild(div);
  });
};

let filtroDocBackupAtual = "TODOS";

criarBackupHistoricoPais = function() {
  const pais = paises[paisAtualIdx];
  const conversasDoPais = historicoIA.filter(item => item.paisNome === pais.nome);
  if (conversasDoPais.length === 0) {
    mostrarAvisoApp(`Não há conversas com a IA em "${pais.nome}" para fazer backup.`, true);
    return;
  }

  let modalBkp = document.getElementById("modalEscolherAlvoBackup");
  if (!modalBkp) {
    modalBkp = document.createElement("div");
    modalBkp.id = "modalEscolherAlvoBackup";
    modalBkp.className = "modal-bg";
    modalBkp.style.zIndex = "210";
    modalBkp.innerHTML = `
      <div class="modal-card" style="max-width:430px;">
        <div class="modal-head">
          <h3>Criar Backup por Documento</h3>
          <button type="button" class="btn-ghost" onclick="fecharModal('modalEscolherAlvoBackup')">✕</button>
        </div>
        <div class="modal-body" style="gap:10px;">
          <label class="fld-lbl" style="margin-top:0;">De que Constituição, Código ou Lei queres guardar o backup?</label>
          <select id="selAlvoBackupDoc"></select>
          <label class="fld-lbl">Nome personalizado para este backup (opcional)</label>
          <input type="text" id="inpNomeNovoBackup" placeholder="Ex: Versão inicial do Código da Estrada">
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-outline" onclick="fecharModal('modalEscolherAlvoBackup')">Cancelar</button>
          <button type="button" class="btn-navy" onclick="confirmarCriacaoBackupPorDoc()">💾 Guardar Backup</button>
        </div>
      </div>`;
    document.body.appendChild(modalBkp);
  }

  const docsUnicos = [...new Set(conversasDoPais.map(c => c.docTitulo))];
  const sel = document.getElementById("selAlvoBackupDoc");
  sel.innerHTML = `<option value="TODOS">Todos os documentos deste país (${conversasDoPais.length} conversa(s))</option>`
    + docsUnicos.map(tituloDoc => {
      const qtd = conversasDoPais.filter(c => c.docTitulo === tituloDoc).length;
      return `<option value="${tituloDoc.replace(/"/g, '&quot;')}">${tituloDoc} (${qtd} conversa(s))</option>`;
    }).join("");

  document.getElementById("inpNomeNovoBackup").value = "";
  modalBkp.style.display = "flex";
};

function confirmarCriacaoBackupPorDoc() {
  const pais = paises[paisAtualIdx];
  const alvoDoc = document.getElementById("selAlvoBackupDoc").value;
  const nomeCustom = document.getElementById("inpNomeNovoBackup").value.trim();

  const conversasFiltradas = historicoIA.filter(item =>
    item.paisNome === pais.nome && (alvoDoc === "TODOS" || item.docTitulo === alvoDoc)
  );

  if (conversasFiltradas.length === 0) {
    mostrarAvisoApp("Não existem conversas para esse documento.", true);
    return;
  }

  const dataAgora = new Date().toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const categoriaDoc = alvoDoc === "TODOS" ? "Todos os documentos" : alvoDoc;
  const nomeFinal = nomeCustom || `Backup · ${categoriaDoc} (${dataAgora})`;

  backupsHistoricoIA.push({
    paisNome: pais.nome,
    docCategoria: categoriaDoc,
    nome: nomeFinal,
    dataBackup: dataAgora,
    total: conversasFiltradas.length,
    itens: JSON.parse(JSON.stringify(conversasFiltradas))
  });

  guardarBackupsHistoricoIA();
  fecharModal("modalEscolherAlvoBackup");
  renderBackupsPais();
  mostrarAvisoApp(`Backup "${categoriaDoc}" criado (${conversasFiltradas.length} conversa(s))!`);
}

function mudarFiltroCategoriaBackup(cat) {
  filtroDocBackupAtual = cat;
  renderBackupsPais();
}

const _renderBackupsBase = renderBackupsPais;
renderBackupsPais = function() {
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;
  backupsHistoricoIA = JSON.parse(localStorage.getItem(chaveBackupsHist())) || [];
  const pais = paises[paisAtualIdx];
  const todosDoPais = backupsHistoricoIA.filter(b => b.paisNome === pais.nome);

  if (todosDoPais.length === 0) {
    box.innerHTML = "";
    return;
  }

  const categorias = [...new Set(todosDoPais.map(b => b.docCategoria || "Geral"))];
  if (filtroDocBackupAtual !== "TODOS" && !categorias.includes(filtroDocBackupAtual)) {
    filtroDocBackupAtual = "TODOS";
  }

  _renderBackupsBase();

  const barraCategorias = document.createElement("div");
  barraCategorias.style.cssText = "display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;";
  barraCategorias.innerHTML = [
    `<button type="button" onclick="mudarFiltroCategoriaBackup('TODOS')" style="padding:5px 12px; border-radius:99px; font-size:0.78rem; background:${filtroDocBackupAtual === 'TODOS' ? '#1e3a5f' : '#fff'}; color:${filtroDocBackupAtual === 'TODOS' ? '#fff' : '#475569'}; border:1px solid ${filtroDocBackupAtual === 'TODOS' ? '#1e3a5f' : '#cbd5e1'};">Todos (${todosDoPais.length})</button>`,
    ...categorias.map(cat => {
      const qtd = todosDoPais.filter(b => (b.docCategoria || "Geral") === cat).length;
      const ativo = filtroDocBackupAtual === cat;
      return `<button type="button" onclick="mudarFiltroCategoriaBackup('${cat.replace(/'/g, "\\'")}')" style="padding:5px 12px; border-radius:99px; font-size:0.78rem; background:${ativo ? '#1e3a5f' : '#fff'}; color:${ativo ? '#fff' : '#475569'}; border:1px solid ${ativo ? '#1e3a5f' : '#cbd5e1'};">📄 ${cat} (${qtd})</button>`;
    })
  ].join("");

  const primeiroTitulo = box.firstElementChild;
  if (primeiroTitulo) {
    primeiroTitulo.insertAdjacentElement("afterend", barraCategorias);
  }

  Array.from(box.querySelectorAll(".hist-item")).forEach(card => {
    const textoCard = card.textContent || "";
    if (filtroDocBackupAtual !== "TODOS" && !textoCard.includes(filtroDocBackupAtual)) {
      card.style.display = "none";
    }
  });
};

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") fecharModal("modalEscolherAlvoBackup");
});

let totalEtapasConfirmacao = 2;
let palavraConfirmacaoFinal = "ELIMINAR";

function abrirConfirmacaoNPassos(tituloAlvo, totalPassos, palavraFinal, callbackExecutar) {
  tituloConfirmacaoAlvo = tituloAlvo;
  acaoConfirmacaoPendente = callbackExecutar;
  etapaConfirmacaoAtual = 1;
  totalEtapasConfirmacao = totalPassos;
  palavraConfirmacaoFinal = palavraFinal;

  document.getElementById("confPassoBadge").textContent = `PASSO 1 DE ${totalEtapasConfirmacao}`;
  document.getElementById("confMensagem").textContent = `Tens a certeza que queres eliminar ${tituloAlvo}? Esta ação não pode ser desfeita.`;
  document.getElementById("confBoxInput").style.display = "none";
  document.getElementById("confInputTexto").value = "";
  document.getElementById("btnConfAvancar").textContent = "Sim, continuar →";
  document.getElementById("modalConfirmacao").style.display = "flex";
}

abrirConfirmacaoDupla = function(tituloAlvo, callbackExecutar) {
  abrirConfirmacaoNPassos(tituloAlvo, 2, "ELIMINAR", callbackExecutar);
};

avancarConfirmacaoDupla = function() {
  if (etapaConfirmacaoAtual < totalEtapasConfirmacao) {
    etapaConfirmacaoAtual++;
    document.getElementById("confPassoBadge").textContent = `PASSO ${etapaConfirmacaoAtual} DE ${totalEtapasConfirmacao}`;

    if (etapaConfirmacaoAtual === totalEtapasConfirmacao) {
      document.getElementById("confMensagem").textContent = `Último aviso! Para apagar permanentemente ${tituloConfirmacaoAlvo}, escreve "${palavraConfirmacaoFinal}" abaixo:`;
      document.getElementById("confInputTexto").placeholder = palavraConfirmacaoFinal;
      document.getElementById("confBoxInput").style.display = "block";
      document.getElementById("btnConfAvancar").textContent = "Eliminar permanentemente";
      setTimeout(() => document.getElementById("confInputTexto").focus(), 50);
    } else {
      const avisosIntermedios = [
        "",
        `Confirma novamente: todos os ficheiros de backup dentro de ${tituloConfirmacaoAlvo} serão perdidos para sempre.`,
        `Terceira confirmação: tens mesmo a certeza absoluta de que não queres restaurar nenhum destes backups antes de apagar?`
      ];
      document.getElementById("confMensagem").textContent = avisosIntermedios[etapaConfirmacaoAtual - 1] || `Confirmação ${etapaConfirmacaoAtual} de ${totalEtapasConfirmacao}: desejas prosseguir com a eliminação?`;
      document.getElementById("confBoxInput").style.display = "none";
      document.getElementById("btnConfAvancar").textContent = `Confirmar (${etapaConfirmacaoAtual}/${totalEtapasConfirmacao}) →`;
    }
    return;
  }

  const digitado = document.getElementById("confInputTexto").value.trim().toUpperCase();
  if (digitado !== palavraConfirmacaoFinal) {
    const inp = document.getElementById("confInputTexto");
    inp.style.borderColor = "#dc2626";
    inp.focus();
    return;
  }

  document.getElementById("confInputTexto").style.borderColor = "";
  fecharModal("modalConfirmacao");
  if (typeof acaoConfirmacaoPendente === "function") {
    acaoConfirmacaoPendente();
  }
};

function apagarTodosBackupsPaisAtual() {
  const pais = paises[paisAtualIdx];
  const qtd = backupsHistoricoIA.filter(b => b.paisNome === pais.nome).length;
  if (qtd === 0) return;

  abrirConfirmacaoNPassos(`TODOS os ${qtd} backup(s) de "${pais.nome}"`, 4, "ELIMINAR TUDO", function() {
    backupsHistoricoIA = backupsHistoricoIA.filter(b => b.paisNome !== pais.nome);
    backupAbertoIdx = null;
    guardarBackupsHistoricoIA();
    renderBackupsPais();
    mostrarAvisoApp(`Todos os backups de "${pais.nome}" foram eliminados.`);
  });
}

const _renderBackupsComApagarTudo = renderBackupsPais;
renderBackupsPais = function() {
  _renderBackupsComApagarTudo();
  const box = document.getElementById("listaBackupsPais");
  if (!box || !box.firstElementChild) return;

  const cabecalho = box.firstElementChild;
  cabecalho.style.display = "flex";
  cabecalho.style.justifyContent = "space-between";
  cabecalho.style.alignItems = "center";
  cabecalho.style.flexWrap = "wrap";
  cabecalho.style.gap = "8px";

  const btnApagarTudo = document.createElement("button");
  btnApagarTudo.type = "button";
  btnApagarTudo.className = "btn-ghost";
  btnApagarTudo.style.cssText = "color:#dc2626; font-size:0.78rem; padding:2px 6px;";
  btnApagarTudo.textContent = "Apagar todos os backups deste país";
  btnApagarTudo.onclick = apagarTodosBackupsPaisAtual;
  cabecalho.appendChild(btnApagarTudo);
};

let filtroDocHistoricoAtual = "TODOS";

function mudarFiltroDocHistorico(docTitulo) {
  filtroDocHistoricoAtual = docTitulo;
  renderHistoricoPais();
}

const _renderHistSemFiltroDoc = renderHistoricoPais;
renderHistoricoPais = function() {
  const box = document.getElementById("listaHistoricoPais");
  if (!box || paisAtualIdx === null) return;
  const pais = paises[paisAtualIdx];
  const todosDoPais = historicoIA.filter(item => item.paisNome === pais.nome);
  const docsUnicos = [...new Set(todosDoPais.map(c => c.docTitulo))];

  if (filtroDocHistoricoAtual !== "TODOS" && !docsUnicos.includes(filtroDocHistoricoAtual)) {
    filtroDocHistoricoAtual = "TODOS";
  }

  let selDoc = document.getElementById("selFiltroDocHistIA");
  const barraPesquisa = document.getElementById("inpBuscaHistIA")?.parentElement;
  if (barraPesquisa && !selDoc) {
    selDoc = document.createElement("select");
    selDoc.id = "selFiltroDocHistIA";
    selDoc.style.cssText = "width:auto; min-width:195px;";
    selDoc.onchange = function() { mudarFiltroDocHistorico(this.value); };
    barraPesquisa.appendChild(selDoc);
  }

  if (selDoc) {
    selDoc.innerHTML = `<option value="TODOS" ${filtroDocHistoricoAtual === "TODOS" ? "selected" : ""}>Todos os documentos (${todosDoPais.length})</option>`
      + docsUnicos.map(tituloDoc => {
        const qtd = todosDoPais.filter(c => c.docTitulo === tituloDoc).length;
        return `<option value="${tituloDoc.replace(/"/g, '&quot;')}" ${filtroDocHistoricoAtual === tituloDoc ? "selected" : ""}>📄 ${tituloDoc} (${qtd})</option>`;
      }).join("");
  }

  const backupOriginal = historicoIA;
  if (filtroDocHistoricoAtual !== "TODOS") {
    historicoIA = historicoIA.filter(item => item.paisNome !== pais.nome || item.docTitulo === filtroDocHistoricoAtual);
  }

  _renderHistSemFiltroDoc();

  historicoIA = backupOriginal;
};

const _renderBackupsComSelectDoc = renderBackupsPais;
renderBackupsPais = function() {
  _renderBackupsComSelectDoc();
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;

  const pais = paises[paisAtualIdx];
  const todosDoPais = backupsHistoricoIA.filter(b => b.paisNome === pais.nome);
  if (todosDoPais.length === 0) return;

  // Remove a barra antiga de botões redondos se existir, para usar o seletor suspenso igual ao Histórico
  const cabecalho = box.firstElementChild;
  if (cabecalho && cabecalho.nextElementSibling && cabecalho.nextElementSibling.querySelector("button")) {
    cabecalho.nextElementSibling.remove();
  }

  const categorias = [...new Set(todosDoPais.map(b => b.docCategoria || "Geral"))];
  const inpBuscaBkp = document.getElementById("inpBuscaListaBackups");
  const barraBkp = inpBuscaBkp ? inpBuscaBkp.parentElement : null;

  if (barraBkp && !document.getElementById("selFiltroDocBackup")) {
    const selBkp = document.createElement("select");
    selBkp.id = "selFiltroDocBackup";
    selBkp.style.cssText = "width:auto; min-width:195px;";
    selBkp.onchange = function() { mudarFiltroCategoriaBackup(this.value); };
    selBkp.innerHTML = `<option value="TODOS" ${filtroDocBackupAtual === "TODOS" ? "selected" : ""}>Todos os documentos (${todosDoPais.length})</option>`
      + categorias.map(cat => {
        const qtd = todosDoPais.filter(b => (b.docCategoria || "Geral") === cat).length;
        return `<option value="${cat.replace(/"/g, '&quot;')}" ${filtroDocBackupAtual === cat ? "selected" : ""}>📄 ${cat} (${qtd})</option>`;
      }).join("");
    barraBkp.appendChild(selBkp);
  }
};

const _renderHistMostrarTudo = renderHistoricoPais;
renderHistoricoPais = function() {
  _renderHistMostrarTudo();
  const selDoc = document.getElementById("selFiltroDocHistIA");
  if (selDoc && selDoc.options.length > 0 && paisAtualIdx !== null) {
    const total = historicoIA.filter(i => i.paisNome === paises[paisAtualIdx].nome).length;
    selDoc.options.textContent = `📚 Mostrar tudo (${total})`;
  }
};

const _renderBkpMostrarTudo = renderBackupsPais;
renderBackupsPais = function() {
  _renderBkpMostrarTudo();
  const selBkp = document.getElementById("selFiltroDocBackup");
  if (selBkp && selBkp.options.length > 0 && paisAtualIdx !== null) {
    const total = backupsHistoricoIA.filter(b => b.paisNome === paises[paisAtualIdx].nome).length;
    selBkp.options.textContent = `📚 Mostrar tudo (${total})`;
  }
};

let backupParaExportar = null;

function abrirModalExportarBackup(bkpIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp) return;
  backupParaExportar = bkp;

  let modalExpBkp = document.getElementById("modalExportarBackup");
  if (!modalExpBkp) {
    modalExpBkp = document.createElement("div");
    modalExpBkp.id = "modalExportarBackup";
    modalExpBkp.className = "modal-bg";
    modalExpBkp.style.zIndex = "220";
    modalExpBkp.innerHTML = `
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3>Pré-visualização e Exportação do Backup</h3>
          <button type="button" class="btn-ghost" onclick="fecharModal('modalExportarBackup')">✕</button>
        </div>
        <div id="previewBoxBackup" class="preview-area"></div>
        <div class="modal-foot" style="justify-content:flex-start;">
          <button type="button" class="btn-amber" onclick="exportarBackupPDF()">Baixar PDF (.pdf)</button>
          <button type="button" class="btn-outline" onclick="exportarBackupDOCX()">Baixar Word (.docx)</button>
          <button type="button" class="btn-outline" onclick="exportarBackupODT()">Baixar LibreOffice Writer (.odt)</button>
        </div>
      </div>`;
    document.body.appendChild(modalExpBkp);
  }

  const tituloBkp = bkp.nome || `Backup de ${bkp.dataBackup}`;
  let html = `<div class="sheet estilo-boletim" style="min-height:auto;">
    <small style="color:#64748b; font-weight:700;">${bkp.paisNome.toUpperCase()} · HISTÓRICO DE IA</small>
    <h1 style="margin:6px 0 4px 0;">${tituloBkp}</h1>
    <p style="color:#64748b; font-size:0.86rem; margin:0 0 22px 0;">Criado em: ${bkp.dataBackup} · Total: ${bkp.itens.length} conversa(s)</p>`;

  bkp.itens.forEach((it, i) => {
    html += `<div style="margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #e5e7eb;">
      <p style="margin:0 0 4px 0; font-size:0.82rem; color:#1e3a5f;"><b>#${i + 1} · ${it.docTitulo}</b> <span style="color:#64748b;">(${it.data})</span></p>
      <p style="margin:0; line-height:1.55;">${it.texto}</p>
    </div>`;
  });

  document.getElementById("previewBoxBackup").innerHTML = html + "</div>";
  modalExpBkp.style.display = "flex";
}

function exportarBackupPDF() {
  if (!backupParaExportar) return;
  const nomeArq = (backupParaExportar.nome || "Backup_IA").replace(/[\\/:*?"<>|]/g, "_");
  html2pdf().from(document.getElementById("previewBoxBackup").firstChild).save(`${nomeArq}.pdf`);
  mostrarAvisoApp("Ficheiro PDF descarregado!");
}

async function exportarBackupDOCX() {
  if (!backupParaExportar) return;
  const { Document, Packer, Paragraph, TextRun } = window.docx;
  const bkp = backupParaExportar;
  const tituloBkp = bkp.nome || `Backup de ${bkp.dataBackup}`;

  const paras = [
    new Paragraph({ children: [new TextRun({ text: `${bkp.paisNome.toUpperCase()} — BACKUP DO HISTÓRICO DA IA`, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: tituloBkp, bold: true, size: 32 })] }),
    new Paragraph({ text: `Criado em: ${bkp.dataBackup} | Total: ${bkp.itens.length} conversa(s)` }),
    new Paragraph({ text: "" })
  ];

  bkp.itens.forEach((it, i) => {
    paras.push(new Paragraph({ children: [new TextRun({ text: `#${i + 1} · ${it.docTitulo} (${it.data})`, bold: true })] }));
    paras.push(new Paragraph({ text: it.texto }));
    paras.push(new Paragraph({ text: "" }));
  });

  const blob = await Packer.toBlob(new Document({ sections: [{ children: paras }] }));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${tituloBkp.replace(/[\\/:*?"<>|]/g, "_")}.docx`;
  a.click();
  mostrarAvisoApp("Ficheiro Word (.docx) descarregado!");
}

async function exportarBackupODT() {
  if (!backupParaExportar) return;
  const zip = new JSZip();
  const bkp = backupParaExportar;
  const tituloBkp = bkp.nome || `Backup de ${bkp.dataBackup}`;
  const esc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let xml = `<text:h>${esc(bkp.paisNome)} — ${esc(tituloBkp)}</text:h><text:p>Criado em: ${esc(bkp.dataBackup)} · Total: ${bkp.itens.length} conversa(s)</text:p>`;
  bkp.itens.forEach((it, i) => {
    xml += `<text:h>#${i + 1} · ${esc(it.docTitulo)} (${esc(it.data)})</text:h><text:p>${esc(it.texto)}</text:p>`;
  });

  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
  zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2"><office:body><office:text>${xml}</office:text></office:body></office:document-content>`);
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${tituloBkp.replace(/[\\/:*?"<>|]/g, "_")}.odt`;
  a.click();
  mostrarAvisoApp("Ficheiro LibreOffice Writer (.odt) descarregado!");
}

const _renderBackupsComExportar = renderBackupsPais;
renderBackupsPais = function() {
  _renderBackupsComExportar();
  const box = document.getElementById("listaBackupsPais");
  if (!box || paisAtualIdx === null) return;

  const pais = paises[paisAtualIdx];
  const todosDoPais = backupsHistoricoIA
    .map((bkp, idx) => ({ bkp, idx }))
    .filter(obj => obj.bkp.paisNome === pais.nome);

  const listaOrdenada = ordemListaBackups === "recente" ? todosDoPais.slice().reverse() : todosDoPais;
  const cards = box.querySelectorAll(".hist-item");

  cards.forEach((card, pos) => {
    const registro = listaOrdenada[pos];
    if (!registro) return;
    const grupoBotoes = card.querySelector("div > div:last-child");
    if (grupoBotoes && !grupoBotoes.querySelector(".btn-exp-bkp")) {
      const btnExp = document.createElement("button");
      btnExp.type = "button";
      btnExp.className = "btn-outline btn-exp-bkp";
      btnExp.style.cssText = "font-size:0.78rem; padding:5px 10px;";
      btnExp.textContent = "⬇️ Baixar";
      btnExp.onclick = () => abrirModalExportarBackup(registro.idx);
      grupoBotoes.insertBefore(btnExp, grupoBotoes.lastElementChild);
    }
  });
};

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") fecharModal("modalExportarBackup");
});

criarBackupHistoricoPais = function() {
  const pais = paises[paisAtualIdx];
  const conversasDoPais = historicoIA.filter(item => item.paisNome === pais.nome);
  if (conversasDoPais.length === 0) {
    mostrarAvisoApp(`Não há conversas com a IA em "${pais.nome}" para fazer backup.`, true);
    return;
  }

  let modalBkp = document.getElementById("modalEscolherAlvoBackup");
  if (!modalBkp) {
    modalBkp = document.createElement("div");
    modalBkp.id = "modalEscolherAlvoBackup";
    modalBkp.className = "modal-bg";
    modalBkp.style.zIndex = "210";
    modalBkp.innerHTML = `
      <div class="modal-card" style="max-width:440px;">
        <div class="modal-head">
          <h3>Criar Backup por Documento</h3>
          <button type="button" class="btn-ghost" onclick="fecharModal('modalEscolherAlvoBackup')">✕</button>
        </div>
        <div class="modal-body" style="gap:10px;">
          <label class="fld-lbl" style="margin-top:0;">Como queres guardar o backup?</label>
          <select id="selAlvoBackupDoc"></select>
          <label class="fld-lbl">Nome personalizado (opcional)</label>
          <input type="text" id="inpNomeNovoBackup" placeholder="Ex: Versão oficial 2026">
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-outline" onclick="fecharModal('modalEscolherAlvoBackup')">Cancelar</button>
          <button type="button" class="btn-navy" onclick="confirmarCriacaoBackupPorDoc()">💾 Guardar Backup</button>
        </div>
      </div>`;
    document.body.appendChild(modalBkp);
  }

  const docsUnicos = [...new Set(conversasDoPais.map(c => c.docTitulo))];
  const sel = document.getElementById("selAlvoBackupDoc");
  sel.innerHTML = `
    <option value="SEPARADOS">📁 Todos os documentos (1 backup separado por cada lei · ${docsUnicos.length} backup(s))</option>
    <option value="JUNTO">📦 Todos os documentos num só Backup (${conversasDoPais.length} conversa(s))</option>
  ` + docsUnicos.map(tituloDoc => {
    const qtd = conversasDoPais.filter(c => c.docTitulo === tituloDoc).length;
    return `<option value="${tituloDoc.replace(/"/g, '&quot;')}">📄 Apenas: ${tituloDoc} (${qtd} conversa(s))</option>`;
  }).join("");

  document.getElementById("inpNomeNovoBackup").value = "";
  modalBkp.style.display = "flex";
};

confirmarCriacaoBackupPorDoc = function() {
  const pais = paises[paisAtualIdx];
  const alvoDoc = document.getElementById("selAlvoBackupDoc").value;
  const nomeCustom = document.getElementById("inpNomeNovoBackup").value.trim();
  const conversasDoPais = historicoIA.filter(item => item.paisNome === pais.nome);

  const dataAgora = new Date().toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  if (alvoDoc === "SEPARADOS") {
    const docsUnicos = [...new Set(conversasDoPais.map(c => c.docTitulo))];
    docsUnicos.forEach(tituloDoc => {
      const itensDoc = conversasDoPais.filter(c => c.docTitulo === tituloDoc);
      backupsHistoricoIA.push({
        paisNome: pais.nome,
        docCategoria: tituloDoc,
        nome: nomeCustom ? `${nomeCustom} · ${tituloDoc}` : `Backup · ${tituloDoc} (${dataAgora})`,
        dataBackup: dataAgora,
        total: itensDoc.length,
        itens: JSON.parse(JSON.stringify(itensDoc))
      });
    });
    guardarBackupsHistoricoIA();
    fecharModal("modalEscolherAlvoBackup");
    renderBackupsPais();
    mostrarAvisoApp(`${docsUnicos.length} backup(s) separado(s) criado(s) com sucesso!`);
    return;
  }

  const conversasFiltradas = alvoDoc === "JUNTO"
    ? conversasDoPais
    : conversasDoPais.filter(item => item.docTitulo === alvoDoc);

  if (conversasFiltradas.length === 0) {
    mostrarAvisoApp("Não existem conversas para esse documento.", true);
    return;
  }

  const categoriaDoc = alvoDoc === "JUNTO" ? "Todos num só Backup" : alvoDoc;
  const nomeFinal = nomeCustom || `Backup · ${categoriaDoc} (${dataAgora})`;

  backupsHistoricoIA.push({
    paisNome: pais.nome,
    docCategoria: categoriaDoc,
    nome: nomeFinal,
    dataBackup: dataAgora,
    total: conversasFiltradas.length,
    itens: JSON.parse(JSON.stringify(conversasFiltradas))
  });

  guardarBackupsHistoricoIA();
  fecharModal("modalEscolherAlvoBackup");
  renderBackupsPais();
  mostrarAvisoApp(`Backup "${categoriaDoc}" criado (${conversasFiltradas.length} conversa(s))!`);
};

function normalizarBusca(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const _renderHistBuscaDoc = renderHistoricoPais;
renderHistoricoPais = function() {
  const inp = document.getElementById("inpBuscaHistIA");
  if (!inp || paisAtualIdx === null) {
    _renderHistBuscaDoc();
    return;
  }

  const termoOriginal = inp.value;
  const termoNorm = normalizarBusca(termoOriginal.trim());
  const pais = paises[paisAtualIdx];

  if (!termoNorm) {
    _renderHistBuscaDoc();
    return;
  }

  // Filtra pelo nome do documento, texto da conversa ou data/hora (sem precisar de acentos exatos)
  const backupHist = historicoIA;
  historicoIA = historicoIA.filter(item => {
    if (item.paisNome !== pais.nome) return true;
    return normalizarBusca(item.docTitulo).includes(termoNorm) ||
           normalizarBusca(item.texto).includes(termoNorm) ||
           normalizarBusca(item.data).includes(termoNorm);
  });

  inp.value = "";
  _renderHistBuscaDoc();
  inp.value = termoOriginal;
  historicoIA = backupHist;
};

const _renderBkpBuscaDoc = renderBackupsPais;
renderBackupsPais = function() {
  const termoNorm = normalizarBusca(buscaListaBackups.trim());
  if (!termoNorm || paisAtualIdx === null) {
    _renderBkpBuscaDoc();
    return;
  }

  const pais = paises[paisAtualIdx];
  const backupLista = backupsHistoricoIA;
  const termoGuardar = buscaListaBackups;

  // Encontra backups pelo nome do documento (categoria ou conversas internas), nome do backup, data/hora ou texto
  backupsHistoricoIA = backupsHistoricoIA.filter(bkp => {
    if (bkp.paisNome !== pais.nome) return true;
    const bateNomeBkp = normalizarBusca(bkp.nome).includes(termoNorm);
    const bateCategoriaDoc = normalizarBusca(bkp.docCategoria).includes(termoNorm);
    const bateData = normalizarBusca(bkp.dataBackup).includes(termoNorm);
    const bateDentro = (bkp.itens || []).some(it =>
      normalizarBusca(it.docTitulo).includes(termoNorm) ||
      normalizarBusca(it.texto).includes(termoNorm) ||
      normalizarBusca(it.data).includes(termoNorm)
    );
    return bateNomeBkp || bateCategoriaDoc || bateData || bateDentro;
  });

  buscaListaBackups = "";
  _renderBkpBuscaDoc();
  buscaListaBackups = termoGuardar;
  const inpBkp = document.getElementById("inpBuscaListaBackups");
  if (inpBkp) inpBkp.value = termoGuardar;
  backupsHistoricoIA = backupLista;
};

function obterTipoDocumentoDoPais(pais, docTitulo) {
  if (!pais || !pais.docs) return "";
  const encontrado = pais.docs.find(d => d.titulo === docTitulo);
  return encontrado ? encontrado.tipo : "";
}

const _execIAStoreTipo = executarIA;
executarIA = function() {
  _execIAStoreTipo();
  if (historicoIA.length > 0 && paisAtualIdx !== null && docAtualIdx !== null) {
    const docAtual = paises[paisAtualIdx].docs[docAtualIdx];
    historicoIA[historicoIA.length - 1].docTipo = docAtual ? docAtual.tipo : "";
    guardarHistoricoIA();
  }
};

renderHistoricoPais = function() {
  const inp = document.getElementById("inpBuscaHistIA");
  if (!inp || paisAtualIdx === null) {
    _renderHistBuscaDoc();
    return;
  }

  const termoOriginal = inp.value;
  const termoNorm = normalizarBusca(termoOriginal.trim());
  const pais = paises[paisAtualIdx];

  if (!termoNorm) {
    _renderHistBuscaDoc();
    return;
  }

  const backupHist = historicoIA;
  historicoIA = historicoIA.filter(item => {
    if (item.paisNome !== pais.nome) return true;
    const tipoDoc = item.docTipo || obterTipoDocumentoDoPais(pais, item.docTitulo);
    return normalizarBusca(tipoDoc).includes(termoNorm) ||
           normalizarBusca(item.docTitulo).includes(termoNorm) ||
           normalizarBusca(item.texto).includes(termoNorm) ||
           normalizarBusca(item.data).includes(termoNorm);
  });

  inp.value = "";
  _renderHistBuscaDoc();
  inp.value = termoOriginal;
  historicoIA = backupHist;
};

renderBackupsPais = function() {
  const termoNorm = normalizarBusca(buscaListaBackups.trim());
  if (!termoNorm || paisAtualIdx === null) {
    _renderBkpBuscaDoc();
    return;
  }

  const pais = paises[paisAtualIdx];
  const backupLista = backupsHistoricoIA;
  const termoGuardar = buscaListaBackups;

  backupsHistoricoIA = backupsHistoricoIA.filter(bkp => {
    if (bkp.paisNome !== pais.nome) return true;
    const tipoCategoria = obterTipoDocumentoDoPais(pais, bkp.docCategoria);
    const bateTipoCategoria = normalizarBusca(tipoCategoria).includes(termoNorm);
    const bateNomeBkp = normalizarBusca(bkp.nome).includes(termoNorm);
    const bateCategoriaDoc = normalizarBusca(bkp.docCategoria).includes(termoNorm);
    const bateData = normalizarBusca(bkp.dataBackup).includes(termoNorm);
    const bateDentro = (bkp.itens || []).some(it => {
      const tipoItem = it.docTipo || obterTipoDocumentoDoPais(pais, it.docTitulo);
      return normalizarBusca(tipoItem).includes(termoNorm) ||
             normalizarBusca(it.docTitulo).includes(termoNorm) ||
             normalizarBusca(it.texto).includes(termoNorm) ||
             normalizarBusca(it.data).includes(termoNorm);
    });
    return bateTipoCategoria || bateNomeBkp || bateCategoriaDoc || bateData || bateDentro;
  });

  buscaListaBackups = "";
  _renderBkpBuscaDoc();
  buscaListaBackups = termoGuardar;
  const inpBkp = document.getElementById("inpBuscaListaBackups");
  if (inpBkp) inpBkp.value = termoGuardar;
  backupsHistoricoIA = backupLista;
};

apagarItemHistoricoPais = function(idx) {
  const item = historicoIA[idx];
  if (!item) return;

  abrirConfirmacaoNPassos(`a conversa sobre "${item.docTitulo}" (${item.data})`, 2, "ELIMINAR", function() {
    historicoIA.splice(idx, 1);
    guardarHistoricoIA();
    renderHistoricoPais();
    mostrarAvisoApp("Conversa eliminada do histórico.");
  });
};

function exportarItemUnicoBackup(bkpIdx, itemIdx) {
  const bkp = backupsHistoricoIA[bkpIdx];
  if (!bkp || !bkp.itens[itemIdx]) return;
  const item = bkp.itens[itemIdx];

  backupParaExportar = {
    paisNome: bkp.paisNome,
    nome: `${item.docTitulo} (${item.data})`,
    dataBackup: item.data,
    total: 1,
    itens: [item]
  };

  let modalExpBkp = document.getElementById("modalExportarBackup");
  if (!modalExpBkp) {
    abrirModalExportarBackup(bkpIdx);
    backupParaExportar = {
      paisNome: bkp.paisNome,
      nome: `${item.docTitulo} (${item.data})`,
      dataBackup: item.data,
      total: 1,
      itens: [item]
    };
  }

  document.getElementById("previewBoxBackup").innerHTML = `
    <div class="sheet estilo-boletim" style="min-height:auto;">
      <small style="color:#64748b; font-weight:700;">${bkp.paisNome.toUpperCase()} · CONVERSA INDIVIDUAL DO BACKUP</small>
      <h1 style="margin:6px 0 4px 0;">${item.docTitulo}</h1>
      <p style="color:#64748b; font-size:0.86rem; margin:0 0 22px 0;">Data da conversa: ${item.data}</p>
      <p style="margin:0; line-height:1.6;">${item.texto}</p>
    </div>`;
  modalExpBkp.style.display = "flex";
}

const _renderBkpComExportItem = renderBackupsPais;
renderBackupsPais = function() {
  _renderBkpComExportItem();
  const box = document.getElementById("listaBackupsPais");
  if (!box || backupAbertoIdx === null) return;

  const bkp = backupsHistoricoIA[backupAbertoIdx];
  if (!bkp) return;

  box.querySelectorAll("button").forEach(btn => {
    const onClickStr = btn.getAttribute("onclick") || "";
    const match = onClickStr.match(/restaurarItemBackupPais\((\d+),\s*(\d+)\)/);
    if (match && !btn.parentElement.querySelector(".btn-exp-item-bkp")) {
      const bIdx = match[1];
      const iIdx = match[2];
      const btnBaixarItem = document.createElement("button");
      btnBaixarItem.type = "button";
      btnBaixarItem.className = "btn-outline btn-exp-item-bkp";
      btnBaixarItem.style.cssText = "font-size:0.74rem; padding:3px 8px;";
      btnBaixarItem.textContent = "⬇️ Baixar";
      btnBaixarItem.setAttribute("onclick", `exportarItemUnicoBackup(${bIdx}, ${iIdx})`);
      btn.parentElement.insertBefore(btnBaixarItem, btn);
    }
  });
};

function exportarItemUnicoHistorico(histIdx) {
  const item = historicoIA[histIdx];
  if (!item) return;

  backupParaExportar = {
    paisNome: item.paisNome,
    nome: `${item.docTitulo} (${item.data})`,
    dataBackup: item.data,
    total: 1,
    itens: [item]
  };

  let modalExpBkp = document.getElementById("modalExportarBackup");
  if (!modalExpBkp) {
    modalExpBkp = document.createElement("div");
    modalExpBkp.id = "modalExportarBackup";
    modalExpBkp.className = "modal-bg";
    modalExpBkp.style.zIndex = "220";
    modalExpBkp.innerHTML = `
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3>Pré-visualização e Exportação</h3>
          <button type="button" class="btn-ghost" onclick="fecharModal('modalExportarBackup')">✕</button>
        </div>
        <div id="previewBoxBackup" class="preview-area"></div>
        <div class="modal-foot" style="justify-content:flex-start;">
          <button type="button" class="btn-amber" onclick="exportarBackupPDF()">Baixar PDF (.pdf)</button>
          <button type="button" class="btn-outline" onclick="exportarBackupDOCX()">Baixar Word (.docx)</button>
          <button type="button" class="btn-outline" onclick="exportarBackupODT()">Baixar LibreOffice Writer (.odt)</button>
        </div>
      </div>`;
    document.body.appendChild(modalExpBkp);
  }

  document.getElementById("previewBoxBackup").innerHTML = `
    <div class="sheet estilo-boletim" style="min-height:auto;">
      <small style="color:#64748b; font-weight:700;">${item.paisNome.toUpperCase()} · CONVERSA DO HISTÓRICO DA IA</small>
      <h1 style="margin:6px 0 4px 0;">${item.docTitulo}</h1>
      <p style="color:#64748b; font-size:0.86rem; margin:0 0 22px 0;">Data da conversa: ${item.data}</p>
      <p style="margin:0; line-height:1.6;">${item.texto}</p>
    </div>`;
  modalExpBkp.style.display = "flex";
}

const _renderHistComExportItem = renderHistoricoPais;
renderHistoricoPais = function() {
  _renderHistComExportItem();
  const box = document.getElementById("listaHistoricoPais");
  if (!box) return;

  box.querySelectorAll("button").forEach(btn => {
    const onClickStr = btn.getAttribute("onclick") || "";
    const match = onClickStr.match(/apagarItemHistoricoPais\((\d+)\)/);
    if (match && !btn.parentElement.querySelector(".btn-exp-item-hist")) {
      const hIdx = match[1];
      const btnBaixar = document.createElement("button");
      btnBaixar.type = "button";
      btnBaixar.className = "btn-outline btn-exp-item-hist";
      btnBaixar.style.cssText = "font-size:0.74rem; padding:3px 8px;";
      btnBaixar.textContent = "⬇️ Baixar";
      btnBaixar.setAttribute("onclick", `exportarItemUnicoHistorico(${hIdx})`);
      btn.parentElement.insertBefore(btnBaixar, btn);
    }
  });
};

avancarConfirmacaoDupla = function() {
  if (etapaConfirmacaoAtual < totalEtapasConfirmacao) {
    etapaConfirmacaoAtual++;
    document.getElementById("confPassoBadge").textContent = `PASSO ${etapaConfirmacaoAtual} DE ${totalEtapasConfirmacao}`;
    document.getElementById("confBoxInput").style.display = "none";

    if (etapaConfirmacaoAtual === totalEtapasConfirmacao) {
      document.getElementById("confMensagem").textContent = `Última confirmação: tens a certeza absoluta de que queres eliminar permanentemente ${tituloConfirmacaoAlvo}?`;
      document.getElementById("btnConfAvancar").textContent = "Eliminar permanentemente";
    } else {
      const avisosIntermedios = [
        "",
        `Segunda confirmação: os dados de ${tituloConfirmacaoAlvo} serão perdidos para sempre.`,
        `Terceira confirmação: confirma novamente que desejas prosseguir com esta eliminação.`
      ];
      document.getElementById("confMensagem").textContent = avisosIntermedios[etapaConfirmacaoAtual - 1] || `Confirmação ${etapaConfirmacaoAtual} de ${totalEtapasConfirmacao}: desejas continuar?`;
      document.getElementById("btnConfAvancar").textContent = `Sim, confirmar (${etapaConfirmacaoAtual}/${totalEtapasConfirmacao}) →`;
    }
    return;
  }

  fecharModal("modalConfirmacao");
  if (typeof acaoConfirmacaoPendente === "function") {
    acaoConfirmacaoPendente();
  }
};

limparHistoricoPaisAtual = function() {
  const pais = paises[paisAtualIdx];
  const qtd = historicoIA.filter(item => item.paisNome === pais.nome).length;
  if (qtd === 0) {
    mostrarAvisoApp(`Não existem conversas no histórico de "${pais.nome}".`, true);
    return;
  }

  abrirConfirmacaoNPassos(`TODAS as ${qtd} conversa(s) do histórico de "${pais.nome}"`, 4, "", function() {
    historicoIA = historicoIA.filter(item => item.paisNome !== pais.nome);
    guardarHistoricoIA();
    renderHistoricoPais();
    mostrarAvisoApp(`Todo o histórico de "${pais.nome}" foi eliminado.`);
  });
};

function interpretarTextoFicheiroParaLei(conteudo, tipoDoc, nomePais, tituloDoc, tom) {
  const limpo = conteudo.replace(/\s+/g, " ").trim();
  // Divide o texto do ficheiro em frases ou blocos relevantes
  const frases = limpo
    .split(/(?<=[.!?])\s+|\n+/)
    .map(f => f.trim())
    .filter(f => f.length > 20);

  const isConstituicao = normalizarBusca(tipoDoc).includes("constituicao");

  const abertura = tom === "epico"
    ? `Sob os desígnios históricos e a soberania de ${nomePais}, consagramos o presente ${tituloDoc}`
    : tom === "poetico"
    ? `Entre a memória do passado e o compromisso com o futuro, ${nomePais} estabelece este ${tituloDoc}`
    : tom === "tecnico"
    ? `Nos termos das disposições normativas aplicáveis a ${nomePais}, aprova-se o presente ${tituloDoc}`
    : tom === "moderno"
    ? `Nós, cidadãos e cidadãs de ${nomePais}, instituímos este ${tituloDoc}`
    : `Nós, povo de ${nomePais}, promulgamos este ${tituloDoc}`;

  const baseResumo = frases.length > 0
    ? frases.slice(0, 2).join(" ")
    : limpo.slice(0, 260);

  const preambuloGerado = isConstituicao
    ? `${abertura}, fundamentado nos princípios extraídos da documentação base: ${baseResumo}`
    : `${abertura}, regulando as matérias previstas na documentação de referência: ${baseResumo}`;

  // Constrói artigos reais a partir dos trechos do ficheiro
  const blocos = frases.length > 0 ? frases.slice(0, 8) : [limpo.slice(0, 400)];
  const artigosGerados = blocos.map((trecho, idx) => {
    const palavrasChave = trecho.split(" ").slice(0, 4).join(" ").replace(/[,.;:!?]/g, "");
    const epigrafe = isConstituicao
      ? (idx === 0 ? "Princípio Fundamental" : `Disposição Constitucional — ${palavrasChave}`)
      : (idx === 0 ? "Objeto e Âmbito" : `Norma Regulamentar — ${palavrasChave}`);

    const textoFormatado = isConstituicao
      ? `Em ${nomePais}, fica constitucionalmente consagrado que ${trecho.charAt(0).toLowerCase() + trecho.slice(1)}`
      : `Nos termos do presente ${tituloDoc} de ${nomePais}, determina-se que ${trecho.charAt(0).toLowerCase() + trecho.slice(1)}`;

    return { epigrafe, texto: textoFormatado };
  });

  const tituloCapitulo = isConstituicao
    ? `TÍTULO — Dos Princípios e Estrutura Constitucional`
    : `TÍTULO — Das Disposições e Normas do ${tituloDoc}`;

  return { preambuloGerado, tituloCapitulo, artigosGerados };
}

executarIA = function() {
  const pais = paises[paisAtualIdx], doc = pais.docs[docAtualIdx];
  const inpTema = document.getElementById("inpTemaIA");
  const ideiaUsuario = inpTema.value.trim();
  const radioSel = document.querySelector('input[name="modoIA"]:checked');
  const modo = radioSel ? radioSel.value : "preambulo";
  const tom = document.getElementById("selTomIA").value;

  // Regista no Histórico com tipo do documento e ano completo
  historicoIA.push({
    paisNome: pais.nome,
    flag: pais.flag,
    docIdx: docAtualIdx,
    docTitulo: doc.titulo,
    docTipo: doc.tipo,
    texto: ficheiroIAAnexado
      ? (ideiaUsuario ? `${ideiaUsuario} [📎 ${ficheiroIAAnexado.nome}]` : `[📎 Ficheiro anexado: ${ficheiroIAAnexado.nome}]`)
      : (ideiaUsuario || `${pais.governo} e ${pais.ideologia}`),
    data: new Date().toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  });
  guardarHistoricoIA();

  if (ficheiroIAAnexado && ficheiroIAAnexado.conteudo) {
    const contextoCompleto = ideiaUsuario
      ? `${ideiaUsuario}. ${ficheiroIAAnexado.conteudo}`
      : ficheiroIAAnexado.conteudo;

    const resultado = interpretarTextoFicheiroParaLei(contextoCompleto, doc.tipo, pais.nome, doc.titulo, tom);

    if (modo === "preambulo" || modo === "completo") {
      doc.preambulo = resultado.preambuloGerado;
      document.getElementById("txtPreambulo").value = resultado.preambuloGerado;
    }
    if (modo === "titulo" || modo === "completo") {
      doc.titulos.push({
        nome: resultado.tituloCapitulo,
        artigos: resultado.artigosGerados
      });
    }
    guardar();
    renderTitulos();
    mostrarAvisoApp(`Conteúdo de "${ficheiroIAAnexado.nome}" interpretado para ${doc.tipo}!`);
    return;
  }

  // Caso não haja ficheiro anexado, usa apenas o texto/tema escrito
  const tema = ideiaUsuario || `${pais.governo} e ${pais.ideologia}`;
  const isConst = normalizarBusca(doc.tipo).includes("constituicao");

  const abertura = tom === "epico"
    ? `Sob os desígnios históricos e a glória eterna de ${pais.nome}, proclamamos este ${doc.titulo}`
    : tom === "poetico"
    ? `Entre a memória dos nossos antepassados e a esperança do amanhã, o povo de ${pais.nome} consagra este ${doc.titulo}`
    : tom === "tecnico"
    ? `Nos termos das disposições normativas aplicáveis a ${pais.nome}, estabelece-se o presente ${doc.titulo}`
    : tom === "moderno"
    ? `Nós, cidadãos e cidadãs de ${pais.nome}, estabelecemos este ${doc.titulo}`
    : `Nós, povo de ${pais.nome}, promulgamos este ${doc.titulo}`;

  const pre = `${abertura} sob os princípios de ${tema}, assegurando a ordem, a justiça e a soberania nacional.`;

  if (modo === "preambulo" || modo === "completo") {
    doc.preambulo = pre;
    document.getElementById("txtPreambulo").value = pre;
  }
  if (modo === "titulo" || modo === "completo") {
    doc.titulos.push({
      nome: `TÍTULO — Sobre ${tema.slice(0, 60)}`,
      artigos: [
        {
          epigrafe: isConst ? "Princípio Constitucional" : "Objeto da Lei",
          texto: isConst
            ? `${pais.nome} rege-se constitucionalmente pelos princípios fundamentais de ${tema}.`
            : `O presente ${doc.titulo} regula em todo o território de ${pais.nome} as normas relativas a ${tema}.`
        },
        {
          epigrafe: isConst ? "Garantia Institucional" : "Fiscalização e Cumprimento",
          texto: `As autoridades competentes de ${pais.nome} velam pelo estrito cumprimento desta disposição.`
        }
      ]
    });
  }
  guardar();
  renderTitulos();
};

removerFicheiroIA = function(ev) {
  if (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  ficheiroIAAnexado = null;
  const inp = document.getElementById("inpFicheiroIA");
  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (inp) inp.value = "";
  if (nomeSpan) nomeSpan.textContent = "";
  if (badge) badge.style.display = "none";
  mostrarAvisoApp("Ficheiro desanexado.");
};

document.addEventListener("DOMContentLoaded", function() {
  const badge = document.getElementById("badgeFicheiroIA");
  if (badge) {
    const btnX = badge.querySelector("button");
    if (btnX) {
      btnX.type = "button";
      btnX.style.cssText = "background:#fee2e2; color:#dc2626; border:1px solid #fecaca; border-radius:6px; padding:2px 8px; font-size:0.82rem; font-weight:700; cursor:pointer; flex-shrink:0; margin-left:8px;";
      btnX.textContent = "✕ Remover";
      btnX.onclick = function(e) { removerFicheiroIA(e); };
    }
  }
});

(function corrigirBotaoDesanexarAgora() {
  const badge = document.getElementById("badgeFicheiroIA");
  if (badge) {
    const btnX = badge.querySelector("button");
    if (btnX) {
      btnX.type = "button";
      btnX.style.cssText = "background:#fee2e2; color:#dc2626; border:1px solid #fecaca; border-radius:6px; padding:2px 8px; font-size:0.82rem; font-weight:700; cursor:pointer; flex-shrink:0; margin-left:8px;";
      btnX.textContent = "✕ Remover";
      btnX.onclick = function(e) { removerFicheiroIA(e); };
    }
  }
})();

function garantirBibliotecaPDF() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cloudflare.com";
      return resolve(window.pdfjsLib);
    }
    const sc = document.createElement("script");
    sc.src = "https://cloudflare.com";
    sc.onload = () => {
      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cloudflare.com";
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("Falha ao iniciar leitor PDF"));
      }
    };
    sc.onerror = () => reject(new Error("Sem ligação para carregar leitor PDF"));
    document.head.appendChild(sc);
  });
}

carregarFicheiroIA = async function(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  try {
    let textoExtraido = "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      const pdfLib = await garantirBibliotecaPDF();
      const buf = await file.arrayBuffer();
      const pdf = await pdfLib.getDocument({ data: buf }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }

    const textoLimpo = textoExtraido.replace(/\s+/g, " ").trim();
    if (!textoLimpo || textoLimpo.startsWith("%PDF")) {
      throw new Error("PDF sem texto selecionável (imagem digitalizada).");
    }

    ficheiroIAAnexado = { nome: file.name, conteudo: textoLimpo };
    if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
    mostrarAvisoApp(`Ficheiro "${file.name}" lido com sucesso!`);
  } catch (err) {
    console.error(err);
    mostrarAvisoApp("Não foi possível extrair texto deste PDF (verifique se tem texto selecionável).", true);
    removerFicheiroIA();
  }
};

apagarDocCard = function(dI) {
  const pais = paises[paisAtualIdx];
  const doc = pais.docs[dI];
  if (!doc) return;

  abrirConfirmacaoNPassos(`o documento "${doc.titulo}"`, 2, "", function() {
    pais.docs.splice(dI, 1);
    guardar();
    abrirPais(paisAtualIdx);
    mostrarAvisoApp(`Documento "${doc.titulo}" eliminado.`);
  });
};

apagarDocAtual = function() {
  const pais = paises[paisAtualIdx];
  const doc = pais.docs[docAtualIdx];
  if (!doc) return;

  abrirConfirmacaoNPassos(`o documento "${doc.titulo}"`, 2, "", function() {
    const tituloApagado = doc.titulo;
    pais.docs.splice(docAtualIdx, 1);
    alteracoesPendentes = false;
    _guardarOriginal();
    _abrirPaisOriginal(paisAtualIdx);
    renderHistoricoPais();
    mostrarAvisoApp(`Documento "${tituloApagado}" eliminado.`);
  });
};

carregarFicheiroIA = async function(ev) {
  const file = ev.target.files && ev.target.files;
  if (!file) return;
  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  try {
    let textoExtraido = "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      const pdfLib = await garantirBibliotecaPDF();
      const buf = await file.arrayBuffer();
      const loadingTask = pdfLib.getDocument({ data: buf, disableWorker: true });
      const pdf = await loadingTask.promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }

    const textoLimpo = textoExtraido.replace(/\s+/g, " ").trim();
    if (!textoLimpo || textoLimpo.startsWith("%PDF")) {
      throw new Error("Não foi encontrado texto selecionável neste PDF.");
    }

    ficheiroIAAnexado = { nome: file.name, conteudo: textoLimpo };
    if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
    mostrarAvisoApp(`Ficheiro "${file.name}" anexado com sucesso!`);
  } catch (err) {
    console.error(err);
    mostrarAvisoApp("Erro ao ler o PDF: verifique se tem ligação à internet ou se o PDF tem texto selecionável.", true);
    removerFicheiroIA();
  }
};

async function extrairTextoPDFNativo(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = new TextDecoder("latin1").decode(bytes);
  let textos = [];

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(latin1)) !== null) {
    const rawStr = match[1];
    const chunk = new Uint8Array(rawStr.length);
    for (let i = 0; i < rawStr.length; i++) chunk[i] = rawStr.charCodeAt(i) & 0xff;

    let decoded = rawStr;
    if (typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("deflate");
        const writer = ds.writable.getWriter();
        writer.write(chunk);
        writer.close();
        const outBuf = await new Response(ds.readable).arrayBuffer();
        decoded = new TextDecoder("latin1").decode(outBuf);
      } catch (e) {
        decoded = rawStr;
      }
    }

    const tjMatches = decoded.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g) || [];
    tjMatches.forEach(m => {
      const inner = m.replace(/^\(|\)\s*Tj$/g, "").replace(/\\([()\\])/g, "$1");
      if (/[a-zA-ZÀ-ÿ0-9]/.test(inner)) textos.push(inner);
    });

    const tjArrMatches = decoded.match(/\[(.*?)\]\s*TJ/gs) || [];
    tjArrMatches.forEach(arr => {
      const parts = arr.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g) || [];
      const line = parts.map(p => p.slice(1, -1).replace(/\\([()\\])/g, "$1")).join("");
      if (/[a-zA-ZÀ-ÿ0-9]/.test(line)) textos.push(line);
    });
  }

  return textos.join(" ").replace(/\s+/g, " ").trim();
}

carregarFicheiroIA = async function(ev) {
  const file = ev.target && ev.target.files ? ev.target.files[0] : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  try {
    let textoExtraido = "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      try {
        const pdfLib = await garantirBibliotecaPDF();
        const pdf = await pdfLib.getDocument({ data: buf, disableWorker: true }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
        }
      } catch (pdfErr) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
      if (!textoExtraido || textoExtraido.trim().length < 5) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }

    const textoLimpo = textoExtraido.replace(/\s+/g, " ").trim();
    if (!textoLimpo || textoLimpo.startsWith("%PDF")) {
      throw new Error("PDF sem texto selecionável.");
    }

    ficheiroIAAnexado = { nome: file.name, conteudo: textoLimpo };
    if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
    mostrarAvisoApp(`Ficheiro "${file.name}" anexado com sucesso!`);
  } catch (err) {
    console.error(err);
    mostrarAvisoApp("Não foi possível ler texto deste PDF (pode ser uma imagem digitalizada).", true);
    removerFicheiroIA();
  }
};

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  try {
    let textoExtraido = "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      try {
        const pdfLib = await garantirBibliotecaPDF();
        const pdf = await pdfLib.getDocument({ data: buf, disableWorker: true }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
        }
      } catch (pdfErr) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
      if (!textoExtraido || textoExtraido.trim().length < 5) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }

    const textoLimpo = textoExtraido.replace(/\s+/g, " ").trim();
    if (!textoLimpo || textoLimpo.startsWith("%PDF")) {
      throw new Error("PDF sem texto selecionável.");
    }

    ficheiroIAAnexado = { nome: file.name, conteudo: textoLimpo };
    if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
    mostrarAvisoApp(`Ficheiro "${file.name}" anexado com sucesso!`);
  } catch (err) {
    console.error(err);
    mostrarAvisoApp("Não foi possível ler texto deste PDF.", true);
    removerFicheiroIA();
  }
};

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  let textoExtraido = "";
  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      try {
        const pdfLib = await garantirBibliotecaPDF();
        const pdf = await pdfLib.getDocument({ data: buf, disableWorker: true }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          textoExtraido += content.items.map(it => it.str).join(" ") + "\n";
        }
      } catch (e1) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
      if (!textoExtraido || textoExtraido.trim().length < 5) {
        textoExtraido = await extrairTextoPDFNativo(buf);
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }
  } catch (err) {
    console.warn("Aviso na leitura:", err);
  }

  const textoLimpo = (textoExtraido || "").replace(/\s+/g, " ").trim();
  const nomeSemExt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");

  // Mantém SEMPRE o ficheiro anexado até o utilizador clicar em ✕ Remover
  ficheiroIAAnexado = {
    nome: file.name,
    conteudo: (textoLimpo && !textoLimpo.startsWith("%PDF"))
      ? textoLimpo
      : `Documento de referência "${nomeSemExt}" (${file.name})`
  };

  if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
  mostrarAvisoApp(`Ficheiro "${file.name}" anexado! Só será removido se clicares no ✕.`);
};

function decodificarHexPDF(hexStr) {
  const limpo = hexStr.replace(/\s+/g, "");
  if (limpo.length < 4) return "";
  // Verifica se é UTF-16BE (começa com FEFF)
  if (limpo.toUpperCase().startsWith("FEFF")) {
    let out = "";
    for (let i = 4; i + 3 < limpo.length; i += 4) {
      const code = parseInt(limpo.slice(i, i + 4), 16);
      if (code >= 32) out += String.fromCharCode(code);
    }
    return out;
  }
  // Caso contrário lê byte a byte (Latin1 / PDFDocEncoding)
  let out = "";
  for (let i = 0; i + 1 < limpo.length; i += 2) {
    const code = parseInt(limpo.slice(i, i + 2), 16);
    if (code >= 32 && code <= 255) out += String.fromCharCode(code);
  }
  return out;
}

extrairTextoPDFNativo = async function(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = new TextDecoder("latin1").decode(bytes);
  let textos = [];

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(latin1)) !== null) {
    const rawStr = match.item ? match.item(1) : match[1];
    if (!rawStr) continue;
    const chunk = new Uint8Array(rawStr.length);
    for (let i = 0; i < rawStr.length; i++) chunk[i] = rawStr.charCodeAt(i) & 0xff;

    let decoded = rawStr;
    if (typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("deflate");
        const writer = ds.writable.getWriter();
        writer.write(chunk);
        writer.close();
        const outBuf = await new Response(ds.readable).arrayBuffer();
        decoded = new TextDecoder("latin1").decode(outBuf);
      } catch (e) {
        decoded = rawStr;
      }
    }

    // 1. Extrai texto entre parênteses: (texto) Tj
    const tjMatches = decoded.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g) || [];
    tjMatches.forEach(m => {
      const inner = m.replace(/^\(|\)\s*Tj$/g, "").replace(/\\([()\\])/g, "$1");
      if (/[a-zA-ZÀ-ÿ0-9]/.test(inner)) textos.push(inner);
    });

    // 2. Extrai texto hexadecimal: <FEFF...> Tj
    const hexTjMatches = decoded.match(/<([0-9A-Fa-f\s]+)>\s*Tj/g) || [];
    hexTjMatches.forEach(m => {
      const hex = m.replace(/^<|>\s*Tj$/g, "");
      const txt = decodificarHexPDF(hex);
      if (/[a-zA-ZÀ-ÿ0-9]/.test(txt)) textos.push(txt);
    });

    // 3. Extrai arrays TJ mistos: [(texto) -20 <FEFF...>] TJ
    const tjArrMatches = decoded.match(/\[([\s\S]*?)\]\s*TJ/g) || [];
    tjArrMatches.forEach(arr => {
      let linha = "";
      const tokens = arr.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)|<([0-9A-Fa-f\s]+)>/g) || [];
      tokens.forEach(tok => {
        if (tok.startsWith("(")) {
          linha += tok.slice(1, -1).replace(/\\([()\\])/g, "$1");
        } else if (tok.startsWith("<")) {
          linha += decodificarHexPDF(tok.slice(1, -1));
        }
      });
      if (/[a-zA-ZÀ-ÿ0-9]/.test(linha)) textos.push(linha);
    });
  }

  return textos.join(" ").replace(/\s+/g, " ").trim();
};

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler e interpretar: ${file.name}...`;

  let textoExtraido = "";
  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      textoExtraido = await extrairTextoPDFNativo(buf);
      if (!textoExtraido || textoExtraido.length < 10) {
        const pdfLib = await garantirBibliotecaPDF();
        const pdf = await pdfLib.getDocument({ data: buf, disableWorker: true }).promise;
        let paginasTxt = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          paginasTxt.push(content.items.map(it => it.str).join(" "));
        }
        textoExtraido = paginasTxt.join(" ");
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }
  } catch (err) {
    console.warn("Erro na leitura:", err);
  }

  const textoLimpo = (textoExtraido || "").replace(/\s+/g, " ").trim();
  ficheiroIAAnexado = {
    nome: file.name,
    conteudo: textoLimpo
  };

  if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
  if (textoLimpo.length > 0) {
    mostrarAvisoApp(`Ficheiro "${file.name}" lido (${textoLimpo.length} caracteres extraídos)!`);
  } else {
    mostrarAvisoApp(`Ficheiro "${file.name}" anexado (PDF apenas com imagem sem camada de texto).`, true);
  }
};

async function carregarPdfJsComBlobWorker() {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = "https://cloudflare.com";
      sc.onload = resolve;
      sc.onerror = reject;
      document.head.appendChild(sc);
    });
  }
  if (window.pdfjsLib && !window.pdfjsLib._blobWorkerReady) {
    try {
      const resp = await fetch("https://cloudflare.com");
      const workerCode = await resp.text();
      const blob = new Blob([workerCode], { type: "application/javascript" });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      window.pdfjsLib._blobWorkerReady = true;
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    }
  }
  return window.pdfjsLib;
}

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  let textoExtraido = "";
  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      const pdfLib = await carregarPdfJsComBlobWorker();
      const pdf = await pdfLib.getDocument({ data: buf }).promise;
      let paginasTxt = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        paginasTxt.push(content.items.map(it => it.str).join(" "));
      }
      textoExtraido = paginasTxt.join("\n");
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }
  } catch (err) {
    console.error("Erro PDF.js:", err);
  }

  const textoLimpo = (textoExtraido || "").replace(/\s+/g, " ").trim();
  ficheiroIAAnexado = {
    nome: file.name,
    conteudo: textoLimpo
  };

  if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
  if (textoLimpo.length > 0) {
    mostrarAvisoApp(`Ficheiro "${file.name}" lido com sucesso (${textoLimpo.length} caracteres)!`);
  } else {
    mostrarAvisoApp(`Não foi possível extrair texto de "${file.name}" (verifique a ligação à internet para carregar o leitor PDF).`, true);
  }
};

async function lerPdfTotalmenteOffline(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = new TextDecoder("latin1").decode(bytes);
  let resultados = [];

  let pos = 0;
  while (true) {
    const idxStream = latin1.indexOf("stream", pos);
    if (idxStream === -1) break;
    let inicioDados = idxStream + 6;
    if (latin1.charAt(inicioDados) === "\r") inicioDados++;
    if (latin1.charAt(inicioDados) === "\n") inicioDados++;

    const fimDados = latin1.indexOf("endstream", inicioDados);
    if (fimDados === -1) break;
    pos = fimDados + 9;

    const fatia = bytes.slice(inicioDados, fimDados);
    let textoBloco = "";

    if (typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("deflate");
        const w = ds.writable.getWriter();
        w.write(fatia);
        w.close();
        const bufDescomp = await new Response(ds.readable).arrayBuffer();
        textoBloco = new TextDecoder("latin1").decode(bufDescomp);
      } catch (e) {
        textoBloco = new TextDecoder("latin1").decode(fatia);
      }
    } else {
      textoBloco = new TextDecoder("latin1").decode(fatia);
    }

    // Extrai blocos entre parênteses (texto)
    const pMatches = textoBloco.match(/\((?:\\.|[^\\()])+\)/g) || [];
    pMatches.forEach(p => {
      const limpo = p.slice(1, -1).replace(/\\([()\\])/g, "$1").trim();
      if (limpo.length > 1 && /[a-zA-ZÀ-ÿ]/.test(limpo)) {
        resultados.push(limpo);
      }
    });

    // Extrai blocos hexadecimais <FEFF...> ou <0041...>
    const hMatches = textoBloco.match(/<([0-9A-Fa-f]{4,})>/g) || [];
    hMatches.forEach(h => {
      const hex = h.slice(1, -1);
      const txt = decodificarHexPDF(hex).trim();
      if (txt.length > 1 && /[a-zA-ZÀ-ÿ]/.test(txt)) {
        resultados.push(txt);
      }
    });
  }

  return resultados.join(" ").replace(/\s+/g, " ").trim();
}

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  let textoExtraido = "";
  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      textoExtraido = await lerPdfTotalmenteOffline(buf);
      if ((!textoExtraido || textoExtraido.length < 15) && navigator.onLine) {
        const pdfLib = await carregarPdfJsComBlobWorker();
        const pdf = await pdfLib.getDocument({ data: buf }).promise;
        let paginasTxt = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          paginasTxt.push(content.items.map(it => it.str).join(" "));
        }
        textoExtraido = paginasTxt.join("\n");
      }
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }
  } catch (err) {
    console.warn("Aviso leitura:", err);
  }

  const textoLimpo = (textoExtraido || "").replace(/\s+/g, " ").trim();
  ficheiroIAAnexado = {
    nome: file.name,
    conteudo: textoLimpo
  };

  if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;
  if (textoLimpo.length > 0) {
    mostrarAvisoApp(`Ficheiro "${file.name}" lido offline (${textoLimpo.length} caracteres)!`);
  } else {
    mostrarAvisoApp(`PDF "${file.name}" usa fontes codificadas que exigem ligação à internet ou ficheiro .TXT/.DOCX.`, true);
  }
};

carregarPdfJsComBlobWorker = async function() {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = "pdf.min.js";
      sc.onload = resolve;
      sc.onerror = () => {
        const scOnline = document.createElement("script");
        scOnline.src = "https://cloudflare.com";
        scOnline.onload = resolve;
        scOnline.onerror = reject;
        document.head.appendChild(scOnline);
      };
      document.head.appendChild(sc);
    });
  }
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";
  }
  return window.pdfjsLib;
};

carregarFicheiroIA = async function(ev) {
  const file = ev && ev.target && ev.target.files ? ev.target.files.item(0) : null;
  if (!file) return;

  const badge = document.getElementById("badgeFicheiroIA");
  const nomeSpan = document.getElementById("nomeFicheiroIA");
  if (badge) badge.style.display = "flex";
  if (nomeSpan) nomeSpan.textContent = `A ler: ${file.name}...`;

  let textoExtraido = "";
  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      const pdfLib = await carregarPdfJsComBlobWorker();
      const pdf = await pdfLib.getDocument({ data: buf, disableWorker: true }).promise;
      let paginasTxt = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        paginasTxt.push(content.items.map(it => it.str).join(" "));
      }
      textoExtraido = paginasTxt.join("\n");
    } else if (ext === "docx" && window.JSZip) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const xml = await zip.file("word/document.xml").async("string");
      textoExtraido = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      textoExtraido = await file.text();
    }
  } catch (err) {
    console.error("Erro leitura PDF:", err);
  }

  const textoLimpo = (textoExtraido || "").replace(/\s+/g, " ").trim();
  ficheiroIAAnexado = { nome: file.name, conteudo: textoLimpo };
  if (nomeSpan) nomeSpan.textContent = `📄 ${file.name}`;

  if (textoLimpo.length > 0) {
    mostrarAvisoApp(`Ficheiro "${file.name}" lido perfeitamente (${textoLimpo.length} caracteres)!`);
  } else {
    mostrarAvisoApp(`Coloque o ficheiro "pdf.min.js" na pasta da app (ou use .TXT / .DOCX enquanto estiver offline).`, true);
  }
};

carregarPdfJsComBlobWorker = async function() {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = "pdf.min.js";
      sc.onload = resolve;
      sc.onerror = reject;
      document.head.appendChild(sc);
    });
  }
  if (window.pdfjsLib) {
    const dummyWorker = new Blob(["self.onmessage=function(){}"], { type: "application/javascript" });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(dummyWorker);
  }
  return window.pdfjsLib;
};

carregarPdfJsComBlobWorker = async function() {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = "pdf.min.js";
      sc.onload = resolve;
      sc.onerror = reject;
      document.head.appendChild(sc);
    });
  }
  if (window.pdfjsLib) {
    const dummyWorker = new Blob(["self.onmessage=function(){}"], { type: "application/javascript" });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(dummyWorker);
  }
  return window.pdfjsLib;
};
