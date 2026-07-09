/**
 * TriageDesk - Categorization & Similarity Engine
 */

export enum Team {
  Payments = "Payments",
  Auth = "Auth",
  UI = "UI",
  Performance = "Performance",
  General = "General"
}

export enum Severity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

export enum Status {
  Open = "Open",
  InProgress = "In Progress",
  Resolved = "Resolved",
  Closed = "Closed"
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  team: Team;
  severity: Severity;
  status: Status;
  created_at: string;
  resolution_notes?: string;
  ingestion_latency_ms?: number;
  sla_deadline?: string;
  escalated?: boolean;
  similarity_matched?: boolean;
}

// Pre-seeded resolved tickets (20 items)
export const SEED_TICKETS: Ticket[] = [
  {
    id: "seed-1",
    title: "Checkout button not working on cart page",
    description: "The main checkout button on the cart page is frozen. Users are unable to proceed with their payment or complete their transactions.",
    team: Team.Payments,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    resolution_notes: "Fixed a race condition in the checkout form validation script. Upgraded the stripe payment library version.",
    ingestion_latency_ms: 1.2,
    sla_deadline: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: true
  },
  {
    id: "seed-2",
    title: "Credit card transaction declined error code 400",
    description: "Transactions are failing with error code 400. In addition, processing a refund is completely broken and throws server timeout.",
    team: Team.Payments,
    severity: Severity.Critical,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 45 * 3600 * 1000).toISOString(),
    resolution_notes: "Corrected the API gateway payment payload mapping. Restored correct refund route timeouts to 5000ms.",
    ingestion_latency_ms: 0.9,
    sla_deadline: new Date(Date.now() - 41 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-3",
    title: "Refund confirmation UI showing blank screen",
    description: "When an agent initiates a payment refund, the confirmation panel displays a completely blank page instead of the success feedback.",
    team: Team.Payments,
    severity: Severity.Medium,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
    resolution_notes: "Added proper fallback checks on the payment confirmation state listener to handle undefined responses.",
    ingestion_latency_ms: 1.1,
    sla_deadline: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: true
  },
  {
    id: "seed-4",
    title: "Slow transaction page loading times",
    description: "The payment dashboard is extremely slow. Loading completed transaction history details takes over 10 seconds on average.",
    team: Team.Payments,
    severity: Severity.Medium,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    resolution_notes: "Optimized database indexes on transactions table and added Redis cache layer for fetching historical lists.",
    ingestion_latency_ms: 1.5,
    sla_deadline: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    escalated: true,
    similarity_matched: true
  },
  {
    id: "seed-5",
    title: "User login OTP SMS fails to deliver on Safari",
    description: "When signing in on Safari browsers, the OTP SMS never arrives. Verification times out and user login gets blocked.",
    team: Team.Auth,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    resolution_notes: "Safari third-party cookie restrictions were blocking cookie storage; implemented a localized cookie header and upgraded OTP dispatcher.",
    ingestion_latency_ms: 1.3,
    sla_deadline: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-6",
    title: "Password reset token email delay",
    description: "Users are reporting that the password reset email takes up to an hour to arrive. By that time, the token link has already expired.",
    team: Team.Auth,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
    resolution_notes: "Moved password reset dispatch operations to high-priority transactional message queues in SendGrid.",
    ingestion_latency_ms: 1.4,
    sla_deadline: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-7",
    title: "OTP validation code invalid on signup",
    description: "New user signup validation is failing. Entering the correct OTP code still shows an invalid verification code error message.",
    team: Team.Auth,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    resolution_notes: "Fixed temporary storage token expiry synchronization. Revamped Redis key validity window from 1 minute to 10 minutes.",
    ingestion_latency_ms: 1.0,
    sla_deadline: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: true
  },
  {
    id: "seed-8",
    title: "Google SSO OAuth authentication failure",
    description: "Clicking the Google SSO login button results in a white screen with no error code. Session doesn't get initialized.",
    team: Team.Auth,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    resolution_notes: "Added authorized redirect URIs in Google Cloud Console dashboard to match current testing and production subdomains.",
    ingestion_latency_ms: 1.1,
    sla_deadline: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-9",
    title: "Navigation bar buttons overlap logo on mobile screens",
    description: "The layout of the main navigation bar is broken on mobile sizes. Buttons and icons overlap with the product logo in portrait view.",
    team: Team.UI,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    resolution_notes: "Applied flex-wrap class and updated responsive media query tailwind breakpoints to stack layout nicely on mobile screens.",
    ingestion_latency_ms: 0.8,
    sla_deadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-10",
    title: "Low contrast in dark mode configuration settings",
    description: "The text colors inside the settings drawer in dark mode are almost invisible. Gray text on a dark charcoal background.",
    team: Team.UI,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    resolution_notes: "Replaced hardcoded hex values with Tailwind CSS text-slate-100 dark styles to support high contrast accessibility.",
    ingestion_latency_ms: 0.9,
    sla_deadline: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-11",
    title: "Loading button spinner looks distorted",
    description: "When saving forms, the secondary buttons with spinners look ugly and distorted. Spinner design is squished inside the block.",
    team: Team.UI,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolution_notes: "Applied standard inline-flex classes with explicit items-center and width constraints to the button loading spinner icons.",
    ingestion_latency_ms: 1.0,
    sla_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-12",
    title: "Dropdown list cut off inside scrolling card container",
    description: "The custom dropdown list layout cuts off. The items cannot be selected because they are clipped by the outer overflow-scroll container.",
    team: Team.UI,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    resolution_notes: "Utilized Radix portal wrapper inside dropdown components to render overlays directly outside the nested scroll container.",
    ingestion_latency_ms: 1.1,
    sla_deadline: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-13",
    title: "Browser crashes when loading massive history page",
    description: "The application freezes and the tab crashes when listing over 100 resolved incidents. Huge rendering lag and freezing behavior.",
    team: Team.Performance,
    severity: Severity.Critical,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    resolution_notes: "Implemented a virtual scroll list using simple element offset slicing to avoid overloading browser DOM with hundreds of cards.",
    ingestion_latency_ms: 1.6,
    sla_deadline: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    escalated: true,
    similarity_matched: true
  },
  {
    id: "seed-14",
    title: "Severe memory leak and slow lagging on Firefox",
    description: "Firefox users experience severe lag and memory build-up over time. Memory usage grows by hundreds of megabytes on tab switch.",
    team: Team.Performance,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    resolution_notes: "Discovered an uncleaned window resize resizeObserver event hook in the main dashboard component and successfully garbage collected it.",
    ingestion_latency_ms: 1.3,
    sla_deadline: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-15",
    title: "Main analytics exporter freezes during download",
    description: "When downloading report logs, the whole browser tab freezes for up to a minute before starting the file transfer.",
    team: Team.Performance,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    resolution_notes: "Refactored the exporter to compile large CSV reports in chunks on the server side instead of processing heavy arrays in main thread.",
    ingestion_latency_ms: 1.4,
    sla_deadline: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-16",
    title: "Search index slow query lagging database",
    description: "Query execution lags. Searching incidents using keywords causes high CPU load, leading to application crash and freezes.",
    team: Team.Performance,
    severity: Severity.High,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    resolution_notes: "Added partial indexes to team and status columns in the SQL tables and restructured text search queries.",
    ingestion_latency_ms: 1.5,
    sla_deadline: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: true
  },
  {
    id: "seed-17",
    title: "Weekly report mail header encoding glitch",
    description: "The automated email has garbled weird characters in the header lines. Looks like raw HTML text syntax details are visible.",
    team: Team.General,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolution_notes: "Configured transport layouts explicitly with UTF-8 content encoding and corrected email headers to use text/html instead.",
    ingestion_latency_ms: 0.9,
    sla_deadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-18",
    title: "Outdated legal copyright date in footer",
    description: "The application footer shows last year's calendar copyright date instead of updating dynamically to the current year.",
    team: Team.General,
    severity: Severity.Low,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    resolution_notes: "Replaced static date text in layout components with dynamic new Date().getFullYear() rendering.",
    ingestion_latency_ms: 0.7,
    sla_deadline: new Date(Date.now() + 38 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-19",
    title: "Missing size validation on avatar picture upload",
    description: "Attempting to upload a large avatar profile photo greater than 10MB fails with an obscure server gateway error.",
    team: Team.General,
    severity: Severity.Medium,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    resolution_notes: "Added client-side size checks targeting inputs with 5MB maximum limits, throwing descriptive toast alert messages on breach.",
    ingestion_latency_ms: 1.1,
    sla_deadline: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  },
  {
    id: "seed-20",
    title: "Footer help support link returns 404 error page",
    description: "The help link located in the footer page layout is broken. It directs users to an inactive page leading to a 404.",
    team: Team.General,
    severity: Severity.Medium,
    status: Status.Resolved,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    resolution_notes: "Corrected the support relative hyperlink path typo inside footer link array elements.",
    ingestion_latency_ms: 1.0,
    sla_deadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    escalated: false,
    similarity_matched: false
  }
];

/**
 * AUTO-CATEGORIZATION ENGINE
 * 
 * 1. TEAM rules:
 * - Payments: payment, checkout, transaction, refund
 * - Auth: login, password, OTP, signup
 * - UI: button, layout, design, color, dark mode
 * - Performance: slow, lag, crash, freeze
 * - General: fallback if no keywords match
 * 
 * 2. SEVERITY rules:
 * - Critical: if description contains combinations like ("money" + "failed"), or ("crash" + "all users")
 * - High: single strong keyword like "crash" or "payment failed"
 * - Medium: default
 * - Low: keywords: cosmetic, minor, UI, color
 */
export function categorizeTicket(title: string, description: string): { team: Team; severity: Severity } {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Determine Team
  let team = Team.General;
  
  const paymentsKeywords = ["payment", "checkout", "transaction", "refund"];
  const authKeywords = ["login", "password", "otp", "signup"];
  const uiKeywords = ["button", "layout", "design", "color", "dark mode"];
  const perfKeywords = ["slow", "lag", "crash", "freeze"];

  const hasPayments = paymentsKeywords.some(keyword => text.includes(keyword));
  const hasAuth = authKeywords.some(keyword => text.includes(keyword));
  const hasUI = uiKeywords.some(keyword => text.includes(keyword));
  const hasPerf = perfKeywords.some(keyword => text.includes(keyword));

  // Let's count matches or match in priority order
  if (hasPayments) {
    team = Team.Payments;
  } else if (hasAuth) {
    team = Team.Auth;
  } else if (hasPerf) {
    team = Team.Performance;
  } else if (hasUI) {
    team = Team.UI;
  }

  // 2. Determine Severity
  let severity = Severity.Medium; // default

  const containsMoneyFailed = text.includes("money") && text.includes("failed");
  const containsCrashAllUsers = text.includes("crash") && text.includes("all users");

  const isCritical = containsMoneyFailed || containsCrashAllUsers;
  
  const isHigh = text.includes("crash") || text.includes("payment failed") || text.includes("payment failed".replace(" ", ""));
  
  const isLow = ["cosmetic", "minor", "ui", "color"].some(keyword => text.includes(keyword));

  if (isCritical) {
    severity = Severity.Critical;
  } else if (isHigh) {
    severity = Severity.High;
  } else if (isLow) {
    severity = Severity.Low;
  }

  return { team, severity };
}

/**
 * SIMILAR TICKET SUGGESTIONS ENGINE (TF-IDF Cosine Similarity)
 */
export function calculateCosineSimilarity(text1: string, text2: string): number {
  const stopwords = new Set([
    "the", "and", "this", "that", "with", "from", "for", "your", "have", "were", "will",
    "is", "at", "on", "in", "to", "of", "a", "an", "it", "its", "are", "was", "be", "or", "but"
  ]);

  const tokenize = (text: string): string[] => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.has(word));
  };

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }

  // Vocabulary
  const vocab = Array.from(new Set([...words1, ...words2]));

  // Frequency mapping
  const freq1: Record<string, number> = {};
  const freq2: Record<string, number> = {};

  words1.forEach(w => freq1[w] = (freq1[w] || 0) + 1);
  words2.forEach(w => freq2[w] = (freq2[w] || 0) + 1);

  // Compute dot product and magnitudes
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  vocab.forEach(word => {
    const val1 = freq1[word] || 0;
    const val2 = freq2[word] || 0;
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export interface SimilarityResult {
  ticket: Ticket;
  similarity: number;
}

/**
 * Searches resolved tickets and returns the best match with similarity score above the threshold.
 */
export function findSimilarTicket(newDescription: string, resolvedTickets: Ticket[], threshold: number = 0.20): SimilarityResult | null {
  let bestMatch: Ticket | null = null;
  let highestScore = 0;

  resolvedTickets.forEach(ticket => {
    // Only compare against Resolved or Closed tickets
    if (ticket.status !== Status.Resolved && ticket.status !== Status.Closed) {
      return;
    }
    const score = calculateCosineSimilarity(newDescription, ticket.description);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = ticket;
    }
  });

  if (bestMatch && highestScore >= threshold) {
    return {
      ticket: bestMatch,
      similarity: highestScore
    };
  }

  return null;
}
