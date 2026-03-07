import { round } from "../lib/round";

interface PaceTableProps {
  data: [number, string][];
  title?: string;
}

export default function PaceTable({ data, title = "Time" }: PaceTableProps) {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 font-bold text-gray-700 uppercase">Distance</th>
            <th className="px-6 py-3 font-bold text-gray-700 uppercase">{title}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {data.map(([km, time], i) => (
            <tr className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} key={i}>
              <td className="px-6 py-3 text-gray-900">{round(km, 2)}k</td>
              <td className="px-6 py-3 text-gray-900">{time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
