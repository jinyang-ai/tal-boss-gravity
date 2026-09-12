// ============================================================
// Cohorts for the Gravity reel. One entry per audience, so a new cut is a
// config change rather than a new composition.
//
// `head` is the two display lines. It is set in ObviouslyNarrowBold, which
// ships with A-Za-z0-9, space, comma and period only - no apostrophes, no
// hyphens, no question marks. Keep copy inside that.
//
// `lead` is the companies that make the claim specific to this cohort. They
// are woven through a shared core of Bangalore names so no arm of the spiral
// is all one thing. Neither list may contain a company that already has a
// real logo tile (Swiggy, CRED, Razorpay, PhonePe, Groww, Zerodha, Meesho,
// ShareChat) or the same name shows up twice in one frame.
// ============================================================
export type Cohort = {
  id: string;
  head: [string, string];
  lead: string[];
};

// Where anyone good in Bangalore sits, whatever their craft.
const CORE = [
  "Flipkart", "Google", "Amazon", "Uber", "Zepto", "Myntra", "Nykaa", "Rapido",
  "Navi", "slice", "Jupiter", "Paytm", "Lenskart", "Blinkit", "Purplle",
  "Porter", "Udaan", "Unacademy", "Headout", "Bureau", "Plum", "Zeta",
  "Intuit", "Oracle", "PayPal", "Atlassian", "LinkedIn", "Dunzo", "Chargebee",
  "Wakefit", "Swish",
];

export const COHORTS: Cohort[] = [
  {
    id: "engineers",
    head: ["The coolest engineers", "of Bangalore are on"],
    lead: ["NVIDIA", "Stripe", "Postman", "Hasura", "Atlan", "smallcase", "Okta",
      "Twilio", "Revolut", "Ninjacart", "Wingify", "MoEngage", "Whatfix",
      "Pixxel", "ClearTax", "eBay", "Ather"],
  },
  {
    id: "ai",
    head: ["The coolest AI engineers", "of Bangalore are on"],
    lead: ["NVIDIA", "Sarvam", "Krutrim", "Fractal", "Adobe", "Microsoft",
      "Qualcomm", "Samsung", "Nutanix", "Rubrik", "Glance", "Gupshup",
      "Sprinklr", "Zoho", "Databricks", "Intel", "Postman"],
  },
  {
    id: "pm",
    head: ["The coolest product managers", "of Bangalore are on"],
    lead: ["Cult.fit", "BigBasket", "Licious", "Angel One", "smallcase",
      "upGrad", "Microsoft", "Salesforce", "Adobe", "Sprinklr", "Postman",
      "Rippling", "Stripe", "Freshworks", "Zomato", "Ola", "Whatfix"],
  },
  {
    id: "design",
    head: ["The coolest designers", "of Bangalore are on"],
    lead: ["Obvious", "Lollypop", "Adobe", "Figma", "Canva", "Cult.fit",
      "Freshworks", "Postman", "Zoho", "Sprinklr", "Licious", "Ather",
      "BigBasket", "Stripe", "Rippling", "Whatfix", "Pixxel"],
  },
  {
    id: "growth",
    head: ["The coolest growth folks", "of Bangalore are on"],
    lead: ["Dream11", "upGrad", "BigBasket", "Licious", "Cult.fit", "Zomato",
      "Ola", "Adobe", "Sprinklr", "MoEngage", "CleverTap", "WebEngage",
      "Whatfix", "Rippling", "Stripe", "Freshworks", "Angel One"],
  },
  {
    id: "builders",
    head: ["The coolest builders", "of Bangalore are on"],
    lead: ["Sarvam", "Krutrim", "Pixxel", "Atlan", "Hasura", "Postman",
      "Wingify", "Ninjacart", "smallcase", "Setu", "Decentro", "Yubi",
      "Zolve", "Rupeek", "Skyroot", "Ather", "Stripe"],
  },
];

// One cohort name, then two from the shared core, so the specific names are
// spread the length of the spiral instead of bunching at one end.
export const weave = (cohort: Cohort): string[] => {
  const out: string[] = [];
  let li = 0;
  let ci = 0;
  while (li < cohort.lead.length || ci < CORE.length) {
    if (li < cohort.lead.length) out.push(cohort.lead[li++]);
    for (let k = 0; k < 2 && ci < CORE.length; k++) out.push(CORE[ci++]);
  }
  return out;
};
