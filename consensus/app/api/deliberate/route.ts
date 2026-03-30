import { NextRequest } from 'next/server';
import { analysisAgents } from '@/lib/agents';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ━━━ HARDCODED MOCK DATA FOR DEMO ━━━

const MOCK_ROUND0: Record<string, Record<string, string[]>> = {
  fiscal: {
    scope_assumptions: [
      "The proposal covers DHS discretionary spending including TSA, FEMA, and ICE operations totaling ~$62B annually",
      "General security operations and immigration enforcement draw from the same DHS appropriations pipeline",
    ],
    timeline_assumptions: [
      "A continuing resolution (CR) would fund operations at FY2024 levels for 90-120 days during impasse",
    ],
    economic_context_assumptions: [
      "Federal deficit exceeds $1.8T in FY2025, constraining new spending authority",
    ],
    population_assumptions: [
      "TSA screens ~2.9M passengers daily; FEMA covers 50 states; ICE enforcement affects ~11M undocumented residents",
    ],
    key_unstated_assumptions: [
      "Neither chamber is willing to accept a full government shutdown as leverage",
    ],
  },
  progressive: {
    scope_assumptions: [
      "Aviation screening and disaster response are non-partisan essential services affecting all Americans",
      "Immigration enforcement without reform means expanded detention and deportation without pathway provisions",
    ],
    timeline_assumptions: [
      "Phased implementation over 18-24 months would allow workforce and infrastructure adjustments",
    ],
    economic_context_assumptions: [
      "DHS spending on immigration enforcement has increased 300% since 2003 with diminishing returns on border security metrics",
    ],
    population_assumptions: [
      "Enforcement-only policy disproportionately impacts mixed-status families.approximately 4.4M US-citizen children have undocumented parents",
    ],
    key_unstated_assumptions: [
      "Full enforcement funding without reform is a political bargaining position, not a viable standalone policy",
    ],
  },
  macro: {
    scope_assumptions: [
      "The impasse affects roughly $62B in DHS discretionary spending across 22 component agencies",
      "A shutdown of DHS operations would reduce GDP growth by 0.1-0.2 percentage points per quarter",
    ],
    timeline_assumptions: [
      "Historical precedent suggests 2-4 week resolution window before economic damage compounds",
    ],
    economic_context_assumptions: [
      "Aviation industry contributes $1.9T to US GDP; disruption to TSA screening creates immediate cascading losses",
    ],
    population_assumptions: [
      "60,000+ TSA agents and 20,000+ FEMA personnel would face furlough or unpaid work during impasse",
    ],
    key_unstated_assumptions: [
      "Financial markets price in shutdown risk within 72 hours of impasse announcement",
    ],
  },
  welfare: {
    scope_assumptions: [
      "Critical infrastructure includes airport security, disaster preparedness, and Coast Guard operations serving 330M Americans",
      "Immigration enforcement funding includes detention beds ($159/person/day) for average 34,000 daily detainees",
    ],
    timeline_assumptions: [
      "Immediate impacts on household safety begin within 48 hours of any operational funding lapse",
    ],
    economic_context_assumptions: [
      "Low-income communities near disaster-prone areas depend on FEMA pre-positioning; a funding gap during hurricane season risks catastrophic outcomes",
    ],
    population_assumptions: [
      "Immigrant labor constitutes 17% of US workforce; enforcement disruptions affect agriculture, construction, and service industries",
    ],
    key_unstated_assumptions: [
      "The human cost of operational lapses in disaster response is not comparable to the policy cost of delayed enforcement funding",
    ],
  },
  legal: {
    scope_assumptions: [
      "Congressional power of the purse (Article I §9) governs all federal appropriations including DHS funding",
      "The Antideficiency Act (31 USC §1341) prohibits agencies from spending beyond appropriated amounts",
    ],
    timeline_assumptions: [
      "Federal courts have limited jurisdiction to order appropriations.impasse resolution is fundamentally legislative",
    ],
    economic_context_assumptions: [
      "Executive emergency spending authority under the Stafford Act covers only declared disasters, not general operations",
    ],
    population_assumptions: [
      "All persons in US territory retain due process rights under the 5th and 14th Amendments regardless of funding disputes",
    ],
    key_unstated_assumptions: [
      "Mandatory immigration enforcement without reform may conflict with existing judicial consent decrees (Flores Agreement, various circuit injunctions)",
    ],
  },
};

const MOCK_CONFLICTS = [
  {
    dimension: "scope assumptions",
    agents_and_assumptions: [
      { agent: "fiscal", assumption: "General security operations and immigration enforcement draw from the same DHS appropriations pipeline" },
      { agent: "progressive", assumption: "Aviation screening and disaster response are non-partisan essential services affecting all Americans" },
    ],
    conflict_description: 'Conflicting assumptions: fiscal treats DHS as unified budget vs progressive separates essential services from enforcement',
  },
  {
    dimension: "timeline assumptions",
    agents_and_assumptions: [
      { agent: "fiscal", assumption: "A continuing resolution (CR) would fund operations at FY2024 levels for 90-120 days during impasse" },
      { agent: "welfare", assumption: "Immediate impacts on household safety begin within 48 hours of any operational funding lapse" },
    ],
    conflict_description: 'Conflicting assumptions: fiscal assumes CR cushion vs welfare assumes immediate operational impact',
  },
];

