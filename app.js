// ============================================================
//  SimTrack — App Logic
// ============================================================

let currentView = "planner";
let editingSessionId = null;
let currentDetailSessionId = null;
let currentScenarioViewId = null;
let capturedGapCount = 0;

// ── Workstream Categories ─────────────────────────────────────
const WORKSTREAMS = [
  "Billing & Registration",
  "Clinical & Nursing",
  "Medical Team (Physicians)",
  "Patient Services",
  "Pharmacy",
  "Food Service",
  "Environmental",
  "Infection Control",
  "Morgue",
  "FMS (Facilities)",
  "Clinical Engineering",
  "IT & Systems",
  "Laboratory",
  "Radiology",
  "Patient Safety & Quality",
  "Signage & Wayfinding",
  "Parking & Transport",
  "Security",
  "General / Other"
];

function workstreamOptions(selected = "") {
  const placeholder = `<option value="" disabled${!selected ? " selected" : ""}>Choose workstream…</option>`;
  return placeholder + WORKSTREAMS.map(w =>
    `<option${w === selected ? " selected" : ""}>${escHtml(w)}</option>`
  ).join("");
}

// ── Access Gate & Identity ────────────────────────────────────
const SIMTRACK_PASSWORD = "AMHSIM2026";

function checkAccessGate() {
  try { if (sessionStorage.getItem("simtrack_access") === SIMTRACK_PASSWORD) return true; } catch (e) {}
  return false;
}

function submitAccessPassword() {
  const input = document.getElementById("accessInput");
  if (input.value === SIMTRACK_PASSWORD) {
    try { sessionStorage.setItem("simtrack_access", SIMTRACK_PASSWORD); } catch (e) {}
    document.getElementById("accessOverlay").style.display = "none";
    bootAfterAccess();
  } else {
    document.getElementById("accessError").style.display = "block";
    input.value = "";
    input.focus();
  }
}

function loadIdentity() {
  try {
    const saved = localStorage.getItem("simtrack_user");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function saveIdentity(name, staffId) {
  const user = { name, staffId };
  try { localStorage.setItem("simtrack_user", JSON.stringify(user)); } catch (e) {}
  return user;
}

function submitIdentity() {
  const name = document.getElementById("identityName").value.trim();
  const staffId = document.getElementById("identityStaffId").value.trim();
  const err = document.getElementById("identityError");
  if (name.length < 2) { err.textContent = "Please enter your full name."; err.style.display = "block"; return; }
  if (!/^\d{3,8}$/.test(staffId)) { err.textContent = "Staff ID must be 3–8 digits."; err.style.display = "block"; return; }
  saveIdentity(name, staffId);
  document.getElementById("identityOverlay").style.display = "none";
  renderIdentityBadge();
  bootApp();
}

function changeIdentity() {
  if (!confirm("Change your identity? Your name and ID will be updated for future actions.")) return;
  const current = loadIdentity() || {};
  document.getElementById("identityName").value = current.name || "";
  document.getElementById("identityStaffId").value = current.staffId || "";
  document.getElementById("identityError").style.display = "none";
  document.getElementById("identityOverlay").style.display = "flex";
}

function renderIdentityBadge() {
  const user = loadIdentity();
  const badge = document.getElementById("identityBadge");
  if (!badge) return;
  if (user) {
    document.getElementById("identityBadgeName").textContent = user.name;
    document.getElementById("identityBadgeId").textContent = "ID: " + user.staffId;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

// Called after password is accepted
function bootAfterAccess() {
  const user = loadIdentity();
  if (!user) {
    // First time: show identity form
    document.getElementById("identityOverlay").style.display = "flex";
    setTimeout(() => document.getElementById("identityName").focus(), 50);
  } else {
    // Returning user: go straight in
    renderIdentityBadge();
    bootApp();
  }
}

// ── Theme (runs immediately, before any gate) ─────────────────
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  const icon = dark ? "🌙" : "☀️";
  const title = dark ? "Switch to light mode" : "Switch to dark mode";
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const brandLogo = document.getElementById("brandLogo");
  const mobileHeaderLogo = document.getElementById("mobileHeaderLogo");
  if (themeToggle) { themeToggle.textContent = icon; themeToggle.title = title; }
  if (themeToggleMobile) { themeToggleMobile.textContent = icon; themeToggleMobile.title = title; }
  if (brandLogo) brandLogo.src = dark ? "Almather_Logo_Black.png" : "AMH logo.jpg";
  if (mobileHeaderLogo) mobileHeaderLogo.src = dark ? "Almather_Logo_Black.png" : "AMH logo.jpg";
  localStorage.setItem("simtrack_theme", dark ? "dark" : "light");
}

// ── Init ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  // Apply saved theme immediately so toggle works even before login
  applyTheme(localStorage.getItem("simtrack_theme") === "dark");
  document.getElementById("themeToggle").addEventListener("click",
    () => applyTheme(!document.body.classList.contains("dark")));
  document.getElementById("themeToggleMobile").addEventListener("click",
    () => applyTheme(!document.body.classList.contains("dark")));

  document.getElementById("loadingOverlay").style.display = "flex";
  await initFirestore();
  document.getElementById("loadingOverlay").style.display = "none";

  // Show password gate if not yet authenticated this session
  if (!checkAccessGate()) {
    document.getElementById("accessOverlay").style.display = "flex";
    setTimeout(() => document.getElementById("accessInput").focus(), 50);
    return; // Don't boot the app yet — bootAfterAccess() will handle it
  }
  bootAfterAccess();
});

async function bootApp() {
  document.getElementById("loadingOverlay").style.display = "none";
  populateScenarioSelects();
  renderWeekPlanner();
  renderWeekLabel();
  // Sidebar toggle (desktop)
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  // Mobile sidebar
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const sidebar = document.getElementById("sidebar");
  const closeMobileSidebar = () => {
    sidebar.classList.remove("mobile-open");
    mobileOverlay.classList.remove("open");
  };
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
    mobileOverlay.classList.toggle("open");
  });
  mobileOverlay.addEventListener("click", closeMobileSidebar);
  // Close sidebar when a nav item is tapped on mobile
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 640) closeMobileSidebar();
    });
  });

  renderIdentityBadge();
}

