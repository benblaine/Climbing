import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";
import type { Ascent } from "@/lib/types/database";

const STYLE_LABELS: Record<string, string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  toprope: "Toprope",
  attempt: "Attempt",
};

const STYLE_COLORS: Record<string, string> = {
  onsight: "bg-yellow-100 text-yellow-800",
  flash: "bg-orange-100 text-orange-800",
  redpoint: "bg-red-100 text-red-800",
  toprope: "bg-blue-100 text-blue-800",
  attempt: "bg-gray-100 text-gray-800",
};

export default function AscentLog({ ascents }: { ascents: Ascent[] }) {
  if (ascents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No ascents logged yet. Be the first!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {ascents.map((ascent) => (
        <div
          key={ascent.id}
          className="flex items-start justify-between rounded-md border border-border p-3 text-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  STYLE_COLORS[ascent.style] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {STYLE_LABELS[ascent.style] ?? ascent.style}
              </span>
              <span className="text-muted-foreground">
                {formatDate(ascent.climbed_on)}
              </span>
              {ascent.grade_opinion && (
                <span className="text-muted-foreground">
                  felt {ascent.grade_opinion}
                </span>
              )}
            </div>
            {ascent.notes && <p className="text-muted-foreground">{ascent.notes}</p>}
          </div>

          {ascent.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: ascent.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
