export const CourseCard = ({ title, children }: { title: string; children?: React.ReactNode }) => {
  return (
    <div className="border p-3 mb-2">
      <h3>{title}</h3>
      {children}
    </div>
  );
};