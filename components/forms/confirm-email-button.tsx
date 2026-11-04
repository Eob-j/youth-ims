"use client";

import { authButtonClass } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// Submit button for the confirm email form, with a pending state so a slow
// confirmation is not clicked twice.
export function ConfirmEmailButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={authButtonClass} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Confirming...
        </>
      ) : (
        "Confirm my email"
      )}
    </Button>
  );
}
