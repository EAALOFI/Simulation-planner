// ============================================================
//  SimTrack — Data Layer
//  All data stored in localStorage under "simtrack_*" keys
// ============================================================

const SCENARIOS = [
  {
    id: "ED-SEPSIS",
    code: "ED-ICU",
    title: "ED to ICU Admission",
    department: "Emergency Department / ICU",
    file: "ED_Sepsis_Management__ICU_Admission_simulation.pdf",
    timing: { setup: 30, execution: 60, debrief: 30 },
    groups: ["ED Personnel (Physicians, Nursing, Registration)", "HIM Staff", "ICU Personnel", "Respiratory Therapy", "IT/Health IT (Siratech)"],
    goal: "Validate technical and clinical efficiency of sepsis protocols and ICU admission workflow within the active Siratech HIS.",
    content: {
      vignette: "75-year-old male with COPD presents with worsening dyspnea and chills. GCS 13. Presentation indicative of Septic Shock secondary to pneumonia.",
      patient: { age: 75, pmh: "COPD, DM", allergies: "NKDA", vitals: "O2 Sat 82% RA | RR 28/min | HR 120 bpm | BP 90/50 | Temp 39.0°C" },
      objectives: [
        "HIS Proficiency: Navigate Siratech Sepsis PowerPlan including SARI score and SIRS criteria entry.",
        "Protocol Adherence: Execute Sepsis Bundle within system-mandated timestamps.",
        "Disposition Efficiency: Coordinate ICU consultation and bed management electronically.",
        "Alert Response: Validate Sepsis Alert trigger when HR >110 and Temp >38.5 entered at triage.",
        "Data Continuity: Ensure MRN matches all digital labels for blood cultures and labs."
      ],
      steps: [
        "Step 1 – Arrival: Visual triage; calculate and enter SARI score in HIS.",
        "Step 2 – Registration: Electronic MRN lookup; activate Emergency encounter.",
        "Step 3 – Triage: Save vital signs to trigger automated Sepsis Alert logic.",
        "Step 4 – Physician Encounter: Initiate Sepsis PowerPlan; order Lactic Acid, Blood Cultures, Antibiotics.",
        "Step 5 – Consultation: Electronic ICU consultation via Siratech Consult Module.",
        "Step 6 – Admission: Execute electronic bed request; complete medication reconciliation.",
        "Step 7 – Transfer: Complete digital handover; update status to Transferred."
      ],
      debriefTopics: [
        "How did automated Siratech sepsis alerts influence speed of 3-hour bundle?",
        "Was there lag between electronic Bed Request and visibility on ICU dashboard?",
        "Identify any software friction points that hindered clinical focus.",
        "How will digital records facilitate OPD follow-up post-discharge?"
      ]
    }
  },
  {
    id: "OPD-INGROWN-TOENAIL",
    code: "OPD-Proc",
    title: "OPD and Procedure Room Readiness",
    department: "Outpatient / General Surgery",
    file: "OPD_GS_Ingrown_Toenail.pdf",
    timing: { setup: 20, execution: 45, debrief: 20 },
    groups: ["General Surgery OPD (Physicians, Nursing)", "Patient Services", "Laboratory Technicians", "Pharmacy (Outpatient)", "IT/Health IT (Siratech)"],
    goal: "Validate technical and clinical efficiency of the outpatient minor procedure workflow in active Siratech HIS, ensuring seamless transition from assessment to billing and procedure documentation.",
    content: {
      vignette: "Outpatient presenting to General Surgery clinic for ingrown toenail assessment and minor surgical procedure.",
      patient: { age: "Adult", pmh: "Ingrown toenail", allergies: "NKDA", vitals: "Stable" },
      objectives: [
        "HIS Proficiency: Navigate Siratech OPD Module including order entry for labs and minor procedures.",
        "Billing Integrity: Finalize Patient Services encounter prior to procedure execution.",
        "Procedure Documentation: Complete operative note and nursing assessment in HIS.",
        "Infection Control: Confirm procedural checklist compliance.",
        "Outpatient Throughput: Validate efficient patient flow from arrival to discharge."
      ],
      steps: [
        "Step 1 – Check-In: Patient Services registers OPD encounter in Siratech.",
        "Step 2 – Nursing Assessment: Vital signs and chief complaint documented.",
        "Step 3 – Physician Consultation: Assessment, diagnosis, and procedure consent.",
        "Step 4 – Billing: Patient Services finalizes billing prior to procedure.",
        "Step 5 – Lab Order (if applicable): Order entry and collection.",
        "Step 6 – Minor Procedure: Toenail procedure with nursing support.",
        "Step 7 – Documentation & Discharge: Complete HIS operative note; discharge instructions."
      ],
      debriefTopics: [
        "Was billing completed before the procedure was performed?",
        "Were there any delays in lab order entry or result availability?",
        "How was the OPD patient flow from check-in to discharge?",
        "Identify any HIS friction points in the minor procedure documentation."
      ]
    }
  },
  {
    id: "PNEUMONIA-KFSH",
    code: "KFSH-Transfer",
    title: "Subacute Patient Transfer KFSH to AMH",
    department: "Inpatient Transfer",
    file: "Pneumonia_from_KFSH.pdf",
    timing: { setup: 30, execution: 60, debrief: 20 },
    groups: ["Duty Managers & Registration Staff", "Inpatient Nursing (AMH)", "Inpatient Physicians (On-call/Admitting)", "EMS/Porter Teams", "Laboratory & Pharmacy"],
    goal: "Validate operational readiness, workflow efficiency, and system interoperability for external transfer from KFSH arriving for AMH inpatient admission with pneumonia.",
    content: {
      vignette: "Patient transferred from King Faisal Specialist Hospital & Research Centre (KFSH) with confirmed pneumonia requiring IV antibiotics and O₂ therapy at AMH.",
      patient: { age: "Adult", pmh: "Pneumonia", allergies: "Per KFSH records", vitals: "Per transfer documents" },
      objectives: [
        "Registration Integrity: Validate 100% accuracy pre-arrival to inpatient encounter.",
        "Unit & Equipment Readiness: Confirm inpatient room equipped with O₂, suction, IV pumps.",
        "Clinical Interoperability: Verify CBC and Pharmacy order readiness.",
        "Inter-departmental Communication: Effective comms between Duty Manager, Inpatient units.",
        "Seamless Patient Transitions: Efficient handoffs EMS → Inpatient floor."
      ],
      steps: [
        "Step 1 – Coordination: Duty Manager confirms transfer from KFSH; pre-arrival setup.",
        "Step 2 – EMS Arrival: Patient received; identity confirmed; HIS encounter activated.",
        "Step 3 – Inpatient Admission: Admitting physician documents admission orders.",
        "Step 4 – Room Readiness: Nursing verifies equipment checklist.",
        "Step 5 – Clinical Handover: Nursing-to-nursing SBAR handover completed.",
        "Step 6 – Order Entry: Lab (CBC) and IV antibiotic orders entered and verified.",
        "Step 7 – Monitoring: O₂ therapy initiated; documentation updated in HIS."
      ],
      debriefTopics: [
        "Were KFSH transfer documents integrated accurately into HIS?",
        "Was room equipment confirmed fully operational before patient arrival?",
        "Were there any communication gaps between Duty Manager and inpatient team?",
        "Were lab and pharmacy orders entered and acknowledged in time?"
      ]
    }
  },
  {
    id: "SUBACUTE-KFSHRC-AMH",
    code: "Comm-Exercise",
    title: "Admission Office Communication Exercise",
    department: "Transfer / External Referral",
    file: "Subacute_Cases_KFSHRC_to_AMH_Part_1.pdf",
    timing: { setup: 20, execution: 45, debrief: 20 },
    groups: ["KFSHRC Transfer Office & External Health Services", "Almather Hospital Patient Services Staff"],
    goal: "Validate operational efficiency, response timelines, and communication accuracy for transferring sub-acute cases from KFSHRC to Almather Hospital.",
    content: {
      vignette: "Sub-acute patient requiring transfer from KFSHRC to Almather Hospital (AMH). Transfer request initiated through formal channels.",
      patient: { age: "Varies (sub-acute case)", pmh: "Per referral", allergies: "Per referral", vitals: "Stable, sub-acute" },
      objectives: [
        "Response Timeliness: Decision and reply within 30-minute benchmark.",
        "Communication Integrity: Use formal templates for acceptance and rejection.",
        "Clinical Coordination: Confirm required medications and transfer times communicated.",
        "Documentation: Complete transfer documentation in designated system.",
        "Inter-facility Protocols: Validate adherence to agreed referral SOP."
      ],
      steps: [
        "Step 1 – Initiation: KFSHRC Transfer Office initiates transfer request to AMH.",
        "Step 2 – Receiving: AMH Patient Services receives request through designated channel.",
        "Step 3 – Decision Making: Reviewing physician at AMH reviews case and decides within 30 minutes.",
        "Step 4 – Communication: Formal acceptance or rejection communicated using standard template.",
        "Step 5 – Coordination: If accepted, medications and transfer time confirmed.",
        "Step 6 – Transfer Execution: Physical transfer with complete documentation.",
        "Step 7 – Admission at AMH: Formal reception and registration completed."
      ],
      debriefTopics: [
        "Was the 30-minute response benchmark met?",
        "Were formal communication templates used correctly?",
        "Were required medications confirmed prior to transfer?",
        "Were there any documentation gaps in the transfer package?"
      ]
    }
  },
  {
    id: "URGENT-REFERRAL-KFSHRC",
    code: "Rev-Transfer",
    title: "Reverse Transfer - AMH to KFSH (Urgent)",
    department: "Inpatient / Emergency Transfer",
    file: "Urgent_referral_back_to_KFSHRC_emergency.pdf",
    timing: { setup: 30, execution: 60, debrief: 20 },
    groups: ["Duty Managers", "Registration Staff", "Inpatient Nursing (AMH)", "Inpatient Physicians (On-call/Admitting)", "EMS", "Laboratory & Pharmacy"],
    goal: "Validate operational readiness, workflow efficiency, and system interoperability for an urgent external patient transfer involving a surgical/medical patient with biliary pathology during AMH admission.",
    content: {
      vignette: "Patient admitted to AMH develops signs of Acute Cholangitis/Cholecystitis requiring urgent referral back to KFSHRC emergency department.",
      patient: { age: "Adult", pmh: "Biliary pathology", allergies: "TBC", vitals: "Deteriorating – biliary sepsis signs" },
      objectives: [
        "Rapid Deterioration Recognition: Identify early signs of cholangitis escalation.",
        "Urgent Transfer Protocol: Activate urgent referral pathway to KFSHRC ED.",
        "Documentation Under Pressure: Complete transfer documentation accurately.",
        "Inter-facility Communication: Effective handover between AMH and KFSHRC ED team.",
        "EMS Coordination: Timely dispatch and safe patient transport."
      ],
      steps: [
        "Step 1 – Clinical Deterioration: Inpatient team identifies escalating cholangitis signs.",
        "Step 2 – Physician Decision: Admitting physician decides on urgent referral to KFSHRC.",
        "Step 3 – Duty Manager Activation: Duty Manager initiates urgent referral protocol.",
        "Step 4 – KFSHRC Notification: ED team leader at KFSHRC notified and accepts.",
        "Step 5 – EMS Activation: EMS dispatched; transfer package prepared.",
        "Step 6 – Patient Prep: Labs, imaging, and medication list finalized for transfer.",
        "Step 7 – Transfer & Handover: SBAR handover to KFSHRC ED; documentation closed."
      ],
      debriefTopics: [
        "Was the clinical deterioration recognized and escalated promptly?",
        "Was the urgent referral pathway activated correctly?",
        "Were there communication delays between AMH and KFSHRC ED?",
        "Was the transfer documentation complete and accurate?"
      ]
    }
  },
  {
    id: "ED-ASTHMA-DOWNTIME",
    code: "HIS-Downtime",
    title: "HIS Downtime Protocols",
    department: "Emergency Department",
    file: "downtime_asthma_emergency_B20_.pdf",
    timing: { setup: 30, execution: 60, debrief: 20 },
    groups: ["ER Registration & HIM Staff", "ER Nursing (Triage and Treatment)", "ER Physicians", "Laboratory/Phlebotomy & Respiratory Therapy", "Radiology Technologists", "Pharmacy Staff"],
    goal: "Validate the manual downtime workflow, clinical adherence to asthma protocols, and inter-departmental coordination when Siratech HIS is unavailable.",
    content: {
      vignette: "Moderate asthma exacerbation patient presents to ED during Siratech HIS downtime. All workflows must be executed manually.",
      patient: { age: "Adult", pmh: "Asthma", allergies: "NKDA", vitals: "SpO2 89% | RR 26 | HR 108 | Mild tachycardia" },
      objectives: [
        "Manual Communication: Effective use of paper orders and verbal communication.",
        "Patient Safety during Downtime: 100% accuracy in manual patient identification.",
        "Clinical Protocol Adherence: Execute asthma protocol without HIS support.",
        "Downtime Forms: Correct use of pre-printed downtime forms.",
        "Service Coordination: Coordinate Lab, Radiology, Pharmacy manually."
      ],
      steps: [
        "Step 1 – Downtime Declaration: IT confirms downtime; distribute downtime forms.",
        "Step 2 – Manual Registration: HIM registers patient using paper downtime form.",
        "Step 3 – Triage: Nursing completes paper triage assessment.",
        "Step 4 – Physician Assessment: Manual order writing; asthma protocol initiated.",
        "Step 5 – Ancillary Services: Paper requisitions to Lab, Radiology, Pharmacy.",
        "Step 6 – Treatment: Nebulization, O₂ therapy, IV access per paper orders.",
        "Step 7 – System Restoration: Data entry into HIS once system restored; reconcile all records."
      ],
      debriefTopics: [
        "Were downtime paper forms available and correctly used?",
        "Were any patient safety concerns identified during manual identification?",
        "How was communication managed between ED modules and ancillary services?",
        "Were all paper records reconciled accurately when HIS was restored?"
      ]
    }
  }
];