// ── Views ─────────────────────────────────────────────────────
function showView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
  currentView = view;

  if (view === "planner") renderWeekPlanner();
  if (view === "sessions") renderSessionsList();
  if (view === "gaps") renderGapsRegistry();
  if (view === "scenarios") renderScenarioCards();
  if (view === "readiness") renderReadinessReport();
}

// ── Week Navigation ───────────────────────────────────────────
function navigateWeek(dir) {
  setWeekOffset(getWeekOffset() + dir);
  renderWeekPlanner();
  renderWeekLabel();
}

function renderWeekLabel() {
  const offset = getWeekOffset();
  const days = getWorkWeekDays(offset);
  const start = days[0].date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const end = days[4].date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  document.getElementById("weekLabel").textContent = `${start} – ${end}`;
  if (document.getElementById("plannerWeekRange"))
    document.getElementById("plannerWeekRange").textContent = `${start} – ${end}`;
}

// ── Weekly Planner ────────────────────────────────────────────
function renderWeekPlanner() {
  const offset = getWeekOffset();
  const days = getWorkWeekDays(offset);
  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";

  days.forEach(({ name, dateStr, date, weekend }) => {
    const sessions = getSessionsForDate(dateStr);
    const todayClass = isToday(dateStr) ? " today-col" : "";
    const weekendClass = weekend ? " weekend-col" : "";

    const col = document.createElement("div");
    col.className = "day-col" + todayClass + weekendClass;

    const dayNum = date.getDate();
    col.innerHTML = `
      <div class="day-header">
        <div>
          <div class="day-name">${name}${weekend ? ' <span class="weekend-badge">Optional</span>' : ""}</div>
          <div class="day-date${isToday(dateStr) ? " today" : ""}">${dayNum}</div>
        </div>
        <button class="day-add" title="Schedule session" onclick="openNewSessionModal('${dateStr}')">＋</button>
      </div>
      <div class="day-sessions" id="day-${dateStr}">
        ${sessions.length === 0 ? `<div class="empty-day">${weekend ? "Weekend — optional" : "No sessions"}</div>` : ""}
      </div>
    `;
    grid.appendChild(col);

    const daySlot = col.querySelector(`#day-${dateStr}`);
    sessions.forEach(s => {
      daySlot.appendChild(buildSessionCard(s));
    });
  });
}

function buildSessionCard(s) {
  const scenario = getScenarioById(s.scenarioId);
  const title = scenario ? scenario.title : s.scenarioId;
  const statusClass = s.status || "planned";

  const card = document.createElement("div");
  card.className = `session-card ${statusClass}`;
  card.innerHTML = `
    <div class="session-card-id">${s.id}</div>
    <div class="session-card-title">${title}</div>
    <div class="session-card-meta">
      ${s.time ? `<span>⏱ ${s.time}</span>` : ""}
      ${s.location ? `<span>📍 ${s.location}</span>` : ""}
    </div>
    ${s.leader ? `<div class="session-card-leader">👤 ${s.leader}</div>` : ""}
    <div class="session-card-actions">
      <button class="btn-icon" onclick="event.stopPropagation(); openEditSessionModal('${s.id}')" title="Edit">✎</button>
      <button class="btn-icon danger" onclick="event.stopPropagation(); confirmDeleteSession('${s.id}')" title="Delete">✕</button>
    </div>
  `;
  card.addEventListener("click", () => openDetailModal(s.id));
  return card;
}

// ── Session Modal ─────────────────────────────────────────────
function openNewSessionModal(prefillDate = "") {
  editingSessionId = null;
  capturedGapCount = 0;
  document.getElementById("sessionModalTitle").textContent = "Schedule New Session";
  clearSessionForm();
  if (prefillDate) document.getElementById("sessionDate").value = prefillDate;
  updateSessionId();
  document.getElementById("capturedGapsRows").innerHTML = "";
  document.getElementById("plannedGapsRows").innerHTML = "";
  addCapturedGapRow(); // pre-populate one empty row
  document.getElementById("sessionModal").classList.add("open");
}

