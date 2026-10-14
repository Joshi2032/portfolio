/** Screen widths shared with CSS. Media queries use bp-tablet, bp-nav, and bp-compact; Vite substitutes these values. */
export const breakpoints = {
  tablet: 980,
  nav: 860,
  compact: 700,
};

export const mediaQueries = {
  tablet: `(max-width: ${breakpoints.tablet}px)`,
  nav: `(max-width: ${breakpoints.nav}px)`,
  compact: `(max-width: ${breakpoints.compact}px)`,
};
