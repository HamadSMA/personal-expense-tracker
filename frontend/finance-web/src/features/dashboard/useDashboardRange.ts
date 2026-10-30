import { useSearchParams } from "react-router";
import type { DateRange } from "../../types/dashboard";
import {
  getPresetRange,
  isIsoDate,
  isRangePreset,
  type RangePreset,
} from "../../utils/dateRanges";

const defaultPreset: RangePreset = "this-month";

export function useDashboardRange() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rangeParam = searchParams.get("range");
  const preset: RangePreset = isRangePreset(rangeParam) ? rangeParam : defaultPreset;

  let range: DateRange;
  if (preset === "custom") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    range = {
      from: isIsoDate(from) ? from : undefined,
      to: isIsoDate(to) ? to : undefined,
    };
  } else {
    range = getPresetRange(preset);
  }

  function setPreset(next: RangePreset) {
    const params = new URLSearchParams();
    if (next === "custom") {
      params.set("range", "custom");
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);
    } else if (next !== defaultPreset) {
      params.set("range", next);
    }
    setSearchParams(params);
  }

  function setCustomRange(from: string, to: string) {
    const params = new URLSearchParams({ range: "custom" });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    setSearchParams(params);
  }

  return { preset, range, setPreset, setCustomRange };
}