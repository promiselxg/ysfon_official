"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormDescription,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { apiCall } from "@/lib/utils/api";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import ChapterList from "./chapter-list";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";

const formSchema = z.object({
  title: z.string().min(1),
});

const ChaptersForm = ({ initialData, courseId }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [chapters, setChapters] = useState(initialData?.chapters || []);
  const router = useRouter();

  const fetchChapters = React.useCallback(async () => {
    try {
      const response = await apiCall("get", `/training/course/${courseId}`);
      setChapters(response.course.chapters);
    } catch (error) {
      toast?.error("Something went wrong!", {
        description: `${error?.response?.data?.message}`,
      });
    }
  }, [courseId]);

  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      const response = await apiCall(
        "POST",
        `/training/course/${courseId}/chapter`,
        {
          title: values.title,
          userId: user.id,
        }
      );
      if (response) {
        toast.success(`${response.message}`);
        fetchChapters();
        toggleCreating();
        form.reset();
        router.replace(`/dashboard/training/course/${courseId}?tab=lessons`);
      }
    } catch (error) {
      toast?.error("Something went wrong!", {
        description: `${error?.response?.data?.message}`,
      });
    }
  };

  const onReorder = async (updatedData) => {
    try {
      setIsUpdating(true);
      const response = await apiCall(
        "PUT",
        `/training/course/${courseId}/chapter/reorder`,
        {
          list: updatedData,
        }
      );
      toast.success(`${response.message}`);
      await fetchChapters();
    } catch (error) {
      toast?.error("Something went wrong!", {
        description: `${error?.response?.data?.message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = async (chapterId) => {
    router.push(`/dashboard/training/course/${courseId}/chapter/${chapterId}`);
  };

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters, router]);

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 transition-all relative">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 flex items-center justify-center rounded-m">
          <Loader2 className=" animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Course chapters
        <Button
          variant="ghost"
          onClick={toggleCreating}
          className="cursor-pointer"
        >
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" /> Add a chapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="eg: 'Introduction to the course'"
                      className="shadow bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm ml-2 italic -mt-1">
                    Edit this course chapter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> please wait...
                </>
              ) : (
                "Create chapter"
              )}
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div
          className={cn("text-sm", !chapters.length && "text-slate-500 italic")}
        >
          {!initialData?.chapters?.length &&
            "you have not added a chapter to this course yet."}
          <ChapterList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters}
            courseId={courseId}
            onSuccess={fetchChapters}
          />
        </div>
      )}

      {!isCreating && chapters.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Drag and drop to reorder the course chapters
        </p>
      )}
    </div>
  );
};

export default ChaptersForm;
