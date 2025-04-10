"use client";

import Image from "next/image";
import Link from "next/link";

export default function BreadcrumbBanner({
  title = "Page",
  pathname = [],
  banner,
}) {
  return (
    <div className="relative w-full h-[200px] md:h-[300px] mt-[85px]">
      <Image src={banner} alt="Banner Image" fill className="object-cover" />

      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center text-white space-y-2">
        <h1 className="font-euclid text-3xl md:text-5xl font-bold">{title}</h1>

        <div className="flex items-center gap-2 text-sm transition-all">
          <Link href="/" className="hover:text-[--app-bg-red] transition-all">
            Home
          </Link>
          {pathname.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span>/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-[--app-bg-red] transition-all"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
