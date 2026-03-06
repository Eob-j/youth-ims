"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CanEditWrapper } from "@/components/can-edit-wrapper";
import { importYouthPoplationData } from "@/feature/import-csv/action";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: any[];
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
}

export function DataImportDialog({
  tableName,
  serverActionHander,
  onImportComplete,
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
        toast("Import successful", {
          description: `Inserted ${response.inserted} records`,
          richColors: true,
        });
        setOpen(false);
        reset();
        onImportComplete?.();
      } else {
        toast.error("Import Error", {
          description: `${response.error}`,
        });
      }
    });
  };

  return (
    <CanEditWrapper>
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
            <Label htmlFor="youth-population-file-upload">
              Select CSV File
            </Label>
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

            {result && (
              <>
                {result.success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Successfully inserted {result.inserted} records
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.error ?? "Import failed"}
                      {result.errors && result.errors.length > 0 && (
                        <details className="mt-2 text-xs">
                          <summary>View validation errors</summary>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(
                              result.errors.slice(0, 10),
                              null,
                              2,
                            )}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
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
    </CanEditWrapper>
  );
}
