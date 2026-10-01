// Allowed upload types and size limits. The same limits are enforced by the
// Supabase storage buckets themselves, so this file only exists to give users
// a friendly error *before* the upload starts. Keep the two in sync.

type UploadRule = {
  maxBytes: number;
  // MIME type -> file extension we store it under
  types: Record<string, string>;
  label: string;
};

export const TRANSCRIPT_RULE: UploadRule = {
  maxBytes: 5 * 1024 * 1024,
  types: {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  },
  label: "a PDF, JPG, PNG or WebP file under 5 MB",
};

export const PHOTO_RULE: UploadRule = {
  maxBytes: 2 * 1024 * 1024,
  types: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  },
  label: "a JPG, PNG or WebP image under 2 MB",
};

// Returns an error message, or null if the file is fine.
export function validateUpload(file: File, rule: UploadRule): string | null {
  if (!(file.type in rule.types)) {
    return `That file type isn't allowed. Please choose ${rule.label}.`;
  }
  if (file.size > rule.maxBytes) {
    return `That file is too large. Please choose ${rule.label}.`;
  }
  return null;
}

// Builds a storage path like "<user-id>/transcript-1700000000000.pdf".
// The extension comes from the validated MIME type, never from the file name,
// and the user's original file name is not used at all.
export function buildUploadPath(
  userId: string,
  prefix: string,
  file: File,
  rule: UploadRule
): string {
  return `${userId}/${prefix}-${Date.now()}.${rule.types[file.type]}`;
}
