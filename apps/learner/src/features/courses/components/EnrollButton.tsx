export const EnrollButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="bg-green-500 text-white px-2 py-1">
      Enroll
    </button>
  );
};