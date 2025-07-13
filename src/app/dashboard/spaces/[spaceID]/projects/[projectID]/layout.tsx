"use client";

import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "../../../../../../components/sidebar";
import Link from "next/link";
import { BrainCircuit, ChevronLeft, Image } from "lucide-react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const { projectID, spaceID } = useParams();
  const pathname = usePathname();

  const tabs = [
    {
      routeName: "logic",
      tabName: "Logic",
      icon: <BrainCircuit size={14} />,
    },
    {
      routeName: "ui",
      tabName: "UI",
      icon: <Image size={14} />,
    },
  ];

  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  
  const currentTab = pathSegments[5];
  const subPage = pathSegments[6];

  const hideSidebar = Boolean(currentTab && subPage);

  return (
    <div className="flex h-screen">
      {!hideSidebar && (
        <Sidebar>
          <Link
            key="dashboard"
            href={`/dashboard`}
            className={`p-2 hover:bg-muted transition-all text-sm w-full rounded-md text-muted-foreground flex gap-2 items-center`}
          >
            <ChevronLeft className="text-muted-foreground" size={14} />
            Dashboard
          </Link>
          {tabs.map((tab) => (
            <Link
              key={tab.routeName}
              href={`/dashboard/spaces/${spaceID}/projects/${projectID}/${tab.routeName}`}
              className={`p-2 hover:bg-muted transition-all text-sm w-full rounded-md ${
                currentTab === tab.routeName && !subPage ? "bg-muted" : ""
              } flex gap-2 items-center`}
            >
              {tab.icon}
              {tab.tabName}
            </Link>
          ))}
        </Sidebar>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}
