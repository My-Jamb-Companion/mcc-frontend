/** The API calls an unnamed course Smart Zone "Exercise". */
export const DEFAULT_ZONE_SET_NAME = "Exercise";

/** What a learner sees for a Smart Zone: its name, or just "Smart Zone" for an unnamed one. */
export const smartZoneLabel = (setName?: string | null): string =>
  !setName || setName.trim() === "" || setName === DEFAULT_ZONE_SET_NAME ? "Smart Zone" : `Smart Zone: ${setName}`;
