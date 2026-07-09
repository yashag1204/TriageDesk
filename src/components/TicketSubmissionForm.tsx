import React, { useState } from "react";
import { Sparkles, AlertCircle, ArrowRight, ShieldCheck, CornerDownRight, Copy, Check } from "lucide-react";
import { Team, Severity } from "../triageEngine";

interface TicketSubmissionFormProps {
  onSubmitSuccess: () => void;
  onViewDashboard: () => void;
}

interface SubmittedFeedback {
  ticket: {
    id: string;
    title: string;
    description: string;
    team: Team;
    severity: Severity;
    status: string;
    created_at: string;
  };
  similarityMatch: {
    title: string;
    description: string;
    similarity: number;
    resolution_notes: string;
  } | null;
}

export default function TicketSubmissionForm({
  onSubmitSuccess,
  onViewDashboard,
}: TicketSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SubmittedFeedback | null>(null);
  const [copied, setCopied] = useState(false);
  const [didHelp, setDidHelp] = useState(false);

  // Suggested quick-templates to help users test keywords!
  const templates = [
    {
      label: "Critical Auth Incident",
      title: "Login OTP code is failing on user signup",
      desc: "User tries to sign up with their password and username, but when the OTP validation SMS arrives, they enter it and the system says invalid verification code. This makes signup completely impossible."
    },
    {
      label: "Critical Payment Incident",
      title: "Money transaction fails and refund crashes",
      desc: "During checkout, the system deducted money from my credit card but the order failed. Now, trying to trigger a transaction refund is crashing with a server timeout. We are losing transactions."
    },
    {
      label: "UI Bug",
      title: "Dark mode color issues on button component",
      desc: "The button color contrast is broken in dark mode inside the dashboard menu. The button is gray with dark text, making it extremely hard to read. Looks like a cosmetic CSS layout issue."
    },
    {
      label: "Performance Issue",
      title: "Dashboard list load is slow and freezes browser",
      desc: "Whenever I navigate to the logs page, the application lags. It is extremely slow to load records and sometimes the browser crashes or freezes completely due to memory leak."
    }
  ];

  const applyTemplate = (t: typeof templates[0]) => {
    setTitle(t.title);
    setDescription(t.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
        setTitle("");
        setDescription("");
        setDidHelp(false);
        onSubmitSuccess(); // refresh stats in App.tsx
      } else {
        console.error("Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get custom badge styling for Team
  const getTeamBadge = (team: Team) => {
    switch (team) {
      case Team.Payments:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case Team.Auth:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case Team.UI:
        return "bg-pink-50 text-pink-700 border-pink-200";
      case Team.Performance:
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  // Get custom badge styling for Severity
  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case Severity.Critical:
        return "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-100";
      case Severity.High:
        return "bg-orange-50 text-orange-700 border-orange-200";
      case Severity.Medium:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case Severity.Low:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  // Extract keywords matched to display in UI for explanation purposes
  const getMatchedTriageTriggers = (t: string, d: string) => {
    const text = `${t} ${d}`.toLowerCase();
    const matched: string[] = [];

    // Team triggers
    if (["payment", "checkout", "transaction", "refund"].some(k => text.includes(k))) {
      const ms = ["payment", "checkout", "transaction", "refund"].filter(k => text.includes(k));
      matched.push(`Team Payments [keywords: ${ms.join(", ")}]`);
    }
    if (["login", "password", "otp", "signup"].some(k => text.includes(k))) {
      const ms = ["login", "password", "otp", "signup"].filter(k => text.includes(k));
      matched.push(`Team Auth [keywords: ${ms.join(", ")}]`);
    }
    if (["button", "layout", "design", "color", "dark mode"].some(k => text.includes(k))) {
      const ms = ["button", "layout", "design", "color", "dark mode"].filter(k => text.includes(k));
      matched.push(`Team UI [keywords: ${ms.join(", ")}]`);
    }
    if (["slow", "lag", "crash", "freeze"].some(k => text.includes(k))) {
      const ms = ["slow", "lag", "crash", "freeze"].filter(k => text.includes(k));
      matched.push(`Team Performance [keywords: ${ms.join(", ")}]`);
    }

    // Severity triggers
    if ((text.includes("money") && text.includes("failed")) || (text.includes("crash") && text.includes("all users"))) {
      matched.push(`Severity Critical [combination: 'money'+'failed' or 'crash'+'all users']`);
    } else if (text.includes("crash") || text.includes("payment failed")) {
      matched.push(`Severity High [strong keyword: 'crash' or 'payment failed']`);
    } else if (["cosmetic", "minor", "ui", "color"].some(k => text.includes(k))) {
      matched.push(`Severity Low [cosmetic keywords]`);
    }

    return matched;
  };

  if (feedback) {
    const triggers = getMatchedTriageTriggers(feedback.ticket.title, feedback.ticket.description);

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-6" id="submission-feedback-view">
        {/* Main Triage Header Banner */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700">SUBMISSION SUCCESS</span>
              <h2 className="text-xl font-semibold text-zinc-900">Incident Ticket #{feedback.ticket.id} Logged</h2>
            </div>
          </div>

          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
            Your report has been analyzed by our rule-based routing engines. It was routed to the appropriate engineering team and assigned a severity tier dynamically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-zinc-50 border border-zinc-150 mb-6">
            <div>
              <span className="block text-[11px] font-mono text-zinc-500 uppercase mb-1.5">ROUTE GROUP (TEAM)</span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border ${getTeamBadge(feedback.ticket.team)}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                {feedback.ticket.team}
              </div>
            </div>
            <div>
              <span className="block text-[11px] font-mono text-zinc-500 uppercase mb-1.5">TRIAGE SEVERITY SECTOR</span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border ${getSeverityBadge(feedback.ticket.severity)}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                {feedback.ticket.severity}
              </div>
            </div>
          </div>

          {/* Engine Explanation Details */}
          {triggers.length > 0 && (
            <div className="border-t border-zinc-100 pt-4">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 block mb-2">Triage engine triggers matched:</span>
              <div className="space-y-1">
                {triggers.map((trigger, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono text-zinc-600">
                    <CornerDownRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar Ticket Suggestion / Resolution block */}
        {feedback.similarityMatch ? (
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-6 sm:p-8 shadow-sm relative overflow-hidden" id="resolution-suggestion-box">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-100/20 rounded-full blur-xl -mr-4 -mt-4"></div>
            
            <div className="flex items-center gap-2.5 text-emerald-800 mb-4">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
              <h3 className="font-semibold text-sm sm:text-base">
                Instant Match: Similar Incident Suggestion Found ({feedback.similarityMatch.similarity}% match)
              </h3>
            </div>

            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Our TF-IDF similarity matcher compared your report's text structure against our database of past resolved incidents. We found a highly similar past ticket that was successfully fixed.
            </p>

            <div className="space-y-4 rounded-xl border border-emerald-150 bg-white p-5 shadow-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">PAST INCIDENT</span>
                <h4 className="font-medium text-zinc-800 text-sm mt-0.5">{feedback.similarityMatch.title}</h4>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 italic">
                  "{feedback.similarityMatch.description}"
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-semibold block mb-1">PROPOSED RESOLUTION NOTES</span>
                <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100/80 text-xs text-zinc-700 leading-relaxed font-sans relative">
                  {feedback.similarityMatch.resolution_notes}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-500">Would you like to try this resolution?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(feedback.similarityMatch!.resolution_notes)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied Notes!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDidHelp(true)}
                  disabled={didHelp}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    didHelp 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  {didHelp ? "✓ This solved my issue!" : "Yes, this resolved it!"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm">
            <div className="flex gap-3 text-zinc-500">
              <AlertCircle className="h-5 w-5 shrink-0 text-zinc-400" />
              <div>
                <h4 className="font-medium text-sm text-zinc-700">No matching resolved cases found above threshold</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Your bug report didn't cross the text similarity limit with any of the 20 pre-seeded solved cases. An engineering agent has been notified and will triage this shortly on the Workspace Dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons to continue */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Submit Another Report
          </button>
          <button
            type="button"
            onClick={onViewDashboard}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md transition-all cursor-pointer"
          >
            <span>Go to Agent Desk</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Template sandbox selection */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-zinc-800 mb-2.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Quick Test Templates</span>
        </div>
        <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
          Select an incident template to auto-populate the form below and test our keyword auto-categorization and matching engines:
        </p>
        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">File Incident Ticket</h2>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Provide descriptive details of the system failure. The routing classifier will parse inputs to assign the correct support tier and fetch related solutions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="bug-title" className="text-xs font-semibold text-zinc-700">
              Incident Summary (Title)
            </label>
            <input
              type="text"
              id="bug-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Credit card payment failed on transaction screen"
              required
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 bg-white shadow-xs focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="bug-desc" className="text-xs font-semibold text-zinc-700">
                Detailed Description (Free Text)
              </label>
              <span className="text-[10px] font-mono text-zinc-400">supports raw error logs</span>
            </div>
            <textarea
              id="bug-desc"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive explanation. For instance: 'I triggered a stripe checkout refund, but the page crashes and slow loading occurs on the screen...'"
              required
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 bg-white shadow-xs focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-hidden transition-all resize-y"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              id="submit-ticket-btn"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Running Routing Classifier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-zinc-100" />
                  <span>Submit to TriageDesk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
