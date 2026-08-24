interface Program {
  id: string;
  thumbnailLabel: string;
  title: string;
  subtitle: string;
}

export type LeaderboardTier = "gold" | "silver" | "bronze" | "standard";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: number;
  username?: string;
  programs: Program[];
  dateJoined: string;
  rank: number;
  rating: string;
  sessions: {
    total: number;
    completed: number;
  };
}
export interface ProspectiveStudent {
  id: string;
  avatar: string;
  name: string;
  email: string;
  dateJoined: string;
  time: string;
  method: Method;
}
interface MethodBadge {
  type: "badge";
  label: string;
}

interface MethodCourse {
  type: "course";
  thumbnailLabel: string;
  title: string;
  subtitle: string;
}

export type Method = MethodBadge | MethodCourse;

export interface PersonalDetailsProps {
  email?: string;
  phone?: string;
  username?: string;
  location?: string;
}
