import { formatDate } from "@/lib/utils";
import { Wrench } from "lucide-react";
import type { ReboltRecord } from "@/lib/types/database";

export default function ReboltHistory({
  records,
}: {
  records: ReboltRecord[];
}) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No rebolt records yet. Know when this was rebolted? Report it!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"
        >
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {formatDate(record.rebolted_on)}
              </span>
              {record.rebolted_by && (
                <span className="text-muted-foreground">
                  by {record.rebolted_by}
                </span>
              )}
              {record.bolt_type && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {record.bolt_type}
                </span>
              )}
            </div>
            {record.notes && (
              <p className="text-muted-foreground">{record.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
