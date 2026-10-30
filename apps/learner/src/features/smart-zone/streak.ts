/** Answers right first time, in a row. A miss, a hint or a skip starts it again. */
export const nextStreak = (current: number, rightFirstTime: boolean): number => (rightFirstTime ? current + 1 : 0);

/** The streak badge only appears once it is worth cheering: two or more in a row. */
export const showStreak = (streak: number): boolean => streak >= 2;

/** The sparkle sound joins the chime from three in a row. */
export const streakSparkles = (streak: number): boolean => streak >= 3;

/** The chime gets slightly higher the longer the streak, up to a point. */
export const streakPitch = (streak: number): number => 1 + Math.min(Math.max(streak - 1, 0), 6) * 0.04;

export const streakText = (streak: number): string => `${streak} in a row`;