const MOCK_ROUND1: Record<string, Record<string, unknown>> = {
  fiscal: {
    position: "CONDITIONALLY SUPPORT. A clean continuing resolution (CR) should fund all DHS operations at FY2024 levels while a bicameral conference committee negotiates enforcement provisions separately. Tying enforcement mandates to essential services creates fiscal hostage-taking that undermines budget discipline.",
    arguments: [
      { point: "Continuing Resolutions Preserve Fiscal Order", evidence: "The federal government has operated under CRs for 130 of the last 180 months. [STAT: CRs maintained 98% of operational capacity at prior-year levels] [SOURCE: Congressional Research Service, FY2024 CR Analysis]. A clean CR for DHS avoids both shutdown costs and new unfunded mandates." },
      { point: "Enforcement-Only Mandates Create Unfunded Liabilities", evidence: "Full ICE enforcement without reform would require [STAT: $25-35B in additional annual spending] for expanded detention capacity and processing. [SOURCE: CBO Score of HR 2, Secure the Border Act, 2023] [CAUSAL: Mandating enforcement without appropriations creates structural deficit pressure]" },
      { point: "Shutdown Costs Exceed Negotiation Benefits", evidence: "The 2018-2019 35-day partial shutdown cost [STAT: $11B in economic losses including $3B permanently lost GDP] [SOURCE: CBO January 2019 Report]. Continuing operations under a CR while negotiating costs zero additional dollars." },
      { point: "Separated Appropriations Enable Better Oversight", evidence: "Breaking DHS into security vs enforcement funding streams allows [CAUSAL: more precise budget controls and reduces logrolling that inflates total spending]. [SOURCE: Government Accountability Office, DHS Budget Structure Review 2022]" },
    ],
    risks: [
      "A CR freezes funding at prior-year levels, preventing necessary adjustments for inflation (~3.2% annually)",
      "Separating enforcement from security funding may reduce legislative leverage for any immigration action",
      "Extended CR reliance erodes agency planning capacity and workforce retention",
    ],
    conditions: [
      "CR must include inflation adjustments for essential services (TSA, FEMA, Coast Guard)",
      "Conference committee must report within 90 days with binding floor vote requirement",
    ],
  },
  progressive: {
    position: "SUPPORT. Essential security services must be funded immediately through a clean CR while comprehensive immigration reform (not enforcement-only mandates) is negotiated through regular order. Using critical infrastructure as leverage for enforcement-only policy is unconscionable.",
    arguments: [
      { point: "Critical Infrastructure Cannot Be Held Hostage", evidence: "[STAT: TSA screens 2.9M passengers daily at 440 airports] [SOURCE: TSA FY2024 Throughput Data]. Any disruption cascades into [CAUSAL: $200M+ daily in direct aviation industry losses plus multiplier effects across tourism and commerce]. Essential services require unconditional funding." },
      { point: "Enforcement Without Reform Fails on Its Own Terms", evidence: "[STAT: Border apprehensions dropped 75% from December 2023 to June 2024 under existing authority] [SOURCE: CBP Monthly Operational Updates]. [CAUSAL: Administrative enforcement tools are more cost-effective than legislative mandates requiring new detention infrastructure at $159/person/day]" },
      { point: "Mixed-Status Family Impact Demands Reform Provisions", evidence: "[STAT: 4.4M US-citizen children have at least one undocumented parent] [SOURCE: Migration Policy Institute 2023]. Enforcement-only funding without legal pathway provisions [CAUSAL: creates family separation at scale, generating $15,000-25,000 per child in annual foster care and social service costs]" },
      { point: "Historical Precedent Favors Clean Funding Bills", evidence: "[STAT: 9 of the last 12 government shutdowns ended with clean CRs, not with the disputed policy attached] [SOURCE: Congressional Research Service Shutdown History]. [CAUSAL: Legislative hostage-taking has a 75% failure rate as a negotiation tactic]" },
    ],
    risks: [
      "Clean CR without enforcement provisions may be seen as abandoning border security concerns entirely",
      "Prolonged impasse could shift public opinion toward accepting enforcement-only as the simpler resolution",
      "Reform provisions added later may lack the political momentum of the original impasse pressure",
    ],
    conditions: [
      "Any resolution must include protections for DACA recipients and mixed-status families",
      "Enforcement funding must be tied to measurable outcomes, not just bed quotas and agent headcounts",
    ],
  },
  macro: {
    position: "CONDITIONALLY SUPPORT. Immediate clean CR for DHS essential operations with a 60-day negotiation window. The macroeconomic risk of DHS disruption far exceeds the policy value of either competing proposal. Quantitative analysis strongly favors operational continuity.",
    arguments: [
      { point: "GDP Impact Analysis Favors Continuity", evidence: "[STAT: DHS operations support $4.2T in annual economic activity through aviation security, port operations, and disaster resilience] [SOURCE: Bureau of Economic Analysis, DHS Economic Impact Study 2023]. [CAUSAL: Each week of DHS disruption reduces quarterly GDP growth by 0.05-0.08 percentage points]" },
      { point: "Labor Market Disruption Risk Is Asymmetric", evidence: "[STAT: 260,000+ DHS employees face furlough or unpaid work during a funding lapse] [SOURCE: Office of Personnel Management]. [CAUSAL: DHS workforce disruption triggers secondary unemployment in airport concessions, disaster contractors, and security vendors.estimated 3:1 multiplier]" },
      { point: "Financial Market Stability Requires Signal Clarity", evidence: "[STAT: The 2013 debt ceiling/shutdown episode triggered a 200-basis-point spike in T-bill yields] [SOURCE: Federal Reserve Economic Data (FRED)]. [CAUSAL: Institutional funding disputes create systemic uncertainty that increases federal borrowing costs by $1-2B per week of impasse]" },
      { point: "Immigration Enforcement GDP Contribution Is Measurable", evidence: "[STAT: Immigrant workers contribute $2.3T to annual GDP across agriculture, construction, and services] [SOURCE: New American Economy, 2024 Immigration Economic Report]. [CAUSAL: Aggressive enforcement disruption to labor supply could reduce agricultural output by 5-8% within one growing season]" },
    ],
    risks: [
      "A 60-day window may be insufficient for comprehensive negotiation given congressional calendar constraints",
      "Market pricing of impasse risk may front-run any resolution timeline",
      "Agriculture and construction sector disruption from enforcement uncertainty creates supply-side inflation pressure",
    ],
    conditions: [
      "CR must include economic impact reporting requirements at 30-day and 60-day marks",
      "Federal Reserve must be consulted on financial stability implications before any enforcement surge implementation",
    ],
  },
  welfare: {
    position: "SUPPORT. Immediate unconditional funding for aviation security, disaster response, and Coast Guard operations. No American household should face increased disaster vulnerability or travel disruption because of an immigration policy dispute. Enforcement debates must be resolved without holding safety hostage.",
    arguments: [
      { point: "Disaster Response Cannot Wait for Policy Negotiation", evidence: "[STAT: FEMA pre-positions $1.2B in supplies for hurricane season covering 170M Americans in coastal and flood zones] [SOURCE: FEMA National Preparedness Report 2024]. [CAUSAL: A funding lapse during peak season (June-November) leaves 50+ million households without federal disaster backstop, translating to $40-80K in uninsured losses per affected household]" },
      { point: "Airport Security Gaps Create Direct Household Risk", evidence: "[STAT: TSA prevented 6,700+ firearms from boarding aircraft in 2023] [SOURCE: TSA Year in Review 2023]. [CAUSAL: Reduced screening capacity increases per-flight risk by an estimated 15-25%, with insurance and behavioral costs passed to the 2.9M daily passengers.roughly $8-15 per household per flight in implicit risk cost]" },
      { point: "Enforcement-Only Policy Increases Household Costs", evidence: "[STAT: Immigrant labor accounts for 73% of crop farmworkers and 30% of construction workers] [SOURCE: USDA National Agricultural Workers Survey, BLS]. [CAUSAL: Mass enforcement without workforce provisions would increase food costs 5-10% and housing construction costs 8-12% for median-income households, equivalent to $2,400-4,800 annually]" },
      { point: "Detention Costs Divert from Community Safety", evidence: "[STAT: ICE detention costs $159/person/day for an average 34,000 daily detainees = $5.4M daily = $2B annually] [SOURCE: DHS Budget in Brief FY2024]. [CAUSAL: Each additional $1B in detention spending displaces approximately 4,000 FEMA personnel-equivalents or 2,800 TSA screeners]" },
    ],
    risks: [
      "Unconditional essential services funding without enforcement provisions may create precedent weakening future enforcement negotiations",
      "FEMA pre-positioning gaps during any lapse period cannot be retroactively corrected once hurricane season begins",
      "Low-income communities near ports and airports face disproportionate safety gaps during any screening reduction",
    ],
    conditions: [
      "Essential services funding must include cost-of-living adjustments, not just flat prior-year levels",
      "Any enforcement funding must include impact assessments on food prices, housing costs, and community safety metrics",
    ],
  },
  legal: {
    position: "CONDITIONALLY SUPPORT, LEGALLY SOUND. A clean CR for DHS essential operations is constitutionally straightforward under Article I appropriations power. Mandating full enforcement funding without reform raises Antideficiency Act complications and potential conflicts with existing consent decrees. The cleanest legal pathway is separated appropriations.",
    arguments: [
      { point: "Congressional Appropriations Power Is Plenary", evidence: "[SOURCE: Article I §9.'No Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law']. The Constitution vests spending authority exclusively in Congress. [CAUSAL: A clean CR exercises this power in its simplest form, minimizing litigation risk to near zero]" },
      { point: "Antideficiency Act Constrains Unfunded Mandates", evidence: "[SOURCE: 31 USC §1341.Antideficiency Act]. Mandating full enforcement without corresponding appropriations [CAUSAL: creates a legal impossibility.agencies cannot obligate funds beyond their appropriation, meaning an enforcement mandate without funding is legally void]. [STAT: GAO has flagged 67 Antideficiency Act violations in the last decade related to spending beyond appropriations]" },
      { point: "Existing Consent Decrees Limit Enforcement Scope", evidence: "[SOURCE: Flores Settlement Agreement (1997), renewed by courts through 2024]. Federal courts currently limit child detention to 20 days. [CAUSAL: Mandating full enforcement without reform provisions conflicts with Flores and risks contempt proceedings across 9 federal district courts]. [SOURCE: Various circuit injunctions on expedited removal.9th Circuit, 5th Circuit split]" },
      { point: "Separation of Powers Supports Clean Funding", evidence: "[SOURCE: Train v. City of New York (1975).Supreme Court held President cannot impound congressionally appropriated funds]. [CAUSAL: If Congress passes a clean CR, the executive must spend as directed.this avoids the constitutional crisis of selective enforcement mandates]. The cleanest legal mechanism is the most defensible." },
    ],
    risks: [
      "A clean CR may face legal challenge from states arguing enforcement is a mandatory federal obligation under INA §287",
      "Separated appropriations could create standing issues for oversight lawsuits",
      "Extended CR reliance may trigger Antideficiency Act issues if costs exceed prior-year levels due to inflation",
    ],
    conditions: [
      "Any enforcement mandate must include corresponding appropriations to avoid Antideficiency Act violations",
      "Immigration provisions must be reviewed for compliance with existing consent decrees before enactment",
    ],
  },
};

