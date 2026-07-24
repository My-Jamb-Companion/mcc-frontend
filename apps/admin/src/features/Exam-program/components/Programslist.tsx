import {ProgramListRow, ProgramListRowData} from "./ProgramRow";
import {NoProgram} from "./EmptyProgram";

interface ProgramListProps {
  program: ProgramListRowData[];
  onShareLink?: (id: string) => void;
  onOpen?: (id: string) => void;
  onEditProgram?: (id: string) => void;
  onPublishProgram?: (id: string) => void;
  onMessageTeacher?: (id: string) => void;
  onViewParentProgram?: (id: string) => void;
  onDeleteProgram?: (id: string) => void;
}

export function ProgramList({
  program,
  onShareLink,
  onOpen,
  onEditProgram,
  onPublishProgram,
  onMessageTeacher,
  onViewParentProgram,
  onDeleteProgram,
}: ProgramListProps) {
  if (program.length === 0) {
    return <NoProgram />;
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {program.map((item) => (
        <ProgramListRow
          key={item.id}
          program={item}
          onShareLink={() => onShareLink?.(item.id)}
          onOpen={() => onOpen?.(item.id)}
          menuHandlers={{
            onOpenProgram: () => onOpen?.(item.id),
            onEditProgram: () => onEditProgram?.(item.id),
            onPublishProgram: () => onPublishProgram?.(item.id),
            onMessageTeacher: () => onMessageTeacher?.(item.id),
            onViewParentProgram: () => onViewParentProgram?.(item.id),
            onDeleteProgram: () => onDeleteProgram?.(item.id),
          }}
        />
      ))}
    </div>
  );
}
