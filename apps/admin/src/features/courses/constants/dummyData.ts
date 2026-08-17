import {CourseListRowData} from "../components/CoursesRow";

export const dummyCourses: CourseListRowData[] = [
  {
    id: "course_1",
    courseName: "pilates",
    logoUrl: "https://picsum.photos/seed/utme/56",
    teacherName: "Beneduct Laura",
    rating: "4.7",
    reviewCount: "5.2k",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    tags: ["Exam", "School Leaving"],
    extraTagsCount: 8,
    status: "live",
    price: 5345,
    originalPrice: 3500,
    modulePrice: 2400,
    currency: "₦",
    link: "https://mcc.com/prog_1",
    instructor: "Beneduct Laura",
    description:
      "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",
    imgBig: "/assets/images/courses/uiux-big.jpg",
    imgSmall: "/assets/images/courses/uiux-small.jpg",
  },
];

// Empty-state test case
export const dummyProgramsEmpty: CourseListRowData[] = [];
