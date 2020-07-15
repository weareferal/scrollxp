import gsap from 'gsap';

export const GSAP3_OR_GREATER = gsap && parseFloat(gsap.version) >= 3;

export const PIN_SPACER_ATTRIBUTE = "data-scrollmagic-pin-spacer";

// Indicators
export const FONT_SIZE = "0.85em";
export const ZINDEX = "9999";
export const EDGE_OFFSET = 15; // minimum edge distance, added to indentation
