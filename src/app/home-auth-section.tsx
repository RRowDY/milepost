import { connection } from "next/server";
import { signInWithGitHub } from "./actions/auth";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export async function HomeAuthSection() {
  await connection();
  const session = await auth();

  if (session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        Signed in as {session.user.email ?? session.user.name}
      </p>
    );
  }

  return (
    <form action={signInWithGitHub}>
      <Button type="submit">Sign in with GitHub</Button>
    </form>
  );
}
