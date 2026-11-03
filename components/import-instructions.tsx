"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Info } from "lucide-react";
import type React from "react";

export interface ImportColumn {
  // The column header, as shown in the table on screen.
  name: string;
  description: React.ReactNode;
}

interface ImportInstructionsProps {
  // The columns to fill in, in file order. Calculated columns are left out.
  columns: ImportColumn[];
  // What is calculated automatically and should be left out of the file.
  calculated?: React.ReactNode;
  // What makes the database reject the whole file, e.g. a duplicate record.
  rejectsWholeFile?: React.ReactNode;
  hasDates?: boolean;
  exampleRow: string;
  templateFileName: string;
}

export function Code({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <code
      className={cn("rounded bg-muted px-1 py-0.5 font-mono text-xs", className)}
    >
      {children}
    </code>
  );
}

// Header row only, so an unedited template can never import sample data.
function downloadTemplate(headers: string[], fileName: string) {
  const blob = new Blob([`${headers.join(",")}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportInstructions({
  columns,
  calculated,
  rejectsWholeFile,
  hasDates = false,
  exampleRow,
  templateFileName,
}: ImportInstructionsProps) {
  const headers = columns.map((column) => column.name);

  return (
    <Alert className="max-h-72 overflow-y-auto">
      <Info className="h-4 w-4" />
      <AlertTitle>How to prepare your CSV file</AlertTitle>
      <AlertDescription className="space-y-3 text-sm">
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Save the file as <strong>CSV (comma delimited)</strong>. Put the
            column names in the first row, then one record per row.
          </li>
          <li>
            Use these column names, in the same order as the table on screen.
            Capital letters and spaces don&apos;t matter.
          </li>
        </ol>

        <ul className="space-y-1 rounded-md border bg-muted/50 p-2">
          {columns.map((column) => (
            <li key={column.name}>
              <Code className="font-semibold">{column.name}</Code>:{" "}
              {column.description}
            </li>
          ))}
        </ul>

        {calculated && (
          <p>
            <strong>Calculated automatically, leave out:</strong> {calculated}
          </p>
        )}

        <ul className="list-disc space-y-1 pl-4">
          <li>
            Use whole numbers with no commas or spaces: <Code>10817</Code>,
            not <Code>10,817</Code>.
          </li>
          {hasDates && (
            <li>
              Write dates as <Code>YYYY-MM-DD</Code>, e.g.{" "}
              <Code>2024-01-15</Code>. Rows with other date formats are
              skipped.
            </li>
          )}
          <li>
            Rows with missing values, or values that aren&apos;t allowed, are
            skipped and the rest are imported.
          </li>
          {rejectsWholeFile && (
            <li>
              If any row {rejectsWholeFile}, <strong>nothing is imported</strong>
              . Fix the file and try again.
            </li>
          )}
        </ul>

        <p>
          Example row: <Code className="break-all">{exampleRow}</Code>
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadTemplate(headers, templateFileName)}
        >
          <Download className="mr-2 h-4 w-4" />
          Download template
        </Button>
      </AlertDescription>
    </Alert>
  );
}
