import {Icon} from "@mcc/ui";
import {sideBarLinks} from "./constants/NavLinks";
import Link from "next/link";
import {useState} from "react";

export default function SideNav({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [url, setUrl] = useState("explore");

  return (
    <div
      className={`pl-3 flex flex-col pb-5 border ${open ? "w-55" : "w-full"} `}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="rounded-2xl bg-black w-full">
          <div
            className={`pt-8 pb-12 flex flex-col gap-3 rounded-2xl bg-[#222225] ${open && "pl-3"}`}
          >
            {sideBarLinks.map((link) => (
              <Link
                // href={link.link}
                href={"#"}
                key={link.label}
                className={`flex relative ${open ? "w-full" : "items-center"}`}
              >
                <button
                  onClick={() => setUrl(link.label)}
                  className={`${url == link.label ? "bg-white text-black" : "text-white hover:bg-muted/40 "} ${open ? "w-full mr-4" : "w-fit mx-auto"} p-2 rounded-xl flex items-center gap-2 cursor-pointer`}
                >
                  <Icon icon={String(link.icon)} width="20" height="20" />
                  {open && (
                    <p className="text-sm font-medium capitalize text-nowrap max-sm:hidden">
                      {link.label}
                    </p>
                  )}
                </button>
                {url === link.label && <Pin />}
              </Link>
            ))}
          </div>

          <div
            className={`${open ? "p-2" : "py-3"} flex items-center justify-center gap-3`}
          >
            <div className="flex items-center gap-3 pl-3">
              <Icon icon="circle-flags:uk" width="16" height="16" />
              <p className={!open ? "hidden" : "text-white text-xs"}>
                English (US)
              </p>
            </div>
            <Icon icon="ci:caret-down-sm" width="24" height="24" color="grey" />
          </div>
        </div>
      </div>

      <div className="px-2 py-2.5 rounded-2xl bg-[#222225] flex items-center gap-2 w-full">
        <div className="w-full max-w-10 max-sm:w-15! h-10 rounded-full border-2 border-white overflow-hidden">
          <img
            src="/assets/images/profile.png"
            alt="profile image"
            className="w-full h-full"
          />
        </div>

        <div
          className={`flex items-center justify-between ${open ? "w-full" : "w-fit"}`}
        >
          <div className={!open ? "hidden" : ""}>
            <p className="text-xs font-semibold text-white">Bright Mba</p>
            <p className="text-muted text-xs">@mac</p>
          </div>
          <Icon icon="ci:caret-down-sm" width="24" height="24" color="white" />
        </div>
      </div>
    </div>
  );
}

const Pin = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="33"
      viewBox="0 0 11 33"
      fill="none"
      className="translate-[1.5px] absolute right-0"
    >
      <path
        d="M1.9334 13.5716C6.31448 11.3491 9.21206 7.97147 10.2085 0V33C9.20306 25.6268 6.23389 22.2421 1.78656 19.7946C-0.669804 18.4428 -0.567027 14.8401 1.9334 13.5716Z"
        fill="white"
      />
    </svg>
  );
};