// ── Storage helpers ──────────────────────────────────────────
const KEYS = {
  sessions: "sessions",
  gaps: "gaps",
  currentWeekOffset: "weekOffset"
};

// In-memory store — loaded from Firestore on startup
const _store = { sessions: [], gaps: [], weekOffset: 0 };
let _db = null;

function loadData(key, fallback = []) {
  if (key === KEYS.sessions) return _store.sessions;
  if (key === KEYS.gaps) return _store.gaps;
  if (key === KEYS.currentWeekOffset) return _store.weekOffset;
  return fallback;
}

function saveData(key, data) {
  if (key === KEYS.sessions) _store.sessions = data;
  else if (key === KEYS.gaps) _store.gaps = data;
  else if (key === KEYS.currentWeekOffset) _store.weekOffset = data;
  _firestoreWrite();
}

function _firestoreWrite() {
  if (!_db) return;
  _db.collection("simtrack").doc("data").set({
    sessions: _store.sessions,
    gaps: _store.gaps,
    weekOffset: _store.weekOffset
  }).catch(e => console.error("Firestore write error:", e));
}

async function initFirestore() {
  const firebaseConfig = {
    apiKey: "AIzaSyDCdQ-elTfBY6ivIRh00Hwt_4-aXrOyUEQ",
    authDomain: "simtrack-amh.firebaseapp.com",
    projectId: "simtrack-amh",
    storageBucket: "simtrack-amh.firebasestorage.app",
    messagingSenderId: "264931281331",
    appId: "1:264931281331:web:1012d1c3ad8ba6ea6fa3c6"
  };
  firebase.initializeApp(firebaseConfig);
  _db = firebase.firestore();
  try {
    const doc = await _db.collection("simtrack").doc("data").get();
    if (doc.exists) {
      const d = doc.data();
      _store.sessions = d.sessions || [];
      _store.gaps = d.gaps || [];
      _store.weekOffset = d.weekOffset || 0;
    }
  } catch (e) {
    console.error("Firestore load error:", e);
  }
}

