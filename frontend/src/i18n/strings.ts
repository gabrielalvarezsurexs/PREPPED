// UI string catalog. `es` is the canonical shape; `Strings = typeof es` forces `en`
// to provide every key at compile time (a missing key is a type error). All copy that
// the app renders lives here — the model never produces any of it.

export type Lang = "es" | "en";

const es = {
  brand: "Prepped",
  tagline: "Tu historial de laboratorio, en claro.",

  nav: {
    history: "Historial",
    upload: "Subir estudio",
    assistant: "Asistente",
    updates: "Novedades",
    about: "Acerca de",
  },

  splash: {
    start: "Inicio",
    login: "Iniciar sesión",
    register: "Registrarse",
  },

  auth: {
    loginTitle: "Iniciar sesión",
    registerTitle: "Crear cuenta",
    nameLabel: "Nombre",
    usernameLabel: "Usuario",
    passwordLabel: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    loginButton: "Entrar",
    registerButton: "Crear cuenta",
    toRegister: "¿No tienes cuenta? Regístrate",
    toLogin: "¿Ya tienes cuenta? Inicia sesión",
    back: "← Volver",
    loggingIn: "Entrando…",
    registering: "Creando…",
    loginError: "No se pudo iniciar sesión. Revisa tus datos.",
    registerError: "No se pudo crear la cuenta.",
    demoHint: "Cuenta de prueba (ya con datos): test_user / Hola5000. También karla (menos datos) y gabriel (vacío).",
    greeting: "Hola, ",
    logout: "Salir",
  },

  updates: {
    title: "Novedades",
    changelogTitle: "Lo nuevo",
    changelog: [
      {
        version: "v0.4 · Cuentas y multiusuario",
        items: [
          "Inicio de sesión y registro: cada usuario tiene su propio historial.",
          "El historial ahora se sirve desde la base de datos (antes eran datos de demo fijos); " +
            "lo que subes se refleja al instante.",
          "Puedes borrar estudios que subiste por error.",
          "Cuentas de prueba sembradas: test_user (con datos), Karla (menos datos) y Gabriel (vacío).",
          "Botón para mostrar u ocultar la contraseña en el login.",
        ],
      },
      {
        version: "v0.3 · Asistente con memoria",
        items: [
          "Nuevo botón «insights adicionales» en cada marcador: pregunta al asistente con un tap.",
          "El chat recuerda los mensajes recientes de la conversación y se conserva al cambiar de pestaña.",
        ],
      },
      {
        version: "v0.2 · Nueva identidad y bilingüe",
        items: [
          "Rediseño visual completo: tipografía con carácter, paleta cálida y acento propio.",
          "Español e inglés con cambio al instante; recuerda tu elección.",
          "Tema claro y oscuro que se adapta a tu sistema.",
          "Gráfica mejorada: banda del rango de referencia y tooltip legible en modo oscuro.",
          "Cada marcador muestra su rango de referencia y colorea la tendencia (mejor/peor).",
        ],
      },
    ],
    roadmapTitle: "Próximamente",
    roadmapIntro: "Ideas en el horizonte (hoja de ruta, sujeta a cambios):",
    roadmap: [
      "Más marcadores: ampliar el catálogo más allá de los 11 actuales.",
      "Recordatorios reales: exportarlos a tu calendario (.ics) y que persistan por cuenta.",
      "Resumen imprimible para la consulta, con tus marcadores fuera de rango y las preguntas listas.",
      "Seguridad real: contraseñas robustas, tokens de sesión y recuperación de cuenta.",
      "Base de datos en la nube (Postgres) y despliegue, para usar Prepped desde cualquier dispositivo.",
      "Rangos personalizados por edad y sexo, en vez de rangos generales de adulto.",
    ],
  },

  disclaimer:
    "Prepped no es una herramienta de diagnóstico ni un asesor médico. No indica " +
    "enfermedades, tratamientos, dosis ni dieta. La ausencia de una alerta no significa " +
    "que todo esté bien. Consulta siempre a un profesional de salud.",

  flag: {
    red: "Fuera de rango",
    amber: "Cerca del límite",
    in_range: "En rango",
  },

  history: {
    historyOfPrefix: "Historial de ",
    needsAttention: "Requieren atención",
    allMarkers: "Todos tus marcadores",
    studies: "estudios",
    noChange: "sin cambio",
    refRange: "Rango: ",
    loading: "Cargando tu historial…",
    loadError: "No se pudo cargar tu historial. ¿El backend está corriendo?",
    emptyTitle: "Aún no tienes estudios",
    emptyBody: "Sube tu primer estudio de laboratorio para empezar a ver tu historial.",
    emptyCta: "Subir un estudio",
  },

  markerDetail: {
    back: "← Volver al historial",
    latestPrefix: "Último: ",
    inRangeNote:
      "Este marcador está en rango. Recuerda que eso no sustituye la valoración de un " +
      "profesional de salud.",
  },

  action: {
    doctorQuestionHeading: "Pregunta lista para tu doctor",
    reminderDone: "✓ Recordatorio puesto",
    insights: "Obtener insights adicionales",
    // Pre-armed question sent to the grounded assistant — built from values the
    // engine already computed; the model only adds context, never re-judges them.
    insightsPrompt: (marker: string, value: string, unit: string, status: string) =>
      `Cuéntame más sobre mi ${marker}: mi último resultado fue ${value} ${unit} y está ` +
      `${status}. ¿Qué contexto general y observaciones ligeras me puedes dar?`,
  },

  chart: {
    maxPrefix: "máx ",
    minPrefix: "mín ",
  },

  upload: {
    title: "Subir un estudio",
    extracting: "Extrayendo marcadores…",
    dragHere: "Arrastra tu PDF o foto aquí",
    orClick: "o haz clic para elegir un archivo (en el móvil puedes tomar una foto)",
    couldNotUpload: "No se pudo subir el archivo.",
    backendHint:
      "El backend debe estar corriendo (uvicorn app.main:app) y necesita una " +
      "OPENAI_API_KEY configurada para la extracción.",
    measurementsAdded: "Mediciones agregadas:",
    deduped: "Duplicadas (ya existían):",
    unrecognized: "No reconocidas:",
    studiesTitle: "Tus estudios",
    studiesEmpty: "Todavía no has subido ningún estudio.",
    studiesMeasurements: "mediciones",
    sourceSynthetic: "demo",
    sourceUpload: "subido",
    delete: "Borrar",
    deleting: "Borrando…",
    confirmDelete: "¿Borrar este estudio? Se quitarán sus mediciones de tu historial.",
    deleteError: "No se pudo borrar el estudio.",
  },

  assistant: {
    title: "Asistente",
    subtitle: "Responde solo desde tus datos ya calculados. Da orientación general, no diagnostica.",
    askExample: "Pregúntame sobre tus resultados. Por ejemplo:",
    suggestions: [
      "¿Qué marcadores debería revisar primero?",
      "¿Qué significa que mi glucosa venga subiendo?",
      "¿Qué le puedo preguntar a mi doctor?",
    ],
    thinking: "Pensando…",
    placeholder: "Escribe tu pregunta…",
    send: "Enviar",
    error: "No se pudo contactar al asistente.",
    errorHint: "el asistente necesita el backend corriendo y una OPENAI_API_KEY.",
  },

  about: {
    openSource: "Prepped es open-source.",
    repoLabel: "Ver el repositorio en GitHub →",
    featuresTitle: "Funcionalidades",
    features: [
      "Cuentas con inicio de sesión y registro: cada usuario ve solo su propio historial. Vienen " +
        "sembrados test_user (con datos), Karla (menos datos) y Gabriel (vacío), y puedes crear la tuya.",
      "Sube estudios como foto o PDF: la app lee la imagen y extrae los valores automáticamente, sin " +
        "escribir a mano.",
      "Sin duplicados: re-subir el mismo archivo se detecta y se omite; tampoco duplica la misma " +
        "medición para la misma fecha.",
      "Borra estudios: si subiste un archivo por error o quieres probar, quitas el estudio y sus " +
        "mediciones salen de tu historial.",
      "Historial por marcador en el tiempo: reúne todos tus estudios en una línea de tiempo por " +
        "marcador (glucosa, colesterol, etc.).",
      "Gráfica de tendencia: cómo cambió cada marcador, con el último resultado resaltado y la banda " +
        "del rango de referencia.",
      "Semáforo conservador: cada valor se marca verde (en rango), ámbar (cerca del límite) o rojo " +
        "(fuera de rango), contra una tabla de referencia curada a mano.",
      "Acción en un tap: cuando un marcador está fuera de rango, la app arma el siguiente paso (una " +
        "pregunta para tu doctor y un recordatorio), sin escribir.",
      "Chat sobre tus datos: pregúntale al asistente o pide «insights adicionales» desde un marcador. " +
        "Solo responde con base en tus resultados ya calculados: contexto general, no diagnósticos.",
      "Bilingüe y con tema claro/oscuro: cambia entre español e inglés al instante (recuerda tu " +
        "elección) y se adapta al modo claro u oscuro de tu sistema.",
      "Disclaimer siempre visible: cada pantalla deja claro que esto no es un diagnóstico ni un " +
        "consejo médico.",
      "11 marcadores soportados: glucosa en ayuno, HbA1c, colesterol total, LDL, HDL, triglicéridos, " +
        "creatinina, ALT, TSH, vitamina D y hemoglobina.",
    ],
    assumptionsTitle: "Supuestos",
    assumptions: [
      "Toda la lógica de salud la calcula nuestro propio código, no el LLM. El modelo solo lee el " +
        "PDF, pone las cosas en lenguaje claro y responde el chat; nunca decide si un valor está en " +
        "rango ni inventa un rango.",
      "Login de prototipo: hay cuentas por usuario, pero la autenticación es básica (para pruebas) y " +
        "requiere el backend corriendo. La seguridad robusta (tokens, sesiones) es trabajo futuro.",
      "La base de datos es un archivo SQLite local (backend/prepped.db), no una base en la nube. No " +
        "se sube al repo. Postgres es la meta futura, no el estado actual.",
      "Los rangos de referencia son fijos, generales para adulto, curados a mano. No se personalizan " +
        "por edad, sexo, embarazo ni condiciones específicas.",
      "«En rango» no significa «estás bien». Solo significa que esa regla no lo marcó. La app es " +
        "deliberadamente conservadora.",
      "Sin diagnóstico, tratamiento, dosis ni dieta, y nunca tranquiliza. Es una decisión de diseño " +
        "aplicada en código, no solo en la copy.",
      "La app no «predice» nada. La tendencia es simplemente el último valor comparado con el " +
        "anterior; no hay proyección estadística ni machine learning.",
      "La extracción depende del LLM (OpenAI) y de tu API key. Si un estudio está muy borroso o en un " +
        "formato inusual, puede fallar o no reconocer algunos marcadores.",
      "Solo entiende los 11 marcadores del catálogo. Cualquier otra cosa en el PDF se ignora (queda " +
        "como «no reconocida»).",
      "Es una página web responsive, no una app nativa. «Tap» = clic/tap en el navegador.",
      "Los datos de demo (test_user) son 100% ficticios. Existen para pruebas, no son un paciente real.",
      "El frontend mantiene un espejo del catálogo y los rangos de referencia (para dibujar la " +
        "gráfica y armar las acciones). Si cambias los rangos en el backend, actualiza el espejo del " +
        "frontend en el mismo commit.",
    ],
  },
};

