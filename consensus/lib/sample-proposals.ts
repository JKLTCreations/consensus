export interface SampleProposal {
  id: string;
  number: string;
  title: string;
  description: string;
  text: string;
}

export const sampleProposals: SampleProposal[] = [
  {
    id: "carbon-tax",
    number: "01",
    title: "Federal Carbon Tax",
    description: "Revenue-neutral carbon pricing with citizen dividends",
    text: "Implement a federal carbon tax starting at $50 per ton of CO2 equivalent emissions, increasing by $10 annually. All net revenue would be returned to American citizens as quarterly dividend payments distributed equally to every adult, with half-shares for children (up to two per household). The tax would apply at the point of extraction or import for fossil fuels. Border carbon adjustments would be applied to imports from countries without equivalent carbon pricing. Industries would receive no exemptions, but trade-exposed sectors could apply for transition assistance during the first 5 years."
  },
  {
    id: "minimum-wage",
    number: "02",
    title: "$20 Minimum Wage",
    description: "Phased federal minimum wage increase over three years",
    text: "Raise the federal minimum wage to $20 per hour, phased in over three years: $16 in Year 1, $18 in Year 2, and $20 in Year 3. After reaching $20, the minimum wage would be indexed to the Consumer Price Index (CPI) with annual automatic adjustments. Tipped workers would receive the full minimum wage with tip credit elimination phased over 5 years. Small businesses (under 50 employees) would receive a 2-year tax credit equal to 25% of increased labor costs. The Department of Labor would conduct annual impact assessments with authority to delay increases in regions experiencing employment declines exceeding 2%."
  },
  {
    id: "ubi",
    number: "03",
    title: "Universal Basic Income",
    description: "Monthly payments funded by value-added tax",
    text: "Establish a Universal Basic Income of $1,000 per month for every American adult (18+), funded primarily through a 10% Value-Added Tax (VAT) on goods and services. The VAT would exempt basic necessities (groceries, clothing under $200, residential rent, healthcare). UBI payments would stack on top of Social Security and SSDI but replace cash welfare programs (TANF, SSI, SNAP). The program would phase in over 2 years, starting with households below 200% of the federal poverty line. A dedicated UBI Trust Fund would be established, with VAT revenue deposited directly. Implementation cost estimated at $2.8 trillion annually, offset by ~$600B in replaced programs and ~$800B in projected VAT revenue."
  },
  {
    id: "debt-ceiling",
    number: "04",
    title: "Debt Ceiling Reform",
    description: "Conditional debt ceiling increase with spending controls",
    text: "Raise the federal debt ceiling by $2.5 trillion, conditional on the following fiscal reforms: (1) Establish statutory spending caps limiting discretionary spending growth to 1% annually for 10 years, with automatic sequestration if caps are breached; (2) Create a bipartisan Fiscal Commission with 16 members to propose mandatory spending reforms within 180 days, with guaranteed up-or-down Congressional vote; (3) Require CBO scoring of all legislation exceeding $5 billion in 10-year costs; (4) Implement a 2% across-the-board reduction in non-defense discretionary spending in FY2025; (5) Exempt Social Security, Medicare benefits, veterans' benefits, and military personnel pay from any cuts. The debt ceiling would automatically suspend for 90 days if Treasury projects extraordinary measures will be exhausted within 30 days."
  },
  {
    id: "community-college",
    number: "05",
    title: "Free Community College",
    description: "Federal funding for tuition-free community college",
    text: "Provide federal funding to make community college tuition-free for all U.S. residents, regardless of age or income. The federal government would cover 75% of average per-student tuition costs, with states covering the remaining 25% as a condition of participation. Eligible institutions must maintain accreditation, demonstrate student completion rates above 25%, and offer at least 3 workforce-aligned certificate programs. Students must maintain a 2.0 GPA and enroll at least half-time. Pell Grants would remain available for living expenses. Estimated federal cost: $80 billion over 10 years. Funded through closing the carried interest loophole ($14B), increasing IRS enforcement ($40B projected additional revenue), and redirecting existing higher education tax expenditures ($26B)."
  }
];