// ── Sessions ─────────────────────────────────────────────────
function getSessions() { return loadData(KEYS.sessions, []); }
function saveSessions(s) { saveData(KEYS.sessions, s); }

function generateSessionId(scenarioId, existingSessions) {
  const same = existingSessions.filter(s => s.scenarioId === scenarioId);
  const num = String(same.length + 1).padStart(2, "0");
  const sc = getScenarioById(scenarioId);
  const code = sc && sc.code ? sc.code : scenarioId.replace(/-/g, "_");
  return `${code}-${num}`;
}

function addSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
}

function updateSession(id, updates) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], ...updates };
    saveSessions(sessions);
    return true;
  }
  return false;
}

function deleteSession(id) {
  const sessions = getSessions().filter(s => s.id !== id);
  saveSessions(sessions);
}

function getSessionById(id) {
  return getSessions().find(s => s.id === id) || null;
}

function getSessionsForDate(dateStr) {
  return getSessions().filter(s => s.date === dateStr);
}

// ── Gaps ─────────────────────────────────────────────────────
function getGaps() { return loadData(KEYS.gaps, []); }
function saveGaps(g) { saveData(KEYS.gaps, g); }

function addGap(gap) {
  const gaps = getGaps();
  gap.id = "GAP-" + String(Date.now()).slice(-6);
  gaps.push(gap);
  saveGaps(gaps);
  return gap;
}

