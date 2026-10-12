import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeAuthSection } from "./home-auth-section";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal Lite</CardTitle>
          <CardDescription>
            Portfolio client portal. Try a synthetic sandbox — all data is
            demo-only and expires.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form action="/api/demo/start" method="post">
            <Button type="submit" className="w-full">
              Try sandbox
            </Button>
          </form>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading session…</p>
            }
          >
            <HomeAuthSection />
          </Suspense>
          <Link
            href="/api/health"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Check DB health
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
