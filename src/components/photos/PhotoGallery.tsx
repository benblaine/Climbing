"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Photo } from "@/lib/types/database";

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mb-3">No photos yet.</p>
    );
  }

  const getPhotoUrl = (photo: Photo) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/climbing-photos/${photo.storage_path}`;
  };

  return (
    <>
      <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="aspect-square overflow-hidden rounded-md border border-border hover:opacity-80"
          >
            <img
              src={getPhotoUrl(photo)}
              alt={photo.caption ?? "Climbing photo"}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute right-4 top-4 text-white hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(selectedPhoto)}
              alt={selectedPhoto.caption ?? "Climbing photo"}
              className="max-h-[85vh] rounded-lg object-contain"
            />
            {selectedPhoto.caption && (
              <p className="mt-2 text-center text-white">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
