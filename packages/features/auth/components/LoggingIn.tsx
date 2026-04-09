import {Icon} from "@iconify/react";
export default function LoggingIn() {
  return (
    <div className="flex flex-col items-center gap-4  ">
      <div
        className="mt-4 rounded-full p-4 border w-fit animated-pulse "
        // style={{background: "var(--muted)"}}
      >
        <Icon
          icon="system-uicons:enter-alt"
          width="48"
          height="48"
          fill="white"
        />
      </div>

      <p className="text-xl font-medium">Logging you into your account...</p>
    </div>
  );
}
