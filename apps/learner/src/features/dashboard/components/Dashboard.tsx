"use client";

import {useState} from "react";
import Header from "./Header";
import SideNav from "./SideNav";

export default function Dashboard() {
  const [sideNav, setSideNav] = useState(true);
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className={`grid-cols-[200px_1fr] grid h-full relative`}>
        <SideNav open={sideNav} setOpen={setSideNav} />
      </div>
    </div>
  );
}
