import type {ProfileTabKey} from "../constants/types";

interface ProfileTabsProps {
  active: ProfileTabKey;
  onChange: (key: ProfileTabKey) => void;
}

export function ProfileTabs({active, onChange}: ProfileTabsProps) {
  const tabs: {key: ProfileTabKey; label: string}[] = [
    {key: "account", label: "Account Details"},
    {key: "bookmarks", label: "Bookmarks"},
    {key: "configurations", label: "Configurations"},
  ];

  return (
    <div className="mt-6 inline-flex rounded-full bg-muted/10 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === t.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
