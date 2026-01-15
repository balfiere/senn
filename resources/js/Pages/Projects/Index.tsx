import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  Clock,
  FileText,
  LogOut,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/Components/ui/button';
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
import { Label } from '@/Components/ui/label';

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
    pdf_url: null as string | null,
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start tracking a new knitting or crochet project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Sweater"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>
            {/* PDF upload will be added in a later phase */}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing || !data.name}>
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
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted rounded-full p-4">
          <FileText className="text-muted-foreground h-8 w-8" />
        </div>
        <h2 className="text-foreground mt-4 text-lg font-medium">
          No projects yet
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Create your first project to start tracking your work.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="border-border hover:border-primary/50 group relative flex flex-col overflow-hidden transition-colors"
        >
          <Link
            href={route('projects.show', project.id)}
            className="absolute inset-0 z-10"
          >
            <span className="sr-only">Open {project.name}</span>
          </Link>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-foreground line-clamp-1 text-base font-medium">
                {project.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-20 h-8 w-8 opacity-0 group-hover:opacity-100"
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
            <CardDescription className="text-muted-foreground text-xs">
              Updated {new Date(project.updated_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(project.stopwatch_seconds)}</span>
              </div>
              {project.pdf_url && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Index({ projects }: Props) {
  return (
    <>
      <Head title="Projects" />
      <div className="bg-background min-h-svh">
        <header className="border-border border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <h1 className="text-foreground text-xl font-semibold">
              Row Counter
            </h1>
            <div className="flex items-center gap-3">
              <CreateProjectDialog />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <ProjectsList projects={projects} />
        </main>
      </div>
    </>
  );
}