function openEditSessionModal(sessionId) {
  editingSessionId = sessionId;
  const s = getSessionById(sessionId);
  if (!s) return;

  document.getElementById("sessionModalTitle").textContent = "Edit Session";
  document.getElementById("sessionScenario").value = s.scenarioId || "";
  document.getElementById("sessionDate").value = s.date || "";
  document.getElementById("sessionTime").value = s.time || "09:00";
  document.getElementById("sessionId").value = s.id || "";
  document.getElementById("sessionIdPreview").textContent = "";
  document.getElementById("sessionLeader").value = s.leader || "";
  document.getElementById("sessionParticipants").value = s.participants || "";
  document.getElementById("sessionLocation").value = s.location || "";
  document.getElementById("sessionStatus").value = s.status || "planned";

  // Captured gaps
  document.getElementById("capturedGapsRows").innerHTML = "";
  capturedGapCount = 0;
  const capturedGaps = s.capturedGaps || [];
  if (capturedGaps.length > 0) {
    capturedGaps.forEach(g => addCapturedGapRow(g));
  } else {
    addCapturedGapRow(); // pre-populate one empty row if none saved
  }

  // Planned gaps
  document.getElementById("plannedGapsRows").innerHTML = "";
  (s.plannedGaps || []).forEach(g => addPlannedGapRow(g));

  handleScenarioChange();
  updateScenarioDocSlot(s.scenarioId);
  document.getElementById("sessionModal").classList.add("open");
}

function clearSessionForm() {
  ["sessionScenario","sessionDate","sessionTime","sessionId","sessionLeader",
   "sessionParticipants","sessionLocation"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.type === "time" ? "09:00" : "";
    });
  document.getElementById("sessionStatus").value = "planned";
  document.getElementById("sessionIdPreview").textContent = "";
  document.getElementById("preGapsList").innerHTML = '<p class="empty-note">Select a repeated scenario to see pre-identified gaps.</p>';
  document.getElementById("sessionScenarioDoc").innerHTML = '<p class="empty-note">Select a scenario above to see its document.</p>';
}

function handleScenarioChange() {
  const scenarioId = document.getElementById("sessionScenario").value;
  updateSessionId();
  updateScenarioDocSlot(scenarioId);
  updatePreGaps(scenarioId);
}

function updateSessionId() {
  const scenarioId = document.getElementById("sessionScenario").value;
  if (!scenarioId) {
    document.getElementById("sessionId").value = "";
    document.getElementById("sessionIdPreview").textContent = "";
    return;
  }
  if (editingSessionId) {
    const s = getSessionById(editingSessionId);
    if (s) {
      document.getElementById("sessionId").value = s.id;
      document.getElementById("sessionIdPreview").textContent = "";
      return;
    }
  }
  const sessions = getSessions();
  const newId = generateSessionId(scenarioId, sessions);
  document.getElementById("sessionId").value = newId;
  document.getElementById("sessionIdPreview").textContent = `→ ${newId}`;
}

function updatePreGaps(scenarioId) {
  const container = document.getElementById("preGapsList");
  if (!scenarioId) {
    container.innerHTML = '<p class="empty-note">Select a repeated scenario to see pre-identified gaps.</p>';
    return;
  }
  const gaps = getGapsForScenario(scenarioId);
  if (gaps.length === 0) {
    container.innerHTML = '<p class="empty-note">No gaps from previous sessions for this scenario.</p>';
    return;
  }
  container.innerHTML = "";
  gaps.forEach(g => {
    const div = document.createElement("div");
    div.className = "pre-gap-item";
    div.dataset.gapId = g.id;
    div.innerHTML = `
      <div style="flex:1">
        <div class="pre-gap-text" id="pgtext-${g.id}">${escHtml(g.description)}</div>
        <div class="pre-gap-meta">${g.category || ""} • ${formatDate(g.date)} • ${g.sessionId || ""}</div>
      </div>
      <button class="btn-xs" onclick="editPreGap('${g.id}')">Edit</button>
    `;
    container.appendChild(div);
  });
}

function editPreGap(gapId) {
  const item = document.querySelector(`.pre-gap-item[data-gap-id="${gapId}"]`);
  const textEl = document.getElementById(`pgtext-${gapId}`);
  if (!textEl) return;
  if (item.classList.contains("editing")) return;
  item.classList.add("editing");
  const oldText = textEl.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  input.style.flex = "1";
  textEl.replaceWith(input);
  const btn = item.querySelector("button");
  btn.textContent = "Save";
  btn.onclick = () => {
    const newText = input.value.trim();
    if (newText) updateGap(gapId, { description: newText });
    showToast("Gap updated", "success");
    updatePreGaps(document.getElementById("sessionScenario").value);
  };
}

function updateScenarioDocSlot(scenarioId) {
  const slot = document.getElementById("sessionScenarioDoc");
  if (!scenarioId) {
    slot.innerHTML = '<p class="empty-note">Select a scenario above to see its document.</p>';
    return;
  }
  const sc = getScenarioById(scenarioId);
  if (!sc) return;
  slot.innerHTML = `
    <div class="scenario-doc-info">
      <div class="scenario-doc-icon">📄</div>
      <div>
        <div class="scenario-doc-name">${escHtml(sc.title)}</div>
        <div class="scenario-doc-size">${escHtml(sc.file)}</div>
      </div>
      <button class="btn-xs" onclick="openScenarioViewer('${sc.id}')">View</button>
    </div>
  `;
}

