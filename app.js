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

// Shown when the cloud data could not be loaded — blocks all data entry so an
// empty app can never overwrite the real cloud record.
function showLoadFailure() {
  const o = document.getElementById("loadingOverlay");
  o.innerHTML = `
    <div style="max-width:420px;text-align:center;font-family:'DM Sans',sans-serif;color:#1a1f2e">
      <div style="font-size:40px;margin-bottom:12px">⚠️</div>
      <h2 style="font-size:20px;margin-bottom:10px;font-family:'DM Serif Display',serif">Couldn't load your data</h2>
      <p style="font-size:14px;color:#4b5568;line-height:1.6;margin-bottom:18px">
        SimTrack could not reach the cloud, so it has <b>not</b> loaded your sessions and gaps.
        Your saved data is safe — to protect it, data entry is disabled until the connection works.
        Please check your internet and try again.
      </p>
      <button onclick="window.location.reload()"
        style="background:#0891b2;color:#fff;border:none;border-radius:6px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer">
        Reload
      </button>
    </div>`;
  o.style.display = "flex";
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
  const loadedOk = await initFirestore();
  document.getElementById("loadingOverlay").style.display = "none";

  // If the cloud load failed, DO NOT boot — entering data now would risk
  // overwriting the real cloud data with an empty set. Show a blocking notice.
  if (!loadedOk) {
    showLoadFailure();
    return;
  }

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
    <div class="session-card-logged-by">logged by ${escHtml(s.loggedBy || "—")}</div>
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
  const allGaps = getGapsForScenario(scenarioId);
  const activeGaps = allGaps.filter(g => g.status !== "resolved");

  if (allGaps.length === 0) {
    container.innerHTML = '<p class="empty-note">No gaps from previous sessions for this scenario.</p>';
    return;
  }
  if (activeGaps.length === 0) {
    container.innerHTML = '<p class="empty-note" style="color:var(--green)">✓ All previously identified gaps have been resolved.</p>';
    return;
  }

  container.innerHTML = "";
  activeGaps.forEach(g => {
    const statusMeta = {
      open:          { label: "Open",        cls: "pre-gap-status-open" },
      "in-progress": { label: "In Progress", cls: "pre-gap-status-inprogress" },
    };
    const sm = statusMeta[g.status] || statusMeta["open"];
    const div = document.createElement("div");
    div.className = "pre-gap-item";
    div.dataset.gapId = g.id;
    div.innerHTML = `
      <div style="flex:1;min-width:0">
        <div class="pre-gap-text" id="pgtext-${g.id}">${escHtml(g.description)}</div>
        <div class="pre-gap-meta">
          ${g.category || ""} • ${formatDate(g.date)} • ${g.sessionId || ""}
        </div>
      </div>
      <div class="pre-gap-controls">
        <span class="pre-gap-status-badge ${sm.cls}">${sm.label}</span>
        <select class="pre-gap-status-select" onchange="changePreGapStatus('${g.id}', this.value, '${scenarioId}')">
          <option value="open"${g.status==="open"?" selected":""}>Open</option>
          <option value="in-progress"${g.status==="in-progress"?" selected":""}>In Progress</option>
          <option value="resolved">Mark Resolved</option>
        </select>
      </div>
    `;
    container.appendChild(div);
  });
}

function changePreGapStatus(gapId, newStatus, scenarioId) {
  // 1. Update data store first
  updateGap(gapId, { status: newStatus });

  // 2. Immediately update the pre-gap item in the DOM (no full re-render needed)
  const item = document.querySelector(`.pre-gap-item[data-gap-id="${gapId}"]`);
  if (item) {
    if (newStatus === "resolved") {
      item.remove();
      // If no active items remain, show the all-resolved message
      const container = document.getElementById("preGapsList");
      if (container && !container.querySelector(".pre-gap-item")) {
        container.innerHTML = '<p class="empty-note" style="color:var(--green)">✓ All previously identified gaps have been resolved.</p>';
      }
    } else {
      // Update badge colour + label in place
      const badge = item.querySelector(".pre-gap-status-badge");
      if (badge) {
        const isIP = newStatus === "in-progress";
        badge.className = `pre-gap-status-badge ${isIP ? "pre-gap-status-inprogress" : "pre-gap-status-open"}`;
        badge.textContent = isIP ? "In Progress" : "Open";
      }
    }
  }

  // 3. Sync the registry row's select + row styling directly
  // (safe to query by data-gap-id here — change originates from pre-gap panel, not the registry select)
  const regRow = document.querySelector(`#gapsTableBody tr[data-gap-id="${gapId}"]`);
  if (regRow) {
    const statusSel = regRow.querySelectorAll('select')[1];
    if (statusSel) {
      statusSel.value = newStatus;
      statusSel.style.color = newStatus === "resolved" ? "var(--green)" : newStatus === "in-progress" ? "var(--amber)" : "var(--red)";
    }
    regRow.classList.toggle("gap-row-resolved", newStatus === "resolved");
  }
  _syncRegistryGapRow(gapId, newStatus);

  if (newStatus === "resolved") showToast("Gap resolved — removed from pre-identified list.", "success");
  else showToast("Gap status updated.", "success");
}

function _syncRegistryGapRow(gapId, newStatus) {
  // Update the summary stats strip only — never touch select elements via DOM query
  const summaryEl = document.getElementById("gapsSummary");
  if (!summaryEl) return;
  const gaps = getGaps();
  const open       = gaps.filter(g => g.status === "open").length;
  const inProgress = gaps.filter(g => g.status === "in-progress").length;
  const resolved   = gaps.filter(g => g.status === "resolved").length;
  const stoppers   = gaps.filter(g => g.priority === "stopper").length;
  summaryEl.innerHTML = `
    <div class="gap-stat"><div class="gap-stat-num">${gaps.length}</div><div class="gap-stat-label">Total Gaps</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${open}</div><div class="gap-stat-label">Open</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--amber)">${inProgress}</div><div class="gap-stat-label">In Progress</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--green)">${resolved}</div><div class="gap-stat-label">Resolved</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${stoppers}</div><div class="gap-stat-label">Stoppers</div></div>
  `;
  // If any filter is active, re-render the table so the changed row is hidden/shown correctly
  const hasActiveFilter = gapFilterStatus !== "all" || gapFilterPriority !== "all" || gapFilterCategory !== "all";
  if (hasActiveFilter) renderGapsRegistry();
}

