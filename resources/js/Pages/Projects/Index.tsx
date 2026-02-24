import { ResponsiveToaster } from '@/Components/Features/ResponsiveToaster';
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
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import { db, type LocalProject } from '@/lib/offline/db';
import { deleteProjectLocally } from '@/lib/offline/repositories/projects';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    Clock,
    FileText,
    MoreHorizontal,
    Plus,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Masonry } from 'react-plock';

// Use LocalProject type which matches our DB schema
type Project = LocalProject;

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
    const [name, setName] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            router.post(
                route('projects.store'),
                {
                    name,
                    pdf_file: pdfFile,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                        setName('');
                        setPdfFile(null);
                    },
                    onError: (err) => {
                        setErrors(err);
                    },
                    onFinish: () => setIsSubmitting(false),
                },
            );
        } catch (error) {
            console.error('Failed to create project:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="rounded-none text-xs tracking-wider uppercase"
                >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-light tracking-tight">
                        Create New Project
                    </DialogTitle>
                    <DialogDescription className="text-sm tracking-wide">
                        Start tracking a new knitting or crochet project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-5">
                    <FormField
                        label="Project Name"
                        description="Give your project a descriptive name"
                        error={errors.name}
                        required
                    >
                        <Input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Sweater"
                            required
                        />
                    </FormField>

                    <FormField
                        label="Pattern PDF (Optional)"
                        description="Upload a PDF pattern for your project"
                        error={errors.pdf_file}
                    >
                        <Input
                            type="file"
                            name="pdf_file"
                            accept=".pdf"
                            onChange={(e) =>
                                setPdfFile(e.target.files?.[0] || null)
                            }
                        />
                    </FormField>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-none"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-none"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AccountButton() {
    return (
        <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground text-xs tracking-wider uppercase"
        >
            <Link href={route('account')}>
                <User className="mr-2 h-3.5 w-3.5" />
                Account
            </Link>
        </Button>
    );
}

function ProjectCard({
    project,
    handleDelete,
    deletingId,
}: {
    project: Project;
    handleDelete: (id: string) => void;
    deletingId: string | null;
}) {
    const [displaySeconds, setDisplaySeconds] = useState(
        project.stopwatch_seconds,
    );

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
    }, [
        project.stopwatch_running,
        project.stopwatch_seconds,
        project.stopwatch_started_at,
    ]);

    return (
        <Card className="group relative flex flex-col gap-0 py-0">
            {project.thumbnail_path && (
                <div className="border-border bg-muted relative aspect-4/3 w-full border-b">
                    <img
                        src={`${route('projects.thumbnail', project.id)}?v=${new Date(project.updated_at).getTime()}`}
                        alt={project.name}
                        className="h-full w-full object-cover grayscale-20 transition-all duration-500 group-hover:grayscale-0"
                    />
                </div>
            )}
            <Link
                href={route('projects.show', project.id)}
                className="absolute inset-0 z-10"
                prefetch
            >
                <span className="sr-only">Open {project.name}</span>
            </Link>
            <CardHeader className="px-6 pt-4 pb-2">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-foreground line-clamp-1 text-base font-normal tracking-tight">
                        {project.name}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative z-20 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
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
                                {deletingId === project.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardDescription className="text-muted-foreground text-xs tracking-wider uppercase">
                    Updated{' '}
                    {new Date(project.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-4">
                <div className="text-muted-foreground flex items-center gap-4 text-xs tracking-wide">
                    <div
                        className={cn(
                            'flex items-center gap-1.5',
                            project.stopwatch_running && 'text-foreground',
                        )}
                    >
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">
                            {formatTime(displaySeconds)}
                        </span>
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        setDeletingId(id);
        try {
            router.delete(route('projects.destroy', id), {
                onSuccess: async () => {
                    // Sync local IndexedDB with server deletion
                    await deleteProjectLocally(id);
                },
                onError: (error) => {
                    console.error('Failed to delete project:', error);
                },
                onFinish: () => setDeletingId(null),
            });
        } catch (e) {
            console.error(e);
            setDeletingId(null);
        }
    };

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-muted/50 mb-6 rounded-full p-6">
                    <FileText className="text-muted-foreground h-10 w-10" />
                </div>
                <h2 className="text-foreground text-2xl font-light tracking-tight">
                    No projects{' '}
                    <span className="ml-1 font-serif tracking-wide italic">
                        yet
                    </span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xs text-sm tracking-wide">
                    Create your first project to start tracking your knitting or
                    crochet work.
                </p>
            </div>
        );
    }

    return (
        <Masonry
            items={projects}
            config={{
                columns: [1, 2, 3],
                gap: [16, 16, 16],
                media: [640, 1024, 1280],
                useBalancedLayout: true,
            }}
            render={(project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    handleDelete={handleDelete}
                    deletingId={deletingId}
                />
            )}
        />
    );
}

export default function Index({ projects: initialProjects }: Props) {
    // Use Dexie live query for reactivity
    const projects =
        useLiveQuery(
            () =>
                db.projects
                    .orderBy('updated_at')
                    .reverse()
                    .filter((p) => !p.deleted_at)
                    .toArray(),
            [],
        ) ?? initialProjects;

    return (
        <>
            <Head title="Projects" />
            <div className="bg-background min-h-svh">
                <header className="bg-background/80 border-border sticky top-0 z-40 w-full border-b backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
                        <h1 className="text-foreground text-sm font-medium tracking-[0.2em] uppercase">
                            Senn.
                        </h1>
                        <div className="flex items-center gap-4">
                            <CreateProjectDialog />
                            <AccountButton />
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-5xl px-6 py-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
                            Your{' '}
                            <span className="ml-0.5 font-serif tracking-wide italic">
                                projects
                            </span>
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm tracking-wide">
                            {projects.length} active project
                            {projects.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <ProjectsList projects={projects} />
                </main>
            </div>
            <ResponsiveToaster />
        </>
    );
}
