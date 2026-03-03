"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HumanTraffickingTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: 10 }).map((_, i) => (
                <th
                  key={i}
                  className="h-10 px-4 text-left align-middle font-medium"
                >
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4 align-middle">
                    <Skeleton className="h-4 w-full max-w-30" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
