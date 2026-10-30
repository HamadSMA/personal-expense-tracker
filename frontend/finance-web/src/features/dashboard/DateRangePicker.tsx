import { useState } from "react";
import type { DateRange } from "../../types/dashboard";
import { isRangePreset, rangePresets, type RangePreset } from "../../utils/dateRanges";

type DateRangePickerProps = {
  preset: RangePreset;
  range: DateRange;
  onPresetChange: (preset: RangePreset) => void;
  onCustomChange: (from: string, to: string) => void;
};

export default function DateRangePicker({
  preset,
  range,
  onPresetChange,
  onCustomChange,
}: DateRangePickerProps) {
  const [error, setError] = useState<string>();

  return (
    <div>
      <label>
        Date range{" "}
        <select
          value={preset}
          onChange={(event) => {
            const value = event.target.value;
            if (isRangePreset(value)) {
              setError(undefined);
              onPresetChange(value);
            }
          }}
        >
          {rangePresets.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {preset === "custom" && (
        <form
          key={`${range.from ?? ""}|${range.to ?? ""}`}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const from = String(data.get("from") ?? "");
            const to = String(data.get("to") ?? "");
            if (from && to && from > to) {
              setError("From date must be on or before To date.");
              return;
            }
            setError(undefined);
            onCustomChange(from, to);
          }}
        >
          <label>
            From <input type="date" name="from" defaultValue={range.from ?? ""} />
          </label>{" "}
          <label>
            To <input type="date" name="to" defaultValue={range.to ?? ""} />
          </label>{" "}
          <button type="submit">Apply</button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}