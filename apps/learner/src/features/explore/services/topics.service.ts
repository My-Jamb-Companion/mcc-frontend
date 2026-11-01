import {apiClient} from "@mcc/api";

/** A category a learner can browse courses by. */
export interface ApiTopic {
  category_id: string;
  name: string;
  course_count: number;
}

/** Endpoint: GET /courses/topics -- active categories with at least one published course, biggest first. */
export const getTopics = async (): Promise<ApiTopic[]> =>
  (await apiClient.get<{data: {topics: ApiTopic[]}}>("/courses/topics")).data.data.topics;
