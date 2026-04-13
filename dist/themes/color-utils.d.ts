/** Parse a hex color string (#RGB or #RRGGBB) to an [r, g, b] tuple. */
export declare function parseHex(hex: string): [number, number, number];
/** Linearly interpolate between two hex colors. t=0 returns `a`, t=1 returns `b`. */
export declare function lerpHex(a: string, b: string, t: number): string;
