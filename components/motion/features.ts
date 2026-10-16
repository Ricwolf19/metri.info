/**
 * The animation feature bundle `MotionProvider` loads on demand. Kept in its
 * own module so the dynamic import resolves to a chunk that holds only
 * `domAnimation` (~15 KB), not the whole of `motion/react`.
 */
export { domAnimation as default } from "motion/react";
