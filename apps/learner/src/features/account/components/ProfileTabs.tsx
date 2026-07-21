interface ProfileTabsProps {
  active: "account" | "configurations";
  onChange: (key: "account" | "configurations") => void;
}

export function ProfileTabs({active, onChange}: ProfileTabsProps) {
  const tabs: {key: "account" | "configurations"; label: string}[] = [
    {key: "account", label: "Account Details"},
    {key: "configurations", label: "Configurations"},
  ];

  return (
    <div className="mt-6 inline-flex rounded-full bg-gray-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === t.key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
