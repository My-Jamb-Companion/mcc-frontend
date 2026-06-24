"use client";
import {Button, Icon} from "@mcc/ui";
import {useState} from "react";

export default function Brainy() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <section className="h-screen flex">
      <nav
        className={`${isSidebarOpen ? "w-[400px]" : "w-[64px]"} transition-all flex flex-col gap-4 bg-muted/10 border-r border-muted/30`}
      >
        <div className="flex items-center justify-between w-full py-4 px-3">
          {isSidebarOpen && (
            <p className="text-2xl font-semibold">
              Brainy<span className="text-primary">.AI</span>{" "}
            </p>
          )}
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className={`${isSidebarOpen ? "" : "mx-auto"}`}
          >
            <Icon
              icon="hugeicons:sidebar-left-01"
              size={24}
              className="text-muted/40 hover:text-muted dark:hover:text-white"
            />
          </button>
        </div>

        <div className={`"flex flex-col gap-2 ${isSidebarOpen ? "px-3" : ""}`}>
          <Button
            variant="ghost"
            className={`flex rounded-none! ${isSidebarOpen ? "justify-start!" : "mx-auto! justify-center! "}`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="line-md:plus" size={24} />
              {isSidebarOpen && (
                <p className="text-sm font-medium text-subtle">
                  New Study Session
                </p>
              )}
            </div>
          </Button>

          <Button
            variant="ghost"
            className={`flex rounded-none! ${isSidebarOpen ? "justify-start!" : "mx-auto! justify-center!"}`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="solar:folder-open-outline" size={24} />
              {isSidebarOpen && (
                <p className="text-sm font-medium text-subtle">Libary</p>
              )}
            </div>
          </Button>
        </div>

        {isSidebarOpen && (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-medium px-3 text-subtle">History</p>

            <div className="flex flex-col gap-6">
              <div className="p-3 rounded-md border border-muted/30">
                <p className="text-sm font-medium text-subtle">
                  I want to learn more about web development using HTML, CSS,
                  and JavaScript.
                </p>
              </div>
              <div className="p-3 rounded-md border border-muted/30">
                <p className="text-sm font-medium text-subtle">
                  I want to learn more about web development using HTML, CSS,
                  and JavaScript.
                </p>
              </div>
              <div className="p-3 rounded-md border border-muted/30">
                <p className="text-sm font-medium text-subtle">
                  I want to learn more about web development using HTML, CSS,
                  and JavaScript.
                </p>
              </div>
              <div className="p-3 rounded-md border border-muted/30">
                <p className="text-sm font-medium text-subtle">
                  I want to learn more about web development using HTML, CSS,
                  and JavaScript.
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="bg-white grow"></div>
    </section>
  );
}
