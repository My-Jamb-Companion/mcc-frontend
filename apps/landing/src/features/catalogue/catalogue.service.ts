import { apiClient } from "@mcc/api";
import { CatalogueCourse, CatalogueProgram } from "./types";

// The backend's Decimal price fields (pydantic v2's default JSON encoding)
// serialize as JSON strings ("7500.00"), not numbers -- "7500.00".toLocaleString()
// silently no-ops (strings have their own, different toLocaleString), so this
// coerces to a real number right at the service boundary rather than leaking
// the wire format into every component that reads .price.
type WireCourse = Omit<CatalogueCourse, "price"> & { price: string | number };
type WireProgram = Omit<CatalogueProgram, "price"> & { price: string | number };

export const getCourses = async (): Promise<CatalogueCourse[]> => {
  const res = await apiClient.get<{
    success: boolean;
    data: { courses: WireCourse[] };
  }>("/courses/");
  return res.data.data.courses.map((c) => ({ ...c, price: Number(c.price) }));
};

export const getPrograms = async (): Promise<CatalogueProgram[]> => {
  const res = await apiClient.get<{
    success: boolean;
    data: { programs: WireProgram[] };
  }>("/exams/programs");
  return res.data.data.programs.map((p) => ({ ...p, price: Number(p.price) }));
};
