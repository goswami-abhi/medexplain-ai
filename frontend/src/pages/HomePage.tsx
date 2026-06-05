import { ArrowRight, CheckCircle2, FileSearch, Heart, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DoctorAssistant,
  HealthChart,
  HeartbeatLine,
  PrescriptionCard,
} from "../components/illustrations/HealthIllustrations";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const features = [
  {
    icon: FileSearch,
    title: "Upload any report",
    text: "Blood tests, prescriptions, lab PDFs, or photos of printed results.",
  },
  {
    icon: Heart,
    title: "Plain-language summaries",
    text: "Clinical wording rewritten so you can follow what your numbers mean.",
  },
  {
    icon: Shield,
    title: "Values that stand out",
    text: "Important results are flagged so you know what to discuss with your doctor.",
  },
];

const steps = [
  "Upload a PDF or image of your medical report",
  "We extract the text with OCR and read the content",
  "You get a clear summary with highlighted key values",
];

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-health-mint/40">
        <div className="absolute inset-0 opacity-40">
          <HeartbeatLine className="absolute bottom-8 left-0 right-0 w-full text-brand-300" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-brand-100 px-3 py-1 text-sm font-medium text-brand-800 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Understand your reports with confidence
              </p>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl text-balance">
                Upload reports and understand your health more clearly
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-600 leading-relaxed">
                MediExplain AI turns lab results and prescriptions into calm, readable summaries —
                so you spend less time guessing and more time preparing for your next visit.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/upload">
                  <Button className="!px-6 !py-3">
                    Upload a report
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" className="!px-6 !py-3">
                    View dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block animate-slide-up">
              <div className="relative mx-auto w-full max-w-md">
                <Card className="relative z-10 !p-8 shadow-lift">
                  <DoctorAssistant className="mx-auto h-36 w-40" />
                  <p className="mt-4 text-center text-sm font-medium text-brand-800">Your health, explained simply</p>
                  <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Glucose</span>
                      <span className="font-medium text-amber-700">Slightly high</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Hemoglobin</span>
                      <span className="font-medium text-emerald-700">Normal</span>
                    </div>
                  </div>
                </Card>
                <PrescriptionCard className="absolute -left-8 top-8 h-20 w-16 opacity-90 drop-shadow-md" />
                <HealthChart className="absolute -right-4 bottom-4 h-20 w-24 drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900 text-center">How it works</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={i} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {i + 1}
              </span>
              <p className="mt-4 text-slate-700 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} hover className="text-center md:text-left">
                <div className="mx-auto md:mx-0 flex h-12 w-12 items-center justify-center rounded-xl bg-health-cyan text-brand-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          MediExplain AI is for educational purposes. Always discuss results and treatment decisions with a licensed healthcare provider.
        </p>
      </section>
    </div>
  );
}
