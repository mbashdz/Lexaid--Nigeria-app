'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function SavedDraftsPage() {
  // Placeholder data - in a real app, this would come from a database
  const savedDrafts: any[] = [];

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Saved Drafts</h1>
        <p className="text-lg text-muted-foreground mt-1">Access and manage your previously saved legal documents.</p>
      </header>

      {savedDrafts.length === 0 ? (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <FolderOpen className="h-20 w-20 text-primary/60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Saved Drafts Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              It looks like you haven&apos;t saved any drafts. Start drafting a new document to see it here.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base">
              <Link href="/dashboard">
                <PlusCircle className="mr-2 h-5 w-5" /> Start a New Draft
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This part will be populated when draft saving is implemented */}
          {/* Example Card for a saved draft:
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>Statement of Claim - Project Alpha</CardTitle>
              <CardDescription>Last saved: 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                A detailed statement of claim regarding the breach of contract between...
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">Open Draft</Button>
            </CardFooter>
          </Card>
          */}
        </div>
      )}

      <Card className="bg-primary/5 border-primary/20 shadow-sm rounded-xl">
        <CardHeader>
            <CardTitle className="text-primary text-xl">Feature Availability</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Full functionality for saving, viewing, and managing drafts is currently under development and will be available soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
