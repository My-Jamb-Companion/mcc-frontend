// Mirrors backend/app/features/academics/courses/schemas.py::CatalogueCourse
// (GET /courses/) and backend/app/features/academics/exams/schemas.py::
// ProgramCatalogueItem (GET /exams/programs).

export interface CatalogueTierPrice {
  tier_id: string;
  tier_name: string;
  price: number;
}

export interface CatalogueCourse {
  course_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  price: number;
  tier_prices: CatalogueTierPrice[];
}

export interface CatalogueProgram {
  program_id: string;
  exam_name: string | null;
  subject_name: string | null;
  description: string | null;
  price: number;
  level: string;
  cover_image_url: string | null;
  tier_prices: CatalogueTierPrice[];
}
