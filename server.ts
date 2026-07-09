import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  Team, 
  Severity, 
  Status, 
  Ticket, 
  SEED_TICKETS, 
  categorizeTicket, 
  findSimilarTicket 
} from "./src/triageEngine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // In-memory ticket store initialized with 20 seed tickets
  let tickets: Ticket[] = [...SEED_TICKETS];

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API Route: Get all tickets
  app.get("/api/tickets", (req, res) => {
    res.json({ tickets });
  });

  // API Route: Submit new ticket with auto-categorization and similarity matching
  app.post("/api/tickets", (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
      }

      const startTime = performance.now();

      // Run auto-categorization
      const { team, severity } = categorizeTicket(title, description);

      // Check for similar past resolved tickets
      const match = findSimilarTicket(description, tickets, 0.20);

      const endTime = performance.now();
      const latencyMs = parseFloat((endTime - startTime).toFixed(2)) || 0.8; // default to 0.8ms if 0

      // Calculate SLA deadline
      let slaHours = 24;
      if (severity === Severity.Critical) slaHours = 4;
      else if (severity === Severity.High) slaHours = 12;
      else if (severity === Severity.Medium) slaHours = 24;
      else if (severity === Severity.Low) slaHours = 48;

      const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

      // Create new ticket
      const newTicket: Ticket = {
        id: `ticket-${Date.now()}`,
        title,
        description,
        team,
        severity,
        status: Status.Open,
        created_at: new Date().toISOString(),
        ingestion_latency_ms: latencyMs,
        sla_deadline: slaDeadline,
        escalated: false,
        similarity_matched: !!match
      };

      // Store in memory
      tickets.push(newTicket);

      res.status(201).json({
        ticket: newTicket,
        similarityMatch: match ? {
          title: match.ticket.title,
          description: match.ticket.description,
          similarity: Math.round(match.similarity * 100),
          resolution_notes: match.ticket.resolution_notes
        } : null
      });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Update ticket status or resolution notes
  app.put("/api/tickets/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, resolution_notes, team, severity } = req.body;

      const ticketIndex = tickets.findIndex(t => t.id === id);
      if (ticketIndex === -1) {
        return res.status(404).json({ error: "Ticket not found." });
      }

      const existingTicket = tickets[ticketIndex];

      // Update fields if provided
      if (status) existingTicket.status = status as Status;
      if (resolution_notes !== undefined) existingTicket.resolution_notes = resolution_notes;
      if (team) existingTicket.team = team as Team;
      if (severity) existingTicket.severity = severity as Severity;
      if (req.body.escalated !== undefined) existingTicket.escalated = req.body.escalated;
      if (req.body.sla_deadline !== undefined) existingTicket.sla_deadline = req.body.sla_deadline;

      tickets[ticketIndex] = existingTicket;

      res.json({ ticket: existingTicket });
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reset tickets endpoint (useful for demo/testing)
  app.post("/api/reset", (req, res) => {
    tickets = [...SEED_TICKETS];
    res.json({ message: "Tickets reset to initial seed data.", tickets });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TriageDesk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
