export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "free-plan",
    question: "Is there a free plan?",
    answer:
      "Yes! TrackrApp has a generous free plan that includes unlimited subscriptions, email renewal reminders, a basic spending dashboard, categories & tags, and CSV export. You can use it forever at no cost.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex) as well as Apple Pay and Google Pay, all securely processed via Stripe.",
  },
  {
    id: "cancel-anytime",
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your Pro subscription at any time from your billing settings. You'll continue to have Pro access until the end of your current billing period, then your account reverts to the free plan.",
  },
  {
    id: "ai-tips",
    question: "How does the AI tips feature work?",
    answer:
      "Once a week, our AI analyses your subscription portfolio and generates personalised tips — like identifying duplicate services, suggesting cheaper alternatives, or flagging subscriptions you rarely use. Tips are available exclusively on the Pro plan.",
  },
  {
    id: "data-secure",
    question: "Is my data secure?",
    answer:
      "Yes. All data is encrypted at rest and in transit (TLS 1.3). We never sell your data to third parties. Our infrastructure runs on enterprise-grade cloud providers with SOC 2-compliant practices.",
  },
  {
    id: "import-subscriptions",
    question: "Can I import my existing subscriptions?",
    answer:
      "Yes — Pro users can import subscriptions from a CSV file. Our smart importer automatically detects column names and maps them to the right fields, with a preview step so you can review before committing.",
  },
];