function addCapturedGapRow(existing = null) {
  capturedGapCount++;
  const row = document.createElement("div");
  row.className = "captured-gap-row";
  row.dataset.idx = capturedGapCount;
  row.innerHTML = `
    <input type="text" placeholder="Describe the workflow gap…" value="${existing ? escHtml(existing.description || "") : ""}">
    <select>${workstreamOptions(existing?.category || "")}</select>
    <select>
      <option value="low"${existing?.priority === "low" ? " selected" : ""}>Low</option>
      <option value="medium"${(!existing || existing.priority === "medium") ? " selected" : ""}>Medium</option>
      <option value="high"${existing?.priority === "high" ? " selected" : ""}>High</option>
      <option value="critical"${existing?.priority === "critical" ? " selected" : ""}>Critical</option>
      <option value="stopper"${existing?.priority === "stopper" ? " selected" : ""}>Stopper</option>
    </select>
    <button class="btn-icon danger" onclick="this.parentElement.remove()">✕</button>
  `;
  document.getElementById("capturedGapsRows").appendChild(row);
}

function addPlannedGapRow(existing = null) {
  const row = document.createElement("div");
  row.className = "captured-gap-row";
  row.innerHTML = `
    <input type="text" placeholder="Describe the planned gap…" value="${existing ? escHtml(existing.description || "") : ""}">
    <select>${workstreamOptions(existing?.category || "")}</select>
    <select>
      <option value="low"${existing?.priority === "low" ? " selected" : ""}>Low</option>
      <option value="medium"${(!existing || existing.priority === "medium") ? " selected" : ""}>Medium</option>
      <option value="high"${existing?.priority === "high" ? " selected" : ""}>High</option>
      <option value="critical"${existing?.priority === "critical" ? " selected" : ""}>Critical</option>
      <option value="stopper"${existing?.priority === "stopper" ? " selected" : ""}>Stopper</option>
    </select>
    <button class="btn-icon danger" onclick="this.parentElement.remove()">✕</button>
  `;
  document.getElementById("plannedGapsRows").appendChild(row);
}

function saveSession() {
  const scenarioId = document.getElementById("sessionScenario").value;
  const date = document.getElementById("sessionDate").value;
  const time = document.getElementById("sessionTime").value;
  const leader = document.getElementById("sessionLeader").value.trim();
  const status = document.getElementById("sessionStatus").value;

  if (!scenarioId) { showToast("Please select a scenario.", "error"); return; }
  if (!date) { showToast("Please select a date.", "error"); return; }

  // Collect captured gaps
  const capturedGaps = [];
  document.querySelectorAll("#capturedGapsRows .captured-gap-row").forEach(row => {
    const inputs = row.querySelectorAll("input, select");
    const desc = inputs[0].value.trim();
    if (desc) capturedGaps.push({ description: desc, category: inputs[1].value, priority: inputs[2].value });
  });

  // Collect planned gaps
  const plannedGaps = [];
  document.querySelectorAll("#plannedGapsRows .captured-gap-row").forEach(row => {
    const inputs = row.querySelectorAll("input, select");
    const desc = inputs[0].value.trim();
    if (desc) plannedGaps.push({ description: desc, category: inputs[1].value, priority: inputs[2].value });
  });

  const sessionData = {
    scenarioId,
    date,
    time,
    leader,
    participants: document.getElementById("sessionParticipants").value.trim(),
    location: document.getElementById("sessionLocation").value.trim(),
    status,
    capturedGaps,
    plannedGaps,
    updatedAt: new Date().toISOString()
  };

  if (editingSessionId) {
    updateSession(editingSessionId, sessionData);
    // Sync captured gaps to global registry:
    // remove gaps previously linked to this session, then re-add current ones
    const existing = getGaps().filter(g => g.sessionId === editingSessionId);
    existing.forEach(g => deleteGap(g.id));
    capturedGaps.forEach(g => {
      addGap({ ...g, sessionId: editingSessionId, date, status: "open" });
    });
    plannedGaps.forEach(g => {
      addGap({ ...g, sessionId: editingSessionId, date, status: "open" });
    });
    showToast("Session updated.", "success");
  } else {
    const newId = document.getElementById("sessionId").value;
    sessionData.id = newId;
    sessionData.createdAt = new Date().toISOString();
    addSession(sessionData);
    capturedGaps.forEach(g => {
      addGap({ ...g, sessionId: newId, date, status: "open" });
    });
    plannedGaps.forEach(g => {
      addGap({ ...g, sessionId: newId, date, status: "open" });
    });
    showToast("Session scheduled.", "success");
  }

  closeModal("sessionModal");
  if (currentView === "planner") renderWeekPlanner();
  if (currentView === "sessions") renderSessionsList();
  if (currentView === "gaps") renderGapsRegistry();
}

