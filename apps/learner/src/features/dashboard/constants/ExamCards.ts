export interface ExamItem {
  id: string;
  name: string;
  icon: string;
  rating: number;
  reviewCount: string;
  price: number;
  originalPrice: number;
  priceLabel: string;
  currency?: string;
}

export interface ExamsProps {
  exam: ExamItem;
  onEnroll?: (id: string) => void;
}

export const exams: ExamItem[] = [
  {
    id: "utme",
    name: "UTME",
    icon: "emojione:graduation-cap",
    rating: 4.7,
    reviewCount: "5.2k",
    price: 2345,
    originalPrice: 3500,
    priceLabel: "₦75 per subject",
    currency: "₦",
  },
  {
    id: "waec",
    name: "WAEC",
    icon: "twemoji:globe-showing-africa-europe",
    rating: 4.3,
    reviewCount: "3.2k",
    price: 245,
    originalPrice: 350,
    priceLabel: "₦15 per subject",
    currency: "₦",
  },
  {
    id: "neco",
    name: "NECO",
    icon: "twemoji:school",
    rating: 4.3,
    reviewCount: "3.2k",
    price: 245,
    originalPrice: 300,
    priceLabel: "₦15 per module",
    currency: "₦",
  },
  {
    id: "ielts",
    name: "IELTS",
    icon: "twemoji:flag-united-kingdom",
    rating: 4.8,
    reviewCount: "6.1k",
    price: 3500,
    originalPrice: 5000,
    priceLabel: "₦500 per module",
    currency: "₦",
  },
];
