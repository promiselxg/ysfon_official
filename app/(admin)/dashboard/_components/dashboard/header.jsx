"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import React from "react";

const DashboardHeader = ({ breadcrumbs = [] }) => {
  const router = useRouter();
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 bg-white shadow  z-40">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList className="">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem
                  className={
                    index === breadcrumbs.length - 1 ? "" : "hidden md:block"
                  }
                >
                  {item.href ? (
                    <span
                      onClick={() => router.push(item.href)}
                      className="text-sm text-slate-700 hover:text-slate-900 transition-all delay-75 cursor-pointer"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <BreadcrumbPage className="text-sm text-slate-600 italic -mt-[1px]">
                      {item.name}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default DashboardHeader;