// ── Sessions List ─────────────────────────────────────────────
function renderSessionsList() {
  const list = document.getElementById("sessionsList");
  const search = (document.getElementById("sessionSearch")?.value || "").toLowerCase();
  const statusF = document.getElementById("statusFilter")?.value || "";

  let sessions = getSessions().sort((a,b) => (b.date||"").localeCompare(a.date||""));

  if (search) {
    sessions = sessions.filter(s => {
      const sc = getScenarioById(s.scenarioId);
      return (sc?.title || "").toLowerCase().includes(search) ||
             (s.leader || "").toLowerCase().includes(search) ||
             (s.id || "").toLowerCase().includes(search);
    });
  }
  if (statusF) sessions = sessions.filter(s => s.status === statusF);

  if (sessions.length === 0) {
    list.innerHTML = '<div class="empty-state">No sessions found.</div>';
    return;
  }

  list.innerHTML = "";
  sessions.forEach(s => {
    const sc = getScenarioById(s.scenarioId);
    const row = document.createElement("div");
    row.className = "session-row";
    row.innerHTML = `
      <div class="session-row-id">${escHtml(s.id)}</div>
      <div>
        <div class="session-row-title">${escHtml(sc?.title || s.scenarioId)}</div>
        <div class="session-row-meta">${escHtml(sc?.department || "")}</div>
      </div>
      <div class="session-row-meta">${formatDate(s.date)} ${s.time ? "at " + s.time : ""}</div>
      <div class="session-row-leader">${escHtml(s.leader || "—")}</div>
      <div><span class="badge badge-${s.status || "planned"}">${s.status || "planned"}</span></div>
      <div style="display:flex;gap:6px">
        <button class="btn-icon" onclick="event.stopPropagation(); openEditSessionModal('${s.id}')" title="Edit">✎</button>
        <button class="btn-icon danger" onclick="event.stopPropagation(); confirmDeleteSession('${s.id}')" title="Delete">✕</button>
      </div>
    `;
    row.addEventListener("click", () => openDetailModal(s.id));
    list.appendChild(row);
  });
}

// ── Detail Modal ──────────────────────────────────────────────
function openDetailModal(sessionId) {
  currentDetailSessionId = sessionId;
  const s = getSessionById(sessionId);
  if (!s) return;
  const sc = getScenarioById(s.scenarioId);
  const gaps = getGaps().filter(g => g.sessionId === sessionId);

  document.getElementById("detailModalTitle").textContent = s.id;
  document.getElementById("detailModalBody").innerHTML = `
    <div class="detail-section">
      <h4>Session Info</h4>
      <div class="detail-grid">
        <div class="detail-item"><label>Scenario</label><span>${escHtml(sc?.title || s.scenarioId)}</span></div>
        <div class="detail-item"><label>Department</label><span>${escHtml(sc?.department || "—")}</span></div>
        <div class="detail-item"><label>Date</label><span>${formatDate(s.date)}</span></div>
        <div class="detail-item"><label>Time</label><span>${s.time || "—"}</span></div>
        <div class="detail-item"><label>Leader</label><span>${escHtml(s.leader || "—")}</span></div>
        <div class="detail-item"><label>Participants</label><span>${escHtml(s.participants || "—")}</span></div>
        <div class="detail-item"><label>Location</label><span>${escHtml(s.location || "—")}</span></div>
        <div class="detail-item"><label>Status</label><span><span class="badge badge-${s.status || "planned"}">${s.status || "planned"}</span></span></div>
      </div>
    </div>
    ${s.feedback ? `
    <div class="detail-section">
      <h4>Feedback / Observations</h4>
      <p style="font-size:13.5px;color:var(--text2);line-height:1.7">${escHtml(s.feedback)}</p>
    </div>` : ""}
    <div class="detail-section">
      <h4>Captured Gaps (${gaps.length})</h4>
      ${gaps.length === 0 ? '<p class="empty-note">No gaps logged for this session.</p>' :
        gaps.map(g => `<div class="gap-pill">
          <span class="badge badge-${g.priority}">${g.priority}</span>
          ${escHtml(g.description)}
          <span class="badge badge-${g.status}">${g.status}</span>
        </div>`).join("")}
    </div>
    ${sc ? `
    <div class="detail-section">
      <h4>Scenario Document</h4>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn-secondary" onclick="openScenarioViewer('${sc.id}')">📄 View Scenario</button>
        <span style="font-size:12px;color:var(--text3)">${escHtml(sc.file)}</span>
      </div>
    </div>` : ""}
  `;

  document.getElementById("detailModal").classList.add("open");
}

function editCurrentDetail() {
  closeModal("detailModal");
  openEditSessionModal(currentDetailSessionId);
}

