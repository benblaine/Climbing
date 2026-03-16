"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

export default function ReportReboltForm({ routeId }: { routeId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to report a rebolt.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("rebolt_records").insert({
      route_id: routeId,
      reported_by: user.id,
      rebolted_on: formData.get("rebolted_on") as string,
      rebolted_by: (formData.get("rebolted_by") as string) || null,
      bolt_type: (formData.get("bolt_type") as string) || null,
      notes: (formData.get("notes") as string) || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      >
        <Wrench className="h-4 w-4" />
        Report Rebolt
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-3 rounded-lg border border-border p-4"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Date Rebolted
          </label>
          <input
            type="date"
            name="rebolted_on"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rebolted By</label>
          <input
            type="text"
            name="rebolted_by"
            placeholder="Name or team"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bolt Type</label>
        <select
          name="bolt_type"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">Unknown</option>
          <option value="stainless steel glue-ins">
            Stainless Steel Glue-ins
          </option>
          <option value="stainless steel expansion">
            Stainless Steel Expansion
          </option>
          <option value="titanium glue-ins">Titanium Glue-ins</option>
          <option value="mild steel">Mild Steel</option>
          <option value="ring bolts">Ring Bolts</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Any additional info about the rebolting"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Rebolt Record"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