const MOCK_VERIFICATION = {
  verified_claims: [
    { claim_text: "CRs maintained 98% of operational capacity at prior-year levels", agent_id: "fiscal", argument_index: 0, status: "verified" as const, source_name: "Congressional Research Service", confidence_note: "CRS data confirms CRs maintain nearly all operational capacity" },
    { claim_text: "TSA screens 2.9M passengers daily at 440 airports", agent_id: "progressive", argument_index: 0, status: "verified" as const, source_name: "TSA Official Data", confidence_note: "TSA throughput data confirms 2.9M daily average in 2024" },
    { claim_text: "The 2018-2019 35-day shutdown cost $11B in economic losses", agent_id: "fiscal", argument_index: 2, status: "verified" as const, source_name: "CBO January 2019 Report", confidence_note: "CBO confirmed $11B total, $3B permanent loss" },
    { claim_text: "4.4M US-citizen children have at least one undocumented parent", agent_id: "progressive", argument_index: 2, status: "verified" as const, source_name: "Migration Policy Institute", confidence_note: "MPI estimates range from 4.1M-4.7M, 4.4M is median" },
    { claim_text: "Border apprehensions dropped 75% from December 2023 to June 2024", agent_id: "progressive", argument_index: 1, status: "outdated" as const, correct_value: "Apprehensions dropped ~56% Dec 2023-Jun 2024; 75% figure applies to later period through September 2024", source_name: "CBP Monthly Operational Updates", confidence_note: "Initial period saw ~56% decline; 75% reached by Sept 2024" },
    { claim_text: "ICE detention costs $159/person/day for an average 34,000 daily detainees", agent_id: "welfare", argument_index: 3, status: "verified" as const, source_name: "DHS Budget in Brief FY2024", confidence_note: "DHS budget documents confirm $159/day average across facility types" },
    { claim_text: "DHS operations support $4.2T in annual economic activity", agent_id: "macro", argument_index: 0, status: "unverifiable" as const, source_name: "Bureau of Economic Analysis", confidence_note: "BEA does not publish a single DHS economic impact figure; $4.2T likely includes all commerce passing through DHS-secured channels" },
    { claim_text: "Immigrant workers contribute $2.3T to annual GDP", agent_id: "macro", argument_index: 3, status: "verified" as const, source_name: "New American Economy", confidence_note: "Multiple sources corroborate $2-2.5T range for immigrant GDP contribution" },
    { claim_text: "GAO has flagged 67 Antideficiency Act violations in the last decade", agent_id: "legal", argument_index: 1, status: "contradicted" as const, correct_value: "GAO reported 41 Antideficiency Act violations from 2014-2024, not 67", source_name: "GAO Antideficiency Act Reports Database", confidence_note: "GAO database shows 41 confirmed violations; 67 may include pending investigations" },
  ],
  verification_summary: "7 of 9 key claims verified or substantively accurate. 1 outdated (progressive border stats), 1 contradicted (legal ADA violation count). Overall evidence quality is strong across all agents.",
  timestamp: new Date().toISOString(),
};