// ── Gaps Registry ─────────────────────────────────────────────
function renderGapsRegistry() {
  const gaps = getGaps();
  const open = gaps.filter(g => g.status === "open").length;
  const inProgress = gaps.filter(g => g.status === "in-progress").length;
  const resolved = gaps.filter(g => g.status === "resolved").length;
  const high = gaps.filter(g => g.priority === "high").length;

  document.getElementById("gapsSummary").innerHTML = `
    <div class="gap-stat"><div class="gap-stat-num">${gaps.length}</div><div class="gap-stat-label">Total Gaps</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${open}</div><div class="gap-stat-label">Open</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--amber)">${inProgress}</div><div class="gap-stat-label">In Progress</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--green)">${resolved}</div><div class="gap-stat-label">Resolved</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${high}</div><div class="gap-stat-label">High Priority</div></div>
  `;

  populateGapSessionSelect();

  const tbody = document.getElementById("gapsTableBody");
  if (gaps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No gaps logged yet.</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  gaps.slice().reverse().forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge-${g.priority || "medium"}" style="font-size:10px">${g.id}</span></td>
      <td class="gap-desc">${escHtml(g.description)}</td>
      <td style="font-size:12px;color:var(--text3)">${escHtml(g.category || "—")}</td>
      <td style="font-size:12px;color:var(--text3);font-family:var(--font-mono)">${escHtml(g.sessionId || "—")}</td>
      <td><span class="badge badge-${g.priority}">${g.priority}</span></td>
      <td>
        <select onchange="updateGap('${g.id}', {status: this.value}); renderGapsRegistry()"
          style="background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:4px 8px;font-size:12px;width:auto">
          <option value="open"${g.status==="open"?" selected":""}>Open</option>
          <option value="in-progress"${g.status==="in-progress"?" selected":""}>In Progress</option>
          <option value="resolved"${g.status==="resolved"?" selected":""}>Resolved</option>
        </select>
      </td>
      <td>
        <button class="btn-icon danger" onclick="deleteGap('${g.id}'); renderGapsRegistry()" title="Delete">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddGapModal() {
  populateGapSessionSelect();
  document.getElementById("gapDesc").value = "";
  document.getElementById("gapPriority").value = "high";
  document.getElementById("gapStatus").value = "open";
  document.getElementById("addGapModal").classList.add("open");
}

function saveGap() {
  const description = document.getElementById("gapDesc").value.trim();
  if (!description) { showToast("Please describe the gap.", "error"); return; }
  addGap({
    description,
    category: document.getElementById("gapCategory").value,
    priority: document.getElementById("gapPriority").value,
    sessionId: document.getElementById("gapSession").value || null,
    status: document.getElementById("gapStatus").value,
    date: new Date().toISOString().split("T")[0]
  });
  showToast("Gap added.", "success");
  closeModal("addGapModal");
  if (currentView === "gaps") renderGapsRegistry();
}

function populateGapSessionSelect() {
  const sel = document.getElementById("gapSession");
  if (!sel) return;
  const sessions = getSessions().sort((a,b) => b.date?.localeCompare(a.date));
  sel.innerHTML = '<option value="">— None —</option>';
  sessions.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    const sc = getScenarioById(s.scenarioId);
    opt.textContent = `${s.id} — ${sc?.title || s.scenarioId} (${formatDate(s.date)})`;
    sel.appendChild(opt);
  });
}

