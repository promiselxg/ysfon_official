"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function ImageViewer({
  src,
  alt,
  className,
  defaultClassName = true,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Image
          src={src}
          alt={alt}
          width={500}
          height={500}
          onClick={() => setOpen(true)}
          priority
          className={`cursor-zoom-in ${className}`}
        />
      </DialogTrigger>

      <DialogContent
        className="p-0 bg-transparent border-none"
        aria-describedby="image preview"
      >
        <DialogTitle></DialogTitle>
        <Image
          src={src}
          alt={alt}
          width={1000}
          height={1000}
          priority
          className={
            defaultClassName ? "w-full md:h-[500px] object-contain" : ""
          }
        />
      </DialogContent>
    </Dialog>
  );
}
