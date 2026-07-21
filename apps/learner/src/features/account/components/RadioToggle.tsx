interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({checked, onChange, label}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`box-border flex items-center w-12 shrink-0  rounded-full leading-none outline-none transition-colors p-1  ${
        checked ? "bg-violet-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`box-border h-5 w-5 shrink-0 rounded-full bg-white shadow transition-transform  ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
