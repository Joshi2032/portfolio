// True while the client adopts the prerendered HTML. Hooks whose first value depends on the
// browser (stored theme) start from the server value and correct it after mount.
export const hydration = { active: false };
