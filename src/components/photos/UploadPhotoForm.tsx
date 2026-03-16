"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

interface UploadPhotoFormProps {
  routeId?: string;
  cragId?: string;
}

export default function UploadPhotoForm({
  routeId,
  cragId,
}: UploadPhotoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to upload photos.");
      setLoading(false);
      return;
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("climbing-photos")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    // Insert photo record
    const { error: insertError } = await supabase.from("photos").insert({
      route_id: routeId || null,
      crag_id: cragId || null,
      user_id: user.id,
      storage_path: path,
      caption: null,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.refresh();
    }

    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mb-4">
      {error && (
        <div className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <label
        className={`inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted ${
          loading ? "opacity-50" : ""
        }`}
      >
        <Camera className="h-4 w-4" />
        {loading ? "Uploading..." : "Add Photo"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  );
}
