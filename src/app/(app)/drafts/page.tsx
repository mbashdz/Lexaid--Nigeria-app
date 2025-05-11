
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, PlusCircle, Loader2, Trash2, Eye, FileText as FileIcon, Edit2, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { getUserDrafts, deleteDraft, updateDraft, type Draft } from '@/services/firestoreService';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export default function SavedDraftsPage() {
  const { user, isFirebaseConfigured: firebaseReady } = useAuth();
  const { toast } = useToast();
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDraftContent, setSelectedDraftContent] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editDraftTitle, setEditDraftTitle] = useState('');
  const [editDraftContent, setEditDraftContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);


  useEffect(() => {
    if (user && firebaseReady) {
      fetchDrafts();
    } else if (!firebaseReady && !user) {
      setIsLoading(false); 
    }
  }, [user, firebaseReady]);

  const fetchDrafts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const drafts = await getUserDrafts(user.uid);
      setSavedDrafts(drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      toast({ title: "Error", description: "Could not fetch saved drafts.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!user) return;
    try {
      await deleteDraft(draftId);
      setSavedDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
      toast({ title: "Draft Deleted", description: "The draft has been successfully deleted.", variant: "default" });
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({ title: "Error", description: "Could not delete the draft.", variant: "destructive" });
    }
  };
  
  const handleViewDraft = (content: string) => {
    setSelectedDraftContent(content);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (draft: Draft) => {
    setEditingDraft(draft);
    setEditDraftTitle(draft.title);
    setEditDraftContent(draft.content);
    setIsEditModalOpen(true);
  };

  const handleSaveDraftChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft || !editingDraft.id || !editDraftTitle.trim() || !editDraftContent.trim()) {
      toast({ title: "Validation Error", description: "Title and content cannot be empty.", variant: "destructive"});
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await updateDraft(editingDraft.id, { title: editDraftTitle, content: editDraftContent });
      toast({ title: "Draft Updated", description: "Changes saved successfully.", variant: "default" });
      setIsEditModalOpen(false);
      setEditingDraft(null);
      fetchDrafts(); // Refresh list
    } catch (error) {
      console.error("Error updating draft:", error);
      toast({ title: "Error", description: "Could not update the draft.", variant: "destructive" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your drafts...</p>
      </div>
    );
  }
  
  if (!firebaseReady) {
     return (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <FolderOpen className="h-20 w-20 text-destructive mb-6" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Service Unavailable</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              The drafts service is currently unavailable due to a configuration issue. Please contact support.
            </p>
          </CardContent>
        </Card>
      );
  }


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
          {savedDrafts.map((draft) => (
            <Card key={draft.id} className="shadow-md rounded-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-primary line-clamp-2">{draft.title || draft.documentType}</CardTitle>
                <CardDescription>
                  Type: {draft.documentType} <br/>
                  Last saved: {draft.lastModified ? formatDistanceToNow(draft.lastModified.toDate(), { addSuffix: true }) : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {draft.content.substring(0, 150)}{draft.content.length > 150 ? '...' : ''}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => handleViewDraft(draft.content)} className="text-primary border-primary hover:bg-primary/10">
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                 <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(draft)} className="text-primary border-primary hover:bg-primary/10">
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
                        This action cannot be undone. This will permanently delete the draft
                        titled &quot;{draft.title || draft.documentType}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteDraft(draft.id!)} className="bg-destructive hover:bg-destructive/90">
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

      {/* View Draft Modal */}
       <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <AlertDialogContent className="max-w-3xl w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><FileIcon className="mr-2 h-5 w-5 text-primary"/> Draft Content</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border border-input bg-secondary/30 p-4 shadow-inner my-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
              {selectedDraftContent}
            </pre>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsViewModalOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Draft Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center"><Edit2 className="mr-2 h-6 w-6 text-primary"/> Edit Draft</DialogTitle>
              <DialogDescription>
                Modify the title and content of your saved draft.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveDraftChanges} className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-draft-title" className="text-left">Title</Label>
                <Input 
                  id="edit-draft-title" 
                  value={editDraftTitle}
                  onChange={(e) => setEditDraftTitle(e.target.value)}
                  placeholder="Enter draft title" 
                  required 
                  className="bg-background border-input focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-draft-content" className="text-left">Content</Label>
                 <ScrollArea className="h-[45vh] w-full rounded-md border border-input shadow-inner">
                    <Textarea 
                    id="edit-draft-content" 
                    value={editDraftContent}
                    onChange={(e) => setEditDraftContent(e.target.value)}
                    placeholder="Edit the draft content..." 
                    required 
                    className="min-h-[45vh] bg-background border-0 focus:border-primary resize-none"
                    />
                </ScrollArea>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => setEditingDraft(null)}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingEdit || !editDraftTitle.trim() || !editDraftContent.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isSubmittingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
