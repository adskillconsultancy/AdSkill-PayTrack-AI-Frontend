import Link from "next/link";
import { Button } from "@/components/common";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <h2 className="text-xl font-semibold text-muted-foreground">
        Page Not Found
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
