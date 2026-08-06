import {Icon} from "@mcc/ui";
import Image from "next/image";

export default function AvatarPicker({
  setFile,
}: {
  setFile: (file: string) => void;
}) {
  return (
    <div className="lg:block">
      <p className="mb-3 text-sm text-gray-500">You can also select avatars</p>

      <div className="flex items-center gap-3">
        <button className="text-gray-400">
          <Icon icon="mdi:chevron-left" />
        </button>

        {avatars.map((avatar) => (
          <button
            key={avatar}
            onClick={() => setFile(avatar)}
            className="relative h-10 w-10 overflow-hidden rounded-full transition hover:scale-110 bg-violet-400"
          >
            <Image src={avatar} alt="avatar" fill className="object-cover" />
          </button>
        ))}

        <button className="text-gray-400">
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
    </div>
  );
}
const avatars = [
  "/assets/images/avatars/1.png",
  "/assets/images/avatars/2.png",
  "/assets/images/avatars/3.png",
  "/assets/images/avatars/4.png",
  "/assets/images/avatars/5.png",
  "/assets/images/avatars/6.png",
  "/assets/images/avatars/7.png",
];
