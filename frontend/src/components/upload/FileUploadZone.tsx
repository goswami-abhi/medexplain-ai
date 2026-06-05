import { FileImage, FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { UploadIllustration } from "../illustrations/HealthIllustrations";
import { Button } from "../ui/Button";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

interface FileUploadZoneProps {
  onUpload: (file: File, title?: string) => Promise<void>;
}

interface PreviewFile {
  file: File;
  preview?: string;
}

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFile = useCallback((file: File) => {
    setPreview((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      const isImage = file.type.startsWith("image/");
      return {
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) setFile(file);
    },
    [setFile]
  );

  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      await onUpload(preview.file, title || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    if (preview?.preview) URL.revokeObjectURL(preview.preview);
    setPreview(null);
    setTitle("");
  };

  const isPdf = preview?.file.type === "application/pdf";

  return (
    <div className="space-y-6">
      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            dragging
              ? "border-brand-500 bg-brand-50/80 scale-[1.01]"
              : "border-slate-300 bg-gradient-to-b from-sky-50/50 to-white hover:border-brand-400"
          }`}
        >
          <div className="mx-auto mb-4 flex justify-center">
            <UploadIllustration className="h-24 w-28" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Drop your report here</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            PDF blood tests, prescriptions, lab results, or scanned images — up to 15MB.
          </p>
          <label className="mt-6 inline-block cursor-pointer">
            <input
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors">
              <Upload className="h-4 w-4" />
              Choose file
            </span>
          </label>
        </div>
      ) : (
        <div className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {preview.preview ? (
                <img src={preview.preview} alt="" className="h-full w-full object-cover" />
              ) : isPdf ? (
                <FileText className="h-10 w-10 text-red-400" />
              ) : (
                <FileImage className="h-10 w-10 text-brand-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{preview.file.name}</p>
              <p className="text-sm text-slate-500">{(preview.file.size / 1024).toFixed(1)} KB</p>
              <input
                type="text"
                placeholder="Report title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleSubmit} loading={loading}>
              Analyze report
            </Button>
            <Button variant="ghost" onClick={clearFile} disabled={loading}>
              Choose another
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{error}</p>
      )}
    </div>
  );
}
