'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookLock, PlusCircle, Wrench } from "lucide-react";

export default function ClauseBankPage() {
  // Placeholder data
  const customClauses: any[] = [];

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Clause Bank</h1>
        <p className="text-lg text-muted-foreground mt-1">Organize and reuse your custom legal clauses efficiently.</p>
      </header>

      {customClauses.length === 0 ? (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <BookLock className="h-20 w-20 text-primary/60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Clause Bank is Empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your library of custom clauses for quick insertion into your legal documents. This feature is coming soon!
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Clause (Soon)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This part will be populated when clause bank is implemented */}
        </div>
      )}

      <Card className="bg-accent/10 border-accent/30 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center gap-3">
          <Wrench className="h-8 w-8 text-accent" />
          <div>
            <CardTitle className="text-accent text-xl">Under Development</CardTitle>
            <CardDescription className="text-accent/80">This feature is actively being developed.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Clause Bank will allow you to save, categorize, and manage your frequently used legal clauses. 
            You&apos;ll be able to easily search and insert them into your documents. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
