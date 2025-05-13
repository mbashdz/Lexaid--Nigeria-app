
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookLock, PlusCircle, Wrench, Loader2, Trash2, Edit2, Eye, Save } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { addClause, getUserClauses, deleteClause, updateClause, type Clause } from '@/services/firestoreService';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';


export default function ClauseBankPage() {
  const { user, isFirebaseConfigured: firebaseReady } = useAuth();
  const { toast } = useToast();
  const [customClauses, setCustomClauses] = useState<Clause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For Adding Clause
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');
  const [newClauseCategory, setNewClauseCategory] = useState('');
  const [isAddingClause, setIsAddingClause] = useState(false);

  // For Viewing Clause
  const [viewClauseContent, setViewClauseContent] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // For Editing Clause
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<Clause | null>(null);
  const [editClauseTitle, setEditClauseTitle] = useState('');
  const [editClauseContent, setEditClauseContent] = useState('');
  const [editClauseCategory, setEditClauseCategory] = useState('');
  const [isUpdatingClause, setIsUpdatingClause] = useState(false);


  useEffect(() => {
    if (user && firebaseReady) {
      fetchClauses();
    } else if (!firebaseReady && !user) {
        setIsLoading(false);
    } else if (firebaseReady && !user) {
        setIsLoading(false);
        setCustomClauses([]);
    }
  }, [user, firebaseReady]);

  const fetchClauses = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const clauses = await getUserClauses(user.uid);
      setCustomClauses(clauses);
    } catch (error) {
      console.error("Error fetching clauses:", error);
      toast({ title: "Error Fetching Clauses", description: (error as Error).message || "Could not fetch custom clauses.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a clause.", variant: "destructive"});
      return;
    }
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive"});
      return;
    }
    setIsAddingClause(true);
    try {
      await addClause(user.uid, newClauseTitle, newClauseContent, newClauseCategory);
      toast({ title: "Clause Added", description: "New clause saved successfully.", variant: "default" });
      setNewClauseTitle('');
      setNewClauseContent('');
      setNewClauseCategory('');
      setIsAddDialogOpen(false);
      fetchClauses(); 
    } catch (error) {
      console.error("Error adding clause:", error);
      toast({ title: "Error Adding Clause", description: (error as Error).message || "Could not add the clause.", variant: "destructive" });
    } finally {
      setIsAddingClause(false);
    }
  };

  const handleOpenEditDialog = (clause: Clause) => {
    setEditingClause(clause);
    setEditClauseTitle(clause.title);
    setEditClauseContent(clause.content);
    setEditClauseCategory(clause.category || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClause || !editingClause.id) {
        toast({ title: "Error", description: "No clause selected for editing.", variant: "destructive"});
        return;
    }
    if (!editClauseTitle.trim() || !editClauseContent.trim()) {
       toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive"});
      return;
    }
    setIsUpdatingClause(true);
    try {
      await updateClause(editingClause.id, { 
        title: editClauseTitle, 
        content: editClauseContent, 
        category: editClauseCategory 
      });
      toast({ title: "Clause Updated", description: "Clause saved successfully.", variant: "default" });
      setIsEditDialogOpen(false);
      setEditingClause(null);
      fetchClauses();
    } catch (error) {
      console.error("Error updating clause:", error);
      toast({ title: "Error Updating Clause", description: (error as Error).message || "Could not update the clause.", variant: "destructive" });
    } finally {
      setIsUpdatingClause(false);
    }
  };


  const handleDeleteClause = async (clauseId: string) => {
    if (!user) return;
    try {
      await deleteClause(clauseId);
      setCustomClauses(prevClauses => prevClauses.filter(clause => clause.id !== clauseId));
      toast({ title: "Clause Deleted", description: "The clause has been successfully deleted.", variant: "default" });
    } catch (error) {
      console.error("Error deleting clause:", error);
      toast({ title: "Error Deleting Clause", description: (error as Error).message || "Could not delete the clause.", variant: "destructive" });
    }
  };
  
  const handleViewClause = (content: string) => {
    setViewClauseContent(content);
    setIsViewModalOpen(true);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your clause bank...</p>
      </div>
    );
  }
  
   if (!firebaseReady) {
     return (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <BookLock className="h-20 w-20 text-destructive mb-6" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Service Unavailable</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              The clause bank service is currently unavailable. This might be due to a configuration issue or network problems. Please check your internet connection or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Clause Bank</h1>
          <p className="text-lg text-muted-foreground mt-1">Organize and reuse your custom legal clauses efficiently.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={!firebaseReady}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Clause
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Clause</DialogTitle>
              <DialogDescription>
                Create a new reusable clause for your documents.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClause} className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clause-title" className="text-left">Title</Label>
                <Input 
                  id="clause-title" 
                  value={newClauseTitle}
                  onChange={(e) => setNewClauseTitle(e.target.value)}
                  placeholder="e.g., Force Majeure Clause" 
                  required 
                  className="bg-background border-input focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clause-content" className="text-left">Content</Label>
                <Textarea 
                  id="clause-content" 
                  value={newClauseContent}
                  onChange={(e) => setNewClauseContent(e.target.value)}
                  placeholder="Enter the full text of the clause..." 
                  required 
                  className="min-h-[150px] bg-background border-input focus:border-primary font-sans"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clause-category" className="text-left">Category (Optional)</Label>
                <Input 
                  id="clause-category" 
                  value={newClauseCategory}
                  onChange={(e) => setNewClauseCategory(e.target.value)}
                  placeholder="e.g., Contract, Litigation" 
                  className="bg-background border-input focus:border-primary"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isAddingClause || !newClauseTitle.trim() || !newClauseContent.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isAddingClause && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Clause
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {customClauses.length === 0 ? (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <BookLock className="h-20 w-20 text-primary/60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Clause Bank is Empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your library of custom clauses for quick insertion into your legal documents.
            </p>
            {firebaseReady && (
                 <Button size="lg" onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Clause
                </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customClauses.map((clause) => (
            <Card key={clause.id} className="shadow-md rounded-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-primary line-clamp-2">{clause.title}</CardTitle>
                <CardDescription>
                  Category: {clause.category || 'General'} <br />
                  Last updated: {clause.lastModified ? formatDistanceToNow(clause.lastModified.toDate(), { addSuffix: true }) : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {clause.content.substring(0, 150)}{clause.content.length > 150 ? '...' : ''}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                 <Button variant="outline" size="sm" onClick={() => handleViewClause(clause.content)} className="text-primary border-primary hover:bg-primary/10">
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(clause)} className="text-primary border-primary hover:bg-primary/10">
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="bg-destructive/90 hover:bg-destructive text-destructive-foreground">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the clause
                        titled &quot;{clause.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClause(clause.id!)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* View Clause Modal */}
      <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <AlertDialogContent className="max-w-2xl w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><BookLock className="mr-2 h-5 w-5 text-primary"/> Clause Content</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] w-full rounded-md border border-input bg-secondary/30 p-4 shadow-inner my-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
              {viewClauseContent}
            </pre>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsViewModalOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Edit Clause Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center"><Edit2 className="mr-2 h-6 w-6 text-primary"/> Edit Clause</DialogTitle>
              <DialogDescription>
                Update the details of your custom clause.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateClause} className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-clause-title" className="text-left">Title</Label>
                <Input 
                  id="edit-clause-title" 
                  value={editClauseTitle}
                  onChange={(e) => setEditClauseTitle(e.target.value)}
                  required 
                  className="bg-background border-input focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-clause-content" className="text-left">Content</Label>
                 <ScrollArea className="h-[30vh] w-full rounded-md border border-input shadow-inner">
                    <Textarea 
                    id="edit-clause-content" 
                    value={editClauseContent}
                    onChange={(e) => setEditClauseContent(e.target.value)}
                    required 
                    className="min-h-[30vh] bg-background border-0 focus:border-primary resize-none font-sans"
                    />
                </ScrollArea>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-clause-category" className="text-left">Category (Optional)</Label>
                <Input 
                  id="edit-clause-category" 
                  value={editClauseCategory}
                  onChange={(e) => setEditClauseCategory(e.target.value)}
                  placeholder="e.g., Contract, Litigation"
                  className="bg-background border-input focus:border-primary"
                />
              </div>
              <DialogFooter className="pt-6 border-t mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => {setIsEditDialogOpen(false); setEditingClause(null)}}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdatingClause || !editClauseTitle.trim() || !editClauseContent.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isUpdatingClause ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
      </Dialog>


      <Card className="bg-accent/10 border-accent/30 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center gap-3">
          <Wrench className="h-8 w-8 text-accent" />
          <div>
            <CardTitle className="text-accent text-xl">Future Enhancements</CardTitle>
            <CardDescription className="text-accent/80">We&apos;re planning more features for the Clause Bank.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Soon, you&apos;ll be able to easily search and insert these clauses directly into your documents. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
