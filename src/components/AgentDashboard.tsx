import React, { useState, useMemo } from "react";
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  Layers,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Send,
  CornerDownRight,
  RefreshCw
} from "lucide-react";
import { Team, Severity, Status, Ticket, calculateCosineSimilarity } from "../triageEngine";

interface AgentDashboardProps {
  tickets: Ticket[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AgentDashboard({
  tickets,
  onUpdateTicket,
  isLoading,
  onRefresh
}: AgentDashboardProps) {
  // Filter States
  const [selectedTeam, setSelectedTeam] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"severity" | "date">("severity");
  
  // Selected active ticket for sidebar workspace
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Edit fields for active ticket workspace
  const [tempStatus, setTempStatus] = useState<Status>(Status.Open);
  const [tempTeam, setTempTeam] = useState<Team>(Team.General);
  const [tempSeverity, setTempSeverity] = useState<Severity>(Severity.Medium);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdatingField, setIsUpdatingField] = useState(false);

  // Find currently selected ticket details
  const activeTicket = useMemo(() => {
    const t = tickets.find(ticket => ticket.id === selectedTicketId);
    if (t) {
      // Sync form values
      // Note: we only do this when activeTicket changes, so let's handle in state updates
      return t;
    }
    return null;
  }, [tickets, selectedTicketId]);

  // Handle selecting a ticket
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setTempStatus(ticket.status);
    setTempTeam(ticket.team);
    setTempSeverity(ticket.severity);
    setResolutionNotes(ticket.resolution_notes || "");
  };

  // Filter & Sort Logic
  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    // Filter by team
    if (selectedTeam !== "All") {
      result = result.filter(t => t.team === selectedTeam);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      result = result.filter(t => t.status === selectedStatus);
    }

    // Filter by search query (title, description, id)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }

