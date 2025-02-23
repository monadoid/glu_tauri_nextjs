import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InstructionsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Instructions</h1>
      <Button asChild>
        <Link href="/final">Finish</Link>
      </Button>
    </div>
  );
} 