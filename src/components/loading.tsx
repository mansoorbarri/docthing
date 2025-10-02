import { Loader2 } from "lucide-react";

export function Loading() {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Loading Dashboard...</p>
      </div>
    )
}