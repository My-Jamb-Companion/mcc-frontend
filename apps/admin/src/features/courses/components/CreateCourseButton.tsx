export const CreateCourseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white px-2 py-1">
      Create Course
    </button>
  );
};