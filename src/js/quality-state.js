/**
 * Shared, dependency-free store for the graphics-quality preset so the
 * renderer can read the pixel-ratio cap without an import cycle.
 */
export const qualityState = {
    pixelRatioCap: 2,
}
