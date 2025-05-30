"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Grip, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { handleDeleteBtn } from "@/lib/utils/deleteItemFromDb";

const ChapterList = ({ onEdit, onReorder, items, courseId, onSuccess }) => {
  const [mounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedChapters = items.slice(startIndex, endIndex + 1);

    setChapters(items);

    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));

    onReorder(bulkUpdateData);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  if (!mounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {chapters?.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      `flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm`,
                      chapter.isPublished &&
                        `bg-sky-100 border-sky-200 text-sky-700`
                    )}
                  >
                    <div
                      className={cn(
                        `px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded`
                      )}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {chapter.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {chapter.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          `bg-slate-500 ${chapter.isPublished && "bg-sky-700"}`
                        )}
                      >
                        {chapter.isPublished ? "Publised" : "Draft"}
                      </Badge>
                      <Pencil
                        className="w-4 h4 cursor-pointer hover:opacity-75"
                        onClick={() => onEdit(chapter.id)}
                      />
                      <Trash2
                        className="w-4 h4 cursor-pointer hover:opacity-75"
                        onClick={() =>
                          handleDeleteBtn(
                            `/training/course/${courseId}/chapter/${chapter.id}`,
                            onSuccess
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ChapterList;
