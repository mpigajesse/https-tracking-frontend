"use client";

/**
 * Dictionnaire de l'application mobile.
 *
 * Pilotée par la **même langue** que l'application web (`useI18n`), pour qu'un
 * changement de langue d'un côté se reflète de l'autre. Le dictionnaire est
 * séparé de `src/lib/i18n.tsx` afin que les deux surfaces gardent des
 * vocabulaires indépendants sans se marcher dessus.
 *
 * Hors périmètre volontaire : les messages du **journal d'audit**. Ils
 * constituent une trace de conformité adossée au BPMN de référence
 * (rédigé en français) et sont destinés à être produits côté serveur ; les
 * localiser rendrait l'historique incohérent d'un utilisateur à l'autre.
 */

import { useI18n } from "@/lib/i18n";

const fr = {
  /* ── Commun ── */
  cancel: "Annuler",
  search: "Rechercher…",
  noResult: "Aucun résultat",
  loading: "Chargement…",
  minutes: "min",
  seconds: "s",
  by: "par",

  /* ── Navigation ── */
  nav_validate: "À valider",
  nav_presents: "Présents",
  nav_scan: "Scanner",
  nav_alerts: "Alertes",
  nav_history: "Historique",
  nav_profile: "Mon profil",
  nav_settings: "Paramètres",

  /* ── Rôles ── */
  role_admin: "Administrateur",
  role_receptionniste: "Réceptionniste",
  allSites: "Tous les sites",

  /* ── Statuts de session ── */
  st_en_attente_ouverture: "En attente d'ouverture",
  st_refusee: "Annulée / Refusée",
  st_ouverte: "Ouverte / En cours",
  st_en_pause: "En pause",
  st_pause_timeout: "Pause — timeout dépassé",
  st_en_attente_cloture: "En attente de clôture",
  st_en_litige: "En litige",
  st_cloturee_validee: "Clôturée / Validée",
  st_cloturee_timeout: "Clôturée (timeout pause)",
  st_cloturee_auto: "Clôturée automatiquement",

  /* ── Types de scan ── */
  scan_entree: "Entrée",
  scan_depart_pause: "Départ en pause",
  scan_retour_pause: "Retour de pause",
  scan_sortie: "Sortie",

  /* ── Couloirs BPMN ── */
  lane_interimaire: "Intérimaire",
  lane_systeme: "Système",
  lane_valideur: "Valideur",

  /* ── Connexion ── */
  login_l1: "Poste de",
  login_l2: "pointage",
  login_desc:
    "Enregistrement des scans, contrôle d'identité et clôture des sessions intérimaires. Connectez-vous avec votre matricule Lear.",
  login_matricule: "Matricule",
  login_code: "Code à 4 chiffres",
  login_submit: "Se connecter",
  login_demo: "Comptes de démonstration",
  login_demoNote:
    "Authentification simulée. Code commun : 1234. À remplacer par l'authentification réelle avant toute mise en production.",

  /* ── File de validation ── */
  home_openings: "Ouvertures — contrôle d'identité",
  home_closures: "Clôtures — contrôle de durée",
  home_emptyTitle: "File vide",
  home_emptyDesc:
    "Aucune demande d'ouverture ni de clôture en attente. Les nouvelles demandes arrivent ici en temps réel.",
  home_scanAt: "Scan",
  home_waiting: "attente",
  home_exitAt: "Sortie",
  home_gross: "brut",

  /* ── Poste de scan ── */
  scan_title: "Poste de scan",
  scan_subtitle: "lecteur QR",
  scan_hint:
    "Sélectionnez l'intérimaire qui présente son QR Code. L'horodatage est pris côté serveur : il ne peut pas être modifié depuis le mobile.",
  scan_searchPlaceholder: "Rechercher un intérimaire…",
  scan_listTitle: "Intérimaires",
  scan_simTitle: "Simuler un échec des contrôles automatiques",
  scan_simNone: "Aucun — contrôles conformes",
  scan_simNote:
    "Le réglage s'applique au prochain scan d'entrée uniquement. Outil de démonstration, à retirer avec le branchement du backend.",
  scan_recording: "Lecture…",
  act_entree: "Enregistrer l'entrée",
  act_depart_pause: "Enregistrer le départ en pause",
  act_retour_pause: "Enregistrer le retour de pause",
  act_awaitValidation: "En attente de validation",
  act_awaitValidationWhy: "Le contrôle d'identité doit être effectué avant tout autre scan.",
  act_timeoutBlocked: "Retour bloqué — timeout",
  act_timeoutBlockedWhy:
    "Délai de 40 min dépassé. Arbitrez depuis l'écran Alertes avant de scanner.",
  act_awaitClosure: "Clôture en attente de validation",
  act_awaitClosureWhy: "La sortie est enregistrée, la clôture doit être validée.",
  act_dayDone: "Journée terminée",
  act_dayDoneWhy: "La session du jour est close.",
  scan_cancelRead: "Annuler la lecture",
  scan_phase1: "Présentation du QR Code…",
  scan_phase2: "QR Code détecté",
  scan_phase3: "Déchiffrement du jeton…",
  scan_phase4: "Jeton valide",
  scan_tokenNote: "Jeton à usage unique · validité {n} s · horodatage serveur",
  scan_noSession: "Aucune session active pour cet intérimaire.",
  scan_entryOk: "Entrée enregistrée — en attente du contrôle d'identité",
  scan_refused: "Accès refusé",
  scan_recorded: "enregistré",

  /* ── Validation ── */
  val_identity: "Contrôle d'identité",
  val_closure: "Contrôle de clôture",
  val_notFound: "Cette session n'existe plus, a déjà été traitée, ou ne relève pas de votre site.",
  val_doubleTitle: "Double validation — contrôle humain",
  val_doubleDesc:
    "Les contrôles automatiques sont déjà passés. Vérifiez de visu la correspondance photo / personne, la validité de la CIN et l'assurance à jour avant d'ouvrir la session.",
  val_computed: "Durée calculée",
  val_grossMinus: "brut −",
  val_ofPauses: "de pauses",
  val_entry: "Entrée",
  val_exit: "Sortie",
  val_tooLong: "Durée supérieure à {n} h — vérifiez la cohérence avant de valider.",
  val_approveOpen: "Valider l'identité et ouvrir",
  val_approveClose: "Valider la clôture",
  val_refuseOpen: "Refuser l'ouverture",
  val_reportAnomaly: "Signaler une anomalie",
  val_motifOpen: "Motif du refus",
  val_motifAnomaly: "Motif de l'anomalie",
  val_motifDesc: "Le motif est obligatoire et sera journalisé dans l'audit de la session.",
  val_otherMotif: "Autre motif",
  val_motifPlaceholder: "Décrivez précisément le motif…",
  val_confirmRefuse: "Confirmer le refus",
  val_confirmAnomaly: "Confirmer l'anomalie",
  val_openedOk: "Ouverture validée",
  val_closedOk: "Clôture validée",
  val_refusedOk: "Refus enregistré et journalisé",
  val_anomalyOk: "Anomalie signalée — session en litige",
  val_motifRequired: "Un motif est obligatoire.",

  /* ── Identité ── */
  id_cin: "CIN",
  id_insurance: "Assurance",
  id_insuranceUntil: "valide jusqu'au {d}",
  id_assignment: "Affectation",
  id_contractEnd: "Fin de contrat",

  /* ── Alertes ── */
  al_title: "Alertes",
  al_subtitle: "surveillance temps réel",
  al_timeouts: "Timeouts de pause",
  al_disputes: "Sessions en litige",
  al_toCheck: "Clôtures à vérifier",
  al_overrun: "Dépassement",
  al_pauseStart: "Départ en pause",
  al_deadline: "échéance",
  al_decision: "Décision requise",
  al_optA: "Fermer la session",
  al_optA_detail: "Fin fixée à {h}",
  al_optA_detailFallback: "Fin = heure de départ en pause",
  al_optB: "Prolonger le délai",
  al_optB_detail: "+10, 20 ou 30 min · surveillance poursuivie",
  al_optC: "Saisir un retour manuel",
  al_optC_detail: "Justification obligatoire · journalisée",
  al_sheetA_desc:
    "La fin de session sera fixée à l'heure de départ en pause. Un flag « à vérifier » sera posé pour contrôle a posteriori.",
  al_sheetB_desc:
    "L'échéance de retour est recalculée et la surveillance se poursuit. Une nouvelle alerte se déclenchera en cas de nouveau dépassement.",
  al_sheetC_desc:
    "À utiliser si l'intérimaire est revenu sans scanner. La justification est obligatoire et journalisée dans l'audit.",
  al_returnTime: "Heure de retour réelle",
  al_justification: "Justification (obligatoire)",
  al_justifPlaceholder: "Ex. : terminal hors service, l'intérimaire est revenu à l'heure indiquée.",
  al_confirmOption: "Confirmer l'option {o}",
  al_emptyTitle: "Aucune alerte",
  al_emptyDesc: "Toutes les pauses sont dans les temps et aucune session n'est en litige.",
  al_closedFlag: "Session clôturée — flag « à vérifier » posé",
  al_extended: "Délai prolongé de {n} min",
  al_manualOk: "Retour manuel enregistré et justifié",
  al_justifRequired: "Une justification est obligatoire.",
  al_anomalySignaled: "Anomalie signalée",
  al_nonNominal: "Clôture non nominale — corriger l'heure de sortie",

  /* ── Présents ── */
  pr_title: "Présents",
  pr_updated: "mise à jour",
  pr_atPost: "Au poste",
  pr_onPause: "En pause",
  pr_empty: "Personne n'est actuellement présent sur le site.",
  pr_since: "depuis",

  /* ── Historique ── */
  hi_title: "Historique",
  hi_session: "session",
  hi_sessions: "sessions",
  hi_empty: "Aucune session enregistrée pour l'instant.",
  hi_net: "net",
  hi_pause: "pause",
  hi_pauses: "pauses",
  hi_ongoing: "en cours",

  /* ── Détail de session ── */
  de_payable: "Temps réel payable",
  de_opening: "Ouverture",
  de_end: "Fin",
  de_gross: "Durée brute",
  de_totalPauses: "Total pauses",
  de_site: "Site",
  de_openedBy: "Ouverture validée par",
  de_closedBy: "Clôture traitée par",
  de_pausesTitle: "Pauses",
  de_manualReturn: "Retour manuel",
  de_extraGranted: "min accordées",
  de_audit: "Journal d'audit",
  de_events: "événements",
  de_notFound: "Cette session n'existe pas ou ne relève pas de votre site.",
  de_noEvent: "Aucun événement journalisé.",

  /* ── Profil ── */
  pf_handled: "Validations traitées",
  pf_visible: "Sessions visibles",
  pf_scopeTitle: "Périmètre",
  pf_scope: "Portée",
  pf_role: "Rôle",
  pf_openWeb: "Ouvrir la version web",
  pf_logout: "Se déconnecter",

  /* ── Paramètres ── */
  se_title: "Paramètres",
  se_subtitle: "Préférences de l'appareil",
  se_appearance: "Apparence",
  se_theme: "Thème",
  se_light: "Clair",
  se_dark: "Sombre",
  se_auto: "Système",
  se_themeNote: "Le mode Système suit le réglage de votre téléphone.",
  se_language: "Langue",
  se_langNote: "La langue est partagée avec l'application web.",
  se_notifications: "Notifications",
  se_notifTimeout: "Alertes de timeout de pause",
  se_notifValidation: "Demandes de validation",
  se_notifAutoClose: "Clôtures automatiques à 23:30",
  se_station: "Poste de scan",
  se_sound: "Son de confirmation au scan",
  se_haptic: "Retour haptique",
  se_keepAwake: "Garder l'écran allumé",
  se_stationNote:
    "Ces réglages sont enregistrés sur cet appareil uniquement. Le son et le retour haptique nécessiteront l'application native.",
  se_rules: "Règles du processus",
  se_pauseTimeout: "Timeout de pause",
  se_tokenValidity: "Validité du jeton QR",
  se_dayCutoff: "Clôture du jour comptable",
  se_rulesNote: "Réglages définis par l'administration, non modifiables depuis le mobile.",
  se_about: "À propos",
  se_version: "Version",
  se_reference: "Référence",
  se_saved: "Préférence enregistrée",

  /* ── Erreurs métier de la machine à états ── */
  err_notAwaitingOpen: "Cette session n'attend pas d'ouverture.",
  err_motifRequired: "Un motif de refus est obligatoire.",
  err_needOpenSession: "Une session ouverte est nécessaire pour partir en pause.",
  err_timeoutBlocked: "Timeout dépassé : un valideur doit statuer sur le retour.",
  err_noPause: "Aucune pause n'est en cours.",
  err_endPauseFirst: "Terminez la pause avant de scanner la sortie.",
  err_noOpenSession: "Aucune session ouverte à clôturer.",
  err_noTimeout: "Aucun timeout à arbitrer.",
  err_justifRequired: "Une justification est obligatoire.",
  err_notAwaitingClose: "Cette session n'attend pas de clôture.",
  err_alreadyClosed: "Session déjà close.",
  err_ctrlEntryOnly: "Les contrôles automatiques s'appliquent au scan d'entrée uniquement.",
  err_badCredentials: "Matricule ou code incorrect.",
  err_accountNotFound: "Compte introuvable.",
} as const;

