import { ToolCall } from "@langchain/core/messages/tool";
import { useFormatter } from "next-intl";
import { unknownToDate } from "../utils";

export function ToolCallTable({ toolCall }: { toolCall: ToolCall }) {
  const format = useFormatter();

  return (
    <div className="max-w-full min-w-[300px] overflow-hidden rounded-lg border">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th
              className="bg-gray-100 px-2 py-0 text-left text-sm"
              colSpan={2}
            >
              {toolCall.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(toolCall.args).map(([key, value]) => {
            let valueStr = "";
            if (["string", "number"].includes(typeof value)) {
              valueStr = value.toString();
            }

            const date = unknownToDate(value);
            if (date) {
              valueStr = format.dateTime(date, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
            }

            try {
              valueStr = valueStr || JSON.stringify(value, null);
            } catch (_) {
              // failed to stringify, just assign an empty string
              valueStr = "";
            }

            return (
              <tr
                key={key}
                className="border-t"
              >
                <td className="w-1/3 px-2 py-1 text-xs font-medium">{key}</td>
                <td className="px-2 py-1 font-mono text-xs">{valueStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
