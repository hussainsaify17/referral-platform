export interface FAQ {
  question: string;
  answer: string;
}

export interface Referral {
  id: string;
  name: string;
  slug: string;
  category: string;
  referral_link: string;
  referral_code?: string;
  benefit_user: string;
  benefit_owner: string;
  bonus_amount?: string;
  steps: string[];
  faq: FAQ[];
  expiry: string;
  last_checked: string;
  status: "active" | "expired";
  is_featured?: boolean;
}
