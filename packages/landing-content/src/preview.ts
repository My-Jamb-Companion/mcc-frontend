/** Messages between the admin editor and the landing site's /preview page (window.postMessage). */
export const PREVIEW_READY = "mcc-landing-preview-ready"; // preview -> admin: send me the content
export const PREVIEW_CONTENT = "mcc-landing-preview-content"; // admin -> preview: draw this page
export const PREVIEW_SCROLL = "mcc-landing-preview-scroll"; // admin -> preview: bring this block into view
