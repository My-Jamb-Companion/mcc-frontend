import {Icon} from "@mcc/ui";

export default function LearningsHeader({
  title,
  paragraph,
  stats,
}: LearningsHeaderProps) {
  return (
    <div className="lg:max-w-[60%]">
      <h2 className="text-4xl font-semibold max-sm:text-xl capitalize">
        {title}
      </h2>
      <p className="text-muted pt-4 cap">{paragraph}</p>
      <div className="flex items-center pt-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
        {stats.map(({label, value, icon, iconBefore}, index) => (
          <div key={label} className="flex items-center">
            <div>
              <p className="text-xs text-muted">{label}</p>
              <p className="text-xs font-semibold flex items-center gap-1">
                {iconBefore && icon && <Icon icon={icon} size={12} />}
                {value}
                {!iconBefore && icon && (
                  <Icon icon={icon} size={14} className="cursor-pointer" />
                )}
              </p>
            </div>
            {index < stats.length - 1 && (
              <svg
                className="mx-5 max-sm:hidden"
                xmlns="http://www.w3.org/2000/svg"
                width="1"
                height="17"
                viewBox="0 0 1 17"
                fill="none"
              >
                <path d="M0.5 0V17" stroke="#27272A" strokeOpacity="0.1" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type Stat = {
  label: string;
  value: string;
  icon?: string;
  iconBefore?: boolean;
};

type LearningsHeaderProps = {
  title: string;
  paragraph: string;
  stats: Stat[];
};
