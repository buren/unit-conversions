import type { PaceTableRow } from "../lib/pace";
import { paceToKmh } from "../lib/pace";

interface PaceTableProps {
  data: PaceTableRow[];
  title?: string;
  showKmh?: boolean;
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

export default function PaceTable({ data, title = "Time", showKmh = false }: PaceTableProps) {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">Distance</th>
            <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">{title}</th>
            {showKmh && <th className="px-3 sm:px-6 py-3 font-bold text-gray-700 uppercase">km/h</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {data.map((row, i) => (
            <tr
              className={
                row.isCustom
                  ? "bg-blue-50"
                  : i % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
              }
              key={`${row.km}-${row.isCustom}`}
            >
              <td className="px-3 sm:px-6 py-3 text-gray-900">
                {row.label}
                {row.isCustom && <span className="ml-1.5 text-blue-500 text-xs align-middle">*</span>}
              </td>
              <td className="px-3 sm:px-6 py-3 text-gray-900">{row.value}</td>
              {showKmh && <td className="px-3 sm:px-6 py-3 text-gray-900">{round(paceStringToKmh(row.value), 1)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
