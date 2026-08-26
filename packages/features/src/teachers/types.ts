export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  email: string;
  subject?: string;
  date_joined?: string;
  no_of_sessions?: number;
  programs?: any[];
  rating?: number | null;
  leaderboard_position?: number | null;
  // Backward compatibility fields
  id?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
  [key: string]: any;
}

export interface GetTeachersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface GetTeachersResponseData {
  items: Teacher[];
  limit?: number;
  page?: number;
  total?: number;
  total_pages?: number;
}

export interface GetTeachersResponse {
  success?: boolean;
  message?: string;
  data: GetTeachersResponseData | Teacher[];
}
