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
  },
  // ── Scenario 7 ──────────────────────────────────────────────
  {
    id: "RRT-ICU-ADMISSION",
    code: "RRT-ICU",
    title: "RRT Activation + ICU Admission",
    department: "Emergency Response / ICU",
    timing: { setup: 20, execution: 45, debrief: 25 },
    groups: ["Rapid Response Team (Physicians, Nursing)", "Floor Nursing", "ICU Personnel", "Respiratory Therapy", "IT/Health IT (Siratech)"],
    goal: "Validate Rapid Response Team activation, real-time clinical documentation, and ICU admission workflow within Siratech HIS under time-critical conditions.",
    content: {
      vignette: "58-year-old male on post-surgical ward, Day 3 post-CABG, develops acute respiratory distress and reduced GCS. Floor nurse activates RRT. Team assesses and determines need for urgent ICU transfer.",
      patient: { age: 58, pmh: "Post-CABG Day 3, DM Type 2", allergies: "Penicillin", vitals: "SpO2 84% RA | RR 32/min | HR 138 bpm | BP 85/55 | GCS 12" },
      objectives: [
        "RRT Documentation: Record RRT activation event with accurate timestamp in Siratech.",
        "ABCDE Assessment: Perform and document structured assessment electronically within HIS.",
        "ICU Request: Activate Siratech critical bed request module for urgent ICU placement.",
        "Medication Safety: Verify allergy flags during emergency medication ordering in HIS.",
        "Handover: Complete electronic SBAR handover from floor to ICU team in Siratech."
      ],
      steps: [
        "Step 1 – Detection: Floor nurse identifies deterioration; documents observations and activates RRT via Siratech alert.",
        "Step 2 – Response: RRT arrives within target time; response time documented in HIS.",
        "Step 3 – Assessment: Physician performs ABCDE assessment; findings entered into HIS.",
        "Step 4 – Decision: Consensus to transfer to ICU; ICU bed request initiated in Siratech.",
        "Step 5 – Orders: Emergency medication and ventilatory support orders entered; allergy flags verified.",
        "Step 6 – Transfer: Patient transported with nursing escort; HIS location updated.",
        "Step 7 – ICU Admission: ICU nursing completes admission assessment; all orders active in new unit."
      ],
      debriefTopics: [
        "Was RRT activation time accurately captured in Siratech within required response windows?",
        "Were allergy alerts triggered correctly during emergency medication ordering?",
        "How did the ICU bed request workflow perform under time pressure?",
        "Were all clinical roles clearly documented in the HIS handover?"
      ]
    }
  },

  // ── Scenario 8 ──────────────────────────────────────────────
  {
    id: "ICU-STEPDOWN-FLOOR",
    code: "ICU-Stepdown",
    title: "Step-down ICU to Floor",
    department: "ICU / Medical-Surgical Ward",
    timing: { setup: 20, execution: 40, debrief: 20 },
    groups: ["ICU Physicians & Nursing", "Ward Physicians & Nursing", "Patient Services", "Pharmacy", "IT/Health IT (Siratech)"],
    goal: "Validate the step-down transfer workflow from ICU to a general ward, including medication reconciliation, bed assignment, and structured electronic handover in Siratech HIS.",
    content: {
      vignette: "62-year-old female, ICU Day 4 recovering from sepsis, now hemodynamically stable. Attending physician determines patient is ready for step-down to the medical-surgical floor.",
      patient: { age: 62, pmh: "Sepsis (resolved), CKD Stage 3, HTN", allergies: "Sulfa", vitals: "SpO2 96% 2L NC | HR 88 bpm | BP 118/72 | Temp 37.1°C" },
      objectives: [
        "Transfer Order: Document step-down order in Siratech with clinical justification and receiving unit.",
        "Medication Reconciliation: Complete full medication reconciliation at point of transfer in HIS.",
        "Bed Management: Validate electronic bed assignment and automated housekeeping notification.",
        "Nursing Handover: Complete structured SBAR handover in Siratech between ICU and ward nurses.",
        "Order Continuity: Confirm all pending and standing orders are active and visible on the ward."
      ],
      steps: [
        "Step 1 – Clinical Decision: Physician documents stability criteria and enters step-down order.",
        "Step 2 – Bed Request: Ward bed assigned via Siratech Bed Management module; housekeeping alerted.",
        "Step 3 – Medication Reconciliation: Pharmacist and physician reconcile ICU medications for floor appropriateness.",
        "Step 4 – Patient Services: Billing encounter updated to reflect unit change.",
        "Step 5 – ICU Nursing Handover: ICU nurse completes SBAR handover in HIS and signs off.",
        "Step 6 – Transport: Patient transferred with escort; location updated in Siratech.",
        "Step 7 – Ward Admission: Ward nurse completes receiving assessment; confirms all active orders."
      ],
      debriefTopics: [
        "Were all ICU medications correctly reconciled for floor-level care?",
        "Was the bed assignment and housekeeping notification workflow efficient?",
        "Were there any order gaps or duplications identified after transfer?",
        "How was the SBAR handover quality documented within Siratech?"
      ]
    }
  },

  // ── Scenario 9 ──────────────────────────────────────────────
  {
    id: "OPD-TO-ED",
    code: "OPD-ED",
    title: "OPD to ED",
    department: "Outpatient / Emergency Department",
    timing: { setup: 20, execution: 40, debrief: 20 },
    groups: ["OPD Physicians & Nursing", "ED Physicians & Nursing", "Patient Services", "IT/Health IT (Siratech)"],
    goal: "Validate the urgent referral workflow for a deteriorating patient from OPD clinic to ED, ensuring seamless HIS record transfer, allergy continuity, and immediate ED triage activation.",
    content: {
      vignette: "45-year-old male presents to OPD Internal Medicine clinic with chest pain 7/10 and diaphoresis. ECG reveals new ST-segment elevation. OPD physician determines need for immediate ED transfer.",
      patient: { age: 45, pmh: "HTN, Dyslipidemia", allergies: "Aspirin (GI intolerance)", vitals: "HR 102 bpm | BP 158/94 | SpO2 95% RA | Diaphoretic" },
      objectives: [
        "Urgent Referral: Generate urgent ED referral via Siratech OPD-ED referral module with priority flag.",
        "Allergy Transfer: Confirm allergy information (Aspirin) is carried forward into ED encounter.",
        "Escort Order: Document nursing escort and transport instructions in HIS.",
        "ED Triage: Validate immediate triage activation upon OPD referral patient arrival in ED.",
        "Record Continuity: Confirm all OPD encounter data visible to ED physician in Siratech."
      ],
      steps: [
        "Step 1 – OPD Assessment: Physician documents findings; ECG result entered; urgent referral to ED generated.",
        "Step 2 – Allergy Review: OPD nurse verifies allergy flag present on referral.",
        "Step 3 – Notification: ED charge nurse notified via Siratech referral alert.",
        "Step 4 – Escort: Patient escorted by OPD nurse with printed referral summary.",
        "Step 5 – ED Reception: ED triage nurse receives patient; confirms identity and reads OPD encounter.",
        "Step 6 – ED Encounter: ED physician opens new encounter; OPD data visible; Cardiology consult initiated.",
        "Step 7 – Escalation: ED activates STEMI protocol; documents activation time in Siratech."
      ],
      debriefTopics: [
        "Was the OPD-to-ED referral generated and received without HIS delays?",
        "Was the Aspirin allergy flag visible and acknowledged in the ED encounter?",
        "Was ED triage immediate upon patient arrival, and was priority flagging effective?",
        "Were all OPD documentation elements available to the ED physician?"
      ]
    }
  },

  // ── Scenario 10 ──────────────────────────────────────────────
  {
    id: "REVERSE-TRANSFER-AMH-KFSH",
    code: "Rev-AMH-KF",
    title: "Reverse Transfer — AMH to KFSH (Planned)",
    department: "Medical-Surgical / Transfer Coordination",
    timing: { setup: 25, execution: 50, debrief: 25 },
    groups: ["Attending Physician", "Ward Nursing", "Patient Services", "Social Work", "Transfer Coordinator", "IT/Health IT (Siratech)"],
    goal: "Validate the planned inter-hospital reverse transfer workflow from AMH to KFSH for higher-level care, ensuring complete Siratech documentation, clinical summary generation, and regulatory compliance.",
    content: {
      vignette: "71-year-old male admitted for CHF exacerbation requiring cardiac catheterisation not available at AMH. Attending physician plans non-urgent transfer to KFSH. Family consent required and complete clinical summary must be generated.",
      patient: { age: 71, pmh: "CHF (EF 30%), Atrial Fibrillation, CKD Stage 3", allergies: "Contrast media (mild reaction)", vitals: "HR 76 bpm | BP 104/68 | SpO2 94% 3L NC | Bilateral ankle oedema" },
      objectives: [
        "Transfer Documentation: Complete inter-hospital transfer form in Siratech with receiving facility details.",
        "Clinical Summary: Generate and print transfer summary / referral letter from HIS.",
        "Allergy Flag: Confirm contrast allergy is prominently documented on all transfer paperwork.",
        "Consent: Document patient and family consent for transfer in Siratech.",
        "Coordination: Verify KFSH acceptance and log receiving physician name in HIS."
      ],
      steps: [
        "Step 1 – Decision: Attending documents clinical decision and indication for transfer to KFSH.",
        "Step 2 – Family Meeting: Social work and physician meet family; consent documented in Siratech.",
        "Step 3 – Clinical Summary: HIS-generated transfer letter reviewed and signed by physician.",
        "Step 4 – Allergy Review: Contrast allergy flag confirmed on transfer documentation.",
        "Step 5 – Coordination: Transfer coordinator contacts KFSH; acceptance and receiving physician logged.",
        "Step 6 – Medication: Discharge medication list generated; reconciled for transfer.",
        "Step 7 – Departure: Patient transferred; Siratech encounter closed with transfer status."
      ],
      debriefTopics: [
        "Was the transfer documentation complete and signed prior to patient departure?",
        "Was the contrast media allergy clearly communicated on all transfer documents?",
        "Was family consent documented appropriately within Siratech?",
        "Were there any gaps in the inter-hospital coordination workflow?"
      ]
    }
  },

  // ── Scenario 11 ──────────────────────────────────────────────
  {
    id: "ED-TO-RADIOLOGY",
    code: "ED-Rad",
    title: "ED to Radiology",
    department: "Emergency Department / Radiology",
    timing: { setup: 15, execution: 35, debrief: 20 },
    groups: ["ED Physicians & Nursing", "Radiology Technicians & Radiologists", "Patient Transport", "IT/Health IT (Siratech)"],
    goal: "Validate the electronic imaging order, patient transport, and result reporting workflow between ED and Radiology through Siratech HIS/RIS integration.",
    content: {
      vignette: "33-year-old female presents to ED with acute abdominal pain 8/10, nausea, and vomiting. ED physician orders urgent CT abdomen/pelvis with IV contrast. Patient requires transport to Radiology.",
      patient: { age: 33, pmh: "Nil significant", allergies: "NKDA", vitals: "HR 110 bpm | BP 98/60 | SpO2 98% RA | Pain 8/10 | Guarding on palpation" },
      objectives: [
        "Order Entry: Enter urgent CT request via Siratech with correct priority and clinical indication.",
        "RIS Integration: Verify imaging order appears in Radiology Information System without manual re-entry.",
        "Allergy Screening: Confirm allergy check performed prior to contrast administration.",
        "Transport: Document patient transport order with monitoring requirements in HIS.",
        "Result Reporting: Validate radiologist report appears in ED physician's Siratech worklist."
      ],
      steps: [
        "Step 1 – Order Entry: ED physician enters urgent CT abdomen/pelvis order with contrast in Siratech.",
        "Step 2 – RIS Visibility: Radiology technician confirms order visible in RIS queue.",
        "Step 3 – Allergy Check: Technician performs pre-contrast allergy screening; documents result.",
        "Step 4 – Transport: ED nurse initiates transport with monitoring; location updated in HIS.",
        "Step 5 – Imaging: CT performed; images acquired and uploaded to PACS.",
        "Step 6 – Reporting: Radiologist dictates and signs report in Siratech.",
        "Step 7 – Result Review: ED physician receives alert; reads and acknowledges report in HIS."
      ],
      debriefTopics: [
        "Was the imaging order visible in the RIS immediately after entry in Siratech?",
        "Was contrast allergy screening completed and documented prior to administration?",
        "How long was the turnaround from order entry to result acknowledgement?",
        "Were any transport or monitoring documentation gaps identified?"
      ]
    }
  },

  // ── Scenario 12 ──────────────────────────────────────────────
  {
    id: "IP-TO-RADIOLOGY",
    code: "IP-Rad",
    title: "Inpatient to Radiology",
    department: "Medical-Surgical Ward / Radiology",
    timing: { setup: 15, execution: 35, debrief: 20 },
    groups: ["Ward Physicians & Nursing", "Radiology Technicians", "Patient Transport", "IT/Health IT (Siratech)"],
    goal: "Validate the inpatient imaging request, scheduling, safe patient transport, and radiology result reporting workflow within Siratech HIS/RIS.",
    content: {
      vignette: "55-year-old male inpatient, post right total knee replacement Day 2, develops right calf pain and swelling. Physician orders urgent Doppler ultrasound lower limbs to rule out DVT. Nursing coordinates transport.",
      patient: { age: 55, pmh: "Post right TKR Day 2, HTN", allergies: "Penicillin", vitals: "HR 94 bpm | BP 138/84 | SpO2 97% RA | Right calf oedema and tenderness" },
      objectives: [
        "Imaging Order: Enter urgent Doppler ultrasound order in Siratech with correct priority.",
        "Scheduling: Radiology confirms slot via RIS; estimated wait time communicated to ward.",
        "Transport Preparation: Nursing documents transport requirements and pre-transport assessment.",
        "Result Communication: Radiologist result auto-populates in physician's HIS worklist.",
        "Clinical Action: Physician acknowledges result and documents clinical decision in Siratech."
      ],
      steps: [
        "Step 1 – Order: Physician enters Doppler ultrasound order with DVT query as indication.",
        "Step 2 – RIS Queue: Radiology confirms order in RIS; slot assigned.",
        "Step 3 – Pre-transport: Nurse completes pre-transport assessment; documents in HIS.",
        "Step 4 – Transport: Patient transported with porter; HIS location updated.",
        "Step 5 – Examination: Ultrasound performed; images uploaded.",
        "Step 6 – Report: Radiologist reports and signs in Siratech.",
        "Step 7 – Result Action: Ward physician reads result; initiates anticoagulation order if positive."
      ],
      debriefTopics: [
        "Was the imaging order correctly prioritised and reflected in the RIS queue?",
        "Was the pre-transport assessment completed and documented before patient departure?",
        "Was the result notification received promptly by the ordering physician?",
        "Were any delays between imaging completion and physician notification identified?"
      ]
    }
  },

  // ── Scenario 13 ──────────────────────────────────────────────
  {
    id: "OPD-TO-RADIOLOGY",
    code: "OPD-Rad",
    title: "OPD to Radiology",
    department: "Outpatient / Radiology",
    timing: { setup: 15, execution: 30, debrief: 15 },
    groups: ["OPD Physicians & Nursing", "Radiology Technicians", "Patient Services", "IT/Health IT (Siratech)"],
    goal: "Validate the outpatient imaging referral, scheduling, and result reporting workflow from OPD clinic to Radiology using Siratech HIS/RIS integration.",
    content: {
      vignette: "48-year-old female presents to OPD Obstetrics & Gynaecology clinic for routine follow-up. Physician orders mammogram and pelvic ultrasound. Patient is directed to Radiology reception for scheduling and examination.",
      patient: { age: 48, pmh: "Nil significant", allergies: "NKDA", vitals: "Stable | BMI 27" },
      objectives: [
        "Order Entry: OPD physician enters imaging orders in Siratech OPD module with correct modalities.",
        "Patient Direction: Patient Services guides patient to Radiology with printed referral summary.",
        "RIS Receipt: Radiology confirms both orders visible in RIS without manual entry.",
        "Exam Performance: Both studies performed, images uploaded to PACS.",
        "Result Return: Radiologist report auto-routes to OPD physician's Siratech worklist for review."
      ],
      steps: [
        "Step 1 – OPD Order: Physician enters mammogram and pelvic ultrasound orders in Siratech.",
        "Step 2 – Patient Guidance: Patient Services prints referral; directs patient to Radiology.",
        "Step 3 – RIS Scheduling: Radiology reception confirms both orders; slots assigned.",
        "Step 4 – Mammogram: Performed and images uploaded to PACS.",
        "Step 5 – Pelvic Ultrasound: Performed and images uploaded to PACS.",
        "Step 6 – Reporting: Radiologist reviews, reports, and signs both studies.",
        "Step 7 – OPD Notification: OPD physician notified via Siratech; results acknowledged and documented."
      ],
      debriefTopics: [
        "Were both imaging orders visible in the RIS immediately after OPD entry?",
        "Was the patient successfully guided to Radiology without manual intervention?",
        "Was the reporting turnaround time acceptable for OPD workflow?",
        "Was result communication back to OPD seamless within Siratech?"
      ]
    }
  },

  // ── Scenario 14 ──────────────────────────────────────────────
  {
    id: "CODE-IN-RADIOLOGY",
    code: "Code-Rad",
    title: "Code in Radiology",
    department: "Radiology / Emergency Response",
    timing: { setup: 25, execution: 45, debrief: 30 },
    groups: ["Radiology Technicians & Radiologists", "Code Blue Team (Physicians, Nursing, RT)", "ED Physicians", "IT/Health IT (Siratech)"],
    goal: "Validate code blue activation, resuscitation team response, and emergency clinical documentation within a Radiology imaging suite environment.",
    content: {
      vignette: "67-year-old male undergoing contrast-enhanced CT scan suddenly becomes unresponsive and pulseless mid-examination. Radiology technician identifies cardiac arrest and activates code blue. Code team responds to CT suite.",
      patient: { age: 67, pmh: "CAD, HTN, prior contrast reaction", allergies: "Contrast media (prior allergic reaction)", vitals: "Pulseless | Apnoeic | GCS 3 | Last recorded: HR 88 | BP 136/78" },
      objectives: [
        "Code Activation: Document code blue activation with time-stamp in Siratech immediately.",
        "Space Management: Radiology team clears CT suite for resuscitation; imaging equipment safely parked.",
        "Resuscitation: CPR initiated; defibrillator retrieved; ACLS protocol followed.",
        "Medication Allergy: Code team identifies contrast allergy before administering any medications.",
        "Documentation: Resuscitation events documented in real-time in Siratech code sheet.",
        "Post-Resuscitation: ROSC documented; decision on ICU transfer entered in HIS."
      ],
      steps: [
        "Step 1 – Recognition: Technician identifies unresponsive patient; calls for help; activates code blue.",
        "Step 2 – Equipment: Radiology team clears room; code cart retrieved.",
        "Step 3 – CPR: First responder initiates chest compressions; airway managed.",
        "Step 4 – Code Team Arrival: Physician assumes team leader role; assigns roles.",
        "Step 5 – ACLS: Defibrillation and medication administration per ACLS protocol; allergy flag checked.",
        "Step 6 – Documentation: Nurse documents all interventions in Siratech code sheet in real-time.",
        "Step 7 – Outcome: ROSC achieved; ICU transfer initiated; full handover documented in HIS."
      ],
      debriefTopics: [
        "Was the code blue activation time-stamped accurately in Siratech?",
        "Was the CT suite effectively cleared to allow resuscitation access?",
        "Was the contrast allergy identified and acknowledged during medication administration?",
        "Was real-time documentation maintained during active resuscitation?"
      ]
    }
  },

  // ── Scenario 15 ──────────────────────────────────────────────
  {
    id: "ED-TO-LD",
    code: "ED-LD",
    title: "ED to Labor & Delivery",
    department: "Emergency Department / Labor & Delivery",
    timing: { setup: 20, execution: 40, debrief: 20 },
    groups: ["ED Physicians & Nursing", "OB/GYN Physicians", "L&D Nursing", "Patient Services", "IT/Health IT (Siratech)"],
    goal: "Validate the urgent obstetric emergency transfer workflow from ED to Labor & Delivery, ensuring rapid assessment, HIS record continuity, and activation of obstetric emergency protocols.",
    content: {
      vignette: "29-year-old female, G2P1 at 36 weeks gestation, presents to ED with severe headache, visual disturbances, and BP 168/112. ED physician diagnoses severe pre-eclampsia and activates urgent L&D transfer.",
      patient: { age: 29, pmh: "G2P1, 36 weeks gestation, Gestational Diabetes", allergies: "NKDA", vitals: "BP 168/112 | HR 96 bpm | SpO2 98% RA | Proteinuria 3+ | Fetal HR 148 bpm" },
      objectives: [
        "Obstetric Alert: Activate obstetric emergency flag in Siratech ED encounter.",
        "Referral: Generate urgent L&D referral with fetal details and pre-eclampsia severity.",
        "Medication: IV Magnesium Sulphate order entered; dose and rate verified in HIS.",
        "Fetal Monitoring: Document baseline fetal heart rate in HIS prior to transfer.",
        "L&D Receipt: L&D team confirms readiness via Siratech; obstetric encounter opened on arrival."
      ],
      steps: [
        "Step 1 – ED Assessment: Physician documents findings; obstetric emergency flag activated.",
        "Step 2 – OB Consult: OB/GYN notified; consult documented in Siratech.",
        "Step 3 – Medication: MgSO4 order entered; pharmacist weight-based dosing confirmed.",
        "Step 4 – Fetal Documentation: Fetal HR documented in HIS; CTG strip attached.",
        "Step 5 – Referral: L&D referral generated via Siratech with all maternal-fetal data.",
        "Step 6 – Transfer: Patient transferred with ED nurse escort; continuous monitoring.",
        "Step 7 – L&D Handover: L&D nurse opens obstetric encounter; ED handover documented."
      ],
      debriefTopics: [
        "Was the obstetric emergency flag visible and communicated promptly to L&D?",
        "Was the MgSO4 dosing order correctly entered and verified in Siratech?",
        "Was fetal monitoring documentation complete prior to transfer?",
        "Was the L&D encounter opened and ED handover documented without delay?"
      ]
    }
  },

  // ── Scenario 16 ──────────────────────────────────────────────
  {
    id: "LD-TO-OR",
    code: "LD-OR",
    title: "L&D to OR — Emergency Caesarean",
    department: "Labor & Delivery / Operating Room",
    timing: { setup: 25, execution: 45, debrief: 25 },
    groups: ["OB/GYN Physicians", "L&D Nursing", "OR Nursing & Anesthesia", "Neonatal Team (NICU)", "IT/Health IT (Siratech)"],
    goal: "Validate the emergency Caesarean section activation, rapid OR preparation, and surgical team handover workflow within the Siratech HIS under time-critical obstetric conditions.",
    content: {
      vignette: "31-year-old female, G1P0 at 38 weeks gestation, presents with Category III fetal heart tracing (sustained bradycardia 80 bpm). OB/GYN determines emergency Caesarean section required. Decision-to-incision target: 30 minutes.",
      patient: { age: 31, pmh: "G1P0, 38 weeks, GDM (diet-controlled)", allergies: "NKDA", vitals: "HR 104 bpm | BP 122/78 | SpO2 99% RA | FHR 80 bpm (Category III)" },
      objectives: [
        "Emergency OR Activation: Enter emergency C-section order in Siratech; OR activated via HIS.",
        "Consent: Verbal consent documented in Siratech with witness; written to follow.",
        "Anaesthesia Notification: Anaesthesia consult documented; spinal vs. GA decision recorded.",
        "Neonatal Alert: NICU team notified via Siratech; neonatal resuscitation bay prepared.",
        "Decision-to-Incision Time: Document and track D-to-I time within Siratech."
      ],
      steps: [
        "Step 1 – Decision: OB/GYN documents Category III tracing and C-section indication.",
        "Step 2 – OR Activation: Emergency OR order placed; OR charge nurse confirms room readiness.",
        "Step 3 – Consent: Verbal consent documented; patient transferred to OR.",
        "Step 4 – Anaesthesia: Anaesthesia completes pre-op assessment; spinal inserted.",
        "Step 5 – NICU Alert: NICU team notified; resuscitation bay confirmed ready.",
        "Step 6 – Surgery: C-section performed; neonate delivered; Apgar scores documented in HIS.",
        "Step 7 – Post-op: Mother transferred to recovery; baby to NICU if required; all HIS entries completed."
      ],
      debriefTopics: [
        "Was the decision-to-incision time within the 30-minute target and accurately recorded?",
        "Was consent properly documented under emergency conditions in Siratech?",
        "Was NICU team notification timely and confirmed in the HIS?",
        "Were any HIS bottlenecks identified during the rapid OR activation sequence?"
      ]
    }
  },

  // ── Scenario 17 ──────────────────────────────────────────────
  {
    id: "BLOOD-TRANSFUSION",
    code: "Blood-Tx",
    title: "Blood Transfusion Workflow",
    department: "Medical-Surgical Ward / Blood Bank / Laboratory",
    timing: { setup: 20, execution: 45, debrief: 25 },
    groups: ["Attending Physician", "Ward Nursing (×2)", "Blood Bank Technicians", "Laboratory", "Pharmacy", "IT/Health IT (Siratech)"],
    goal: "Validate the complete blood transfusion workflow including electronic request, cross-match, blood bank dispensing, bedside two-nurse verification, and transfusion monitoring within Siratech HIS.",
    content: {
      vignette: "44-year-old female, post major abdominal surgery Day 1, with Hb 6.2 g/dL and haemodynamic instability. Physician orders 2 units packed Red Blood Cells. Nursing must complete request, laboratory cross-match, blood bank dispensing, and bedside verification.",
      patient: { age: 44, pmh: "Post-laparotomy Day 1, no prior transfusion history", allergies: "NKDA", vitals: "HR 112 bpm | BP 94/58 | Hb 6.2 g/dL | SpO2 97% 2L NC | Pale and diaphoretic" },
      objectives: [
        "Transfusion Request: Enter packed RBC transfusion order in Siratech with blood group and Hb indication.",
        "Sample Collection: Nursing collects and labels cross-match specimen; barcoded label verified in HIS.",
        "Blood Bank: Cross-match completed; 2 units pRBC assigned and dispensed in Siratech.",
        "Two-Nurse Verification: Bedside verification of blood product using Siratech barcode scan protocol.",
        "Monitoring: Vital signs documented at 15-minute intervals in HIS during transfusion."
      ],
      steps: [
        "Step 1 – Order Entry: Physician enters transfusion order with indication, blood group, and units required.",
        "Step 2 – Specimen Collection: Nurse collects cross-match sample; HIS generates barcoded label; patient ID verified.",
        "Step 3 – Lab Processing: Blood Bank processes cross-match; compatibility confirmed in Siratech.",
        "Step 4 – Dispensing: Blood Bank dispenses 2 units pRBC; transaction recorded in HIS.",
        "Step 5 – Bedside Verification: Two nurses scan product and patient wristband via Siratech; match confirmed.",
        "Step 6 – Transfusion Start: First unit commenced; start time documented; nursing observations at 15 min intervals.",
        "Step 7 – Completion: Transfusion completed; Hb recheck ordered; outcomes documented in HIS."
      ],
      debriefTopics: [
        "Was patient identification and sample labelling completed without error in Siratech?",
        "Was the two-nurse barcode verification workflow followed for both units?",
        "Were 15-minute monitoring observations documented consistently in HIS?",
        "Were there any delays in cross-match turnaround or blood bank dispensing?"
      ]
    }
  },

  // ── Scenario 18 ──────────────────────────────────────────────
  {
    id: "DEATH-NOTIFICATION",
    code: "Death-Note",
    title: "Death Notification Workflow",
    department: "Medical-Surgical Ward / Administration",
    timing: { setup: 20, execution: 40, debrief: 25 },
    groups: ["Attending Physician", "Ward Nursing", "Patient Services", "Social Work", "Morgue Staff", "IT/Health IT (Siratech)"],
    goal: "Validate the death notification, clinical documentation, family communication, and body transfer workflow within Siratech HIS in compliance with institutional and Saudi MOH regulatory requirements.",
    content: {
      vignette: "79-year-old male inpatient with end-stage COPD and a documented DNR order is declared deceased by the attending physician. Team must complete all required HIS documentation, notify the family, obtain necessary authorisations, and coordinate transfer to the morgue.",
      patient: { age: 79, pmh: "End-stage COPD, Cor Pulmonale, documented DNR", allergies: "NKDA", vitals: "No spontaneous respirations | No pulse | Fixed dilated pupils | Time of death: documented" },
      objectives: [
        "Death Declaration: Physician documents time of death and clinical findings in Siratech.",
        "DNR Verification: Confirm DNR order present and correctly documented in HIS prior to any intervention.",
        "Family Notification: Social work and physician notify next of kin; communication documented in Siratech.",
        "Death Certificate: Physician completes electronic death certificate within Siratech.",
        "Morgue Transfer: Patient Services and morgue staff coordinate transfer; chain of custody documented in HIS."
      ],
      steps: [
        "Step 1 – Declaration: Physician examines patient; declares and documents time of death in Siratech.",
        "Step 2 – DNR Review: Nursing confirms DNR order visible and valid in HIS.",
        "Step 3 – Family Notification: Social worker and physician contact next of kin; details documented.",
        "Step 4 – Death Certificate: Physician completes and signs death certificate in Siratech.",
        "Step 5 – Body Preparation: Nursing prepares body per protocol; documentation completed.",
        "Step 6 – Morgue Coordination: Patient Services contacts morgue; transfer authorisation entered in HIS.",
        "Step 7 – Encounter Closure: Billing encounter and HIS record closed with correct discharge disposition code."
      ],
      debriefTopics: [
        "Was time of death documented immediately and accurately in Siratech?",
        "Was the DNR order verified in HIS before any post-mortem interventions?",
        "Was family notification documented with the name of next of kin and time of contact?",
        "Was the morgue transfer and chain of custody properly recorded in the HIS?"
      ]
    }
  },

  // ── Scenario 19 ──────────────────────────────────────────────
  {
    id: "OR-TO-ICU",
    code: "OR-ICU",
    title: "OR to ICU — Post-operative Transfer",
    department: "Operating Room / ICU",
    timing: { setup: 20, execution: 40, debrief: 20 },
    groups: ["Surgeon & Anaesthesiologist", "OR Nursing", "ICU Physicians & Nursing", "Pharmacy", "IT/Health IT (Siratech)"],
    goal: "Validate the post-operative patient handover and transfer workflow from OR to ICU, including anaesthesia handover documentation, medication reconciliation, and ICU admission in Siratech HIS.",
    content: {
      vignette: "66-year-old male post-emergency laparotomy for bowel perforation and faecal peritonitis. Anaesthesiologist determines patient requires ICU admission post-operatively. OR team must complete comprehensive handover.",
      patient: { age: 66, pmh: "T2DM, HTN, smoker", allergies: "NKDA", vitals: "HR 108 bpm | BP 88/54 (vasopressor-dependent) | SpO2 96% (mechanically ventilated) | Temp 36.1°C" },
      objectives: [
        "Operative Note: Surgeon completes and signs operative note in Siratech before OR exit.",
        "Anaesthesia Handover: Anaesthesiologist documents ISBAR handover in HIS for ICU team.",
        "Medication Reconciliation: OR and ICU pharmacy reconcile intraoperative and post-op medications.",
        "ICU Admission: ICU nursing completes admission assessment in Siratech within 30 minutes.",
        "Ventilator Orders: Mechanical ventilation settings entered and verified in HIS."
      ],
      steps: [
        "Step 1 – Operative Note: Surgeon dictates and signs operative note in Siratech before patient leaves OR.",
        "Step 2 – OR to ICU Handover: Anaesthesiologist provides ISBAR handover; ICU physician documents receipt.",
        "Step 3 – Medication: Vasopressors and post-op medications reconciled by pharmacy.",
        "Step 4 – Ventilator Settings: ICU physician enters ventilator orders in Siratech.",
        "Step 5 – ICU Assessment: ICU nurse completes physical assessment and documents in HIS.",
        "Step 6 – Lines and Monitoring: Invasive lines documented; monitoring parameters set in Siratech.",
        "Step 7 – Family Update: Surgeon notifies family; communication documented in HIS."
      ],
      debriefTopics: [
        "Was the operative note completed and signed before OR departure?",
        "Was the anaesthesia-to-ICU handover documented clearly in Siratech?",
        "Were vasopressor and post-op medication orders correctly reconciled?",
        "Was the ICU admission assessment completed within 30 minutes of arrival?"
      ]
    }
  },

  // ── Scenario 20 ──────────────────────────────────────────────
  {
    id: "ED-TO-OR",
    code: "ED-OR",
    title: "ED to OR — Emergency Surgery",
    department: "Emergency Department / Operating Room",
    timing: { setup: 20, execution: 45, debrief: 25 },
    groups: ["ED Physicians & Nursing", "Surgeon on Call", "OR Nursing & Anaesthesiologist", "Pharmacy", "Patient Services", "IT/Health IT (Siratech)"],
    goal: "Validate the emergency direct-to-OR transfer workflow from the Emergency Department, including surgical consult documentation, rapid OR activation, anaesthesia assessment, and safe patient handover within Siratech HIS.",
    content: {
      vignette: "38-year-old male presents to ED via ambulance following a high-speed road traffic accident. Primary survey reveals blunt abdominal trauma with haemoperitoneum on FAST exam. Surgeon determines emergency exploratory laparotomy is required. Patient must go directly from ED to OR.",
      patient: { age: 38, pmh: "Nil significant", allergies: "NKDA", vitals: "HR 132 bpm | BP 82/50 | SpO2 94% 15L NRB | GCS 13 | FAST: free fluid in Morrison's pouch and pelvis" },
      objectives: [
        "Trauma Activation: Document trauma team activation and time-stamp in Siratech ED encounter.",
        "Surgical Consult: Surgeon documents consult findings and emergency OR indication in HIS.",
        "Emergency OR Booking: OR booking entered in Siratech; OR team confirms room and team availability.",
        "Consent: Emergency verbal consent documented in Siratech with witness; written to follow post-op.",
        "Anaesthesia Pre-op: Anaesthesiologist completes rapid pre-op assessment and documents in HIS.",
        "Handover: ED physician completes structured ISBAR handover to OR team documented in Siratech."
      ],
      steps: [
        "Step 1 – Trauma Activation: ED physician activates trauma team; time-stamped in Siratech.",
        "Step 2 – Primary Survey: ABCDE assessment performed and documented; FAST result entered in HIS.",
        "Step 3 – Surgical Consult: Surgeon reviews patient; documents haemoperitoneum and OR indication.",
        "Step 4 – OR Booking: Emergency OR booking entered; OR charge nurse confirms room ready.",
        "Step 5 – Consent: Verbal consent obtained and documented; patient's next of kin notified.",
        "Step 6 – Anaesthesia: Rapid anaesthesia pre-op assessment completed and signed in HIS.",
        "Step 7 – Transfer & Handover: Patient transferred to OR; ED physician delivers ISBAR handover; all entries completed in Siratech."
      ],
      debriefTopics: [
        "Was the trauma activation time-stamped accurately and was the team assembled within target time?",
        "Was the FAST result and surgical indication clearly documented in Siratech before OR departure?",
        "Was emergency consent obtained and documented appropriately under time pressure?",
        "Was the ISBAR handover from ED to OR comprehensive and recorded in HIS?"
      ]
    }
  },

  // ── Scenario 21 ──────────────────────────────────────────────
  {
    id: "EMERGENCY-OUTSIDE-CLINICAL",
    code: "Ext-Emergency",
    title: "Emergency Outside Clinical Areas",
    department: "Hospital Grounds / AMH Paramedics / KFSHRC Emergency",
    timing: { setup: 25, execution: 50, debrief: 30 },
    groups: ["AMH Paramedics", "Security Team", "Duty Manager", "AMH Clinical First Responders", "KFSHRC Emergency Department", "IT/Health IT (Siratech)"],
    goal: "Validate the response to a medical emergency occurring outside clinical areas during Phase 1 commissioning, when AMH Emergency Department is not yet operational. This includes first response activation, on-scene stabilisation, duty manager decision-making, advance notification of KFSHRC, and transfer by AMH paramedic ambulance with complete chain-of-custody documentation.",
    content: {
      vignette: "52-year-old male visitor collapses with witnessed cardiac arrest in the AMH main lobby. Security activates the emergency response. AMH clinical staff initiate BLS and retrieve the AED. AMH paramedics assume ACLS on scene. With the AMH Emergency Department non-operational and unable to receive the patient, the Duty Manager confirms diversion to KFSHRC Emergency. Patient must be stabilised, loaded into the AMH ambulance, and transferred to KFSHRC ED with a structured handover.",
      patient: { age: 52, pmh: "Unknown (visitor — no prior records in Siratech)", allergies: "Unknown", vitals: "Pulseless | Apnoeic | GCS 3 | Witnessed collapse | AED on scene" },
      objectives: [
        "Emergency Activation: Security documents emergency call and activation time in Siratech duty log.",
        "BLS / AED Response: First available clinical staff initiates CPR and applies AED within 3 minutes of collapse.",
        "ACLS Handover: AMH paramedics assume team lead; airway secured; rhythm documented.",
        "Duty Manager Decision: Duty Manager confirms AMH ED non-operational; authorises transfer to KFSHRC; documents decision in Siratech.",
        "KFSHRC Pre-notification: KFSHRC ED notified by phone with patient status; acceptance confirmed and documented in Siratech.",
        "Pre-hospital Record: AMH paramedic completes pre-hospital care report in Siratech before departure.",
        "Transfer & Handover: Patient transferred by AMH ambulance; ISBAR handover delivered to KFSHRC ED team; chain of custody signed and recorded."
      ],
      steps: [
        "Step 1 – Collapse Identified: Bystander alerts security; location and time documented in Siratech duty log.",
        "Step 2 – First Response: Nearest clinical staff initiates CPR; AED retrieved from lobby station and applied; rhythm analysed.",
        "Step 3 – Paramedic Arrival: AMH paramedics arrive on scene; assume ACLS; advanced airway and IV access established; interventions documented.",
        "Step 4 – Duty Manager Activation: Duty Manager notified; confirms AMH ED non-operational; makes formal decision to transfer to KFSHRC; entry made in Siratech.",
        "Step 5 – KFSHRC Notification: Duty Manager contacts KFSHRC ED; communicates patient age, arrest rhythm, interventions, ETA; KFSHRC acceptance confirmed and logged.",
        "Step 6 – Pre-hospital Documentation: Paramedic completes Siratech pre-hospital care report: response time, CPR duration, shocks delivered, medications given, current status.",
        "Step 7 – Transfer: Patient loaded into AMH ambulance with continuous monitoring; en route ACLS maintained; on arrival at KFSHRC, structured ISBAR handover delivered; chain of custody form signed by both teams."
      ],
      debriefTopics: [
        "Was the emergency response activated promptly and was the first responder chain clearly understood by all staff?",
        "Was the AED accessible and applied within the 3-minute target from time of collapse?",
        "Was the Duty Manager's decision to divert to KFSHRC made efficiently and documented in Siratech?",
        "Was KFSHRC notified in advance with sufficient clinical detail to prepare for the patient's arrival?",
        "Was the pre-hospital care report completed in Siratech before the ambulance departed?",
        "Was the ISBAR handover and chain of custody documentation complete and signed at KFSHRC?"
      ]
    }
  },

  // ── Scenario 22 ──────────────────────────────────────────────
  {
    id: "ICU-TO-OR",
    code: "ICU-OR",
    title: "ICU to OR — Emergency Surgery",
    department: "ICU / Operating Room",
    timing: { setup: 25, execution: 45, debrief: 25 },
    groups: ["ICU Physicians & Anaesthesiologist", "ICU Nursing", "OR Nursing & Surgeon", "Pharmacy", "IT/Health IT (Siratech)"],
    goal: "Validate the emergency transfer of a critically ill ICU patient to the OR for unplanned surgery, including rapid preparation, HIS documentation, and safe handover under time-critical conditions.",
    content: {
      vignette: "52-year-old male, ICU Day 3 post-abdominal aortic aneurysm repair, develops abdominal compartment syndrome with bladder pressure 28 mmHg. Surgeon determines emergency decompressive laparotomy required. ICU-to-OR transfer must be completed urgently.",
      patient: { age: 52, pmh: "Post-AAA repair Day 3, CKD Stage 2, AF", allergies: "Heparin (HIT history)", vitals: "HR 124 bpm | BP 84/50 (on Noradrenaline) | SpO2 91% (FiO2 0.7) | Bladder pressure 28 mmHg" },
      objectives: [
        "HIT Alert: Confirm Heparin allergy/HIT flag active and visible in Siratech for OR team.",
        "Emergency OR Booking: Surgeon enters emergency OR booking in Siratech; OR confirms availability.",
        "ICU Preparation: ICU nurse documents pre-transfer preparation and current medication infusions.",
        "Anaesthesia Briefing: ICU anaesthesiologist provides formal briefing; documented in HIS.",
        "Intraoperative Anticoagulation: Alternative anticoagulant (Bivalirudin) ordered and verified given HIT history."
      ],
      steps: [
        "Step 1 – Decision: Surgeon documents indication for emergency laparotomy; emergency OR booking entered.",
        "Step 2 – HIT Alert: ICU nurse confirms HIT flag active; alerts OR pharmacist and anaesthesiologist.",
        "Step 3 – Infusion Documentation: All current vasopressor and sedation infusions documented in Siratech.",
        "Step 4 – Consent: Emergency consent documented by surgeon in HIS.",
        "Step 5 – Transfer: Patient transferred on ICU ventilator with full monitoring; HIS location updated.",
        "Step 6 – OR Handover: ICU anaesthesiologist hands over to OR anaesthesiologist via ISBAR in HIS.",
        "Step 7 – Anticoagulation: Bivalirudin order verified by pharmacist; Heparin explicitly excluded in HIS."
      ],
      debriefTopics: [
        "Was the HIT allergy flag clearly communicated to all OR team members via Siratech?",
        "Was Heparin safely excluded and an alternative anticoagulant ordered and verified?",
        "Was the emergency OR booking and ICU-to-OR transfer completed within an acceptable timeframe?",
        "Were all ICU infusions documented and reconciled accurately for the OR team?"
      ]
    }
  },

  // ── Scenario 24 ──────────────────────────────────────────────
  {
    id: "OPD-CASH-PAYMENT",
    code: "OPD-Cash",
    title: "OPD Cash Payment — Non-Insured & Copay Patients",
    department: "Outpatient / Patient Services / Billing & Registration",
    timing: { setup: 15, execution: 35, debrief: 20 },
    groups: ["OPD Receptionist / Patient Services", "OPD Nurse", "OPD Physician", "Cashier / Finance", "IT/Health IT (Siratech)"],
    goal: "Validate the end-to-end cash payment workflow for non-insured patients and insured patients with copayment obligations presenting for simple OPD clinic visits, including registration, billing, payment collection, receipt issuance, and Siratech documentation.",
    content: {
      vignette: "A 34-year-old non-insured walk-in patient presents to the OPD reception requesting a general practice consultation. A second scenario strand involves an insured patient with a 20% copayment liability for a specialist visit. Both patients require registration, service pricing, cash collection, receipt generation, and Siratech financial closure before they are seen by the physician.",
      patient: { age: 34, pmh: "None", allergies: "NKDA", vitals: "Stable — not acutely unwell" },
      objectives: [
        "Registration: OPD receptionist registers non-insured and copay patients accurately in Siratech, selecting correct payer type (cash / self-pay / copay).",
        "Service Pricing: Correct consultation and applicable service fees are identified and communicated to the patient prior to service delivery.",
        "Cash Collection: Cashier receives payment, issues a system-generated receipt with correct patient and service details.",
        "Copay Calculation: For insured patients, the system correctly calculates and isolates the copay amount due from the patient.",
        "Receipt & Documentation: Receipt is printed with hospital logo, patient identifier, itemised charges, and payment method; transaction recorded and closed in Siratech.",
        "POS / Cashier Handoff: Workflow between reception, nurse, physician, and cashier is sequenced correctly with no dead-ends or handover gaps."
      ],
      steps: [
        "Step 1 – Patient Arrival: Patient presents at OPD reception; receptionist confirms insurance status and selects correct payer category in Siratech.",
        "Step 2 – Service Selection & Pricing: Receptionist or cashier identifies applicable services; fee schedule is confirmed in the system and communicated to the patient.",
        "Step 3 – Pre-Payment / Copay Collection: Cashier collects the required amount (full cash or copay); payment is entered in Siratech and POS system.",
        "Step 4 – Receipt Issuance: System generates and prints itemised receipt with hospital logo, patient name, MRN/barcode, service details, and amount paid.",
        "Step 5 – Physician Visit: Patient proceeds to clinic after payment is confirmed; physician documents the encounter and any orders in Siratech.",
        "Step 6 – Financial Closure: All charges are posted and reconciled in Siratech; cashier confirms end-of-transaction report matches collected amounts."
      ],
      debriefTopics: [
        "Was the correct payer type (cash / copay) selected at registration without confusion?",
        "Was the fee communicated to the patient before service delivery?",
        "Was the POS or cashier system available and functioning, and was the receipt generated correctly?",
        "For copay patients, did the system correctly calculate the patient-due portion?",
        "Were there any handover gaps between reception, cashier, and clinical team?",
        "Was the Siratech financial transaction posted, closed, and reconcilable?"
      ]
    }
  },

  // ── Scenario 25 ──────────────────────────────────────────────
  {
    id: "ICU-TO-RADIOLOGY",
    code: "ICU-Rad",
    title: "ICU to Radiology Transfer",
    department: "Intensive Care Unit / Radiology",
    timing: { setup: 20, execution: 40, debrief: 20 },
    groups: ["ICU Physicians & Nursing", "Respiratory Therapy", "Radiology Technicians", "Patient Transport", "IT/Health IT (Siratech)"],
    goal: "Validate the safe transfer of a critically ill, monitored ICU patient to Radiology for urgent imaging — including imaging order and prioritisation, pre-transport risk assessment, continuous monitoring and airway management during transport, image acquisition, and result reporting within Siratech HIS/RIS.",
    content: {
      vignette: "61-year-old male in the ICU, intubated and mechanically ventilated following severe community-acquired pneumonia, develops an acute fall in oxygen saturation with asymmetric chest expansion. The intensivist orders an urgent CT chest to exclude a large pneumothorax or worsening consolidation. As CT cannot be performed at the bedside, the patient must be transferred to Radiology with full monitoring, ventilator support, and an accompanying ICU team.",
      patient: { age: 61, pmh: "Severe community-acquired pneumonia, intubated & ventilated, septic shock on noradrenaline", allergies: "NKDA", vitals: "HR 121 bpm | BP 96/54 (on noradrenaline) | SpO2 88% on FiO2 0.8 | Ventilated (SIMV) | Sedated RASS -4" },
      objectives: [
        "Imaging Order: Intensivist enters the urgent CT chest order in Siratech with correct priority and clinical indication.",
        "Transport Risk Assessment: ICU nurse completes and documents a pre-transport risk assessment (airway, haemodynamics, infusions, oxygen reserve).",
        "Team & Equipment: Transport ventilator, full monitoring, emergency airway kit, and infusion pumps confirmed; accompanying physician/RT assigned.",
        "Continuous Monitoring: Vital signs and ventilator settings maintained and documented throughout transfer with no monitoring gaps.",
        "Radiology Handover: Structured ISBAR handover to the radiology team; contrast/renal status and isolation needs communicated.",
        "Result Communication: Radiologist report auto-populates the intensivist's Siratech worklist; critical findings escalated immediately.",
        "Safe Return: Patient returned to ICU; post-transport reassessment and documentation completed."
      ],
      steps: [
        "Step 1 – Order: Intensivist enters the urgent CT chest order with indication (desaturation, query pneumothorax) and priority in Siratech.",
        "Step 2 – RIS Scheduling: Radiology acknowledges the urgent order in RIS; slot confirmed and ETA communicated to ICU.",
        "Step 3 – Pre-transport Assessment: ICU nurse documents airway, haemodynamic stability, infusion list, and oxygen calculation; intensivist signs off fitness for transfer.",
        "Step 4 – Preparation: Transport ventilator and monitor connected; emergency drugs and airway kit checked; accompanying ICU physician/RT assigned.",
        "Step 5 – Transport: Patient transferred with continuous monitoring; HIS patient location updated; vitals documented en route.",
        "Step 6 – Imaging: CT performed; ICU team maintains airway and haemodynamics; images uploaded to PACS.",
        "Step 7 – Report: Radiologist reviews and signs the report in Siratech; any critical finding phoned to the intensivist and logged.",
        "Step 8 – Return & Reassess: Patient returned to ICU; post-transport reassessment, ventilator reconnection, and documentation completed."
      ],
      debriefTopics: [
        "Was the imaging order correctly prioritised and acknowledged in the RIS without delay?",
        "Was a documented pre-transport risk assessment completed before the patient left the ICU?",
        "Was monitoring and ventilation continuous and documented throughout the transfer, with no gaps?",
        "Was the ISBAR handover to Radiology complete (infusions, airway, contrast/renal status, isolation)?",
        "Were critical results escalated to the intensivist promptly and logged in Siratech?",
        "Were any equipment, staffing, lift/route, or system constraints identified during transport?"
      ]
    }
  },

  // ── Scenario 26 ──────────────────────────────────────────────
  {
    id: "IP-CONSULT-TO-OR",
    code: "IP-OR",
    title: "Inpatient Surgical Consult to Emergency OR",
    department: "Medical-Surgical Ward / Operating Room",
    timing: { setup: 20, execution: 45, debrief: 25 },
    groups: ["Internal Medicine Team", "Surgery Team", "Anaesthesiology", "Ward & OR Nursing", "Pharmacy", "IT/Health IT (Siratech)"],
    goal: "Validate the operational pathway from an inpatient surgical consult request to emergency OR execution — testing system readiness, interdepartmental communication, and HIS documentation at each handover point.",
    content: {
      vignette: "48-year-old female, Day 2 of an Internal Medicine admission for pneumonia, develops worsening abdominal pain and distension with fever and a rising white-cell count. CT shows a closed-loop bowel obstruction. The surgical team is consulted and the surgeon decides an emergency laparotomy is required, triggering an urgent ward-to-OR pathway.",
      patient: { age: 48, pmh: "Day 2 admission under Internal Medicine for pneumonia", allergies: "NKDA", vitals: "HR 112 bpm | BP 104/62 | Temp 38.6 C | abdominal distension and guarding | WBC rising" },
      objectives: [
        "Consult Workflow: Internal Medicine raises a surgical consult in Siratech; Surgery and Anaesthesia respond and document within target time.",
        "Emergency OR Booking: Surgeon enters the emergency OR booking in Siratech; OR confirms room and team readiness.",
        "Consent & Pre-op: Informed consent obtained and pre-operative documentation completed in HIS.",
        "Ward-OR Nursing Workflow: Pre-op preparation and nursing handover between ward and OR completed and documented.",
        "Safe Transfer: Patient transferred ward-to-OR with a structured ISBAR handover recorded in Siratech."
      ],
      steps: [
        "Step 1 - Deterioration & Assessment: Ward team reviews the patient; abdominal findings and rising WBC documented; CT result reviewed in Siratech.",
        "Step 2 - Surgical Consult: IM raises a surgical consult in Siratech; surgeon reviews and documents findings and the decision for emergency laparotomy.",
        "Step 3 - Anaesthesia Review: Anaesthesia consulted; rapid pre-operative assessment completed and documented.",
        "Step 4 - Emergency OR Booking: Surgeon enters emergency OR booking; OR charge nurse confirms room, team, and instrument readiness.",
        "Step 5 - Consent & Pre-op: Informed consent obtained and scanned; pre-op checklist, labs, and group-and-save completed in HIS.",
        "Step 6 - Ward Preparation: Ward nursing completes pre-op preparation; medications reconciled; site and identity confirmed.",
        "Step 7 - Transfer & Handover: Patient transferred to OR; ISBAR handover from ward to OR nursing and anaesthesia documented in Siratech."
      ],
      debriefTopics: [
        "Was the surgical consult raised and responded to within an acceptable time, with clear documentation?",
        "Was the emergency OR booking completed in Siratech and confirmed by the OR team without delay?",
        "Was consent and pre-operative documentation complete before transfer?",
        "Was the ward-to-OR ISBAR handover structured and recorded?",
        "Were any interdepartmental communication or system gaps identified between IM, Surgery, Anaesthesia, and OR?"
      ]
    }
  },

  // ── Scenario 27 ──────────────────────────────────────────────
  {
    id: "OPD-TO-INPATIENT",
    code: "OPD-IP",
    title: "OPD to Inpatient Admission",
    department: "Outpatient / Admissions / Inpatient Ward",
    timing: { setup: 15, execution: 35, debrief: 20 },
    groups: ["OPD Physician & Nursing", "Admission Office / Patient Services", "Inpatient Ward Nursing", "Bed Management", "IT/Health IT (Siratech)"],
    goal: "Test the workflow and readiness to transfer an outpatient to the inpatient ward through the admission office — ensuring a clear pathway and that all required logistics are in place.",
    content: {
      vignette: "31-year-old female presents to the OB-GYN outpatient clinic with vaginal discharge and mild bleeding. After examination, the clinic physician decides she requires a direct admission to the inpatient ward. The admission must flow from OPD through the admission office to an allocated ward bed.",
      patient: { age: 31, pmh: "Nil significant", allergies: "NKDA", vitals: "Haemodynamically stable | mild PV bleeding" },
      objectives: [
        "Admission Decision: OPD physician documents the admission decision and diagnosis in Siratech and initiates the admission request.",
        "Admission Office Workflow: Admission office processes the request, registers the inpatient encounter, and assigns admission type.",
        "Bed & Logistics Readiness: Ward bed, nursing, and required logistics confirmed available before transfer.",
        "Orders & Handover: Admission orders entered; OPD-to-ward clinical handover completed and documented.",
        "Safe Transfer: Patient transferred from OPD to the ward with identity and documentation reconciled in HIS."
      ],
      steps: [
        "Step 1 - Clinical Decision: OPD physician documents findings and the decision to admit in Siratech.",
        "Step 2 - Admission Request: Admission request raised in the system with admitting service and provisional diagnosis.",
        "Step 3 - Admission Office: Admission office verifies details, registers the inpatient encounter, and assigns admission type.",
        "Step 4 - Bed Allocation: Bed management allocates a ward bed; ward nursing notified and confirms readiness.",
        "Step 5 - Orders: Admitting team enters admission orders (investigations, medications, observations) in HIS.",
        "Step 6 - Handover: OPD nurse gives ISBAR handover to ward nursing; documentation transferred.",
        "Step 7 - Transfer: Patient escorted to the ward; identity, wristband, and HIS location updated."
      ],
      debriefTopics: [
        "Was the admission decision and request raised clearly and promptly in Siratech?",
        "Was the admission office workflow smooth, with correct encounter registration and admission type?",
        "Was a ward bed allocated and confirmed ready before the patient was transferred?",
        "Were admission orders entered and the OPD-to-ward handover documented?",
        "Were any logistics, bed-availability, or system gaps identified in the OPD-to-inpatient pathway?"
      ]
    }
  },

  // ── Scenario 28 ──────────────────────────────────────────────
  {
    id: "STEMI-PATHWAY",
    code: "STEMI",
    title: "STEMI Pathway",
    department: "Emergency Department / Inpatient / Inter-facility Transfer",
    file: "STEMI_Transfer_Pathway_AMH_to_KFSHRC.pdf",
    timing: { setup: 30, execution: 60, debrief: 30 },
    groups: ["Emergency Department (Physicians, Nursing)", "Inpatient Ward & On-call Team", "MRP (Emergency / Inpatient)", "EMS & Transfer Escort", "KFSHRC Interventionist (simulated)", "IT/Health IT (Siratech)"],
    goal: "Validate the agreed AMH-to-KFSHRC STEMI transfer pathway for primary PCI — testing recognition, MRP escalation, interventionist communication, cath lab activation, EMS transfer, and structured DEM handover against time-critical reperfusion targets.",
    content: {
      vignette: "A patient with suspected STEMI is identified at Almathar Hospital. AMH does not perform primary PCI, so the pathway requires rapid recognition, MRP confirmation, direct escalation to the KFSHRC on-call interventionist with the ECG shared to the agreed WhatsApp group, acceptance for primary PCI, and EMS transfer to the KFSHRC DEM under continuous monitoring. The scenario may be run from either entry point — Emergency Department or Inpatient ward — to test both arms of the pathway.",
      patient: { age: "Adult", pmh: "Cardiac risk factors", allergies: "NKDA", vitals: "Ischaemic chest pain | 12-lead ECG showing ST elevation | haemodynamics to be documented at first medical contact" },
      objectives: [
        "Recognition & First ECG: Suspected STEMI identified and a 12-lead ECG acquired and interpreted within the pathway target; patient moved to a monitored bed.",
        "MRP Confirmation & Escalation: Emergency or Inpatient MRP confirms STEMI, calls the KFSHRC on-call interventionist, and posts the ECG to the agreed WhatsApp group.",
        "Interventionist Decision: Acceptance for primary PCI obtained and time-stamped from the moment the ECG was posted.",
        "Parallel Activation: Cath lab activation, stabilisation and STEMI medications, IV access, monitoring, and EMS activation proceed in parallel rather than in sequence.",
        "Transfer & DIDO: Door-in door-out achieved within target, with EMS transfer to KFSHRC DEM under continuous monitoring and appropriate escort.",
        "Handover & Close-out: Structured handover at DEM to the cath lab per established KFSHRC workflow; all pathway time-stamps captured for the QI feedback loop."
      ],
      steps: [
        "Step 1 - Identification: Suspected STEMI recognised at the entry point (ED presentation, or ward / on-call team for an inpatient).",
        "Step 2 - ECG: 12-lead ECG obtained; for the inpatient arm the patient is moved to a monitored bed.",
        "Step 3 - MRP Confirmation: Emergency or Inpatient MRP reviews and confirms STEMI.",
        "Step 4 - Interventionist Communication: MRP calls the KFSHRC on-call interventionist and posts the ECG to the WhatsApp group; decision time-stamp starts.",
        "Step 5 - Decision: Interventionist accepts for primary PCI. (If not accepted, the case follows the fallback protocol — see debrief; this branch is still pending CMO definition.)",
        "Step 6 - Parallel Activation & Prep: Interventionist activates the KFSHRC cath lab while the MRP completes stabilisation, STEMI medications, IV access, and monitoring; EMS activated.",
        "Step 7 - EMS Transfer: Patient transferred to KFSHRC DEM with continuous monitoring and escort.",
        "Step 8 - Handover: Structured handover at DEM to cath lab per established KFSHRC workflow.",
        "Step 9 - Close-out: Pathway time-stamps captured and documented; QI feedback loop closed."
      ],
      debriefTopics: [
        "Was the first ECG acquired and interpreted within target from first medical contact, in both the ED and inpatient arms?",
        "How long did the interventionist decision take from the moment the ECG was posted, and was the WhatsApp escalation reliable?",
        "Was door-in door-out (DIDO) achieved within target, and where did the time actually go?",
        "Did cath lab activation, stabilisation, and EMS activation genuinely run in parallel, or did they queue behind one another?",
        "Was EMS activation-to-departure timely, and was monitoring and escort appropriate throughout transfer?",
        "Was the DEM handover structured and complete, and were all pathway time-stamps captured for QI?",
        "The fallback branch for a non-accepted case is undefined — what should happen, and who decides? (Open item pending CMO definition.)",
        "Were KPI targets (first ECG, decision time, DIDO, EMS activation-to-departure, FMC-to-device) realistic for AMH, and do they need adjusting from the standard reperfusion benchmarks?"
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
const _store = { sessions: [], gaps: [], weekOffset: 0, customScenarios: [] };
let _db = null;
// SAFETY FLAG: only becomes true after a successful cloud read. No write to the
// cloud is permitted until then — this prevents an empty/half-loaded app from
// overwriting (wiping) the real data when the initial load fails or is slow.
let _loaded = false;

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
  if (!_loaded) {
    // Refuse to write before a confirmed successful load — guards against
    // overwriting good cloud data with an empty/half-initialised _store.
    console.warn("SimTrack: write blocked — data not loaded from cloud yet.");
    return;
  }
  _db.collection("simtrack").doc("data").set({
    sessions: _store.sessions,
    gaps: _store.gaps,
    weekOffset: _store.weekOffset,
    customScenarios: _store.customScenarios
  }).catch(e => console.error("Firestore write error:", e));
  autoSnapshot();
}

// ── Backup & Restore ──────────────────────────────────────────
function exportBackupObject() {
  return {
    app: "SimTrack", version: 1,
    exportedAt: new Date().toISOString(),
    sessions: _store.sessions,
    gaps: _store.gaps,
    customScenarios: _store.customScenarios,
    weekOffset: _store.weekOffset
  };
}

function restoreFromBackup(obj) {
  if (!obj || !Array.isArray(obj.gaps) || !Array.isArray(obj.sessions)) {
    throw new Error("Not a valid SimTrack backup file.");
  }
  _store.sessions = obj.sessions || [];
  _store.gaps = obj.gaps || [];
  _store.customScenarios = obj.customScenarios || [];
  _store.weekOffset = obj.weekOffset || 0;
  _firestoreWrite(); // guarded by _loaded
  return { sessions: _store.sessions.length, gaps: _store.gaps.length, customScenarios: _store.customScenarios.length };
}

// Keeps a local last-known-good copy on every save, and writes one off-device
// cloud backup per day. Never snapshots an empty store.
function autoSnapshot() {
  if (!_loaded) return;
  if ((_store.gaps.length + _store.sessions.length) === 0) return;
  const snap = exportBackupObject();
  try { localStorage.setItem("simtrack_snapshot", JSON.stringify(snap)); } catch (e) {}
  const today = new Date().toISOString().slice(0, 10);
  try {
    if (_db && localStorage.getItem("simtrack_lastBackupDay") !== today) {
      _db.collection("simtrack").doc("backup-" + today).set(snap)
        .then(() => localStorage.setItem("simtrack_lastBackupDay", today))
        .catch(e => console.warn("Daily cloud backup failed:", e));
    }
  } catch (e) {}
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

  // Try up to 3 times before giving up — a transient network hiccup must NOT
  // be allowed to drop us into an empty, write-enabled state.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const doc = await _db.collection("simtrack").doc("data").get();
      if (doc.exists) {
        const d = doc.data();
        _store.sessions = d.sessions || [];
        _store.gaps = d.gaps || [];
        _store.weekOffset = d.weekOffset || 0;
        _store.customScenarios = d.customScenarios || [];
      }
      // Successful read (even a brand-new install with no doc) — safe to write now.
      _loaded = true;

      // Auto-migrate: remove custom entries whose titles now exist as built-ins,
      // and remap any session/gap scenarioId references to the new built-in ID.
      const titleToBuiltinId = Object.fromEntries(
        SCENARIOS.map(s => [s.title.toLowerCase().trim(), s.id])
      );
      const idRemap = {}; // oldCustomId -> newBuiltinId
      _store.customScenarios.forEach(s => {
        if (s.isOverride) return;
        const builtinId = titleToBuiltinId[(s.title || "").toLowerCase().trim()];
        if (builtinId) idRemap[s.id] = builtinId;
      });
      if (Object.keys(idRemap).length > 0) {
        _store.sessions = _store.sessions.map(s =>
          idRemap[s.scenarioId] ? { ...s, scenarioId: idRemap[s.scenarioId] } : s
        );
        _store.gaps = _store.gaps.map(g =>
          idRemap[g.scenarioId] ? { ...g, scenarioId: idRemap[g.scenarioId] } : g
        );
      }
      const before = _store.customScenarios.length;
      _store.customScenarios = _store.customScenarios.filter(s =>
        s.isOverride || !titleToBuiltinId[(s.title || "").toLowerCase().trim()]
      );
      if (_store.customScenarios.length !== before || Object.keys(idRemap).length > 0) _firestoreWrite();

      autoSnapshot(); // capture last-known-good + once-daily off-device backup
      return true; // loaded OK
    } catch (e) {
      console.error(`Firestore load attempt ${attempt} failed:`, e);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1200 * attempt));
    }
  }
  // All attempts failed: leave _loaded = false so writes stay blocked.
  return false;
}

