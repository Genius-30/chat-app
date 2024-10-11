import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ChatsSkeleton({ count = 5 }) {
  return (
    <div className="px-2 space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatsSkeleton;
