export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <section className="flex flex-col h-screen">
      <div className="py-6 px-8">
        <h4 className="text-xl">
          <span className="text-primary font-bagel">MC. </span>
          Companion
        </h4>
      </div>
      <div className="h-full flex-1">{children}</div>
      <div className="flex items-center justify-between px-16 py-6 text-sm font-medium">
        <p className="text-muted">© 2026 MC companion</p>
        <div className="flex items-center gap-5">
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Terms and Conditions
          </p>
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Privacy Policy
          </p>
        </div>
      </div>
    </section>
  );
}
