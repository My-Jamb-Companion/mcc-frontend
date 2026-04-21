export interface CourseCardProps {
  image: string;
  instructor: string;
  rating: number;
  reviewCount: string;
  title: string;
  tags: string[];
  price?: number;
  originalPrice?: number;
  pricePerModule?: number;
  currency?: string;
  onClick?: () => void;
}
