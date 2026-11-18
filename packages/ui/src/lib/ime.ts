type ImeKeyboardEventLike = {
  nativeEvent?: { isComposing?: boolean };
  keyCode?: number;
  isComposing?: boolean;
};

/**
 * True while an IME composition is active. Enter (and separator keys) confirm
 * the composition in that state and must not commit a value. Keycode 229 is the
 * legacy marker for keydown events fired during composition.
 */
export function isImeComposing(e: ImeKeyboardEventLike): boolean {
  return Boolean(
    e.nativeEvent?.isComposing || e.isComposing || e.keyCode === 229,
  );
}
