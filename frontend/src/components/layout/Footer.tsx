export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">MediExplain AI</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Plain-language summaries of medical reports. Not a substitute for professional medical advice.
            </p>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} MediExplain AI · Portfolio demo</p>
        </div>
      </div>
    </footer>
  );
}
