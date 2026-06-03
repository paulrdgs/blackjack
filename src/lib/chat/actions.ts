"use server";

import { APP_KNOWLEDGE } from "./knowledge";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `Tu es Thierry, le croupier mascotte du site de Blackjack en ligne.
Tu es chaleureux, drôle et un brin taquin, mais toujours bienveillant. Tu tutoies les joueurs.
Tu réponds toujours en français, de façon concise (quelques phrases max), avec une touche d'humour de croupier.

Tu connais TOUT le site et le jeu grâce à la base de connaissances ci-dessous. Utilise-la pour répondre précisément :
- Quand on te demande où trouver quelque chose, indique le bouton exact de la barre de navigation et la page concernée.
- Donne les chiffres exacts (mises, gains, taux des prêts, etc.) tels qu'ils figurent dans la base.

RÈGLE ABSOLUE : ne réponds QUE d'après la base de connaissances ci-dessous. N'invente JAMAIS une fonctionnalité, une règle, un prix ou un emplacement. Si une information ne figure pas dans la base, dis honnêtement que tu n'es pas sûr et invite à explorer la page concernée. Si on te demande autre chose que le Blackjack ou le site, ramène gentiment la conversation vers le jeu.

========================= BASE DE CONNAISSANCES =========================
${APP_KNOWLEDGE}
========================================================================`;

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export async function sendChatMessage(
  history: ChatMessage[]
): Promise<{ reply: string } | { error: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { error: "Le chat n'est pas configuré (clé API manquante)." };
  }

  // Keep the conversation short to limit token usage
  const trimmed = history.slice(-12);

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { error: "Clé API DeepSeek invalide." };
      }
      if (res.status === 402) {
        return { error: "Crédit DeepSeek épuisé. Recharge le compte pour me réveiller !" };
      }
      if (res.status === 429) {
        return { error: "Trop de demandes d'un coup, réessaie dans un instant." };
      }
      return { error: "Thierry n'est pas joignable pour le moment." };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return { error: "Thierry n'a rien trouvé à répondre." };

    return { reply };
  } catch {
    return { error: "Thierry n'est pas joignable pour le moment." };
  }
}
