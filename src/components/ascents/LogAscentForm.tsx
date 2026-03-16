"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, Star } from "lucide-react";

export default function LogAscentForm({ routeId }: { routeId: string }) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to log an ascent.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ascents").insert({
      route_id: routeId,
      user_id: user.id,
      climbed_on: formData.get("climbed_on") as string,
      style: formData.get("style") as string,
      grade_opinion: (formData.get("grade_opinion") as string) || null,
      notes: (formData.get("notes") as string) || null,
      rating: formData.get("rating") ? parseInt(formData.get("rating") as string) : null,
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
        className="mb-4 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Log Ascent
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
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="climbed_on"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Style</label>
          <select
            name="style"
            defaultValue="redpoint"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="onsight">Onsight</option>
            <option value="flash">Flash</option>
            <option value="redpoint">Redpoint</option>
            <option value="toprope">Toprope</option>
            <option value="attempt">Attempt</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Grade Opinion (optional)
          </label>
          <input
            type="text"
            name="grade_opinion"
            placeholder="e.g. 24"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rating (1-5) <Star className="inline h-3 w-3" />
          </label>
          <select
            name="rating"
            defaultValue=""
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">-</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="How was it?"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Ascent"}
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
