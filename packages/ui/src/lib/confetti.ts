import party from "party-js";

export function confettiCelebrate(
  target?: HTMLElement,
  count?: number,
  spread?: number,
) {
  party.confetti(target ?? document.body, {
    count: count ?? 80,
    spread: spread ?? 50,
  });
}
