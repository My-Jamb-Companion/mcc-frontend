/** Whether what was typed is the account's email, as the server requires (case and surrounding spaces do not matter). */
export const emailMatches = (typed: string, email: string): boolean =>
  typed.trim().toLowerCase() === email.trim().toLowerCase() && email.trim() !== "";
