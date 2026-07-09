import React, { useState, useEffect, useMemo } from "react";
import { Ticket, Status, Severity } from "./triageEngine";
import Navbar from "./components/Navbar";
import TicketSubmissionForm from "./components/TicketSubmissionForm";
import AgentDashboard from "./components/AgentDashboard";
import OpsDashboard from "./components/OpsDashboard";
import { AlertCircle, RefreshCw, ServerCrash } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"submit" | "dashboard" | "analytics">("dashboard");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch all tickets on mount
  const fetchTickets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        setErrorMessage("Failed to retrieve incident queue from server.");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setErrorMessage("Could not connect to the backend server. Make sure it is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update a ticket's fields (status, team, severity, resolution_notes)
  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTicket = data.ticket;
        // Update local tickets state
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updatedTicket } : t))
        );
      } else {
        console.error("Failed to update ticket server-side");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // Reset database back to original 20 pre-seeded tickets
  const handleResetDatabase = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
        // Optional quick alert
      } else {
        console.error("Failed to reset tickets");
      }
    } catch (error) {
      console.error("Error resetting tickets:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Calculate live statistics for top bar HUD dynamically from tickets
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(
      (t) => t.status === Status.Open || t.status === Status.InProgress
    ).length;
    // Count critical tickets that are still open or in progress
    const critical = tickets.filter(
      (t) =>
        t.severity === Severity.Critical &&
        (t.status === Status.Open || t.status === Status.InProgress)
    ).length;
    const resolved = tickets.filter(
      (t) => t.status === Status.Resolved || t.status === Status.Closed
    ).length;

    return { total, open, critical, resolved };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans" id="app-container">
      {/* Navbar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleResetDatabase}
        isResetting={isResetting}
        stats={stats}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State Banner */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
            <ServerCrash className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Server Synchronicity Error</h4>
              <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              <button
                onClick={fetchTickets}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner for full screen */}
        {isLoading && tickets.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin"></div>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-3">
              Syncing TriageDesk ticket queue...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "submit" ? (
              <TicketSubmissionForm
                onSubmitSuccess={fetchTickets}
                onViewDashboard={() => setActiveTab("dashboard")}
              />
            ) : activeTab === "dashboard" ? (
              <AgentDashboard
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                isLoading={isLoading}
                onRefresh={fetchTickets}
              />
            ) : (
              <OpsDashboard
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                onRefresh={fetchTickets}
              />
            )}
          </div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div>
            <span>TriageDesk • Rules-Based Router</span>
          </div>
          <div className="flex gap-4">
            <span>TF-IDF Text Similarity Engine</span>
            <span>•</span>
            <span>20 Seed Records</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