// ── Scenario Library ──────────────────────────────────────────
function renderScenarioCards() {
  const container = document.getElementById("scenarioCards");
  container.innerHTML = "";
  SCENARIOS.forEach(sc => {
    const sessionCount = getSessions().filter(s => s.scenarioId === sc.id).length;
    const card = document.createElement("div");
    card.className = "scenario-card";
    card.innerHTML = `
      <div class="scenario-card-dept">${escHtml(sc.department)}</div>
      <div class="scenario-card-title">${escHtml(sc.title)}</div>
      <div class="scenario-card-desc">${escHtml(sc.goal)}</div>
      <div class="scenario-card-meta">
        <span>⏱ Setup ${sc.timing.setup}m + Exec ${sc.timing.execution}m + Debrief ${sc.timing.debrief}m</span>
        <span>◎ ${sessionCount} session${sessionCount !== 1 ? "s" : ""} run</span>
      </div>
      <div class="scenario-card-actions">
        <button class="btn-secondary" onclick="openScenarioViewer('${sc.id}')">📄 View Scenario</button>
        <button class="btn-primary" onclick="openNewSessionModalForScenario('${sc.id}')">+ Schedule</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openNewSessionModalForScenario(scenarioId) {
  openNewSessionModal();
  setTimeout(() => {
    document.getElementById("sessionScenario").value = scenarioId;
    handleScenarioChange();
  }, 50);
}

// ── Scenario Viewer ───────────────────────────────────────────
function openScenarioViewer(scenarioId) {
  currentScenarioViewId = scenarioId;
  const sc = getScenarioById(scenarioId);
  if (!sc) return;

  const pdfPath = `scenarios/${sc.file}`;
  document.getElementById("scenarioViewTitle").textContent = sc.title;
  document.getElementById("scenarioViewBody").innerHTML = `
    <div class="scenario-viewer-tabs">
      <button class="sv-tab active" onclick="switchScenarioTab('pdf', this)">📄 PDF Document</button>
      <button class="sv-tab" onclick="switchScenarioTab('overview', this)">📋 Overview</button>
    </div>

    <div class="sv-panel" id="sv-pdf">
      <div class="pdf-open-block">
        <div class="pdf-icon">📄</div>
        <div class="pdf-open-name">${escHtml(sc.file)}</div>
        <p class="pdf-open-note">Click below to open or download the scenario document.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
          <button class="btn-primary" onclick="window.open('scenarios/${sc.file}', '_blank')">Open PDF</button>
          <button class="btn-secondary" onclick="downloadCurrentScenario()">⬇ Download</button>
        </div>
      </div>
    </div>

    <div class="sv-panel hidden" id="sv-overview">
      <div class="scenario-viewer-content">
        <h3>Scenario Overview</h3>
        <div class="meta-grid">
          <div class="meta-item"><label>Department</label><span>${escHtml(sc.department)}</span></div>
          <div class="meta-item"><label>Total Duration</label><span>${sc.timing.setup + sc.timing.execution + sc.timing.debrief} min</span></div>
          <div class="meta-item"><label>Setup</label><span>${sc.timing.setup} min</span></div>
          <div class="meta-item"><label>Execution</label><span>${sc.timing.execution} min</span></div>
          <div class="meta-item"><label>Debrief</label><span>${sc.timing.debrief} min</span></div>
        </div>

        <h3>Educational Goal</h3>
        <p>${escHtml(sc.goal)}</p>

        <h3>Target Learning Groups</h3>
        <ul>${sc.groups.map(g => `<li>${escHtml(g)}</li>`).join("")}</ul>

        <h3>Clinical Vignette</h3>
        <p>${escHtml(sc.content.vignette)}</p>

        <h3>Patient Profile</h3>
        <div class="meta-grid">
          <div class="meta-item"><label>Age / PMH</label><span>${escHtml(sc.content.patient.age)} — ${escHtml(sc.content.patient.pmh)}</span></div>
          <div class="meta-item"><label>Allergies</label><span>${escHtml(sc.content.patient.allergies)}</span></div>
          <div class="meta-item" style="grid-column:1/-1"><label>Baseline Vitals</label><span>${escHtml(sc.content.patient.vitals)}</span></div>
        </div>

        <h3>Operational Objectives</h3>
        <ul>${sc.content.objectives.map(o => `<li>${escHtml(o)}</li>`).join("")}</ul>

        <h3>Scenario Workflow Steps</h3>
        <ul>${sc.content.steps.map(s => `<li>${escHtml(s)}</li>`).join("")}</ul>

        <h3>Debriefing Topics</h3>
        <ul>${sc.content.debriefTopics.map(d => `<li>${escHtml(d)}</li>`).join("")}</ul>
      </div>
    </div>
  `;
  document.getElementById("scenarioViewModal").classList.add("open");
}

function switchScenarioTab(tab, btn) {
  document.querySelectorAll(".sv-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".sv-panel").forEach(p => p.classList.add("hidden"));
  btn.classList.add("active");
  document.getElementById("sv-" + tab).classList.remove("hidden");
}

function downloadCurrentScenario() {
  if (!currentScenarioViewId) return;
  const sc = getScenarioById(currentScenarioViewId);
  if (!sc) return;
  const a = document.createElement("a");
  a.href = `scenarios/${sc.file}`;
  a.download = sc.file;
  a.click();
}

// ── Readiness Report ──────────────────────────────────────────
function renderReadinessReport() {
  const sessions = getSessions();
  const gaps = getGaps();
  const completed = sessions.filter(s => s.status === "completed");
  const planned = sessions.filter(s => s.status === "planned");
  const totalGaps = gaps.length;
  const resolvedGaps = gaps.filter(g => g.status === "resolved").length;
  const openGaps = gaps.filter(g => g.status === "open").length;
  const readinessPct = totalGaps === 0 ? 100 : Math.round((resolvedGaps / totalGaps) * 100);

  // Scenario completion table
  const scTable = SCENARIOS.map(sc => {
    const scSessions = sessions.filter(s => s.scenarioId === sc.id);
    const scCompleted = scSessions.filter(s => s.status === "completed");
    const scGaps = gaps.filter(g => {
      const sess = getSessionById(g.sessionId);
      return sess && sess.scenarioId === sc.id;
    });
    const scResolved = scGaps.filter(g => g.status === "resolved");
    const status = scCompleted.length === 0 ? "Not Started" : (scGaps.length === 0 || scResolved.length === scGaps.length) ? "Validated ✓" : "In Progress";
    return { sc, scSessions, scCompleted, scGaps, scResolved, status };
  });

  document.getElementById("readinessContent").innerHTML = `
    <div class="readiness-section">
      <h3>Key Performance Indicators</h3>
      <div class="readiness-kpis">
        <div class="kpi-card"><div class="kpi-label">Total Sessions</div><div class="kpi-value">${sessions.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Completed</div><div class="kpi-value" style="color:var(--green)">${completed.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Planned</div><div class="kpi-value" style="color:var(--blue)">${planned.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Gaps</div><div class="kpi-value">${totalGaps}</div></div>
        <div class="kpi-card"><div class="kpi-label">Open Gaps</div><div class="kpi-value" style="color:var(--red)">${openGaps}</div></div>
        <div class="kpi-card"><div class="kpi-label">Resolved Gaps</div><div class="kpi-value" style="color:var(--green)">${resolvedGaps}</div></div>
        <div class="kpi-card"><div class="kpi-label">Readiness Score</div><div class="kpi-value" style="color:var(--teal)">${readinessPct}%</div><div class="kpi-sub">Based on gap resolution</div></div>
        <div class="kpi-card"><div class="kpi-label">Scenarios Validated</div><div class="kpi-value" style="color:var(--teal)">${scTable.filter(r => r.status === "Validated ✓").length} / ${SCENARIOS.length}</div></div>
      </div>
    </div>

    <div class="readiness-section">
      <h3>Scenario Validation Status</h3>
      <table class="readiness-table">
        <thead><tr><th>Scenario</th><th>Department</th><th>Sessions Run</th><th>Completed</th><th>Gaps</th><th>Resolved</th><th>Status</th></tr></thead>
        <tbody>
          ${scTable.map(r => `
            <tr>
              <td style="color:var(--text);font-weight:600">${escHtml(r.sc.title)}</td>
              <td>${escHtml(r.sc.department)}</td>
              <td>${r.scSessions.length}</td>
              <td>${r.scCompleted.length}</td>
              <td>${r.scGaps.length}</td>
              <td>${r.scResolved.length}</td>
              <td><span class="badge ${r.status === "Validated ✓" ? "badge-completed" : r.status === "In Progress" ? "badge-in-progress" : "badge-planned"}">${r.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="readiness-section">
      <h3>Session History Log</h3>
      <table class="readiness-table">
        <thead><tr><th>Session ID</th><th>Scenario</th><th>Date</th><th>Leader</th><th>Status</th><th>Gaps Captured</th></tr></thead>
        <tbody>
          ${sessions.length === 0 ? `<tr><td colspan="6" class="empty-state">No sessions logged yet.</td></tr>` :
            sessions.slice().sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(s => {
              const sc = getScenarioById(s.scenarioId);
              const sGaps = gaps.filter(g => g.sessionId === s.id);
              return `<tr>
                <td style="font-family:var(--font-mono);font-size:11px">${escHtml(s.id)}</td>
                <td>${escHtml(sc?.title || s.scenarioId)}</td>
                <td>${formatDate(s.date)}</td>
                <td>${escHtml(s.leader || "—")}</td>
                <td><span class="badge badge-${s.status}">${s.status}</span></td>
                <td>${sGaps.length}</td>
              </tr>`;
            }).join("")}
        </tbody>
      </table>
    </div>

    <div class="readiness-section">
      <h3>Open Gaps Summary</h3>
      <table class="readiness-table">
        <thead><tr><th>Gap ID</th><th>Description</th><th>Category</th><th>Priority</th><th>Session</th></tr></thead>
        <tbody>
          ${gaps.filter(g => g.status !== "resolved").length === 0 ?
            `<tr><td colspan="5" style="text-align:center;color:var(--green);padding:20px">✓ All gaps resolved</td></tr>` :
            gaps.filter(g => g.status !== "resolved").map(g => `
              <tr>
                <td style="font-family:var(--font-mono);font-size:11px">${g.id}</td>
                <td>${escHtml(g.description)}</td>
                <td style="font-size:12px">${escHtml(g.category || "—")}</td>
                <td><span class="badge badge-${g.priority}">${g.priority}</span></td>
                <td style="font-family:var(--font-mono);font-size:11px">${escHtml(g.sessionId || "—")}</td>
              </tr>
            `).join("")}
        </tbody>
      </table>
    </div>

    <div class="readiness-section" style="border-color:var(--teal)">
      <h3>Proof of Operational Readiness</h3>
      <p style="font-size:13px;color:var(--text2);line-height:1.8">
        This log documents the full simulation commissioning cycle conducted at <strong>Almather Hospital (AMH)</strong>.
        A total of <strong>${sessions.length} simulation sessions</strong> have been scheduled across <strong>${SCENARIOS.length} clinical scenarios</strong>.
        Of these, <strong>${completed.length} sessions have been completed</strong>.
        The current gap resolution rate stands at <strong style="color:var(--teal)">${readinessPct}%</strong>
        (${resolvedGaps} of ${totalGaps} identified gaps resolved).
      </p>
      <p style="font-size:12px;color:var(--text3);margin-top:10px;font-family:var(--font-mono)">
        Report generated: ${new Date().toLocaleString("en-GB")} · SimTrack v1.0
      </p>
    </div>
  `;
}

function printReport() {
  renderReadinessReport();
  window.print();
}

// ── Scenario Select Population ────────────────────────────────
function populateScenarioSelects() {
  const sel = document.getElementById("sessionScenario");
  if (!sel) return;
  sel.innerHTML = '<option value="">Select scenario…</option>';
  SCENARIOS.forEach(sc => {
    const opt = document.createElement("option");
    opt.value = sc.id;
    opt.textContent = sc.title;
    sel.appendChild(opt);
  });
}

// ── Delete Confirm ────────────────────────────────────────────
function confirmDeleteSession(id) {
  if (confirm(`Delete session "${id}"? This cannot be undone.`)) {
    deleteSession(id);
    showToast("Session deleted.", "success");
    if (currentView === "planner") renderWeekPlanner();
    if (currentView === "sessions") renderSessionsList();
    if (currentView === "readiness") renderReadinessReport();
  }
}

// ── Modal helpers ─────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach(m => m.classList.remove("open"));
  }
});

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show${type ? " " + type : ""}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ── Utilities ─────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
