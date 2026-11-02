/**
 * Experimental API — outside the 1.0 semver promise.
 *
 * Anything exported here may change, move or disappear in any minor release.
 * Promote an export to the stable root entry only after it has a consumer and
 * a reviewed contract.
 */
export {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  CollapsibleTrigger,
} from "./collapsible.js";
export {
  CopyableMoney,
  CopyableMoneyLine,
  type CopyableMoneyLineProps,
  type CopyableMoneyProps,
} from "./composed/copyable-money.js";
export {
  DateTimePicker,
  type DateTimePickerProps,
} from "./composed/date-time-picker.js";
export {
  FieldDescription,
  FieldGroup,
} from "./composed/field-feedback.js";
export {
  HintTooltip,
  type HintTooltipProps,
} from "./composed/hint-tooltip.js";
export {
  type PhoneAction,
  PhoneNumber,
  type PhoneNumberLabels,
  type PhoneNumberProps,
  type PhoneNumberVariant,
  phoneNumberPresets,
} from "./composed/phone-number.js";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "./form.js";
export { toLocaleDigits } from "./lib/locale-digits.js";
export {
  type FormatPersianDateOptions,
  formatLocaleInteger,
  formatLocaleRelativeTime,
  formatPersianDate,
} from "./lib/locale-format.js";
export { persianizeDigits, toLatinDigits } from "./lib/numeric.js";
export {
  formatPhoneE164,
  formatPhoneSmsHref,
  formatPhoneTelHref,
  isValidIranMobile,
  normalizeIranMobile,
  normalizeIranMobileInput,
  normalizePhoneDigits,
  persianizePhoneDigits,
} from "./lib/phone.js";
export {
  applyDocumentLocale,
  LocalePreferenceProvider,
  type LocalePreferenceProviderProps,
  resolveLocaleDir,
  type TextDirection,
  useLocalePreference,
} from "./locale-preference.js";
export {
  MobileTopBar,
  type MobileTopBarProps,
} from "./mobile-top-bar.js";
export {
  Collapse,
  type CollapseProps,
  MenuMorphGlyph,
  type MenuMorphGlyphProps,
} from "./motion/index.js";
export {
  PageShell,
  type PageShellProps,
  pageShellContentVariants,
} from "./page-shell.js";
export { Progress } from "./progress.js";
export {
  ScrollArea,
  type ScrollAreaProps,
  ScrollBar,
} from "./scroll-area.js";
export { Slider } from "./slider.js";
export { Switch, type SwitchProps } from "./switch.js";
export { Textarea, type TextareaProps } from "./textarea.js";
export { Toggle, toggleVariants } from "./toggle.js";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group.js";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.js";
export {
  WhatsNew,
  type WhatsNewItem,
  type WhatsNewManifest,
  type WhatsNewProps,
} from "./whats-new.js";