export type Strings = typeof es;

const en: Strings = {
  brand: "Prepped",
  tagline: "Your lab history, in plain language.",

  nav: {
    history: "History",
    upload: "Upload report",
    assistant: "Assistant",
    updates: "Updates",
    about: "About",
  },

  splash: {
    start: "Start",
    login: "Log in",
    register: "Sign up",
  },

  auth: {
    loginTitle: "Log in",
    registerTitle: "Create account",
    nameLabel: "Name",
    usernameLabel: "Username",
    passwordLabel: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    loginButton: "Enter",
    registerButton: "Create account",
    toRegister: "No account? Sign up",
    toLogin: "Already have an account? Log in",
    back: "← Back",
    loggingIn: "Signing in…",
    registering: "Creating…",
    loginError: "Could not log in. Check your details.",
    registerError: "Could not create the account.",
    demoHint: "Test account (preloaded): test_user / Hola5000. Also karla (less data) and gabriel (empty).",
    greeting: "Hi, ",
    logout: "Log out",
  },

  updates: {
    title: "Updates",
    changelogTitle: "What's new",
    changelog: [
      {
        version: "v0.4 · Accounts & multi-user",
        items: [
          "Sign-in and registration: each user has their own history.",
          "History now comes from the database (it used to be fixed demo data); what you upload " +
            "shows up instantly.",
          "You can delete studies you uploaded by mistake.",
          "Seeded test accounts: test_user (with data), Karla (less data), and Gabriel (empty).",
          "Show/hide password button on the login screen.",
        ],
      },
      {
        version: "v0.3 · Assistant with memory",
        items: [
          "New \"additional insights\" button on each marker: ask the assistant in one tap.",
          "The chat remembers recent messages in the conversation and persists when you switch tabs.",
        ],
      },
      {
        version: "v0.2 · New identity & bilingual",
        items: [
          "Full visual redesign: characterful typography, a warm palette, and its own accent.",
          "Spanish and English with instant switching; it remembers your choice.",
          "Light and dark theme that adapts to your system.",
          "Improved chart: reference-range band and a tooltip that's legible in dark mode.",
          "Each marker shows its reference range and colors the trend (better/worse).",
        ],
      },
    ],
    roadmapTitle: "Coming soon",
    roadmapIntro: "Ideas on the horizon (roadmap, subject to change):",
    roadmap: [
      "More markers: expand the catalog beyond the current 11.",
      "Real reminders: export them to your calendar (.ics) and persist them per account.",
      "Printable visit summary with your out-of-range markers and the ready-made questions.",
      "Real security: robust passwords, session tokens, and account recovery.",
      "Cloud database (Postgres) and deployment, to use Prepped from any device.",
      "Ranges personalized by age and sex, instead of general adult ranges.",
    ],
  },

  disclaimer:
    "Prepped is not a diagnostic tool or a medical advisor. It does not indicate " +
    "diseases, treatments, dosing, or diet. The absence of a flag does not mean " +
    "everything is fine. Always consult a health professional.",

  flag: {
    red: "Out of range",
    amber: "Near the limit",
    in_range: "In range",
  },

  history: {
    historyOfPrefix: "History for ",
    needsAttention: "Needs attention",
    allMarkers: "All your markers",
    studies: "reports",
    noChange: "no change",
    refRange: "Range: ",
    loading: "Loading your history…",
    loadError: "Could not load your history. Is the backend running?",
    emptyTitle: "No studies yet",
    emptyBody: "Upload your first lab report to start seeing your history.",
    emptyCta: "Upload a report",
  },

  markerDetail: {
    back: "← Back to history",
    latestPrefix: "Latest: ",
    inRangeNote:
      "This marker is in range. Remember that this does not replace the assessment of a " +
      "health professional.",
  },

  action: {
    doctorQuestionHeading: "A question ready for your doctor",
    reminderDone: "✓ Reminder set",
    insights: "Get additional insights",
    insightsPrompt: (marker: string, value: string, unit: string, status: string) =>
      `Tell me more about my ${marker}: my latest result was ${value} ${unit} and it is ` +
      `${status}. What general context and light observations can you give me?`,
  },

  chart: {
    maxPrefix: "max ",
    minPrefix: "min ",
  },

  upload: {
    title: "Upload a report",
    extracting: "Extracting markers…",
    dragHere: "Drag your PDF or photo here",
    orClick: "or click to pick a file (on mobile you can take a photo)",
    couldNotUpload: "The file could not be uploaded.",
    backendHint:
      "The backend must be running (uvicorn app.main:app) and needs an " +
      "OPENAI_API_KEY configured for extraction.",
    measurementsAdded: "Measurements added:",
    deduped: "Duplicates (already existed):",
    unrecognized: "Unrecognized:",
    studiesTitle: "Your studies",
    studiesEmpty: "You haven't uploaded any studies yet.",
    studiesMeasurements: "measurements",
    sourceSynthetic: "demo",
    sourceUpload: "uploaded",
    delete: "Delete",
    deleting: "Deleting…",
    confirmDelete: "Delete this study? Its measurements will be removed from your history.",
    deleteError: "Could not delete the study.",
  },

  assistant: {
    title: "Assistant",
    subtitle: "Answers only from your already-computed data. It gives general guidance, not diagnoses.",
    askExample: "Ask me about your results. For example:",
    suggestions: [
      "Which markers should I check first?",
      "What does it mean that my glucose is trending up?",
      "What can I ask my doctor?",
    ],
    thinking: "Thinking…",
    placeholder: "Type your question…",
    send: "Send",
    error: "The assistant could not be reached.",
    errorHint: "the assistant needs the backend running and an OPENAI_API_KEY.",
  },

  about: {
    openSource: "Prepped is open source.",
    repoLabel: "View the repository on GitHub →",
    featuresTitle: "Features",
    features: [
      "Accounts with sign-in and registration: each user sees only their own history. Seeded accounts " +
        "are test_user (with data), Karla (less data), and Gabriel (empty), and you can create your own.",
      "Upload reports as a photo or PDF: the app reads the image and extracts the values " +
        "automatically, with no manual typing.",
      "No duplicates: re-uploading the same file is detected and skipped; it also won't duplicate the " +
        "same measurement for the same date.",
      "Delete studies: if you uploaded a file by mistake or want to test, remove the study and its " +
        "measurements leave your history.",
      "Marker history over time: it pulls all your reports into a per-marker timeline (glucose, " +
        "cholesterol, etc.).",
      "Trend chart: how each marker changed over time, with the latest result highlighted and the " +
        "reference-range band shown.",
      "Conservative traffic light: every value is flagged green (in range), amber (near the limit), " +
        "or red (out of range), against a hand-curated reference table.",
      "One-tap action: when a marker is out of range, the app assembles the next step (a question for " +
        "your doctor and a reminder) — no writing required.",
      "Chat over your data: ask the assistant, or request \"additional insights\" from a marker. It " +
        "only answers from your already-computed results: general context, not diagnoses.",
      "Bilingual with light/dark theme: switch between Spanish and English instantly (it remembers " +
        "your choice) and it adapts to your system's light or dark mode.",
      "Always-visible disclaimer: every screen makes clear this is not a diagnosis or medical advice.",
      "11 supported markers: fasting glucose, HbA1c, total cholesterol, LDL, HDL, triglycerides, " +
        "creatinine, ALT, TSH, vitamin D, and hemoglobin.",
    ],
    assumptionsTitle: "Assumptions",
    assumptions: [
      "All health logic is computed by our own code, not the LLM. The model only reads the PDF, puts " +
        "things into plain language, and answers the chat; it never decides whether a value is in " +
        "range and never invents a range.",
      "Prototype login: there are per-user accounts, but authentication is basic (for testing) and " +
        "requires the backend running. Robust security (tokens, sessions) is future work.",
      "The database is a local SQLite file (backend/prepped.db), not a cloud database. It's not " +
        "committed to the repo. Postgres is the future goal, not the current state.",
      "Reference ranges are fixed, general adult ranges, curated by hand. They are not personalized " +
        "by age, sex, pregnancy, or specific conditions.",
      "\"In range\" does not mean \"you're fine.\" It only means that rule didn't flag it. The app is " +
        "deliberately conservative.",
      "No diagnosis, treatment, dosing, or diet, and it never reassures. That's a design decision " +
        "enforced in code, not just in copy.",
      "The app does not \"predict\" anything. The trend is simply the latest value compared to the " +
        "previous one; there's no statistical projection or machine learning.",
      "Extraction depends on the LLM (OpenAI) and your API key. If a report is very blurry or in an " +
        "unusual format, it may fail or not recognize some markers.",
      "It only understands the 11 markers in the catalog. Anything else in the PDF is ignored (left " +
        "as \"unrecognized\").",
      "It's a responsive web page, not a native app. \"Tap\" = click/tap in the browser.",
      "The demo data (test_user) is 100% fake. It exists for testing, not a real patient.",
      "The frontend keeps a mirror of the catalog and reference ranges (to draw the chart and " +
        "assemble the actions). If you change ranges in the backend, update the frontend mirror in " +
        "the same commit.",
    ],
  },
};

export const STRINGS: Record<Lang, Strings> = { es, en };
