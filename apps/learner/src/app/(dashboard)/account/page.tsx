import Account from "@/src/features/account/components/Account";

export const metadata = {
  title: "Account",
};
export const dynamic = "force-dynamic";
export default function AccountPage() {
  return <Account />;
}
