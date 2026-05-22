import {Icon} from "@mcc/ui";

export default function Notifications() {
  return (
    <button className="rounded-full p-2 pt-1.5 border border-muted/40 shadow-md dark:shadow-muted/20">
      <Icon icon="line-md:bell-filled" size={24}/>
    </button>
  );
}