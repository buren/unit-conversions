import { Fragment, useState } from "react";
import { EMPTY_VALUE, formatDelta, type PaceTableRow, type PaceVariant } from "../lib/pace";

interface PaceTableProps {
  data: PaceTableRow[];
  title?: string;
  showKmh?: boolean;
  highlightKm?: number;
  /** Difference against the unadjusted pace; adds a comparison column when given */
  deltaSecFor?: (row: PaceTableRow) => number;
  /** Ladder of nearby paces for a row; makes rows expandable when given */
  variantsFor?: (row: PaceTableRow) => PaceVariant[];
}

function paceStringToKmh(pace: string): number {
  const parts = pace.split(":").map(Number);
  const totalSec = parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
  if (totalSec <= 0) return 0;
  return 3600 / totalSec;
}

function round(value: number, digits = 2): number {
  return parseFloat(value.toFixed(digits));
}

function rowKey(row: PaceTableRow): string {
  return `${row.km}-${row.isCustom}`;
}

function deltaClass(deltaSec: number): string {
  if (deltaSec === 0) return "text-gray-400";
  return deltaSec < 0 ? "text-emerald-600" : "text-red-600";
}

export default function PaceTable({
  data,
  title = "Time",
  showKmh = false,
  highlightKm,
  deltaSecFor,
  variantsFor,
}: PaceTableProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (data.length === 0) return null;

  const showMiles = data.some((row) => row.miles !== undefined);
  const columnCount = 1 + (showMiles ? 1 : 0) + 1 + (showKmh ? 1 : 0) + (deltaSecFor ? 1 : 0);

  function toggle(row: PaceTableRow) {
    const key = rowKey(row);
    setExpandedKey((prev) => (prev === key ? null : key));
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">Distance</th>
            {showMiles && <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">Miles</th>}
            <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">{title}</th>
            {deltaSecFor && <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">Diff</th>}
            {showKmh && <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">km/h</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {data.map((row, i) => {
            const key = rowKey(row);
            // Every row of a table with a usable pace is expandable, so the ladder
            // itself is only built for the row actually open.
            const expandable = variantsFor !== undefined && row.value !== EMPTY_VALUE;
            const expanded = expandable && expandedKey === key;
            const variants = expanded ? variantsFor(row) : [];
            const delta = deltaSecFor?.(row);

            return (
              <Fragment key={key}>
                <tr
                  className={`${
                    highlightKm !== undefined && Math.abs(row.km - highlightKm) < 0.01
                      ? "bg-amber-50 font-medium"
                      : row.isCustom
                        ? "bg-blue-50"
                        : i % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                  } ${expandable ? "cursor-pointer hover:bg-blue-50/70" : ""}`}
                  onClick={expandable ? () => toggle(row) : undefined}
                  onKeyDown={
                    expandable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={expandable ? 0 : undefined}
                  role={expandable ? "button" : undefined}
                  aria-expanded={expandable ? expanded : undefined}
                >
                  <td className="px-3 sm:px-6 py-3 text-gray-900">
                    {expandable && (
                      <span
                        aria-hidden="true"
                        className={`mr-1.5 inline-block text-xs text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
                      >
                        &#9656;
                      </span>
                    )}
                    {row.label}
                    {row.isCustom && <span className="ml-1.5 text-blue-500 text-xs align-middle">*</span>}
                  </td>
                  {showMiles && <td className="px-3 sm:px-6 py-3 text-gray-500 whitespace-nowrap">{round(row.miles!, 1)} mi</td>}
                  <td className="px-3 sm:px-6 py-3 text-gray-900 whitespace-nowrap">{row.value}</td>
                  {deltaSecFor && (
                    <td className={`px-3 sm:px-6 py-3 tabular-nums whitespace-nowrap ${deltaClass(delta ?? 0)}`}>
                      {row.value === EMPTY_VALUE ? EMPTY_VALUE : formatDelta(delta ?? 0)}
                    </td>
                  )}
                  {showKmh && (
                    <td className="px-3 sm:px-6 py-3 text-gray-900">
                      {row.value === EMPTY_VALUE ? EMPTY_VALUE : round(paceStringToKmh(row.value), 1)}
                    </td>
                  )}
                </tr>
                {expanded && (
                  <tr className="bg-gray-100">
                    <td colSpan={columnCount} className="px-3 sm:px-6 py-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {row.label} at nearby paces
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase text-gray-500">
                            <th className="py-1 text-left font-semibold">Pace</th>
                            <th className="py-1 text-left font-semibold">{title}</th>
                            <th className="py-1 text-left font-semibold">Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr
                              key={v.offsetSec}
                              className={v.offsetSec === 0 ? "font-semibold text-gray-900" : "text-gray-700"}
                            >
                              <td className="py-1 tabular-nums">{v.pace}</td>
                              <td className="py-1 tabular-nums">{v.time}</td>
                              <td className={`py-1 tabular-nums ${deltaClass(v.deltaSec)}`}>
                                {formatDelta(v.deltaSec)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