const MOCK_DISCREPANCIES = {
  discrepancies: [
    { issue: "DHS funding structure: unified vs separated", agent_a: "fiscal", claim_a: "DHS should have separated appropriations for security vs enforcement", agent_b: "progressive", claim_b: "Essential services must be funded unconditionally regardless of enforcement debates", severity: "medium" as const, resolution_hint: "Both support clean CR; disagree on long-term structure", detected_by: "llm" as const, stems_from_assumption_conflict: true },
    { issue: "Enforcement cost-effectiveness", agent_a: "progressive", claim_a: "Administrative enforcement tools are more cost-effective than legislative mandates", agent_b: "legal", claim_b: "Enforcement mandates require corresponding appropriations to be legally valid", severity: "low" as const, resolution_hint: "Not a true conflict.legal confirms progressive's point from constitutional angle", detected_by: "llm" as const, stems_from_assumption_conflict: false },
    { issue: "Economic impact magnitude of DHS disruption", agent_a: "macro", claim_a: "DHS operations support $4.2T in annual economic activity", agent_b: "fiscal", claim_b: "Shutdown costs were $11B over 35 days.significant but not catastrophic to GDP", severity: "medium" as const, resolution_hint: "$4.2T is total commerce flowing through DHS-secured channels, not direct DHS value-add; both numbers can coexist", detected_by: "programmatic" as const, stems_from_assumption_conflict: false },
  ],
  verified_resolutions: [
    { issue: "GAO Antideficiency Act violation count", resolved_by: "verification", correct_position: "41 violations, not 67 as legal claimed", agent_who_was_wrong: "legal" },
  ],
  consensus_areas: [
    "All five agents support some form of clean continuing resolution for essential DHS services",
    "All agents agree that tying critical infrastructure funding to unrelated policy demands is suboptimal",
    "All agents acknowledge that enforcement-only mandates without appropriations face legal and practical barriers",
  ],
  programmatic_detection_count: 1,
  llm_detection_count: 2,
  false_positive_count: 0,
};

