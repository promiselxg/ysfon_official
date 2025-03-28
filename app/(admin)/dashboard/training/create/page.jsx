import CourseTitle from "@/components/training/form-course-title";
import React from "react";
import DashboardHeader from "../../_components/dashboard/header";

const TrainingPage = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Course creation" },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex w-full">
        <div className="w-full flex  bg-muted items-center justify-center h-[calc(100vh-64px)]">
          <div className="py-10 rounded-[15px] shadow w-full flex max-w-5xl mx-auto md:items-center md:justify-center bg-white">
            <CourseTitle />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingPage;
