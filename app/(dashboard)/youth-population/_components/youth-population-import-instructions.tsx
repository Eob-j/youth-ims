"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Info } from "lucide-react";
import type React from "react";

// The columns to fill in, with the same labels and order as the table in the
// UI. Calculated columns are left out. Must match the headers in
// youthPopulationImportConfig.
const headers = [
  "LGA",
  "Total Population",
  "Male Youth",
  "Female Youth",
  "Urban Youth",
  "Rural Youth",
  "Year",
];

const columns = [
  { name: "LGA", description: "LGA name, e.g. Banjul. Required." },
  {
    name: "Total Population",
    description: "Total population of the LGA. Required.",
  },
  {
    name: "Male Youth, Female Youth",
    description:
      "Required. Added together to give Youth Population, which cannot be more than Total Population.",
  },
  {
    name: "Urban Youth, Rural Youth",
    description: "Required. Must add up to Male Youth + Female Youth.",
  },
  { name: "Year", description: "e.g. 2024. Required." },
];

function Code({
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
function downloadTemplate() {
  const blob = new Blob([`${headers.join(",")}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "youth-population-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function YouthPopulationImportInstructions() {
  return (
    <Alert className="max-h-72 overflow-y-auto">
      <Info className="h-4 w-4" />
      <AlertTitle>How to prepare your CSV file</AlertTitle>
      <AlertDescription className="space-y-3 text-sm">
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Save the file as <strong>CSV (comma delimited)</strong>. Put the
            column names in the first row, then one row per LGA and year.
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

        <p>
          <strong>Calculated automatically, leave these out:</strong> Youth
          Population (Male Youth + Female Youth) and Youth Share (%) (Youth
          Population ÷ Total Population × 100). If your file has them, for
          example an exported file, Youth Share is ignored and Youth Population
          must equal Male Youth + Female Youth. The ID, version and
          created/updated dates are also set for you.
        </p>

        <ul className="list-disc space-y-1 pl-4">
          <li>
            Use whole numbers with no commas or spaces: <Code>10817</Code>,
            not <Code>10,817</Code>.
          </li>
          <li>
            Rows with missing or invalid values are skipped and the rest are
            imported.
          </li>
          <li>
            If any row breaks a total rule above, or repeats an LGA and year
            that already exists, <strong>nothing is imported</strong>. Fix the
            file and try again.
          </li>
        </ul>

        <p>
          Example row: <Code>Banjul,26461,5123,5694,10817,0,2024</Code>
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
        >
          <Download className="mr-2 h-4 w-4" />
          Download template
        </Button>
      </AlertDescription>
    </Alert>
  );
}
