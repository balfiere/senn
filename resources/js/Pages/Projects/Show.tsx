import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/Components/ui/button';

interface Project {
  id: string;
  user_id: number;
  name: string;
  pdf_url: string | null;
  stopwatch_seconds: number;
  stopwatch_running: boolean;
  stopwatch_started_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  project: Project;
}

export default function Show({ project }: Props) {
  return (
    <>
      <Head title={project.name} />
      <div className="bg-background min-h-svh">
        <header className="border-border border-b">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('projects.index')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to projects</span>
              </Link>
            </Button>
            <h1 className="text-foreground text-xl font-semibold">
              {project.name}
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="bg-card rounded-lg border p-8 text-center">
            <h2 className="text-foreground text-lg font-medium">
              Project View Coming Soon
            </h2>
            <p className="text-muted-foreground mt-2">
              This is a placeholder page. The full project view with counters,
              parts, and PDF viewer will be implemented in a future phase.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