// ── Custom Scenarios ──────────────────────────────────────────
function getCustomScenarios() { return _store.customScenarios; }

function getAllScenarios() {
  // Custom entries with same ID override the built-in scenario
  const customIds = new Set(_store.customScenarios.map(s => s.id));
  return [...SCENARIOS.filter(s => !customIds.has(s.id)), ..._store.customScenarios];
}

function addCustomScenario(sc) {
  _store.customScenarios.push(sc);
  _firestoreWrite();
}

function deleteCustomScenario(id) {
  _store.customScenarios = _store.customScenarios.filter(s => s.id !== id);
  _firestoreWrite();
}

function updateOrOverrideScenario(id, changes) {
  const existingIdx = _store.customScenarios.findIndex(s => s.id === id);
  if (existingIdx !== -1) {
    // Update existing custom/override entry
    _store.customScenarios[existingIdx] = { ..._store.customScenarios[existingIdx], ...changes };
  } else {
    // Built-in scenario — create an override copy in customScenarios
    const builtin = SCENARIOS.find(s => s.id === id);
    if (builtin) {
      _store.customScenarios.push({ ...builtin, ...changes, isOverride: true });
    }
  }
  _firestoreWrite();
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

// Re-create a session under a different scenario, remapping all gap references.
// Returns the new session ID, or null if oldId not found.
function reassignSession(oldId, newScenarioId) {
  const sessions = _store.sessions;
  const idx = sessions.findIndex(s => s.id === oldId);
  if (idx === -1) { console.error("reassignSession: session not found:", oldId); return null; }

  // Generate a new ID based on the new scenario and current count for that scenario
  const newId = generateSessionId(newScenarioId, sessions.filter(s => s.id !== oldId));

  // Update the session in place with new id + new scenarioId
  sessions[idx] = { ...sessions[idx], id: newId, scenarioId: newScenarioId };

  // Remap all gaps that referenced the old session ID
  _store.gaps = _store.gaps.map(g =>
    g.sessionId === oldId ? { ...g, sessionId: newId } : g
  );

  saveSessions(sessions);
  _firestoreWrite();
  console.log(`reassignSession: ${oldId} → ${newId} (scenario: ${newScenarioId})`);
  return newId;
}

// ── Bulk Historical Import ────────────────────────────────────
// importData: { sessions: [...], gaps: [...] }
// Each session: { scenarioId, date, status, time?, leader?, participants?, location? }
// Each gap:     { sessionIdx (index into importData.sessions), description, category, priority, status }
function bulkImport(importData) {
  const now = new Date().toISOString();

  // 1. Tag existing sessions with a tempId equal to their current id
  const existing = _store.sessions.map(s => ({ ...s, _tid: s.id }));

  // 2. Tag imported sessions with a unique tempId
  const incoming = (importData.sessions || []).map((s, i) => ({
    scenarioId: s.scenarioId,
    date: s.date,
    status: s.status || "completed",
    time: s.time || "",
    leader: s.leader || "",
    participants: s.participants || "",
    location: s.location || "",
    loggedBy: "Historical Import",
    createdAt: now,
    _tid: `__IMP_${i}`
  }));

  // 3. Merge and sort chronologically by date (stable: existing order preserved within same date)
  const merged = [...existing, ...incoming];
  merged.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // 4. Re-generate IDs within each scenario group in date order
  const scenarioCounts = {};
  const idMap = {}; // _tid -> new id
  merged.forEach(s => {
    const n = (scenarioCounts[s.scenarioId] || 0) + 1;
    scenarioCounts[s.scenarioId] = n;
    const sc = getScenarioById(s.scenarioId);
    const code = sc?.code || s.scenarioId.replace(/-/g, "_");
    const newId = `${code}-${String(n).padStart(2, "0")}`;
    idMap[s._tid] = newId;
    s.id = newId;
    delete s._tid;
  });

  // 5. Remap existing gap sessionId references to new ids
  const updatedGaps = _store.gaps.map(g => ({
    ...g,
    sessionId: idMap[g.sessionId] || g.sessionId
  }));

  // 6. Build new gaps from import payload
  let gapSeq = updatedGaps.length + 1;
  const newGaps = (importData.gaps || []).map(g => ({
    id: `GAP-H${String(gapSeq++).padStart(3, "0")}`,
    description: g.description,
    category: g.category || "General / Other",
    priority: g.priority || "medium",
    status: g.status || "open",
    sessionId: idMap[`__IMP_${g.sessionIdx}`] || null,
    date: (importData.sessions[g.sessionIdx] || {}).date || "",
    loggedBy: "Historical Import",
    comment: g.comment || ""
  }));

  _store.sessions = merged;
  _store.gaps = [...updatedGaps, ...newGaps];
  _firestoreWrite();

  return {
    sessionsImported: incoming.length,
    gapsImported: newGaps.length,
    idMap
  };
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
    if (g.scenarioId === scenarioId) return true;
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

// Format a local Date object as "YYYY-MM-DD" using local timezone (not UTC)
function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns array of {name, dateStr, date, weekend} for Sun–Sat
function getWorkWeekDays(offset = 0) {
  const sunday = getSundayOfWeek(offset);
  const days = [];
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = localDateStr(d);   // ← local timezone, not UTC
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
  return dateStr === localDateStr(new Date());   // ← local timezone, not UTC
}

function getScenarioById(id) {
  // Custom/overrides take precedence over built-in
  return _store.customScenarios.find(s => s.id === id) || SCENARIOS.find(s => s.id === id) || null;
}
