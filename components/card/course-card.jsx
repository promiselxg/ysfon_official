import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import CourseProgress from "../progress/course-progress";

export const CourseCard = ({ course, href }) => {
  return (
    <Link href={href}>
      <div className="w-full cursor-pointer group hover:shadow-sm transition overflow-hidden  rounded-lg h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            src={course?.image}
            width={500}
            height={300}
            alt={course?.title}
            unoptimized
            priority
            className="w-full h-[200px] object-cover rounded-t-lg"
          />
        </div>

        <div className="p-4 bg-white rounded-b-lg space-y-2 shadow border border-[rgba(0,0,0,0.1)]">
          <h1
            className={cn(
              `${course?.font} text-[--app-primary-color] text-[20px] font-[400] break-words line-clamp-1 group-hover:text-sky-700 transition`
            )}
          >
            {course?.title}
          </h1>

          <div className="text-xs text-muted-foreground">
            {course?.category}
          </div>
          <div className="flex items-center gap-2 text-sm font-euclid">
            <div className="flex items-center gap-2 ">
              <BookOpen className="h-4 w-4" />
              {course?.chapters}{" "}
              {course?.chapters === 1 ? "Chapter" : "Chapters"}
            </div>
          </div>
          <div className="min-h-[12px]">
            <CourseProgress
              variant={course.progress === 100 ? "success" : "default"}
              size="sm"
              value={course.progress || 0}
              className={course.progress === null ? "invisible" : ""}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};
