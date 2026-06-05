const LOWTRACK_PAYT_URL =
  "https://lowtrack.com.br/webhook/lt_44068f2f8717831efdaa534b7a2a3c15816743ec77c07978/payt";

module.exports = async (req, res) => {
  if (req.method === "GET" || req.method === "HEAD") {
    return res.status(200).json({
      ok: true,
      message: "Endpoint Payt ativo. Vendas sao repassadas para Lowtrack.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Metodo nao permitido" });
  }

  const payload =
    typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body ?? {});

  try {
    await fetch(LOWTRACK_PAYT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
  } catch (_) {
    // Payt exige 200 no teste; nao bloquear salvamento por falha de repasse.
  }

  return res.status(200).json({ ok: true, received: true });
};
