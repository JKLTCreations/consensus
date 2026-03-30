# CONSENSUS - Multi-Agent Policy Deliberation

## Why We Built This

On January 19, 2025, the U.S. federal government shut down after Congress failed to reach consensus on a spending bill. In the weeks that followed, the consequences of that failure rippled outward in ways few anticipated. Staffing shortages at the FAA — a direct result of the shutdown — contributed to the conditions that led to the crash of Air Canada Flight 2259. A policy disagreement in Washington had, through a chain of institutional neglect, cost lives.

That event crystallized something we had been thinking about for a long time: **the cost of political gridlock is not abstract.** When legislators cannot reach consensus, the downstream effects fall on ordinary people — through degraded public services, stalled infrastructure, and institutional failures that compound over time.

We also recognized that the policy debate itself is broken. Citizens are forced to rely on partisan media, think-tank spin, and social media noise to form opinions about policies that will directly affect their lives. There is no tool that takes a policy proposal, subjects it to rigorous multi-perspective analysis, and produces an honest, transparent map of where experts agree, where they disagree, and what the evidence actually says.

**CONSENSUS exists to fill that gap.** It is an AI-powered deliberation engine that analyzes policy proposals from five distinct analytical perspectives, forces those perspectives to confront each other's evidence, and synthesizes the result into a clear, evidence-ranked consensus report. It does not tell you what to think. It maps the decision space so that citizens — the people policies are ultimately made for — can see the full picture.

This tool is built for **citizens of any population who deserve the right to fair, just, and evidence-based policymaking.** Not lobbyists. Not pundits. People.

---

## How It Works

CONSENSUS uses a structured multi-round deliberation protocol where five AI agents — each embodying a distinct analytical lens — independently analyze a policy proposal, then confront each other's claims, resolve conflicts, and converge toward evidence-backed consensus.

### The Agents

| Agent | Perspective | Analytical Focus |
|-------|------------|-----------------|
| **Fiscal Conservative** | Free market economics | Federal budgeting, tax burden, deficit/debt impact, regulatory costs, supply-side growth |
| **Progressive Policy** | Social economics | Income inequality, healthcare access, education ROI, social mobility, fiscal multipliers |
| **Macroeconomic Analyst** | Nonpartisan data-driven | GDP projections, inflation dynamics, labor markets, monetary policy interaction, trade balance |
| **Public Welfare** | Household impact | Cost of living, food/housing security, employment quality, demographic disparities, transition costs |
| **Constitutional/Legal** | Legal feasibility | Constitutional authority, SCOTUS precedent, enforcement mechanisms, federal vs. state jurisdiction |
| **Moderator** | Synthesis | Identifies convergence, proposes compromises, scores rationality, produces final consensus map |

Each agent is constrained to tag every factual claim with `[STAT:]`, `[SOURCE:]`, or `[CAUSAL:]` markers, enabling programmatic verification and cross-agent comparison.

### The Deliberation Process

```
ROUND 0: ASSUMPTION FRAMING
    All 5 agents declare their assumptions (scope, timeline, economic
    context, population, unstated). Programmatic conflict detection
    identifies contradictions (e.g., "immediate" vs "phased" timelines).

ROUND 1: INDEPENDENT ANALYSIS
    Each agent provides a position (SUPPORT/OPPOSE/CONDITIONAL), 3-4
    evidence-tagged arguments, risks, and conditions for changing
    their stance. Agents do not see each other's work.

ROUND 1.5: DISCREPANCY DETECTION
    Two-stage conflict detection:
    1. Programmatic pass — code detects numerical divergence (>10%),
       source conflicts, and causal contradictions across agents
    2. Moderator LLM pass — validates findings, identifies semantic
       conflicts the code missed, flags assumption-driven vs. factual
       disagreements

ROUND 2: CONFLICT RESOLUTION
    Each agent confronts the discrepancies, other agents' arguments,
    and must concede at least one point. Produces revised positions,
    agreements, rebuttals, and compromise proposals.

ROUND 3: CONSENSUS SYNTHESIS
    The Moderator synthesizes everything using an evidence hierarchy:
    1. Verified claims (highest weight)
    2. CBO/GAO/BLS official data
    3. Peer-reviewed research
    4. Federal Reserve analysis
    5. Historical precedent
    6. International comparisons
    7. Think tank analysis
    8. Theoretical models (lowest weight)

    Output: consensus score, areas of agreement, compromises,
    irreconcilable disagreements, rationality scores per agent,
    and a single evidence-backed recommendation with specific
    parameters (dollar amounts, timelines, conditions).
```

### Key Design Principles

