const DECAY = 0.996

/**
 * movement projection based on velocity
 * @param velocityPxMs
 * @param decay
 */
export const projection = (velocityPxMs: number, decay = DECAY) => (velocityPxMs * decay) / (1 - decay)
