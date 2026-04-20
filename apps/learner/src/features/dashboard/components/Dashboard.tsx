"use client";

import {useState} from "react";
import Header from "./Header";
import SideNav from "./SideNav";

export default function Dashboard() {
  const [sideNav, setSideNav] = useState(true);
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className={`grid-cols-[auto_1fr] grid h-full`}>
        <SideNav open={sideNav} setOpen={setSideNav} />
      </div>
    </div>
  );
}
