export interface LiveClassCardProps {
  title: string;
  thumbnail: string;
  instructorImage: string;
  instructorName: string;
  scheduledAt: Date;
  datetime: string;
  onJoin?: () => void;
}
