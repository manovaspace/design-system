import { describe, expect, it } from "vitest";
import {
  ArrowsUpDownIcon as ArrowsUpDownFromIcons,
  BellIcon as BellFromIcons,
  CameraIcon as CameraFromIcons,
  ChartBarIcon as ChartBarFromIcons,
  HistoryIcon as HistoryFromIcons,
  ListIcon as ListFromIcons,
  MapPinIcon as MapPinFromIcons,
  MoreHorizontalIcon as MoreHorizontalFromIcons,
  ReceiptIcon as ReceiptFromIcons,
  SlidersIcon as SlidersFromIcons,
  SortIcon as SortFromIcons,
  UtensilsIcon as UtensilsFromIcons,
} from "./icons.js";
import {
  ArrowsUpDownIcon,
  BellIcon,
  CameraIcon,
  ChartBarIcon,
  HistoryIcon,
  ListIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  ReceiptIcon,
  SlidersIcon,
  SortIcon,
  UtensilsIcon,
} from "./index.js";

describe("icons", () => {
  it("exports new icons from both root and icons entrypoints", () => {
    expect(ArrowsUpDownIcon).toBe(ArrowsUpDownFromIcons);
    expect(SortIcon).toBe(SortFromIcons);
    expect(SortIcon).toBe(ArrowsUpDownIcon);
    expect(BellIcon).toBe(BellFromIcons);
    expect(CameraIcon).toBe(CameraFromIcons);
    expect(ChartBarIcon).toBe(ChartBarFromIcons);
    expect(HistoryIcon).toBe(HistoryFromIcons);
    expect(ListIcon).toBe(ListFromIcons);
    expect(MapPinIcon).toBe(MapPinFromIcons);
    expect(MoreHorizontalIcon).toBe(MoreHorizontalFromIcons);
    expect(ReceiptIcon).toBe(ReceiptFromIcons);
    expect(SlidersIcon).toBe(SlidersFromIcons);
    expect(UtensilsIcon).toBe(UtensilsFromIcons);
  });
});