const en: Record<keyof typeof fr, string> = {
  cancel: "Cancel",
  search: "Search…",
  noResult: "No results",
  loading: "Loading…",
  minutes: "min",
  seconds: "s",
  by: "by",

  nav_validate: "To validate",
  nav_presents: "On site",
  nav_scan: "Scan",
  nav_alerts: "Alerts",
  nav_history: "History",
  nav_profile: "My profile",
  nav_settings: "Settings",

  role_admin: "Administrator",
  role_receptionniste: "Receptionist",
  allSites: "All sites",

  st_en_attente_ouverture: "Awaiting opening",
  st_refusee: "Cancelled / Refused",
  st_ouverte: "Open / In progress",
  st_en_pause: "On break",
  st_pause_timeout: "Break — timeout exceeded",
  st_en_attente_cloture: "Awaiting closure",
  st_en_litige: "Disputed",
  st_cloturee_validee: "Closed / Validated",
  st_cloturee_timeout: "Closed (break timeout)",
  st_cloturee_auto: "Automatically closed",

  scan_entree: "Entry",
  scan_depart_pause: "Break start",
  scan_retour_pause: "Break return",
  scan_sortie: "Exit",

  lane_interimaire: "Worker",
  lane_systeme: "System",
  lane_valideur: "Validator",

  login_l1: "Time-tracking",
  login_l2: "station",
  login_desc:
    "Scan recording, identity checks and session closure for temporary workers. Sign in with your Lear staff ID.",
  login_matricule: "Staff ID",
  login_code: "4-digit code",
  login_submit: "Sign in",
  login_demo: "Demo accounts",
  login_demoNote:
    "Simulated authentication. Shared code: 1234. Replace with real authentication before any production release.",

  home_openings: "Openings — identity check",
  home_closures: "Closures — duration check",
  home_emptyTitle: "Queue empty",
  home_emptyDesc:
    "No pending opening or closure request. New requests appear here in real time.",
  home_scanAt: "Scan",
  home_waiting: "waiting",
  home_exitAt: "Exit",
  home_gross: "gross",

  scan_title: "Scanning station",
  scan_subtitle: "QR reader",
  scan_hint:
    "Select the worker presenting their QR code. The timestamp is taken server-side and cannot be altered from the phone.",
  scan_searchPlaceholder: "Search for a worker…",
  scan_listTitle: "Workers",
  scan_simTitle: "Simulate an automated check failure",
  scan_simNone: "None — checks passed",
  scan_simNote:
    "The setting applies to the next entry scan only. Demonstration tool, to be removed once the backend is connected.",
  scan_recording: "Reading…",
  act_entree: "Record entry",
  act_depart_pause: "Record break start",
  act_retour_pause: "Record break return",
  act_awaitValidation: "Awaiting validation",
  act_awaitValidationWhy: "The identity check must be completed before any other scan.",
  act_timeoutBlocked: "Return blocked — timeout",
  act_timeoutBlockedWhy: "40 min deadline exceeded. Arbitrate from the Alerts screen before scanning.",
  act_awaitClosure: "Closure awaiting validation",
  act_awaitClosureWhy: "The exit is recorded, the closure must be validated.",
  act_dayDone: "Day finished",
  act_dayDoneWhy: "Today's session is closed.",
  scan_cancelRead: "Cancel reading",
  scan_phase1: "Presenting QR code…",
  scan_phase2: "QR code detected",
  scan_phase3: "Decrypting token…",
  scan_phase4: "Token valid",
  scan_tokenNote: "Single-use token · valid {n} s · server timestamp",
  scan_noSession: "No active session for this worker.",
  scan_entryOk: "Entry recorded — awaiting identity check",
  scan_refused: "Access denied",
  scan_recorded: "recorded",

  val_identity: "Identity check",
  val_closure: "Closure check",
  val_notFound: "This session no longer exists, has been handled, or is outside your site.",
  val_doubleTitle: "Dual validation — human check",
  val_doubleDesc:
    "Automated checks have passed. Visually confirm the photo matches the person, the ID card is valid and the insurance is up to date before opening the session.",
  val_computed: "Computed duration",
  val_grossMinus: "gross −",
  val_ofPauses: "of breaks",
  val_entry: "Entry",
  val_exit: "Exit",
  val_tooLong: "Duration over {n} h — check consistency before validating.",
  val_approveOpen: "Validate identity and open",
  val_approveClose: "Validate closure",
  val_refuseOpen: "Refuse opening",
  val_reportAnomaly: "Report an anomaly",
  val_motifOpen: "Reason for refusal",
  val_motifAnomaly: "Reason for the anomaly",
  val_motifDesc: "A reason is mandatory and will be recorded in the session audit log.",
  val_otherMotif: "Other reason",
  val_motifPlaceholder: "Describe the reason precisely…",
  val_confirmRefuse: "Confirm refusal",
  val_confirmAnomaly: "Confirm anomaly",
  val_openedOk: "Opening validated",
  val_closedOk: "Closure validated",
  val_refusedOk: "Refusal recorded and logged",
  val_anomalyOk: "Anomaly reported — session disputed",
  val_motifRequired: "A reason is mandatory.",

  id_cin: "ID card",
  id_insurance: "Insurance",
  id_insuranceUntil: "valid until {d}",
  id_assignment: "Assignment",
  id_contractEnd: "Contract end",

  al_title: "Alerts",
  al_subtitle: "real-time monitoring",
  al_timeouts: "Break timeouts",
  al_disputes: "Disputed sessions",
  al_toCheck: "Closures to review",
  al_overrun: "Overrun",
  al_pauseStart: "Break started",
  al_deadline: "deadline",
  al_decision: "Decision required",
  al_optA: "Close the session",
  al_optA_detail: "End set to {h}",
  al_optA_detailFallback: "End = break start time",
  al_optB: "Extend the deadline",
  al_optB_detail: "+10, 20 or 30 min · monitoring continues",
  al_optC: "Enter a manual return",
  al_optC_detail: "Justification mandatory · logged",
  al_sheetA_desc:
    "The session end will be set to the break start time. A « to review » flag will be raised for later checking.",
  al_sheetB_desc:
    "The return deadline is recalculated and monitoring continues. A new alert will fire on any further overrun.",
  al_sheetC_desc:
    "Use when the worker returned without scanning. The justification is mandatory and recorded in the audit log.",
  al_returnTime: "Actual return time",
  al_justification: "Justification (mandatory)",
  al_justifPlaceholder: "E.g. terminal out of order, the worker returned at the time given.",
  al_confirmOption: "Confirm option {o}",
  al_emptyTitle: "No alerts",
  al_emptyDesc: "All breaks are within limits and no session is disputed.",
  al_closedFlag: "Session closed — « to review » flag raised",
  al_extended: "Deadline extended by {n} min",
  al_manualOk: "Manual return recorded and justified",
  al_justifRequired: "A justification is mandatory.",
  al_anomalySignaled: "Anomaly reported",
  al_nonNominal: "Non-nominal closure — correct the exit time",

  pr_title: "On site",
  pr_updated: "updated",
  pr_atPost: "At post",
  pr_onPause: "On break",
  pr_empty: "Nobody is currently on site.",
  pr_since: "since",

  hi_title: "History",
  hi_session: "session",
  hi_sessions: "sessions",
  hi_empty: "No session recorded yet.",
  hi_net: "net",
  hi_pause: "break",
  hi_pauses: "breaks",
  hi_ongoing: "ongoing",

  de_payable: "Payable working time",
  de_opening: "Opening",
  de_end: "End",
  de_gross: "Gross duration",
  de_totalPauses: "Total breaks",
  de_site: "Site",
  de_openedBy: "Opening validated by",
  de_closedBy: "Closure handled by",
  de_pausesTitle: "Breaks",
  de_manualReturn: "Manual return",
  de_extraGranted: "min granted",
  de_audit: "Audit log",
  de_events: "events",
  de_notFound: "This session does not exist or is outside your site.",
  de_noEvent: "No event logged.",

  pf_handled: "Validations handled",
  pf_visible: "Visible sessions",
  pf_scopeTitle: "Scope",
  pf_scope: "Coverage",
  pf_role: "Role",
  pf_openWeb: "Open the web version",
  pf_logout: "Sign out",

  se_title: "Settings",
  se_subtitle: "Device preferences",
  se_appearance: "Appearance",
  se_theme: "Theme",
  se_light: "Light",
  se_dark: "Dark",
  se_auto: "System",
  se_themeNote: "System mode follows your phone setting.",
  se_language: "Language",
  se_langNote: "The language is shared with the web application.",
  se_notifications: "Notifications",
  se_notifTimeout: "Break timeout alerts",
  se_notifValidation: "Validation requests",
  se_notifAutoClose: "Automatic closures at 23:30",
  se_station: "Scanning station",
  se_sound: "Confirmation sound on scan",
  se_haptic: "Haptic feedback",
  se_keepAwake: "Keep the screen awake",
  se_stationNote:
    "These settings are stored on this device only. Sound and haptic feedback will require the native app.",
  se_rules: "Process rules",
  se_pauseTimeout: "Break timeout",
  se_tokenValidity: "QR token validity",
  se_dayCutoff: "Accounting day cutoff",
  se_rulesNote: "Set by administration, not editable from the phone.",
  se_about: "About",
  se_version: "Version",
  se_reference: "Reference",
  se_saved: "Preference saved",

  err_notAwaitingOpen: "This session is not awaiting opening.",
  err_motifRequired: "A refusal reason is mandatory.",
  err_needOpenSession: "An open session is required to start a break.",
  err_timeoutBlocked: "Timeout exceeded: a validator must decide on the return.",
  err_noPause: "No break is in progress.",
  err_endPauseFirst: "End the break before scanning the exit.",
  err_noOpenSession: "No open session to close.",
  err_noTimeout: "No timeout to arbitrate.",
  err_justifRequired: "A justification is mandatory.",
  err_notAwaitingClose: "This session is not awaiting closure.",
  err_alreadyClosed: "Session already closed.",
  err_ctrlEntryOnly: "Automated checks apply to the entry scan only.",
  err_badCredentials: "Incorrect staff ID or code.",
  err_accountNotFound: "Account not found.",
};

export type MobileKey = keyof typeof fr;

const DICOS = { fr, en } as const;

/**
 * Traduction avec interpolation simple : `t("scan_tokenNote", { n: 120 })`
 * remplace `{n}` par la valeur fournie.
 */
export type MobileT = (cle: MobileKey, vars?: Record<string, string | number>) => string;

export function useMobileT(): { t: MobileT; lang: "fr" | "en" } {
  const { lang } = useI18n();
  const dico = DICOS[lang] ?? fr;

  const t: MobileT = (cle, vars) => {
    let texte: string = dico[cle] ?? fr[cle];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        texte = texte.replaceAll(`{${k}}`, String(v));
      }
    }
    return texte;
  };

  return { t, lang };
}
