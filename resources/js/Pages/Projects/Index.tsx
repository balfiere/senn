import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  Clock,
  FileText,
  LogOut,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { FormField } from '@/Components/ui/form-field';
import { ResponsiveToaster } from '@/Components/Features/ResponsiveToaster';

interface Project {
  id: string;
  user_id: number;
  name: string;
  pdf_path: string | null;
  thumbnail_path: string | null;
  stopwatch_seconds: number;
  stopwatch_running: boolean;
  stopwatch_started_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  projects: Project[];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    pdf_file: null as File | null,
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('projects.store'), {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-none text-xs uppercase tracking-wider">
          <Plus className="mr-2 h-3.5 w-3.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="font-light tracking-tight text-xl">Create New Project</DialogTitle>
          <DialogDescription className="text-sm tracking-wide">
            Start tracking a new knitting or crochet project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-6">
            <FormField
              label="Project Name"
              error={errors.name}
              required
              description="Give your project a descriptive name"
            >
              <Input
                placeholder="My Sweater"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
              />
            </FormField>
            <FormField
              label="Pattern PDF (Optional)"
              error={errors.pdf_file}
              description="Upload a PDF pattern for your project"
            >
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setData('pdf_file', e.target.files ? e.target.files[0] : null)}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing || !data.name} className="rounded-none">
              {processing ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LogoutButton() {
  const handleLogout = () => {
    router.post(route('logout'));
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
      <LogOut className="mr-2 h-3.5 w-3.5" />
      Sign Out
    </Button>
  );
}

function ProjectCard({ project, handleDelete, deletingId }: { project: Project, handleDelete: (id: string) => void, deletingId: string | null }) {
  const [displaySeconds, setDisplaySeconds] = useState(project.stopwatch_seconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateDisplay = () => {
      if (project.stopwatch_running && project.stopwatch_started_at) {
        const start = new Date(project.stopwatch_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.max(0, Math.floor((now - start) / 1000));
        setDisplaySeconds(project.stopwatch_seconds + elapsed);
      } else {
        setDisplaySeconds(project.stopwatch_seconds);
      }
    };

    updateDisplay();

    if (project.stopwatch_running) {
      interval = setInterval(updateDisplay, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project.stopwatch_running, project.stopwatch_seconds, project.stopwatch_started_at]);

  return (
    <Card
      className="group relative flex flex-col gap-0 py-0"
    >
      {project.thumbnail_path && (
        <div className="relative aspect-4/3 w-full border-b border-border bg-muted">
          <img
            src={route('projects.thumbnail', project.id)}
            alt={project.name}
            className="h-full w-full object-cover grayscale-20 group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      )}
      <Link
        href={route('projects.show', project.id)}
        className="absolute inset-0 z-10"
      >
        <span className="sr-only">Open {project.name}</span>
      </Link>
      <CardHeader className="pb-2 pt-4 px-6">
        <div className="flex items-start justify-between">
          <CardTitle className="text-foreground line-clamp-1 text-base font-normal tracking-tight">
            {project.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-20 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(project.id);
                }}
                disabled={deletingId === project.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletingId === project.id ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-muted-foreground text-xs uppercase tracking-wider">
          Updated {new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-6">
        <div className="text-muted-foreground flex items-center gap-4 text-xs tracking-wide">
          <div className={cn("flex items-center gap-1.5", project.stopwatch_running && "text-foreground")}>
            <Clock className="h-3 w-3" />
            <span className="font-mono">{formatTime(displaySeconds)}</span>
          </div>
          {project.pdf_path && (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              <span>Pattern</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsList({ projects }: { projects: Project[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(id);
    router.delete(route('projects.destroy', id), {
      onFinish: () => setDeletingId(null),
    });
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-muted/50 rounded-full p-6 mb-6">
          <FileText className="text-muted-foreground h-10 w-10" />
        </div>
        <h2 className="text-foreground text-2xl font-light tracking-tight">
          No projects <span className="font-serif italic">yet</span>
        </h2>
        <p className="text-muted-foreground mt-3 text-sm tracking-wide max-w-xs">
          Create your first project to start tracking your knitting or crochet work.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          handleDelete={handleDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}

export default function Index({ projects }: Props) {
  return (
    <>
      <Head title="Projects" />
      <div className="bg-background min-h-svh">
        <header className="bg-background/80 backdrop-blur-sm top-0 z-40 w-full sticky border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <h1 className="text-foreground text-sm uppercase tracking-[0.2em] font-medium">
              Row Counter
            </h1>
            <div className="flex items-center gap-4">
              <CreateProjectDialog />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
              Your <span className="font-serif italic">projects</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm tracking-wide">
              {projects.length} active project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ProjectsList projects={projects} />
        </main>
      </div>
      <ResponsiveToaster />
    </>
  );
}