    // Sort Logic
    if (sortBy === "severity") {
      // Severity Priority Rank
      const sevRank = {
        [Severity.Critical]: 4,
        [Severity.High]: 3,
        [Severity.Medium]: 2,
        [Severity.Low]: 1
      };
      // Sort by Severity first (critical top), then by Date (newest)
      result.sort((a, b) => {
        const diff = sevRank[b.severity] - sevRank[a.severity];
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // Sort by date (newest first)
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [tickets, selectedTeam, selectedStatus, searchQuery, sortBy]);

  // Calculate live matching recommendations inside active ticket context
  // Compares active ticket with other resolved/closed tickets to help agents copy previous fixes!
  const agentSimilarResolutions = useMemo(() => {
    if (!activeTicket) return [];

    const matches: { ticket: Ticket; score: number }[] = [];
    tickets.forEach(t => {
      // Don't compare ticket with itself, and only look for resolved/closed candidates with notes
      if (t.id === activeTicket.id) return;
      if (t.status !== Status.Resolved && t.status !== Status.Closed) return;
      if (!t.resolution_notes) return;

      const score = calculateCosineSimilarity(activeTicket.description, t.description);
      if (score >= 0.15) { // lower threshold for internal workspace recommendations
        matches.push({ ticket: t, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [tickets, activeTicket]);

  // Submit active workspace updates
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    setIsUpdatingField(true);
    try {
      // If status is marked resolved, ensure there's at least some resolution note
      let finalNotes = resolutionNotes;
      if (tempStatus === Status.Resolved && !resolutionNotes.trim()) {
        finalNotes = "Marked resolved by support specialist.";
        setResolutionNotes(finalNotes);
      }

      await onUpdateTicket(activeTicket.id, {
        status: tempStatus,
        team: tempTeam,
        severity: tempSeverity,
        resolution_notes: finalNotes
      });
    } catch (err) {
      console.error("Error updating ticket properties", err);
    } finally {
      setIsUpdatingField(false);
    }
  };

  // Quick apply notes from past matching ticket
  const handleApplyResolutionNote = (notes: string) => {
    setResolutionNotes(notes);
    setTempStatus(Status.Resolved);
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Styling helpers
  const getSeverityStyles = (sev: Severity) => {
    switch (sev) {
      case Severity.Critical:
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-600 animate-pulse"
        };
      case Severity.High:
        return {
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          dot: "bg-orange-500"
        };
      case Severity.Medium:
        return {
          bg: "bg-yellow-50 text-yellow-800 border-yellow-200",
          dot: "bg-yellow-500"
        };
      case Severity.Low:
        return {
          bg: "bg-zinc-100 text-zinc-600 border-zinc-200",
          dot: "bg-zinc-400"
        };
    }
  };

  const getStatusStyles = (status: Status) => {
    switch (status) {
      case Status.Open:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case Status.InProgress:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case Status.Resolved:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case Status.Closed:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start py-2" id="agent-dashboard-layout">
      {/* LEFT: Sidebar Filters */}
      <div className="xl:col-span-3 space-y-5">
        {/* Search Bar */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <label htmlFor="search-input" className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Search Ticket Queue
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, text..."
              className="w-full rounded-lg border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 bg-white shadow-xs focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Filter by Team */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-zinc-800 mb-3 border-b border-zinc-100 pb-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Route Filter</span>
          </div>
          <div className="space-y-1.5">
            {["All", ...Object.values(Team)].map((teamVal) => {
              const count = teamVal === "All" 
                ? tickets.length 
                : tickets.filter(t => t.team === teamVal).length;
              const isSelected = selectedTeam === teamVal;

              return (
                <button
                  key={teamVal}
                  onClick={() => setSelectedTeam(teamVal)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isSelected 
                      ? "bg-zinc-900 text-white" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <span>{teamVal}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
                    isSelected ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter by Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-zinc-800 mb-3 border-b border-zinc-100 pb-2">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Status Filter</span>
          </div>
          <div className="space-y-1.5">
            {["All", ...Object.values(Status)].map((statusVal) => {
              const count = statusVal === "All" 
                ? tickets.length 
                : tickets.filter(t => t.status === statusVal).length;
              const isSelected = selectedStatus === statusVal;

              return (
                <button
                  key={statusVal}
                  onClick={() => setSelectedStatus(statusVal)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isSelected 
                      ? "bg-zinc-900 text-white" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <span>{statusVal}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
                    isSelected ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort controls */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-zinc-800 mb-3 border-b border-zinc-100 pb-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Sort Priority</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setSortBy("severity")}
              className={`px-3 py-2 text-[11px] font-semibold rounded-lg text-center border cursor-pointer transition-all ${
                sortBy === "severity"
                  ? "bg-zinc-100 border-zinc-300 text-zinc-900 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Severity Priority
            </button>
            <button
              onClick={() => setSortBy("date")}
              className={`px-3 py-2 text-[11px] font-semibold rounded-lg text-center border cursor-pointer transition-all ${
                sortBy === "date"
                  ? "bg-zinc-100 border-zinc-300 text-zinc-900 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Newest Logged
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Queue List */}
      <div className={`space-y-4 xl:col-span-6`}>
        {/* Header Summary info */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Queue List</h3>
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-200 rounded-full text-zinc-700">
              {filteredAndSortedTickets.length} incidents
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Sync Queue</span>
          </button>
        </div>

        {/* Empty state */}
        {filteredAndSortedTickets.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-12 px-4 text-center">
            <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <h4 className="font-semibold text-zinc-700 text-sm">No incidents matched filters</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Try adjusting your team sidebar selections, status checkboxes, or text query parameter.
            </p>
          </div>
        )}

        {/* Ticket List View */}
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {filteredAndSortedTickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const sevStyles = getSeverityStyles(ticket.severity);

            return (
              <div
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket)}
                className={`group rounded-xl border p-4 text-left transition-all cursor-pointer bg-white relative ${
                  isSelected
                    ? "border-zinc-950 ring-1 ring-zinc-950 bg-zinc-50/20"
                    : "border-zinc-200 hover:border-zinc-300 shadow-xs hover:shadow-sm"
                }`}
              >
                {/* Upper line: Id, date, and status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-zinc-500">
                      #{ticket.id}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      • <Clock className="h-3 w-3 inline" /> {formatDate(ticket.created_at)}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusStyles(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-sm text-zinc-900 leading-snug group-hover:text-zinc-950 transition-colors">
                  {ticket.title}
                </h4>

                {/* Description snippet */}
                <p className="text-xs text-zinc-500 mt-1 mb-3.5 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Lower line: Metadata Badges */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-400">Team:</span>
                    <span className="text-[11px] font-medium text-zinc-700">
                      {ticket.team}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-md border ${sevStyles.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sevStyles.dot}`}></span>
                    <span>{ticket.severity}</span>
                  </div>
                </div>

                {/* Arrow indicator on hover */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:block">
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Incident Workspace Detail Sidebar */}
      <div className="xl:col-span-3">
        {activeTicket ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-5 sticky top-20" id="active-ticket-workspace">
            {/* Header / ID */}
            <div className="border-b border-zinc-100 pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] font-bold text-zinc-500">
                  ACTIVE TICKET: #{activeTicket.id}
                </span>
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
              <h3 className="font-semibold text-sm text-zinc-950 leading-snug">
                {activeTicket.title}
              </h3>
            </div>

            {/* Description Scroller */}
            <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-150">
              <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase block mb-1">REPORT DESCRIPTION</span>
              <p className="text-xs text-zinc-600 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                {activeTicket.description}
              </p>
            </div>

            {/* Resolution Helper / Similarity Copy section */}
            {agentSimilarResolutions.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/20 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Suggested Fixes From Similarity</span>
                </div>
                
                <div className="space-y-2">
                  {agentSimilarResolutions.map((match, idx) => (
                    <div key={idx} className="border-b border-emerald-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="font-medium text-[11px] text-zinc-800 line-clamp-1">{match.ticket.title}</h5>
                        <span className="text-[9px] font-mono text-emerald-600 shrink-0 bg-emerald-50 px-1 py-0.5 rounded">
                          {Math.round(match.score * 100)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic mt-0.5 line-clamp-2">
                        "{match.ticket.resolution_notes}"
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApplyResolutionNote(match.ticket.resolution_notes || "")}
                        className="mt-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        <span>Apply resolution & resolve</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Properties Form */}
            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-team" className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                    Override Team
                  </label>
                  <select
                    id="edit-team"
                    value={tempTeam}
                    onChange={(e) => setTempTeam(e.target.value as Team)}
                    className="w-full text-xs rounded-lg border border-zinc-200 px-2 py-1.5 bg-white cursor-pointer focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-hidden"
                  >
                    {Object.values(Team).map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-severity" className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                    Override Severity
                  </label>
                  <select
                    id="edit-severity"
                    value={tempSeverity}
                    onChange={(e) => setTempSeverity(e.target.value as Severity)}
                    className="w-full text-xs rounded-lg border border-zinc-200 px-2 py-1.5 bg-white cursor-pointer focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-hidden"
                  >
                    {Object.values(Severity).map(sev => (
                      <option key={sev} value={sev}>{sev}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Update Button Group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">
                  Update Ticket Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(Status).map(statusVal => {
                    const isCurrent = tempStatus === statusVal;
                    return (
                      <button
                        key={statusVal}
                        type="button"
                        onClick={() => setTempStatus(statusVal)}
                        className={`py-1.5 text-[10px] font-semibold rounded-lg text-center border cursor-pointer transition-colors ${
                          isCurrent
                            ? "bg-zinc-900 border-zinc-900 text-white font-bold"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {statusVal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Notes (Shown always, but required when marked Resolved) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="resolution-notes" className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                    Resolution Notes
                  </label>
                  {tempStatus === Status.Resolved && (
                    <span className="text-[9px] text-red-500 font-semibold">*Required</span>
                  )}
                </div>
                <textarea
                  id="resolution-notes"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={
                    tempStatus === Status.Resolved
                      ? "Describe the fix details... (e.g. 'Upgraded Stripe SDK and updated confirmation handlers')"
                      : "Optional notes. Enter resolution notes here when wrapping up..."
                  }
                  required={tempStatus === Status.Resolved}
                  className="w-full text-xs rounded-lg border border-zinc-200 px-2.5 py-2 bg-white shadow-xs focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-hidden resize-y"
                ></textarea>
              </div>

              {/* Action Save Button */}
              <button
                type="submit"
                disabled={isUpdatingField || (tempStatus === Status.Resolved && !resolutionNotes.trim())}
                id="update-ticket-properties-btn"
                className="w-full flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white shadow-md transition-all cursor-pointer"
              >
                {isUpdatingField ? (
                  <>
                    <span className="h-3 w-3 rounded-full border border-white/30 border-t-white animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Apply Support Action</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-center shadow-xs">
            <ShieldAlert className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
            <h4 className="font-semibold text-xs text-zinc-600">No Incident Selected</h4>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Click any incident card from the queue to open the active agent workspace. Here you can override auto-routes, update ticket status, review similar solutions, and write closure resolutions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
