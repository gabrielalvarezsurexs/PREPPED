// Visible on every screen (guardrail): the absence of a flag is never "all good".

export const DISCLAIMER_TEXT =
  "Prepped no es una herramienta de diagnóstico ni un asesor médico. No indica " +
  "enfermedades, tratamientos, dosis ni dieta. La ausencia de una alerta no significa " +
  "que todo esté bien. Consulta siempre a un profesional de salud.";

export function Disclaimer() {
  return (
    <p className="disclaimer" role="note">
      ⚕️ {DISCLAIMER_TEXT}
    </p>
  );
}