- **Transparency over authority**: CONSENSUS maps the decision space — it does not make the decision. Every claim is attributed, every conflict is surfaced, and every concession is tracked.
- **Mandatory concession**: Agents are required to concede at least one point per round, preventing ideological entrenchment.
- **Assumption-aware**: Disagreements are labeled as either factual disputes or framing differences, so users can distinguish "we disagree on the numbers" from "we disagree on what matters."
- **Evidence hierarchy**: Final synthesis is weighted by source quality, not volume. A single CBO estimate outweighs ten think-tank assertions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Frontend | React 19, TypeScript 5.7 |
| Styling | Tailwind CSS 4.0 with custom CSS variables |
| AI | Anthropic Claude API (claude-sonnet-4) via @anthropic-ai/sdk |
| Streaming | NDJSON event stream over HTTP (ReadableStream) |
| Deployment | Node.js runtime |

---

## Project Structure

```
consensus/
  app/
    api/deliberate/route.ts   — API endpoint: orchestrates the full deliberation
    globals.css                — Theme, fonts, animations, CSS variables
    layout.tsx                 — Root layout
    page.tsx                   — Entry point → ConsensusApp
  components/
    ConsensusApp.tsx           — Main state machine, event stream consumer
    PolicyInput.tsx            — Search bar UI with sample proposals
    AgentStatusBar.tsx         — Real-time round/agent progress indicator
    AgentBadge.tsx             — Colored agent label
    PulsingDot.tsx             — Active agent animation
    DeliberationTimeline.tsx   — Renders Round 0 → Round 2 results
    AssumptionFramingPanel.tsx — Round 0 assumption cards + conflict display
    AssumptionConflictCard.tsx — Individual assumption conflict
    AgentAnalysisPanel.tsx     — Collapsible per-agent analysis with evidence tags
    EvidenceVerificationBadge.tsx — Claim verification status indicator
    VerificationPanel.tsx      — Verification results summary
    DiscrepancyPanel.tsx       — Discrepancy report with severity levels
    DiscrepancyResponseView.tsx— Agent defend/concede/partial responses
    ResolvedDiscrepancyCard.tsx— Resolved conflict with winning position
    ConsensusReport.tsx        — Final report: meter, recommendation, scores
    ConsensusMeter.tsx         — Visual consensus score (0-100)
    RationalRecommendation.tsx — Evidence-backed policy recommendation
    RationalityScores.tsx      — Per-agent rationality rankings
  lib/
    agents.ts                  — Agent definitions, system prompts, colors
    types.ts                   — TypeScript interfaces for all data structures
    prompts.ts                 — Prompt builders for each deliberation round
    claim-extractor.ts         — Extracts [STAT:]/[SOURCE:]/[CAUSAL:] claims
    claim-comparator.ts        — Programmatic discrepancy detection
    verification.ts            — Web search-based claim verification
    sample-proposals.ts        — 5 pre-loaded policy proposals
```

---

## API Optimization

CONSENSUS uses **per-agent API keys** so that each of the six agents (5 analysts + 1 moderator) operates on its own rate-limit quota. This enables fully parallel execution within each round:

- **Per-agent keys**: Each agent has its own Anthropic API key (`ANTHROPIC_API_KEY_FISCAL`, `ANTHROPIC_API_KEY_PROGRESSIVE`, etc.), so all 5 analysts run simultaneously without hitting a single key's rate limit
- **Parallel rounds**: Rounds 0, 1, and 2 fire all 5 agent calls in parallel via `Promise.all` -- total wall-clock time equals the slowest agent, not the sum of all agents
- **Exponential backoff**: 60s/75s/90s retry per key on rate limits
- **~75s total deliberation**: Down from ~5 minutes with a single sequential key

| Round | Calls | Parallelism |
|-------|-------|-------------|
| Round 0 (Assumptions) | 5 | All parallel |
| Round 1 (Analysis) | 5 | All parallel |
| Round 1.5 (Discrepancies) | 1 | Moderator key |
| Round 2 (Conflict Resolution) | 5 | All parallel |
| Round 3 (Consensus) | 1 | Moderator key |
| **Total** | **17** | **Max 3 calls per key** |

---

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd consensus
   npm install
   ```
3. Create `.env.local` with six Anthropic API keys (one per agent):
   ```
   ANTHROPIC_API_KEY_FISCAL=sk-ant-...
   ANTHROPIC_API_KEY_PROGRESSIVE=sk-ant-...
   ANTHROPIC_API_KEY_MACRO=sk-ant-...
   ANTHROPIC_API_KEY_WELFARE=sk-ant-...
   ANTHROPIC_API_KEY_LEGAL=sk-ant-...
   ANTHROPIC_API_KEY_MODERATOR=sk-ant-...
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

---

## Sample Proposals

CONSENSUS ships with five pre-loaded policy proposals for immediate testing:

1. **Federal Carbon Tax** — Revenue-neutral carbon pricing with citizen dividends
2. **$20 Minimum Wage** — Phased federal minimum wage increase over three years
3. **Universal Basic Income** — Monthly payments funded by value-added tax
4. **Debt Ceiling Reform** — Conditional debt ceiling increase with spending controls
5. **Free Community College** — Federal funding for tuition-free community college

---

*CONSENSUS v1.0 — Decision support, not decision making. Powered by Claude.*
