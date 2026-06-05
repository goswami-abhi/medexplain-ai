import { useNavigate } from "react-router-dom";
import { uploadReport } from "../api/client";
import { FileUploadZone } from "../components/upload/FileUploadZone";
import { HeartbeatLine } from "../components/illustrations/HealthIllustrations";

export function UploadPage() {
  const navigate = useNavigate();

  const handleUpload = async (file: File, title?: string) => {
    const result = await uploadReport(file, title);
    navigate(`/reports/${result.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-2 text-brand-500">
        <HeartbeatLine className="w-32" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-slate-900">Upload a medical report</h1>
      <p className="mt-2 text-slate-600">
        We&apos;ll extract the text, highlight important values, and explain everything in everyday language.
      </p>
      <div className="mt-10">
        <FileUploadZone onUpload={handleUpload} />
      </div>
      <ul className="mt-8 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          PDF lab reports & blood tests
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Prescription photos
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Scanned documents (OCR)
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          JPEG, PNG, WebP images
        </li>
      </ul>
    </div>
  );
}
