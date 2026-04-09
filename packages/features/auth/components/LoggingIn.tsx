import {Icon} from "@iconify/react";
export default function LoggingIn() {
  return (
    <div className="space-y-7">
      <div className="bg-black rounded-full p-6 border w-fit mx-auto">
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
