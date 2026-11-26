import type { M3StateLayers } from "./types.js";

/** M3 state layer opacities per ADR-078 section 6. */
export const M3_STATE_LAYER_OPACITIES: M3StateLayers = {
  hoverOpacity: 0.08,
  focusOpacity: 0.1,
  pressedOpacity: 0.1,
  draggedOpacity: 0.16,
  disabledContentOpacity: 0.38,
  disabledContainerOpacity: 0.12,
};

export function stateLayersToCssVars(
  layers: M3StateLayers = M3_STATE_LAYER_OPACITIES,
): Record<string, string> {
  return {
    "--md-sys-state-hover-opacity": String(layers.hoverOpacity),
    "--md-sys-state-focus-opacity": String(layers.focusOpacity),
    "--md-sys-state-pressed-opacity": String(layers.pressedOpacity),
    "--md-sys-state-dragged-opacity": String(layers.draggedOpacity),
    "--md-sys-state-disabled-content-opacity": String(
      layers.disabledContentOpacity,
    ),
    "--md-sys-state-disabled-container-opacity": String(
      layers.disabledContainerOpacity,
    ),
  };
}
