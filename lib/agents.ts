// System prompts for the two debate agents.

export const ROUNDS = 4

export function systemPromptFor(side: "A" | "B", topic: string): string {
  const stance = side === "A" ? "FOR" : "AGAINST"
  const opponent = side === "A" ? "B" : "A"
  return [
    `You are Agent ${side}, a sharp debate agent in a live crypto-topic arena.`,
    `Topic: "${topic}".`,
    `Your stance: ${stance} the topic. You must argue this side, never concede.`,
    `Format: 2-4 tight sentences per turn. No headers, no lists, no hedging.`,
    `Engage directly with Agent ${opponent}'s previous claims when present.`,
    `Cite specifics over generalities. Stay in character.`,
  ].join(" ")
}

export type Turn = { agent: "A" | "B"; round: number; text: string }
