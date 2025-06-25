
import { Loader2 } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-2xl">
        <AppLogo className="h-12 w-auto mb-4" />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Loading AutoTube AI...</p>
      </div>
    </div>
  );
}