const MOCK_ROUND2: Record<string, Record<string, unknown>> = {
  fiscal: {
    verification_responses: [
      { claim: "CRs maintained 98% of operational capacity", verification_status: "verified", my_response: "Confirmed.CRs are a proven mechanism for maintaining operations during policy disputes." },
    ],
    discrepancy_responses: [
      { issue: "DHS funding structure: unified vs separated", my_response: "partially_concede", stems_from_assumption_conflict: true, reasoning: "Progressive is right that essential services need unconditional funding. I concede that during active impasse, separation is more important than long-term restructuring. But the structural reform argument stands for future budget cycles.", updated_claim: "Immediate clean CR for essential services; structural separation as a follow-on reform." },
    ],
    agreements: [
      { agent: "progressive", point: "Essential services cannot be held hostage to enforcement debates", reason: "Fiscal discipline requires predictable funding for core operations.hostage-taking undermines both." },
      { agent: "legal", point: "Antideficiency Act prevents unfunded enforcement mandates", reason: "This constitutional constraint supports our position that mandates require matched appropriations." },
      { agent: "macro", point: "Shutdown costs exceed negotiation benefits", reason: "The $11B cost of the 2018-2019 shutdown confirms that impasse is more expensive than compromise." },
    ],
    rebuttals: [
      { agent: "progressive", point: "Enforcement-only policy fails on its own terms", counter_argument: "While administrative enforcement has shown results, legislative mandates provide durable authority that executive actions lack. The question is whether to fund enforcement at all, not whether it works." },
    ],
    revised_position: "CONDITIONALLY SUPPORT. Clean CR for all DHS essential operations with automatic inflation adjustment. Enforcement funding should be negotiated through regular appropriations order with matched revenue offsets, not attached to must-pass security funding. Conference committee with 90-day binding deadline.",
    compromises: [
      "Accept inflation-adjusted CR (not flat prior-year) for essential services to address welfare's cost-of-living concern",
      "Support 90-day conference committee with required floor vote to prevent indefinite CR reliance",
      "Agree that enforcement mandates must include CBO-scored appropriations to satisfy both fiscal discipline and legal requirements",
    ],
    confidence: 8,
  },
  progressive: {
    verification_responses: [
      { claim: "Border apprehensions dropped 75% from December 2023 to June 2024", verification_status: "outdated", my_response: "Accepted.the 75% figure applies to the longer Dec 2023-Sept 2024 period. The Dec-June decline was ~56%. I'll use the verified 56% figure for the initial period." },
    ],
    discrepancy_responses: [
      { issue: "DHS funding structure: unified vs separated", my_response: "partially_concede", stems_from_assumption_conflict: true, reasoning: "Fiscal's point about separated appropriations has merit for long-term governance. I concede that structural separation could prevent future hostage-taking. But the immediate priority is unconditional essential services funding.", updated_claim: "Immediate clean CR with structural separation as a follow-on reform to prevent future impasses." },
    ],
    agreements: [
      { agent: "fiscal", point: "Conference committee with binding deadline is the right procedural mechanism", reason: "Regular order is better than crisis-driven legislating. A 90-day deadline with required vote prevents indefinite delay." },
      { agent: "legal", point: "Flores and existing consent decrees constrain enforcement options", reason: "The legal framework confirms that enforcement-only mandates face immediate judicial obstacles." },
      { agent: "welfare", point: "Household cost impacts of enforcement disruption are severe", reason: "The 5-10% food cost increase and 8-12% housing cost increase data strengthens the case for reform alongside enforcement." },
    ],
    rebuttals: [
      { agent: "fiscal", point: "Legislative mandates provide durable enforcement authority", counter_argument: "Durability without reform provisions creates durable harm. The 2017 enforcement surge demonstrated that legislative authority without pathway provisions increases family separation costs by $2-4B annually in downstream social services." },
    ],
    revised_position: "SUPPORT. Immediate clean CR for all DHS essential operations. Enforcement funding negotiated through conference committee within 90 days, but MUST include reform provisions: DACA protections, mixed-status family safeguards, and outcome-based enforcement metrics tied to appropriations.",
    compromises: [
      "Accept conference committee process rather than demanding reform provisions as precondition for any enforcement funding",
      "Agree to outcome-based enforcement metrics (rather than opposing all enforcement funding) as bridge to fiscal and legal concerns",
      "Support separated appropriations structure to prevent future essential-service hostage situations",
    ],
    confidence: 7,
  },
  macro: {
    verification_responses: [
      { claim: "DHS operations support $4.2T in annual economic activity", verification_status: "unverifiable", my_response: "Acknowledged.the $4.2T figure represents total commerce flowing through DHS-secured channels (ports, airports, borders), not direct DHS value-add. I'll clarify this as facilitated economic activity rather than direct support." },
    ],
    discrepancy_responses: [
      { issue: "Economic impact magnitude of DHS disruption", my_response: "partially_concede", stems_from_assumption_conflict: false, reasoning: "Fiscal is correct that the $11B shutdown cost is the better direct measure. My $4.2T figure is the total at-risk commerce, not actual losses. Both numbers are valid for different analytical purposes. I'll lead with the direct cost measure going forward.", updated_claim: "DHS disruption costs $300M+/day in direct losses (per CBO extrapolation from 2018-2019 data), with $4.2T in total commerce at elevated risk." },
    ],
    agreements: [
      { agent: "fiscal", point: "Clean CR is the lowest-cost mechanism to maintain operations", reason: "Cost-benefit analysis clearly favors CR over shutdown or unfunded mandates. Zero incremental cost vs $300M+/day losses." },
      { agent: "welfare", point: "Labor market disruption from enforcement surge creates inflation risk", reason: "With immigrant labor at 17% of workforce, an enforcement surge is a negative supply shock.exactly the wrong policy during a disinflationary period." },
    ],
    rebuttals: [
      { agent: "progressive", point: "Administrative enforcement dropped apprehensions 56%", counter_argument: "Correlation is not causation. The apprehension decline coincides with Mexican economic improvement and seasonal patterns. Attributing it solely to administrative enforcement overstates policy efficacy by 20-30 percentage points." },
    ],
    revised_position: "CONDITIONALLY SUPPORT. Immediate clean CR with economic impact triggers. If impasse extends beyond 30 days, automatic inflation-adjusted funding kicks in. Conference committee with economic impact reporting at 30 and 60 days. Enforcement funding must include labor market impact assessment before implementation.",
    compromises: [
      "Accept 60-day (not 90-day) conference committee deadline given the compounding cost of uncertainty",
      "Support economic impact reporting requirements as compromise between progressive's outcome metrics and fiscal's cost discipline",
      "Agree to labor market impact assessment for enforcement provisions to bridge welfare and progressive concerns",
    ],
    confidence: 8,
  },
  welfare: {
    verification_responses: [
      { claim: "ICE detention costs $159/person/day for an average 34,000 daily detainees", verification_status: "verified", my_response: "Confirmed. This data point is critical for understanding the opportunity cost of enforcement-only approaches." },
    ],
    discrepancy_responses: [
      { issue: "DHS funding structure: unified vs separated", my_response: "concede", stems_from_assumption_conflict: true, reasoning: "Fiscal's separated appropriations proposal actually protects essential services better than my original framing. If security and enforcement are separate line items, disaster response can never be held hostage to enforcement debates. I fully concede this structural point.", updated_claim: "Separated appropriations are the best mechanism to protect essential household safety services." },
    ],
    agreements: [
      { agent: "fiscal", point: "Separated appropriations prevent future hostage situations", reason: "This structural reform directly protects the households I'm most concerned about.those in disaster zones and those depending on airport security." },
      { agent: "progressive", point: "Mixed-status families face disproportionate impact from enforcement-only policy", reason: "The 4.4M US-citizen children data aligns with our household-level analysis. These are American families affected by enforcement policy." },
      { agent: "macro", point: "Labor market disruption creates food and housing cost inflation", reason: "Macro's supply shock analysis confirms our household cost estimates.5-10% food and 8-12% housing increases." },
    ],
    rebuttals: [
      { agent: "fiscal", point: "CR inflation adjustment is sufficient to address cost-of-living", counter_argument: "Inflation adjustment covers operational costs but not the increased demand from climate-driven disasters. FEMA's real costs are rising 12-15% annually due to disaster frequency, well above general inflation." },
    ],
    revised_position: "SUPPORT. Immediate clean CR with cost-of-living AND disaster-frequency adjustments for FEMA and Coast Guard. Separated appropriations structure to permanently protect essential services. Enforcement funding through conference committee with mandatory household impact assessments.",
    compromises: [
      "Accept conference committee timeline (60-90 days) rather than demanding immediate unconditional essential-only funding",
      "Support separated appropriations as long-term structural fix, conceding fiscal's governance framework",
      "Agree to enforcement funding that includes household impact assessments and cost-of-living analysis",
    ],
    confidence: 7,
  },
  legal: {
    verification_responses: [
      { claim: "GAO has flagged 67 Antideficiency Act violations in the last decade", verification_status: "contradicted", my_response: "Accepted.the correct figure is 41 confirmed violations from 2014-2024. I included pending investigations in my original count, which was imprecise. The legal principle stands regardless: Antideficiency Act compliance is mandatory." },
    ],
    discrepancy_responses: [
      { issue: "Enforcement cost-effectiveness", my_response: "defend", stems_from_assumption_conflict: false, reasoning: "This was flagged as a discrepancy but is actually complementary analysis. Progressive argues administrative enforcement is more cost-effective; I argue enforcement mandates need matched appropriations. Both can be true simultaneously.administrative tools work within existing appropriations, and new mandates require new funding.", updated_claim: "Both administrative and legislative enforcement tools are legally valid; mandates simply require corresponding appropriations." },
    ],
    agreements: [
      { agent: "fiscal", point: "Enforcement mandates must include CBO-scored appropriations", reason: "This is a constitutional requirement under the Antideficiency Act, not merely a policy preference." },
      { agent: "progressive", point: "Flores Settlement constrains detention-based enforcement", reason: "Active judicial consent decrees are binding law.any enforcement mandate must operate within existing court orders or seek modification." },
    ],
    rebuttals: [
      { agent: "welfare", point: "FEMA costs are rising 12-15% annually beyond general inflation", counter_argument: "While factually accurate, a CR cannot legally include policy changes like disaster-frequency adjustments.that requires new appropriations legislation. The legal mechanism is a supplemental appropriation, not a modified CR." },
    ],
    revised_position: "CONDITIONALLY SUPPORT, LEGALLY SOUND. Clean CR for all DHS operations as the most legally defensible path. Separated appropriations for structural reform. Any enforcement mandate must satisfy Antideficiency Act, comply with Flores and existing consent decrees, and include corresponding CBO-scored appropriations. Conference committee with 90-day deadline and judicial review provisions.",
    compromises: [
      "Accept that FEMA supplemental appropriations may be needed alongside the CR to address welfare's disaster-frequency concern",
      "Support conference committee process with explicit Antideficiency Act compliance review for all enforcement provisions",
      "Agree to judicial review provisions to resolve circuit splits on enforcement authority before implementation",
    ],
    confidence: 9,
  },
};

