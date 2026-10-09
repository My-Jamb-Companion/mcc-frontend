import { AddChildForm } from "@/src/features/children/AddChildForm";

export default function AddChildPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Add another child</h1>
      <p className="text-sm text-muted mb-6">Create an account for another child and link it to yours.</p>
      <AddChildForm />
    </div>
  );
}
