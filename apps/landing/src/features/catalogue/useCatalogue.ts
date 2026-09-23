import { useQuery } from "@tanstack/react-query";
import { getCourses, getPrograms } from "./catalogue.service";

export const useCourses = () =>
  useQuery({ queryKey: ["catalogue", "courses"], queryFn: getCourses });

export const usePrograms = () =>
  useQuery({ queryKey: ["catalogue", "programs"], queryFn: getPrograms });