const MOCK_CONSENSUS = {
  spectrum: {
    left_label: "Oppose Enforcement-Only Mandates",
    right_label: "Support Clean CR + Reform Pathway",
    policy_question: "Should critical infrastructure funding be separated from immigration enforcement to resolve the legislative impasse?",
    agent_positions: [
      { agent_id: "legal", position: 58, stance_label: "Conditional Support", one_line_summary: "Clean CR is the most legally defensible path forward" },
      { agent_id: "fiscal", position: 68, stance_label: "Conditional Support", one_line_summary: "Separated appropriations with a 90-day conference deadline" },
      { agent_id: "macro", position: 75, stance_label: "Conditional Support", one_line_summary: "Economic triggers and labor market impact assessment required" },
      { agent_id: "welfare", position: 85, stance_label: "Strong Support", one_line_summary: "Disaster-adjusted funding with household impact requirements" },
      { agent_id: "progressive", position: 92, stance_label: "Strong Support", one_line_summary: "Reform provisions must accompany any enforcement package" },
    ],
    consensus_direction: "Unanimous support for clean continuing resolution; disagreements center on enforcement conditions and reform requirements",
  },
  assumption_impact: [
    { assumption_dimension: "Funding Structure", impact: "Fiscal's assumption of unified DHS pipeline conflicted with progressive's essential services framing. Resolution through separated appropriations satisfied both perspectives.", recommended_framing: "Treat aviation security, disaster response, and immigration enforcement as distinct appropriations categories" },
    { assumption_dimension: "Timeline Urgency", impact: "Welfare's 48-hour impact window vs fiscal's 90-120 day CR cushion created tension. Both are correct for different services.FEMA pre-positioning needs are immediate while TSA operations continue under CR.", recommended_framing: "Differentiate between operational continuity (maintained by CR) and capability gaps (requiring supplemental funding)" },
    { assumption_dimension: "Enforcement Efficacy", impact: "Progressive assumed administrative tools are sufficient; fiscal assumed legislative mandates are necessary for durability. Macro's supply-side analysis suggests enforcement approach matters less than labor market preparation.", recommended_framing: "Evaluate enforcement mechanisms by economic impact and legal defensibility, not political preference" },
  ],
  verification_impact: {
    claims_verified: 6,
    claims_contradicted: 1,
    claims_outdated: 1,
    impact_summary: "Evidence quality is strong across all agents. Legal's ADA violation count was overstated (41, not 67) but the legal principle holds. Progressive's border apprehension timeline was corrected from 75% to 56% for the initial period. These corrections did not materially change any agent's position.",
    agents_most_accurate: ["fiscal", "welfare"],
    agents_least_accurate: ["legal"],
  },
  resolved_discrepancies: [
    { issue: "DHS funding structure: unified vs separated", resolution: "All five agents converged on separated appropriations as optimal structure through Round 2 deliberation", winning_position: "Separated appropriations for essential services vs enforcement, originally proposed by fiscal, endorsed by all", resolution_source: "round2_concession" as const, dissenting_agents: [] },
    { issue: "Economic impact magnitude", resolution: "Macro conceded that direct cost measure ($300M+/day) is more precise than total at-risk commerce ($4.2T)", winning_position: "Use CBO-extrapolated direct costs rather than total facilitated commerce figures", resolution_source: "verification" as const, dissenting_agents: [] },
  ],
  areas_of_agreement: [
    "Clean continuing resolution for DHS essential services is the immediate mechanism of choice",
    "Enforcement-only mandates without corresponding appropriations violate the Antideficiency Act and are legally void",
    "Separated appropriations structure prevents future essential-service hostage situations",
    "Conference committee with binding deadline (60-90 days) is the proper procedural vehicle for enforcement and reform negotiation",
    "Any enforcement implementation must include labor market and household impact assessments",
  ],
  areas_of_compromise: [
    { position: "Inflation-adjusted CR with FEMA supplemental appropriation for disaster-frequency costs", reasoning: "Bridges fiscal's cost discipline (standard inflation adjustment) with welfare's concern about rising disaster costs (supplemental for above-inflation increases)", supporting_agents: ["fiscal", "welfare", "legal"] },
    { position: "Enforcement funding tied to outcome-based metrics rather than input quotas (bed counts, agent headcounts)", reasoning: "Satisfies progressive's demand for reform linkage, fiscal's demand for cost accountability, and macro's need for labor market predictability", supporting_agents: ["progressive", "fiscal", "macro"] },
    { position: "60-90 day conference committee with economic impact reporting at 30-day and 60-day marks", reasoning: "Macro's economic triggers provide objective off-ramps; fiscal's binding vote requirement prevents indefinite delay", supporting_agents: ["macro", "fiscal", "progressive"] },
  ],
  irreconcilable_disagreements: [
    { issue: "Whether enforcement funding should require simultaneous reform provisions (DACA protections, pathway programs)", side_a: "Progressive and Welfare: Any enforcement package must include reform provisions to protect mixed-status families and labor market stability", side_b: "Fiscal and Legal: Enforcement and reform should be negotiated separately to avoid logrolling and maintain clean appropriations", why_unresolvable: "VALUES dispute.reflects fundamentally different views on whether enforcement and reform are morally separable policy domains" },
  ],
  rational_recommendation: "Enact a clean continuing resolution for all DHS essential operations (TSA, FEMA, Coast Guard, CISA) at FY2024 levels plus 3.2% inflation adjustment, with a FEMA supplemental appropriation of $2.4B for disaster-frequency costs. Establish a bicameral conference committee with a 75-day binding deadline to negotiate enforcement provisions that must: (1) include CBO-scored appropriations, (2) comply with Flores Settlement and existing consent decrees, (3) incorporate outcome-based metrics, and (4) include labor market and household impact assessments. Require economic impact reporting at 30 and 60 days. If the conference committee fails to report, automatic clean CR extension with inflation adjustment continues operations.",
  decision_points: [
    "Should enforcement and reform provisions be negotiated as a single package (progressive/welfare position) or as separate sequential bills (fiscal/legal position)?",
    "What is the binding conference committee deadline: 60 days (macro preference) or 90 days (fiscal/legal preference)?",
    "Should the FEMA supplemental be included in the initial CR or passed as separate legislation?",
    "How should outcome-based enforcement metrics be defined.by apprehension rates, removal rates, asylum processing times, or labor market indicators?",
    "What happens if the conference committee misses its deadline.automatic CR extension or escalation to full chamber votes on competing proposals?",
  ],
  agent_rationality_scores: {
    fiscal: { score: 88, reasoning: "Strong evidence quality with verified claims. Made meaningful concession on separated appropriations timing. Consistent internal logic between deficit concerns and CR support. Addressed all discrepancies substantively." },
    progressive: { score: 81, reasoning: "Good evidence base but border apprehension figure was outdated.corrected transparently. Strong concession on conference committee process. Slightly overreached on enforcement efficacy claims given macro's causation critique." },
    macro: { score: 85, reasoning: "Excellent quantitative framework. Transparently conceded $4.2T figure was facilitated commerce, not direct value-add. GDP impact analysis well-sourced. Appropriately challenged progressive's causation claims." },
    welfare: { score: 83, reasoning: "Strongest household-level analysis with verified detention cost data. Full concession to fiscal on separated appropriations was intellectually honest. FEMA disaster-frequency argument was compelling but legally imprecise per legal's correction." },
    legal: { score: 79, reasoning: "Sound constitutional analysis but ADA violation count was contradicted (41, not 67). Accepted correction transparently. Strong Antideficiency Act and Flores arguments well-sourced. CR supplemental distinction was valuable procedural contribution." },
  },
  consensus_score: 74,
};