function updateGap(id, updates) {
  const gaps = getGaps();
  const idx = gaps.findIndex(g => g.id === id);
  if (idx !== -1) { gaps[idx] = { ...gaps[idx], ...updates }; saveGaps(gaps); }
}

function deleteGap(id) {
  saveGaps(getGaps().filter(g => g.id !== id));
}

// Get gaps linked to a scenario (for pre-identification)
function getGapsForScenario(scenarioId) {
  return getGaps().filter(g => {
    if (!g.sessionId) return false;
    const session = getSessionById(g.sessionId);
    return session && session.scenarioId === scenarioId;
  });
}

// ── Week helpers ─────────────────────────────────────────────
function getWeekOffset() { return parseInt(loadData(KEYS.currentWeekOffset, 0)) || 0; }
function setWeekOffset(n) { saveData(KEYS.currentWeekOffset, n); }

function getSundayOfWeek(offset = 0) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = today.getDate() - day;
  const sunday = new Date(today.setDate(diff + offset * 7));
  sunday.setHours(0,0,0,0);
  return sunday;
}

// Returns array of {name, dateStr, date, weekend} for Sun–Sat
function getWorkWeekDays(offset = 0) {
  const sunday = getSundayOfWeek(offset);
  const days = [];
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ name: names[i], dateStr, date: d, weekend: i >= 5 });
  }
  return days;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function getScenarioById(id) {
  return SCENARIOS.find(s => s.id === id) || null;
}
