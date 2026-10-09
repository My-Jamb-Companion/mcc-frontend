import { AccountForm } from "@/src/features/account/AccountForm";

export default function AccountPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Account</h1>
      <p className="text-sm text-muted mb-6">Your name and contact details.</p>
      <AccountForm />
    </div>
  );
}