// Refresh pre-gaps panel if session modal is currently open (called from registry status change)
function syncPreGapsIfOpen() {
  const modal = document.getElementById("sessionModal");
  if (!modal || !modal.classList.contains("open")) return;
  const scenarioId = document.getElementById("sessionScenario").value;
  if (scenarioId) updatePreGaps(scenarioId);
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
    const loggedBy = loadIdentity()?.name || null;
    sessionData.id = newId;
    sessionData.createdAt = new Date().toISOString();
    sessionData.loggedBy = loggedBy;
    addSession(sessionData);
    capturedGaps.forEach(g => {
      addGap({ ...g, sessionId: newId, date, status: "open", loggedBy });
    });
    plannedGaps.forEach(g => {
      addGap({ ...g, sessionId: newId, date, status: "open", loggedBy });
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
        <div class="session-row-meta" style="font-size:11px;margin-top:2px;color:var(--text2)">logged by ${escHtml(s.loggedBy || "—")}</div>
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
        <div class="detail-item"><label>Scheduled by</label><span>${escHtml(s.loggedBy || "—")}</span></div>
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
  const allGaps = getGaps();
  const open = allGaps.filter(g => g.status === "open").length;
  const inProgress = allGaps.filter(g => g.status === "in-progress").length;
  const resolved = allGaps.filter(g => g.status === "resolved").length;
  const stoppers = allGaps.filter(g => g.priority === "stopper").length;

  document.getElementById("gapsSummary").innerHTML = `
    <div class="gap-stat"><div class="gap-stat-num">${allGaps.length}</div><div class="gap-stat-label">Total Gaps</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${open}</div><div class="gap-stat-label">Open</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--amber)">${inProgress}</div><div class="gap-stat-label">In Progress</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--green)">${resolved}</div><div class="gap-stat-label">Resolved</div></div>
    <div class="gap-stat"><div class="gap-stat-num" style="color:var(--red)">${stoppers}</div><div class="gap-stat-label">Stoppers</div></div>
  `;

  populateGapScenarioSelect();
  _renderGapFilterBar();

  const gaps = _applyGapFiltersAndSort(allGaps);
  const tbody = document.getElementById("gapsTableBody");
  if (allGaps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No gaps logged yet.</td></tr>';
    return;
  }
  if (gaps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state" style="color:var(--text3)">No gaps match the current filters.</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  gaps.forEach(g => {
    const tr = document.createElement("tr");
    tr.dataset.gapId = g.id;
    if (g.status === "resolved") tr.classList.add("gap-row-resolved");
    const statusColor = g.status === "resolved" ? "var(--green)" : g.status === "in-progress" ? "var(--amber)" : "var(--red)";
    const hasComment = !!(g.comment && g.comment.trim());
    tr.innerHTML = `
      <td><span class="badge badge-${g.priority || "medium"}" style="font-size:10px">${g.id}</span></td>
      <td class="gap-desc">
        ${escHtml(g.description)}
        <div class="gap-logged-by">by ${escHtml(g.loggedBy || "—")}</div>
        ${hasComment ? `<div class="gap-comment-preview">💬 ${escHtml(g.comment)}</div>` : ""}
      </td>
      <td style="font-size:12px;color:var(--text3)">${escHtml(g.category || "—")}</td>
      <td style="font-size:12px;color:var(--text3);font-family:var(--font-mono)">${g.sessionId ? escHtml(g.sessionId) : g.scenarioId ? `<span title="${escHtml(getScenarioById(g.scenarioId)?.title || g.scenarioId)}" style="font-family:var(--font-sans);font-style:italic">${escHtml(getScenarioById(g.scenarioId)?.title || g.scenarioId)}</span>` : "—"}</td>
      <td><span class="badge badge-${g.priority}">${escHtml(g.priority || "—")}</span></td>
      <td>
        <select onchange="onRegistryStatusChange(this, '${g.id}')"
          style="background:var(--bg3);border:1px solid var(--border);color:${statusColor};border-radius:4px;padding:4px 8px;font-size:12px;width:auto">
          <option value="open"${g.status==="open"?" selected":""}>Open</option>
          <option value="in-progress"${g.status==="in-progress"?" selected":""}>In Progress</option>
          <option value="resolved"${g.status==="resolved"?" selected":""}>Resolved</option>
        </select>
      </td>
      <td style="white-space:nowrap">
        <button class="btn-icon" onclick="toggleGapEdit('${g.id}')" title="Edit gap">✎</button>
        <button class="btn-icon${hasComment ? " has-comment" : ""}" onclick="toggleGapComment('${g.id}')" title="${hasComment ? "Edit comment" : "Add comment"}">💬</button>
        <button class="btn-icon danger" onclick="deleteGap('${g.id}'); renderGapsRegistry()" title="Delete">✕</button>
      </td>
    `;
    // Edit editor row (hidden by default) — edits description, category, priority
    const editRow = document.createElement("tr");
    editRow.className = "gap-edit-row";
    editRow.dataset.editFor = g.id;
    editRow.style.display = "none";
    editRow.innerHTML = `
      <td colspan="7" class="gap-edit-cell">
        <div class="gap-edit-editor">
          <label class="gap-edit-label">Description</label>
          <textarea class="gap-edit-desc" rows="2">${escHtml(g.description || "")}</textarea>
          <div class="gap-edit-fields">
            <div class="gap-edit-field">
              <label class="gap-edit-label">Category</label>
              <select class="gap-edit-category">${workstreamOptions(g.category || "")}</select>
            </div>
            <div class="gap-edit-field">
              <label class="gap-edit-label">Priority</label>
              <select class="gap-edit-priority">
                <option value="stopper"${g.priority==="stopper"?" selected":""}>Stopper</option>
                <option value="high"${g.priority==="high"?" selected":""}>High</option>
                <option value="medium"${g.priority==="medium"?" selected":""}>Medium</option>
                <option value="low"${g.priority==="low"?" selected":""}>Low</option>
              </select>
            </div>
          </div>
          <div class="gap-edit-actions">
            <button class="btn-secondary" onclick="saveGapEdit('${g.id}')">Save changes</button>
            <button class="btn-ghost" onclick="toggleGapEdit('${g.id}')">Cancel</button>
          </div>
        </div>
      </td>
    `;
    // Comment editor row (hidden by default)
    const commentRow = document.createElement("tr");
    commentRow.className = "gap-comment-row";
    commentRow.dataset.commentFor = g.id;
    commentRow.style.display = "none";
    commentRow.innerHTML = `
      <td colspan="7" class="gap-comment-cell">
        <div class="gap-comment-editor">
          <textarea class="gap-comment-input" placeholder="Add a comment — resolution details, root cause, follow-up action…" rows="2">${escHtml(g.comment || "")}</textarea>
          <div class="gap-comment-actions">
            <button class="btn-secondary" onclick="saveGapComment('${g.id}')">Save</button>
            <button class="btn-ghost" onclick="toggleGapComment('${g.id}')">Cancel</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
    tbody.appendChild(editRow);
    tbody.appendChild(commentRow);
  });
}

// Show/hide the inline edit editor for a gap. Closes the comment editor if open.
function toggleGapEdit(gapId) {
  const editRow = document.querySelector(`.gap-edit-row[data-edit-for="${gapId}"]`);
  if (!editRow) return;
  const isOpen = editRow.style.display !== "none";
  // Close any other open editors first to avoid confusion
  document.querySelectorAll(".gap-edit-row, .gap-comment-row").forEach(r => { r.style.display = "none"; });
  if (!isOpen) {
    editRow.style.display = "table-row";
    const ta = editRow.querySelector(".gap-edit-desc");
    if (ta) ta.focus();
  }
}

// Save edits to description, category, priority. Full re-render from the data
// store keeps everything in sync — no risk of stale/wrong-row DOM state.
function saveGapEdit(gapId) {
  const editRow = document.querySelector(`.gap-edit-row[data-edit-for="${gapId}"]`);
  if (!editRow) return;
  const description = editRow.querySelector(".gap-edit-desc").value.trim();
  const category = editRow.querySelector(".gap-edit-category").value;
  const priority = editRow.querySelector(".gap-edit-priority").value;
  if (!description) { showToast("Description can't be empty.", "error"); return; }

  updateGap(gapId, { description, category, priority });
  renderGapsRegistry();          // rebuild table from source of truth (sync-safe)
  syncPreGapsIfOpen();           // reflect changes in the pre-gaps panel if open
  showToast("Gap updated.", "success");
}

// Called from registry status select — uses the element reference directly to avoid wrong-row DOM queries
function onRegistryStatusChange(selectEl, gapId) {
  const newStatus = selectEl.value;
  updateGap(gapId, { status: newStatus });
  // Update select colour in place (no DOM query needed — we have the element)
  const color = newStatus === "resolved" ? "var(--green)" : newStatus === "in-progress" ? "var(--amber)" : "var(--red)";
  selectEl.style.color = color;
  // Toggle resolved row styling
  const row = selectEl.closest("tr");
  if (row) row.classList.toggle("gap-row-resolved", newStatus === "resolved");
  // Refresh summary counts
  _syncRegistryGapRow(gapId, newStatus);
  // Keep pre-gaps panel in sync if session modal is open
  syncPreGapsIfOpen();
}

function toggleGapComment(gapId) {
  const commentRow = document.querySelector(`.gap-comment-row[data-comment-for="${gapId}"]`);
  if (!commentRow) return;
  const isOpen = commentRow.style.display !== "none";
  // Close any other open editors first (one editor open at a time)
  document.querySelectorAll(".gap-edit-row, .gap-comment-row").forEach(r => { r.style.display = "none"; });
  if (!isOpen) {
    commentRow.style.display = "table-row";
    commentRow.querySelector("textarea").focus();
  }
}

function saveGapComment(gapId) {
  const commentRow = document.querySelector(`.gap-comment-row[data-comment-for="${gapId}"]`);
  if (!commentRow) return;
  const text = commentRow.querySelector("textarea").value.trim();
  updateGap(gapId, { comment: text });
  commentRow.style.display = "none";
  // Refresh the preview in the description cell
  const mainRow = document.querySelector(`#gapsTableBody tr[data-gap-id="${gapId}"]`);
  if (mainRow) {
    let preview = mainRow.querySelector(".gap-comment-preview");
    const commentBtn = mainRow.querySelector(".btn-icon:not(.danger)");
    if (text) {
      if (!preview) {
        preview = document.createElement("div");
        preview.className = "gap-comment-preview";
        mainRow.querySelector(".gap-desc").appendChild(preview);
      }
      preview.textContent = "💬 " + text;
      if (commentBtn) commentBtn.classList.add("has-comment");
    } else {
      if (preview) preview.remove();
      if (commentBtn) commentBtn.classList.remove("has-comment");
    }
  }
  showToast(text ? "Comment saved." : "Comment removed.", "success");
}

// ── Bulk Import ───────────────────────────────────────────────
function openImportModal() {
  document.getElementById("importJson").value = "";
  document.getElementById("importPreview").style.display = "none";
  document.getElementById("importConfirmBtn").disabled = true;
  document.getElementById("importModal").classList.add("open");
}

function previewImport() {
  const raw = document.getElementById("importJson").value.trim();
  const preview = document.getElementById("importPreview");
  if (!raw) { showToast("Paste the import JSON first.", "error"); return; }
  let data;
  try { data = JSON.parse(raw); } catch(e) {
    preview.style.display = "none";
    document.getElementById("importConfirmBtn").disabled = true;
    showToast("Invalid JSON — check for syntax errors.", "error"); return;
  }
  const sessions = data.sessions || [];
  const gaps = data.gaps || [];
  const scenarioBreakdown = {};
  sessions.forEach(s => { scenarioBreakdown[s.scenarioId] = (scenarioBreakdown[s.scenarioId] || 0) + 1; });
  const rows = Object.entries(scenarioBreakdown)
    .map(([id, n]) => `<tr><td>${escHtml(getScenarioById(id)?.title || id)}</td><td>${n}</td></tr>`)
    .join("");
  preview.innerHTML = `
    <div class="import-summary">
      <span>📋 <strong>${sessions.length}</strong> sessions to import</span>
      <span>⚠ <strong>${gaps.length}</strong> gaps to import</span>
      <span>🔁 <strong>${getSessions().length}</strong> existing sessions will be re-numbered</span>
    </div>
    <table class="import-breakdown"><thead><tr><th>Scenario</th><th>Sessions</th></tr></thead><tbody>${rows}</tbody></table>
  `;
  preview.style.display = "block";
  document.getElementById("importConfirmBtn").disabled = false;
}

function runBulkImport() {
  const raw = document.getElementById("importJson").value.trim();
  let data;
  try { data = JSON.parse(raw); } catch(e) { showToast("Invalid JSON.", "error"); return; }
  if (!confirm(`This will import ${(data.sessions||[]).length} sessions and ${(data.gaps||[]).length} gaps, and re-number all existing sessions. This cannot be undone. Proceed?`)) return;
  const result = bulkImport(data);
  closeModal("importModal");
  renderGapsRegistry();
  renderWeekPlanner();
  showToast(`Imported ${result.sessionsImported} sessions and ${result.gapsImported} gaps successfully.`, "success");
}

function openAddGapModal() {
  populateGapScenarioSelect();
  document.getElementById("gapDesc").value = "";
  document.getElementById("gapScenario").value = "";
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
    scenarioId: document.getElementById("gapScenario").value || null,
    status: document.getElementById("gapStatus").value,
    date: localDateStr(new Date()),
    loggedBy: loadIdentity()?.name || null
  });
  showToast("Gap added.", "success");
  closeModal("addGapModal");
  if (currentView === "gaps") renderGapsRegistry();
}

function populateGapScenarioSelect() {
  const sel = document.getElementById("gapScenario");
  if (!sel) return;
  const scenarios = getAllScenarios().sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  sel.innerHTML = '<option value="">— None —</option>';
  scenarios.forEach(sc => {
    const opt = document.createElement("option");
    opt.value = sc.id;
    opt.textContent = `${sc.title}${sc.department ? " — " + sc.department : ""}`;
    sel.appendChild(opt);
  });
}

// ── Scenario Library ──────────────────────────────────────────

let scenarioActiveFilter = "All";

// ── Gap Registry Filters ──────────────────────────────────────
let gapFilterStatus   = "all";
let gapFilterPriority = "all";
let gapFilterCategory = "all";
let gapSortBy         = "default";

function setGapFilter(type, value) {
  if (type === "status")   gapFilterStatus   = value;
  if (type === "priority") gapFilterPriority = value;
  if (type === "category") gapFilterCategory = value;
  if (type === "sort")     gapSortBy         = value;
  renderGapsRegistry();
}

function _applyGapFiltersAndSort(gaps) {
  let list = gaps.slice();
  if (gapFilterStatus   !== "all") list = list.filter(g => g.status   === gapFilterStatus);
  if (gapFilterPriority !== "all") list = list.filter(g => g.priority === gapFilterPriority);
  if (gapFilterCategory !== "all") list = list.filter(g => g.category === gapFilterCategory);
  const PRIO = { stopper: 0, high: 1, medium: 2, low: 3 };
  if (gapSortBy === "priority")  list.sort((a, b) => (PRIO[a.priority] ?? 4) - (PRIO[b.priority] ?? 4));
  else if (gapSortBy === "category") list.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
  else if (gapSortBy === "status")   list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
  else if (gapSortBy === "session")  list.sort((a, b) => (a.sessionId || "").localeCompare(b.sessionId || ""));
  else list.reverse(); // default: newest first
  return list;
}

function _renderGapFilterBar() {
  const allGaps = getGaps();
  const categories = [...new Set(allGaps.map(g => g.category).filter(Boolean))].sort();

  const chip = (type, value, label, icon, colorClass) => {
    const active = (type === "status" ? gapFilterStatus : type === "priority" ? gapFilterPriority : type === "category" ? gapFilterCategory : gapSortBy) === value;
    return `<button class="gf-chip ${colorClass}${active ? " gf-active" : ""}" onclick="setGapFilter('${type}','${value}')"><i class="ti ${icon}"></i>${label}</button>`;
  };

  const catIcons = {
    "IT & Systems":           "ti-device-desktop",
    "Billing & Registration": "ti-receipt",
    "Clinical & Nursing":     "ti-stethoscope",
    "Medical Team (Physicians)": "ti-user-md",
    "Pharmacy":               "ti-pill",
    "Laboratory":             "ti-test-pipe",
    "Radiology":              "ti-scan",
    "FMS (Facilities)":       "ti-building",
    "Patient Safety & Quality": "ti-shield-check",
    "Patient Services":       "ti-users",
    "Signage & Wayfinding":   "ti-sign-right",
    "Infection Control":      "ti-virus",
    "Clinical Engineering":   "ti-tool",
    "Food Service":           "ti-tools-kitchen-2",
    "Security":               "ti-shield",
    "Parking & Transport":    "ti-car",
    "Environmental":          "ti-leaf",
    "Morgue":                 "ti-building-hospital",
    "General / Other":        "ti-dots-circle-horizontal",
  };

  const activeCount = [gapFilterStatus, gapFilterPriority, gapFilterCategory].filter(v => v !== "all").length;

  const el = document.getElementById("gapFilterBar");
  if (!el) return;
  el.innerHTML = `
    <div class="gf-bar">
      <div class="gf-group">
        <span class="gf-label"><i class="ti ti-circle-dot"></i> Status</span>
        <div class="gf-chips">
          ${chip("status","all","All","ti-list","gf-gray")}
          ${chip("status","open","Open","ti-circle","gf-red")}
          ${chip("status","in-progress","In Progress","ti-clock","gf-amber")}
          ${chip("status","resolved","Resolved","ti-circle-check","gf-green")}
        </div>
      </div>
      <div class="gf-group">
        <span class="gf-label"><i class="ti ti-flag"></i> Priority</span>
        <div class="gf-chips">
          ${chip("priority","all","All","ti-list","gf-gray")}
          ${chip("priority","stopper","Stopper","ti-octagon","gf-red")}
          ${chip("priority","high","High","ti-arrow-up","gf-amber")}
          ${chip("priority","medium","Medium","ti-minus","gf-blue")}
          ${chip("priority","low","Low","ti-arrow-down","gf-gray")}
        </div>
      </div>
      <div class="gf-group">
        <span class="gf-label"><i class="ti ti-tag"></i> Category</span>
        <div class="gf-chips gf-chips-wrap">
          ${chip("category","all","All","ti-layout-grid","gf-gray")}
          ${categories.map(c => chip("category", c, c, catIcons[c] || "ti-point", "gf-teal")).join("")}
        </div>
      </div>
      <div class="gf-group">
        <span class="gf-label"><i class="ti ti-arrows-sort"></i> Sort</span>
        <div class="gf-chips">
          ${chip("sort","default","Newest","ti-clock-down","gf-gray")}
          ${chip("sort","priority","Priority","ti-flag-3","gf-gray")}
          ${chip("sort","category","Category","ti-tag","gf-gray")}
          ${chip("sort","status","Status","ti-circle-dot","gf-gray")}
          ${chip("sort","session","Session","ti-id","gf-gray")}
        </div>
      </div>
      ${activeCount > 0 ? `<button class="gf-clear" onclick="clearGapFilters()"><i class="ti ti-x"></i> Clear filters</button>` : ""}
    </div>
  `;
}

function clearGapFilters() {
  gapFilterStatus = "all"; gapFilterPriority = "all"; gapFilterCategory = "all"; gapSortBy = "default";
  renderGapsRegistry();
}

const SCENARIO_TAGS_MAP = {
  "Emergency":  d => /emergency|hospital grounds/i.test(d),
  "OPD":        d => /outpatient/i.test(d),
  "ICU":        d => /\bicu\b/i.test(d),
  "Surgical":   d => /operating room/i.test(d),
  "Imaging":    d => /radiology/i.test(d),
  "Obstetrics": d => /labor.{0,5}delivery|l&d/i.test(d),
  "Transfers":  d => /transfer|referral|kfshrc|paramedic/i.test(d),
  "Inpatient":  d => /medical.surgical|inpatient|ward|blood bank/i.test(d),
};

function getScenarioTags(sc) {
  const dept = sc.department || "";
  const tags = Object.entries(SCENARIO_TAGS_MAP)
    .filter(([, test]) => test(dept))
    .map(([tag]) => tag);
  return tags.length ? tags : ["General"];
}

function renderScenarioFilterBar() {
  const bar = document.getElementById("scenarioFilterBar");
  if (!bar) return;
  const all = getAllScenarios();
  const counts = { All: all.length };
  Object.keys(SCENARIO_TAGS_MAP).forEach(t => {
    counts[t] = all.filter(sc => getScenarioTags(sc).includes(t)).length;
  });
  const tags = ["All", ...Object.keys(SCENARIO_TAGS_MAP)];
  bar.innerHTML = tags
    .filter(t => counts[t] > 0)
    .map(t => `<button class="scenario-filter-pill${t === scenarioActiveFilter ? " active" : ""}" onclick="setScenarioFilter('${t}')">${escHtml(t)} <span class="pill-count">${counts[t]}</span></button>`)
    .join("");
}

function setScenarioFilter(tag) {
  scenarioActiveFilter = tag;
  renderScenarioFilterBar();
  renderScenarioCards();
}

function renderScenarioCards() {
  const container = document.getElementById("scenarioCards");
  container.innerHTML = "";
  renderScenarioFilterBar();
  let scenarios = getAllScenarios();
  if (scenarioActiveFilter !== "All") {
    scenarios = scenarios.filter(sc => getScenarioTags(sc).includes(scenarioActiveFilter));
  }
  if (scenarios.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;padding:32px;text-align:center;color:var(--text3);font-size:14px;">No scenarios in this category yet.</div>`;
    return;
  }
  scenarios.forEach(sc => {
    const sessionCount = getSessions().filter(s => s.scenarioId === sc.id).length;
    const isCustom = !SCENARIOS.find(s => s.id === sc.id);
    const card = document.createElement("div");
    card.className = "scenario-card" + (isCustom ? " scenario-card-custom" : "");
    card.innerHTML = `
      <div class="scenario-card-dept">
        ${escHtml(sc.department || "—")}
        ${isCustom ? '<span class="custom-badge">Custom</span>' : ""}
      </div>
      <div class="scenario-card-title">${escHtml(sc.title)}</div>
      <div class="scenario-card-desc">${escHtml(sc.goal || sc.description || "")}</div>
      <div class="scenario-card-meta">
        ${sc.timing ? `<span>⏱ Setup ${sc.timing.setup}m + Exec ${sc.timing.execution}m + Debrief ${sc.timing.debrief}m</span>` : ""}
        <span>◎ ${sessionCount} session${sessionCount !== 1 ? "s" : ""} run</span>
      </div>
      <div class="scenario-card-actions">
        <button class="btn-secondary" onclick="openScenarioViewer('${sc.id}')">📋 View</button>
        <button class="btn-ghost" onclick="openEditScenarioModal('${sc.id}')">✏ Edit</button>
        <button class="btn-primary" onclick="openNewSessionModalForScenario('${sc.id}')">+ Schedule</button>
        ${isCustom ? `<button class="btn-ghost danger-ghost" onclick="confirmDeleteScenario('${sc.id}')">🗑</button>` : ""}
      </div>
    `;
    container.appendChild(card);
  });
}

function confirmDeleteScenario(id) {
  const sc = getScenarioById(id);
  if (!sc) return;
  if (!confirm(`Delete scenario "${sc.title}"?\nThis cannot be undone. Existing sessions using this scenario will keep their reference.`)) return;
  deleteCustomScenario(id);
  renderScenarioCards();
  populateScenarioSelects();
  showToast("Scenario deleted.");
}

// ── Add Scenario Modal ────────────────────────────────────────
let _addScenarioFromSession = false;
let _editingScenarioId = null; // null = add mode, string = edit mode

function openAddScenarioModal(fromSession = false) {
  _addScenarioFromSession = fromSession;
  _editingScenarioId = null;
  // Reset modal to "Add" mode
  document.getElementById("addScenarioModalTitle").textContent = "Add Scenario";
  document.getElementById("addScenarioSaveBtn").textContent = "Save Scenario";
  ["newScenarioTitle","newScenarioDept","newScenarioGoal","newScenarioVignette","newScenarioObjectives"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("addScenarioModal").classList.add("open");
  document.getElementById("newScenarioTitle").focus();
}

function openEditScenarioModal(scenarioId) {
  const sc = getScenarioById(scenarioId);
  if (!sc) return;
  _editingScenarioId = scenarioId;
  _addScenarioFromSession = false;

  document.getElementById("addScenarioModalTitle").textContent = "Edit Scenario";
  document.getElementById("addScenarioSaveBtn").textContent = "Save Changes";
  document.getElementById("newScenarioTitle").value = sc.title || "";
  document.getElementById("newScenarioDept").value = sc.department || "";
  document.getElementById("newScenarioGoal").value = sc.goal || "";
  document.getElementById("newScenarioVignette").value = sc.content?.vignette || "";
  document.getElementById("newScenarioObjectives").value = (sc.content?.objectives || []).join("\n");
  document.getElementById("addScenarioModal").classList.add("open");
  document.getElementById("newScenarioTitle").focus();
}

function closeAddScenarioModal() {
  document.getElementById("addScenarioModal").classList.remove("open");
  _editingScenarioId = null;
}

function saveNewScenario() {
  const title    = document.getElementById("newScenarioTitle").value.trim();
  const dept     = document.getElementById("newScenarioDept").value.trim();
  const goal     = document.getElementById("newScenarioGoal").value.trim();
  const vignette = document.getElementById("newScenarioVignette").value.trim();
  const objRaw   = document.getElementById("newScenarioObjectives").value.trim();

  if (!title) { alert("Title is required."); return; }

  const objectives = objRaw ? objRaw.split("\n").map(l => l.trim()).filter(Boolean) : [];

  if (_editingScenarioId) {
    // ── Edit mode ──
    const changes = {
      title,
      department: dept || "—",
      goal: goal || "",
      content: {
        ...(getScenarioById(_editingScenarioId)?.content || {}),
        vignette,
        objectives
      }
    };
    updateOrOverrideScenario(_editingScenarioId, changes);
    closeAddScenarioModal();
    renderScenarioCards();
    populateScenarioSelects();
    // Refresh viewer if it's open on this scenario
    if (currentScenarioViewId === _editingScenarioId) openScenarioViewer(_editingScenarioId);
    showToast("Scenario updated.");
    return;
  }

  // ── Add mode ──
  const user = loadIdentity();
  const id   = "CUSTOM-" + Date.now();
  const code = title.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").slice(0, 12).toUpperCase();

  const sc = {
    id, code, title,
    department: dept || "—",
    goal: goal || "",
    isCustom: true,
    addedBy: user ? `${user.name} (${user.staffId})` : "Unknown",
    addedAt: new Date().toISOString(),
    content: { vignette, objectives, steps: [], debriefTopics: [] }
  };

  addCustomScenario(sc);
  closeAddScenarioModal();
  renderScenarioCards();
  populateScenarioSelects();
  showToast("Scenario added to the library!");

  if (_addScenarioFromSession) {
    const sel = document.getElementById("sessionScenario");
    if (sel) { sel.value = id; handleScenarioChange(); }
    _addScenarioFromSession = false;
  }
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

  document.getElementById("scenarioViewTitle").textContent = sc.title;
  document.getElementById("scenarioViewBody").innerHTML = `
    <div class="scenario-viewer-content">
      <div class="meta-grid">
        <div class="meta-item"><label>Department</label><span>${escHtml(sc.department || "—")}</span></div>
        ${sc.timing ? `
        <div class="meta-item"><label>Total Duration</label><span>${sc.timing.setup + sc.timing.execution + sc.timing.debrief} min</span></div>
        <div class="meta-item"><label>Setup</label><span>${sc.timing.setup} min</span></div>
        <div class="meta-item"><label>Execution</label><span>${sc.timing.execution} min</span></div>
        <div class="meta-item"><label>Debrief</label><span>${sc.timing.debrief} min</span></div>
        ` : ""}
      </div>

      ${sc.goal ? `<h3>Educational Goal</h3><p>${escHtml(sc.goal)}</p>` : ""}

      ${sc.groups?.length ? `<h3>Target Learning Groups</h3><ul>${sc.groups.map(g => `<li>${escHtml(g)}</li>`).join("")}</ul>` : ""}

      ${sc.content?.vignette ? `<h3>Clinical Vignette</h3><p>${escHtml(sc.content.vignette)}</p>` : ""}

      ${sc.content?.patient ? `
      <h3>Patient Profile</h3>
      <div class="meta-grid">
        <div class="meta-item"><label>Age / PMH</label><span>${escHtml(sc.content.patient.age)} — ${escHtml(sc.content.patient.pmh)}</span></div>
        <div class="meta-item"><label>Allergies</label><span>${escHtml(sc.content.patient.allergies)}</span></div>
        <div class="meta-item" style="grid-column:1/-1"><label>Baseline Vitals</label><span>${escHtml(sc.content.patient.vitals)}</span></div>
      </div>` : ""}

      ${sc.content?.objectives?.length ? `<h3>Operational Objectives</h3><ul>${sc.content.objectives.map(o => `<li>${escHtml(o)}</li>`).join("")}</ul>` : ""}

      ${sc.content?.steps?.length ? `<h3>Scenario Workflow Steps</h3><ul>${sc.content.steps.map(s => `<li>${escHtml(s)}</li>`).join("")}</ul>` : ""}

      ${sc.content?.debriefTopics?.length ? `<h3>Debriefing Topics</h3><ul>${sc.content.debriefTopics.map(d => `<li>${escHtml(d)}</li>`).join("")}</ul>` : ""}
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

// ── Readiness analysis engine ─────────────────────────────────
// Pure on-device synthesis of the readiness data → structured result the
// report renders. CLAUDE-READY SEAM: a future async version could POST these
// same inputs to a serverless Claude proxy and return the same shape; only
// this function changes, the report stays identical.
function buildReadinessAnalysis(sessions, gaps, scTable, allScen) {
  const completed = sessions.filter(s => s.status === "completed").length;
  const totalGaps = gaps.length;
  const resolvedGaps = gaps.filter(g => g.status === "resolved").length;
  const unresolved = gaps.filter(g => g.status !== "resolved");
  const openStoppers = unresolved.filter(g => g.priority === "stopper");
  const openHigh = unresolved.filter(g => g.priority === "high");
  const readinessPct = totalGaps === 0 ? 100 : Math.round(resolvedGaps / totalGaps * 100);
  const validated = scTable.filter(r => r.status === "Validated ✓");
  const inProg = scTable.filter(r => r.status === "In Progress");
  const notStarted = scTable.filter(r => r.status === "Not Started");

  // Category concentration of unresolved gaps
  const byCat = {};
  unresolved.forEach(g => { const c = g.category || "Other"; byCat[c] = (byCat[c] || 0) + 1; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const dominant = cats[0] || null;
  const dominantPct = dominant && unresolved.length ? Math.round(dominant[1] / unresolved.length * 100) : 0;

  // Theme detection across unresolved gap descriptions
  const THEMES = [
    ["Siratech / HIS access & integration", /siratech|\bhis\b|\bris\b|pacs|integration|interface|module|privilege|access|login|\brole\b|account|auto-?populate/i],
    ["Printing, labels & forms", /print|printer|label|\bform\b|receipt|invoice/i],
    ["Communication & paging", /overhead|speaker|announce|ascom|paging|landline|\bphone\b|call system|\bsms\b|notif/i],
    ["Pricing, billing & cashiering", /pric|payment|billing|\bcash\b|charge|\bpos\b|cashier|refund|copay/i],
    ["Equipment & consumables", /equipment|consumable|supply|stock|device|machine|drawer|trolley|ambo|monitor|\btube/i],
    ["Process clarity & workflow", /unclear|workflow|process|pathway|responsib|not defined|not assigned|escalation|\bsla\b|guideline/i],
    ["Consent, documentation & handover", /consent|document|\bscan\b|template|handover|isbar/i],
    ["Facilities & infrastructure", /power|backup|outage|network|cctv|\bdoor\b|shutter|elevator|\blift\b|\bclock|congestion|layout/i],
    ["Signage & wayfinding", /signage|wayfinding|direction|\bsign\b/i],
    ["Safety & clinical alerts", /allergy|alert|\bflag\b|infection|hand hygiene|sanitiz|safety/i],
  ];
  const themes = THEMES
    .map(([name, re]) => [name, unresolved.filter(g => re.test(g.description || "")).length])
    .filter(t => t[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([name, count]) => ({ name, count }));
  const stopperCats = [...new Set(openStoppers.map(g => g.category || "Other"))];

  // Open-gaps synthesis paragraph
  let gapsLead;
  if (unresolved.length === 0) {
    gapsLead = "All identified gaps have been resolved — no open operational issues remain across the simulation programme.";
  } else {
    const parts = [];
    parts.push(`There are <strong>${unresolved.length} unresolved gaps</strong> — ${openStoppers.length} go-live stopper${openStoppers.length === 1 ? "" : "s"} and ${openHigh.length} high priority.`);
    if (dominant) parts.push(`The burden concentrates in <strong>${dominant[0]}</strong> (${dominantPct}% of open items)${cats[1] ? `, then ${cats[1][0]} (${cats[1][1]})` : ""}.`);
    if (themes.length) parts.push(`Recurring patterns: ${themes.map(t => `${t.name} (${t.count})`).join(", ")}.`);
    if (openStoppers.length) parts.push(`The stopper${openStoppers.length === 1 ? "" : "s"} sit in ${stopperCats.join(", ")} and must clear before go-live.`);
    if (themes.length) parts.push(`Tackling the '${themes[0].name}' cluster alone would close roughly ${themes[0].count} of the open gaps.`);
    gapsLead = parts.join(" ");
  }

  // Validation plan: quick wins (in-progress nearest done) + new coverage
  const planItems = [];
  const inProgRanked = inProg.map(r => {
    const openN = r.scGaps.length - r.scResolved.length;
    const pct = r.scGaps.length ? Math.round(r.scResolved.length / r.scGaps.length * 100) : 0;
    return { title: r.sc.title, openN, pct };
  }).sort((a, b) => a.openN - b.openN || b.pct - a.pct);
  inProgRanked.slice(0, 2).forEach(r => planItems.push({
    title: r.title,
    reason: `${r.pct}% of its gaps already resolved — close the last ${r.openN} and re-run to validate.`,
    tag: "Quick win"
  }));
  notStarted.slice(0, 2).forEach(r => planItems.push({
    title: r.sc.title,
    reason: "Not yet simulated — a first run will surface and begin validating this pathway.",
    tag: "New coverage"
  }));
  const planTop = planItems.slice(0, 3);
  const covNow = allScen.length ? Math.round(validated.length / allScen.length * 100) : 0;
  const covProj = allScen.length ? Math.round((validated.length + planTop.length) / allScen.length * 100) : 0;
  let planIntro, projection;
  if (planTop.length === 0) {
    planIntro = "Every scenario has been validated — focus now shifts to closing the remaining gaps and re-confirming fixes.";
    projection = "";
  } else {
    planIntro = `To raise readiness at a steady pace, run these ${planTop.length} session${planTop.length === 1 ? "" : "s"} next:`;
    projection = `Completing this set would move scenario validation from ${validated.length}/${allScen.length} (${covNow}%) toward ~${covProj}%, while steadily retiring the open-gap backlog.`;
  }

  const proof = `Almather Hospital has completed <strong>${completed}</strong> simulation session${completed === 1 ? "" : "s"} across <strong>${allScen.length}</strong> clinical scenarios, validating <strong>${validated.length}</strong> end-to-end. Of <strong>${totalGaps}</strong> operational gaps surfaced, <strong>${resolvedGaps}</strong> are resolved (<strong>${readinessPct}%</strong>)${openStoppers.length ? `, with ${openStoppers.length} go-live blocker${openStoppers.length === 1 ? "" : "s"} under active remediation` : " and no go-live blockers outstanding"}. Every gap was identified in simulation rather than live operation — evidence of a controlled, defensible commissioning process.`;

  return {
    kpis: { readinessPct, completed, validated: validated.length, scenTotal: allScen.length, resolvedGaps, totalGaps, openStoppers: openStoppers.length, openHigh: openHigh.length, openTotal: unresolved.length },
    gapsLead, themes,
    plan: { intro: planIntro, items: planTop, projection },
    proof
  };
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
  const scTable = getAllScenarios().map(sc => {
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

  const A = buildReadinessAnalysis(sessions, gaps, scTable, getAllScenarios());

  document.getElementById("readinessContent").innerHTML = `
    <div class="print-report-header print-only">
      <img src="AMH logo.jpg" alt="Almather Hospital" class="print-logo" />
      <div class="print-report-title">Operational Readiness Report</div>
      <div class="print-report-sub">Almather Hospital (AMH) · Simulation Commissioning Programme</div>
      <div class="print-report-date">Generated ${new Date().toLocaleString("en-GB")} · Readiness score ${readinessPct}%</div>
    </div>

    <!-- ===== AI ANALYTICAL REPORT (screen + export) ===== -->
    <div class="ra">
      <div class="ra-kpis">
        <div class="ra-kpi big">
          <div class="v">${A.kpis.readinessPct}%</div>
          <div class="k">Operational readiness</div>
          <div class="ra-gauge"><i style="width:${A.kpis.readinessPct}%"></i></div>
        </div>
        <div class="ra-kpi"><div class="v">${A.kpis.completed}</div><div class="k">Sessions completed</div></div>
        <div class="ra-kpi"><div class="v">${A.kpis.validated}<span>/${A.kpis.scenTotal}</span></div><div class="k">Scenarios validated</div></div>
        <div class="ra-kpi"><div class="v">${A.kpis.resolvedGaps}<span>/${A.kpis.totalGaps}</span></div><div class="k">Gaps resolved</div></div>
        <div class="ra-kpi ${A.kpis.openStoppers ? "danger" : ""}"><div class="v">${A.kpis.openStoppers}</div><div class="k">Open stoppers</div></div>
      </div>

      <div class="ra-card">
        <div class="ra-h"><span class="ra-ai">AI</span> Open gaps &mdash; analysis</div>
        <p class="ra-text">${A.gapsLead}</p>
        ${A.themes.length ? `<div class="ra-themes">${A.themes.map(t => `
          <div class="ra-theme">
            <span class="ra-theme-name">${escHtml(t.name)}</span>
            <span class="ra-theme-n">${t.count}</span>
            <span class="ra-theme-bar"><i style="width:${Math.round(t.count / A.themes[0].count * 100)}%"></i></span>
          </div>`).join("")}</div>` : ""}
      </div>

      <div class="ra-card">
        <div class="ra-h"><span class="ra-ai">AI</span> What to validate next</div>
        <p class="ra-text">${A.plan.intro}</p>
        ${A.plan.items.length ? `<ol class="ra-plan">${A.plan.items.map(it => `
          <li>
            <div class="ra-plan-top"><span class="ra-plan-title">${escHtml(it.title)}</span><span class="ra-tag ${it.tag === "Quick win" ? "qw" : "nc"}">${it.tag}</span></div>
            <div class="ra-plan-reason">${escHtml(it.reason)}</div>
          </li>`).join("")}</ol>` : ""}
        ${A.plan.projection ? `<p class="ra-proj">${A.plan.projection}</p>` : ""}
      </div>

      <div class="ra-proof">
        <div class="ra-h">Proof of operational readiness</div>
        <p class="ra-text">${A.proof}</p>
        <div class="ra-sign"><div><span></span>Prepared by</div><div><span></span>Approved by</div><div><span></span>Date</div></div>
      </div>
    </div>

    <!-- ===== DETAILED ON-SCREEN VIEW (hidden in export) ===== -->
    <div class="screen-only">
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
        <div class="kpi-card"><div class="kpi-label">Scenarios Validated</div><div class="kpi-value" style="color:var(--teal)">${scTable.filter(r => r.status === "Validated ✓").length} / ${getAllScenarios().length}</div></div>
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
        A total of <strong>${sessions.length} simulation sessions</strong> have been scheduled across <strong>${getAllScenarios().length} clinical scenarios</strong>.
        Of these, <strong>${completed.length} sessions have been completed</strong>.
        The current gap resolution rate stands at <strong style="color:var(--teal)">${readinessPct}%</strong>
        (${resolvedGaps} of ${totalGaps} identified gaps resolved).
      </p>
      <p style="font-size:12px;color:var(--text3);margin-top:10px;font-family:var(--font-mono)">
        Report generated: ${new Date().toLocaleString("en-GB")} · SimTrack v1.0
      </p>
    </div>
    </div>
  `;
}

function printReport() {
  renderReadinessReport();
  window.print();
}

// ── Backup & Restore ──────────────────────────────────────────
function downloadBackup() {
  const data = exportBackupObject();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `SimTrack-backup-${d}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast(`Backup downloaded — ${data.gaps.length} gaps, ${data.sessions.length} sessions.`, "success");
}

function triggerRestore() {
  document.getElementById("restoreFileInput").click();
}

function handleRestoreFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      const s = (obj.sessions || []).length, g = (obj.gaps || []).length;
      if (!Array.isArray(obj.gaps) || !Array.isArray(obj.sessions)) {
        showToast("That file isn't a valid SimTrack backup.", "error"); input.value = ""; return;
      }
      const when = obj.exportedAt ? new Date(obj.exportedAt).toLocaleString("en-GB") : "unknown date";
      if (!confirm(`Restore this backup (from ${when})?\n\nThis REPLACES all current data with:\n  • ${s} sessions\n  • ${g} gaps\n\nTip: download a backup of the current data first if unsure.`)) {
        input.value = ""; return;
      }
      const res = restoreFromBackup(obj);
      if (currentView === "planner") renderWeekPlanner();
      else if (currentView === "sessions") renderSessionsList();
      else if (currentView === "gaps") renderGapsRegistry();
      else if (currentView === "scenarios") renderScenarioCards();
      else if (currentView === "readiness") renderReadinessReport();
      showToast(`Restored ${res.gaps} gaps and ${res.sessions} sessions.`, "success");
    } catch (e) {
      showToast("Restore failed: " + e.message, "error");
    }
    input.value = "";
  };
  reader.readAsText(file);
}

// ── Scenario Select Population ────────────────────────────────
function populateScenarioSelects() {
  const sel = document.getElementById("sessionScenario");
  if (!sel) return;
  sel.innerHTML = '<option value="">Select scenario…</option>';
  getAllScenarios().forEach(sc => {
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
