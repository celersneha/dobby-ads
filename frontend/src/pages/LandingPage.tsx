import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <section className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="soft-badge">
            Nested folders + image uploads + access control
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Organize campaigns with a clean, scalable folder workspace.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Dobby Ads helps each user create private folder trees, upload
            assets, and track folder size including nested content at any depth.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/register">Start for free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>

        <div className="feature-surface">
          <div className="absolute -right-10 -top-10 size-32 rounded-full bg-brand-soft/80 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-accent/80 blur-3xl" />
          <div className="relative space-y-4">
            <h2 className="text-xl font-medium text-foreground">
              Why this structure works
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="rounded-lg bg-background/70 px-3 py-2 transition-colors duration-200 hover:bg-background">
                Each user can only access their own folders and images
              </li>
              <li className="rounded-lg bg-background/70 px-3 py-2 transition-colors duration-200 hover:bg-background">
                Folder size aggregates recursively for nested folders
              </li>
              <li className="rounded-lg bg-background/70 px-3 py-2 transition-colors duration-200 hover:bg-background">
                JWT auth flow with refresh token rotation
              </li>
              <li className="rounded-lg bg-background/70 px-3 py-2 transition-colors duration-200 hover:bg-background">
                Modular frontend architecture using Redux + shadcn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
