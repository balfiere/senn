import { Head, Link } from '@inertiajs/react';

import { Button } from '@/Components/ui/button';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-background flex min-h-svh flex-col items-center justify-center px-4">
                <div className="max-w-lg text-center">
                    <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                        Knitting and Crochet Row Counter
                    </h1>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Keep track of your knitting and crochet projects with
                        row counters, pattern notes, and PDF management.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild size="lg">
                            <Link href={route('register')}>Get Started</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href={route('login')}>Sign In</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
