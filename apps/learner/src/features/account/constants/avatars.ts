/**
 * The built-in profile pictures, 512 px so they stay sharp on the profile page. 1 to 3 are the supplied artwork
 * and 4 to 10 are drawn to match it, in a range of black skin tones, men and women. A student who picked one of the
 * older 48 px pictures (`/assets/images/avatars/1.png` to `14.png`) still sees it: those files are kept, just no
 * longer offered.
 */
export const AVATARS = Array.from({length: 10}, (_, i) => `/assets/images/avatars/hd/${String(i + 1).padStart(2, "0")}.png`);