// ━━━ ROUTE HANDLER ━━━

export async function POST(req: NextRequest) {
  let proposal: string;
  try {
    const body = await req.json();
    proposal = body.proposal;
    if (!proposal || typeof proposal !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing proposal text' }), { status: 400 });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const agentIds = ['fiscal', 'progressive', 'macro', 'welfare', 'legal'];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(event) + '\n'));
      };

      try {
        // ━━━ ROUND 0: ASSUMPTION FRAMING ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 0 });
          await sleep(1500 + Math.random() * 1000);
          send({ type: 'agent_complete', agent: id, round: 0, data: MOCK_ROUND0[id] });
          await sleep(300);
        }
        send({ type: 'round_complete', round: 0 });
        send({ type: 'assumption_conflicts', data: MOCK_CONFLICTS });
        await sleep(800);

        // ━━━ ROUND 1: INDEPENDENT ANALYSIS ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 1 });
          await sleep(2000 + Math.random() * 1500);
          send({ type: 'agent_complete', agent: id, round: 1, data: MOCK_ROUND1[id] });
          await sleep(400);
        }
        send({ type: 'round_complete', round: 1 });
        await sleep(800);

        // ━━━ ROUND 1.25: VERIFICATION ━━━
        send({ type: 'agent_start', agent: 'moderator', round: 1.25 });
        await sleep(3000 + Math.random() * 1000);
        send({ type: 'verification_complete', data: MOCK_VERIFICATION });
        await sleep(800);

        // ━━━ ROUND 1.5: DISCREPANCY DETECTION ━━━
        send({ type: 'programmatic_discrepancies', data: [] });
        send({ type: 'agent_start', agent: 'moderator', round: 1.5 });
        await sleep(2500 + Math.random() * 1000);
        send({ type: 'agent_complete', agent: 'moderator', round: 1.5, data: MOCK_DISCREPANCIES });
        send({ type: 'discrepancies_detected', data: MOCK_DISCREPANCIES });
        await sleep(800);

        // ━━━ ROUND 2: CONFLICT RESOLUTION ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 2 });
          await sleep(2000 + Math.random() * 1500);
          send({ type: 'agent_complete', agent: id, round: 2, data: MOCK_ROUND2[id] });
          await sleep(400);
        }
        send({ type: 'round_complete', round: 2 });
        await sleep(800);

        // ━━━ ROUND 3: CONSENSUS ━━━
        send({ type: 'agent_start', agent: 'moderator', round: 3 });
        await sleep(3500 + Math.random() * 1500);
        send({ type: 'agent_complete', agent: 'moderator', round: 3, data: MOCK_CONSENSUS });
        send({ type: 'consensus', data: MOCK_CONSENSUS });

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
