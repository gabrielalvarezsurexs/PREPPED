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
  },

  updates: {
    title: "Novedades",
    intro: "Lo que viene para Prepped (hoja de ruta, sujeta a cambios):",
    items: [
      "Inicio de sesión y cuentas: pasar del prototipo de un solo perfil local a multiusuario con " +
        "inicio de sesión.",
      "Más marcadores: ampliar el catálogo más allá de los 11 actuales.",
      "Nuevas funcionalidades generales: mejoras de experiencia y capacidades adicionales en toda " +
        "la app.",
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
      "Sube estudios de laboratorio como foto o PDF. La app lee la imagen y extrae los valores " +
        "automáticamente, sin escribir a mano.",
      "Sin duplicados: re-subir el mismo archivo se detecta y se omite. Tampoco duplica cuando dos " +
        "archivos traen la misma medición para la misma fecha.",
      "Historial de cada marcador en el tiempo: reúne todos tus estudios y arma un historial por " +
        "marcador (glucosa, colesterol, etc.).",
      "Gráfica de tendencia: cada marcador tiene una gráfica de cómo cambió en el tiempo, con el " +
        "último resultado resaltado.",
      "Semáforo conservador: cada valor se marca verde (en rango), ámbar (acercándose al límite) o " +
        "rojo (fuera de rango), comparado contra una tabla de referencia curada a mano.",
      "Acción en un tap: cuando un marcador está fuera de rango, la app ofrece un siguiente paso ya " +
        "armado (una pregunta para tu doctor, o un recordatorio) — sin escribir.",
      "Recordatorios: puedes crear un recordatorio para un marcador; crearlo dos veces no genera " +
        "duplicados.",
      "Chat sobre tus datos: puedes preguntarle a un asistente, pero solo responde con base en tus " +
        "propios resultados ya calculados. Da contexto general y observaciones ligeras, no diagnósticos.",
      "Disclaimer siempre visible: cada pantalla deja claro que esto no es un diagnóstico ni un " +
        "consejo médico.",
      "Funciona en parte sin servidor: ver el historial, la gráfica y la acción (AT-1 y AT-2) corre " +
        "solo en el frontend con datos de demo; solo las subidas reales necesitan el backend + API key.",
      "11 marcadores soportados: glucosa en ayuno, HbA1c, colesterol total, LDL, HDL, triglicéridos, " +
        "creatinina, ALT, TSH, vitamina D y hemoglobina.",
    ],
    assumptionsTitle: "Supuestos",
    assumptions: [
      "Toda la lógica de salud la calcula nuestro propio código, no el LLM. El modelo solo lee el " +
        "PDF, pone las cosas en lenguaje claro y responde el chat; nunca decide si un valor está en " +
        "rango ni inventa un rango.",
      "Es un prototipo de un solo usuario y perfil local. Aún no hay cuentas, login ni multiusuario.",
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
      "Los datos de demo (Rafael) son 100% ficticios. Existen para pruebas, no son un paciente real.",
      "El frontend y el backend duplican a propósito la tabla de rangos de referencia para que la " +
        "demo corra sin servidor. Si cambias los rangos de un lado, debes actualizar el otro.",
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
  },

  updates: {
    title: "Updates",
    intro: "What's coming for Prepped (roadmap, subject to change):",
    items: [
      "Login and accounts: move from the single local-profile prototype to multi-user with sign-in.",
      "More markers: expand the catalog beyond the current 11.",
      "New general features: experience improvements and additional capabilities across the app.",
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
      "Upload lab reports as a photo or PDF. The app reads the image and extracts the values " +
        "automatically, with no manual typing.",
      "No duplicates: re-uploading the same file is detected and skipped. It also won't duplicate " +
        "when two files carry the same measurement for the same date.",
      "Marker history over time: it pulls together all your reports and builds a history for each " +
        "marker (glucose, cholesterol, etc.).",
      "Trend chart: each marker gets a chart of how it changed over time, with the latest result " +
        "highlighted.",
      "Conservative traffic light: every value is flagged green (in range), amber (approaching the " +
        "limit), or red (out of range), compared against a hand-curated reference table.",
      "One-tap action: when a marker is out of range, the app offers a pre-armed next step (a " +
        "question to bring to your doctor, or a reminder) — no writing required.",
      "Reminders: you can create a reminder for a marker; creating it twice does not produce " +
        "duplicates.",
      "Chat over your data: you can ask an assistant, but it only answers based on your own " +
        "already-computed results. It gives general context and light observations, not diagnoses.",
      "Always-visible disclaimer: every screen makes clear this is not a diagnosis or medical advice.",
      "Works partly without a server: viewing history, the chart, and the action (AT-1 and AT-2) runs " +
        "on the frontend alone using demo data; only real uploads need the backend + API key.",
      "11 supported markers: fasting glucose, HbA1c, total cholesterol, LDL, HDL, triglycerides, " +
        "creatinine, ALT, TSH, vitamin D, and hemoglobin.",
    ],
    assumptionsTitle: "Assumptions",
    assumptions: [
      "All health logic is computed by our own code, not the LLM. The model only reads the PDF, puts " +
        "things into plain language, and answers the chat; it never decides whether a value is in " +
        "range and never invents a range.",
      "It's a single-user, local-profile prototype. No accounts, login, or multi-user yet.",
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
      "The demo data (Rafael) is 100% fake. It exists for testing, not a real patient.",
      "Frontend and backend intentionally duplicate the reference-range table so the demo can run " +
        "without a server. If you change ranges on one side, you must update the other.",
    ],
  },
};

export const STRINGS: Record<Lang, Strings> = { es, en };
