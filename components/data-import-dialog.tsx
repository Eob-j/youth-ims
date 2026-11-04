"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileSpreadsheet, TriangleAlert, Upload, XCircle } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import {
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_FILE_MB,
  MAX_IMPORT_ROWS,
} from "@/lib/importer/limits";

interface ImportResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: RowError[];
  error?: string;
}

interface DataImportDialogProps {
  tableName: string;
  serverActionHander: (data: FormData) => Promise<
    | {
        success: boolean;
        error: string;
        errors?: undefined;
        inserted?: undefined;
        failed?: undefined;
      }
    | {
        success: boolean;
        error: string;
        errors: any[];
        inserted?: undefined;
        failed?: undefined;
      }
    | {
        success: boolean;
        inserted: number;
        failed: number;
        error: string;
        errors?: undefined;
      }
    | {
        success: boolean;
        inserted: number;
        failed: number;
        errors: any[];
        error?: undefined;
      }
  >;
  onImportComplete?: () => void;
  // Optional guidance shown above the file picker, e.g. the required columns.
  instructions?: React.ReactNode;
}

// A row the import skipped, as returned by the import actions: the file row
// number and the validation issues per field (z.treeifyError output).
type RowError = {
  row: number;
  issues?: {
    errors?: string[];
    properties?: Record<string, { errors?: string[] }>;
  };
};

const MAX_LISTED_ROWS = 20;

// "Row 3: lga – expected string, received null"
function describeRowError({ row, issues }: RowError) {
  const clean = (message: string) => message.replace(/^Invalid input: /, "");
  const problems = [
    ...(issues?.errors ?? []).map(clean),
    ...Object.entries(issues?.properties ?? {}).flatMap(([field, value]) =>
      (value.errors ?? []).map((message) => `${field} – ${clean(message)}`),
    ),
  ];
  return `Row ${row}: ${problems.join("; ") || "invalid values"}`;
}

function RowErrors({ errors }: { errors?: RowError[] }) {
  if (!errors?.length) return null;
  const hidden = errors.length - MAX_LISTED_ROWS;
  return (
    <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-4 text-xs">
      {errors.slice(0, MAX_LISTED_ROWS).map((error) => (
        <li key={error.row}>{describeRowError(error)}</li>
      ))}
      {hidden > 0 && (
        <li>
          …and {hidden} more row{hidden === 1 ? "" : "s"}
        </li>
      )}
    </ul>
  );
}

export function DataImportDialog({
  tableName,
  serverActionHander,
  onImportComplete,
  instructions,
}: DataImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowed = [".csv", ".xlsx", ".xls", ".xlsm"];
    const valid = allowed.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext),
    );

    if (!valid) {
      toast.error("Invalid file type", {
        description: "Supported formats: CSV, XLSX, XLS, XLSM",
        richColors: true,
      });
      return;
    }

    // Refuse here rather than after a long upload; the server checks too.
    if (selectedFile.size > MAX_IMPORT_FILE_BYTES) {
      toast.error("File too large", {
        description: `The maximum is ${MAX_IMPORT_FILE_MB} MB. Split the file into smaller files.`,
        richColors: true,
      });
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please choose a file to import",
        richColors: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const response = await serverActionHander(formData);

      if (response.success) {
        const skipped = response.failed ?? 0;
        if (skipped > 0) {
          // Some rows were left out: keep the dialog open listing them, so
          // they can be fixed and imported again.
          toast.warning("Import finished with skipped rows", {
            description: `Imported ${response.inserted} records. ${skipped} row${skipped === 1 ? " was" : "s were"} skipped because of missing or invalid values.`,
          });
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setResult(response as ImportResult);
        } else {
          toast.success("Import successful", {
            description: `Imported ${response.inserted} records.`,
          });
          setOpen(false);
          reset();
        }
        onImportComplete?.();
      } else {
        toast.error("Import Error", {
          description: `${response.error}`,
        });
        setResult(response as ImportResult);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Upload an CSV file to import data into {tableName}
        </DialogDescription>

        <div className="space-y-4 py-4">
          {instructions}
          <Label htmlFor="youth-population-file-upload">Select CSV File</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileSelect}
            id="youth-population-file-upload"
          />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {file ? file.name : "Choose an CSV file"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_IMPORT_FILE_MB} MB and{" "}
            {MAX_IMPORT_ROWS.toLocaleString()} rows per file.
          </p>

          {result &&
            (result.success ? (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <TriangleAlert className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  Imported {result.inserted} records. These rows were skipped;
                  fix them and import them again:
                  <RowErrors errors={result.errors} />
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.error ?? "Import failed"}
                  <RowErrors errors={result.errors} />
                </AlertDescription>
              </Alert>
            ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
            }}
          >
            Close
          </Button>
          <Button onClick={handleImport} disabled={isPending || !file}>
            {isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
