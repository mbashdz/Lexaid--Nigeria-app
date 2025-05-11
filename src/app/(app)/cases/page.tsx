
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Briefcase, PlusCircle, Loader2, Trash2, Edit2, Eye, CalendarIcon, Search, Filter, PackageOpen } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { addCase, getUserCases, deleteCase, updateCase, type Case } from '@/services/firestoreService';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
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
import { cn } from '@/lib/utils';


type CaseFormData = Omit<Case, 'id' | 'userId' | 'createdAt' | 'lastModified' | 'relatedDocumentIds' | 'nextAdjournmentDate'> & {
  nextAdjournmentDate?: Date | null;
};

const initialCaseFormData: CaseFormData = {
  title: '',
  caseNumber: '',
  court: '',
  clientName: '',
  opponentName: '',
  parties: '',
  status: 'Open',
  priority: 'Medium',
  nextAdjournmentDate: null,
  caseNotes: '',
};


export default function CaseManagementPage() {
  const { user, isFirebaseConfigured: firebaseReady } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<Case | null>(null); // For editing
  const [formData, setFormData] = useState<CaseFormData>(initialCaseFormData);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Case['status'] | 'all'>('all');


  useEffect(() => {
    if (user && firebaseReady) {
      fetchCases();
    } else if (!firebaseReady && !user) {
        setIsLoading(false);
    }
  }, [user, firebaseReady]);

  const fetchCases = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userCases = await getUserCases(user.uid);
      setCases(userCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast({ title: "Error", description: "Could not fetch cases.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof CaseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as Case['status'] | Case['priority'] }));
  };
  
  const handleDateChange = (date?: Date) => {
    setFormData(prev => ({...prev, nextAdjournmentDate: date || null}));
  };

  const openAddDialog = () => {
    setCurrentCase(null);
    setFormData(initialCaseFormData);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (caseItem: Case) => {
    setCurrentCase(caseItem);
    setFormData({
      ...caseItem,
      nextAdjournmentDate: caseItem.nextAdjournmentDate ? caseItem.nextAdjournmentDate.toDate() : null,
    });
    setIsFormDialogOpen(true);
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) {
      toast({ title: "Validation Error", description: "Case title is required.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);

    const casePayload: Omit<Case, 'id' | 'userId' | 'createdAt' | 'lastModified' | 'relatedDocumentIds'> = {
      ...formData,
      nextAdjournmentDate: formData.nextAdjournmentDate ? Timestamp.fromDate(formData.nextAdjournmentDate) : null,
    };
    
    try {
      if (currentCase && currentCase.id) {
        await updateCase(currentCase.id, casePayload);
        toast({ title: "Case Updated", description: "Case details saved successfully.", variant: "default" });
      } else {
        await addCase(user.uid, casePayload);
        toast({ title: "Case Added", description: "New case created successfully.", variant: "default" });
      }
      setIsFormDialogOpen(false);
      fetchCases(); 
    } catch (error) {
      console.error("Error submitting case:", error);
      toast({ title: "Error", description: "Could not save the case.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!user) return;
    try {
      await deleteCase(caseId);
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
      toast({ title: "Case Deleted", description: "The case has been successfully deleted.", variant: "default" });
    } catch (error) {
      console.error("Error deleting case:", error);
      toast({ title: "Error", description: "Could not delete the case.", variant: "destructive" });
    }
  };
  
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.caseNumber && c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.clientName && c.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your cases...</p>
      </div>
    );
  }
  
   if (!firebaseReady) {
     return (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Briefcase className="h-20 w-20 text-destructive mb-6" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Service Unavailable</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Case management is currently unavailable due to a configuration issue. Please contact support.
            </p>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Case Management</h1>
          <p className="text-lg text-muted-foreground mt-1">Organize, track, and manage your legal cases.</p>
        </div>
        <Button size="lg" onClick={openAddDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base mt-4 sm:mt-0" disabled={!firebaseReady}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Case
        </Button>
      </header>

      {/* Filters and Search */}
      <Card className="p-4 sm:p-6 shadow-sm rounded-xl border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases (title, number, client...)"
              className="w-full pl-12 pr-4 py-3 text-base bg-background border-input focus:border-primary rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Case['status'] | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px] py-3 text-base bg-background border-input focus:border-primary rounded-lg">
              <Filter className="mr-2 h-4 w-4 inline-block" /> 
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Adjourned">Adjourned</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>


      {filteredCases.length === 0 ? (
        <Card className="shadow-lg rounded-xl border-border">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <PackageOpen className="h-20 w-20 text-primary/60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {cases.length === 0 ? 'No Cases Yet' : 'No Cases Match Your Filters'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {cases.length === 0 
                ? 'Start by adding your first case to manage it here.'
                : 'Try adjusting your search term or status filter.'
              }
            </p>
             {cases.length === 0 && (
                <Button size="lg" onClick={openAddDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={!firebaseReady}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Case
                </Button>
             )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="shadow-md rounded-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-primary line-clamp-2">{caseItem.title}</CardTitle>
                <CardDescription>
                  Case No: {caseItem.caseNumber || 'N/A'} <br />
                  Client: {caseItem.clientName || 'N/A'} <br/>
                  Status: <span className={cn(
                    "font-semibold",
                    caseItem.status === "Open" && "text-green-600",
                    caseItem.status === "Closed" && "text-red-600",
                    caseItem.status === "Adjourned" && "text-yellow-600",
                    caseItem.status === "Pending" && "text-blue-600",
                  )}>{caseItem.status}</span>
                  {caseItem.priority && (
                    <> | Priority: <span className={cn(
                        "font-semibold",
                        caseItem.priority === "High" && "text-red-500",
                        caseItem.priority === "Medium" && "text-yellow-500",
                        caseItem.priority === "Low" && "text-green-500",
                    )}>{caseItem.priority}</span></>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {caseItem.nextAdjournmentDate && (
                  <p className="text-sm text-muted-foreground">
                    Next Adjournment: {format(caseItem.nextAdjournmentDate.toDate(), 'PPP')}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {caseItem.lastModified ? formatDistanceToNow(caseItem.lastModified.toDate(), { addSuffix: true }) : 'N/A'}
                </p>
                 {/* Placeholder for quick view of notes or related docs */}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                 <Button variant="outline" size="sm" onClick={() => openEditDialog(caseItem)} className="text-primary border-primary hover:bg-primary/10">
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
                        This action cannot be undone. This will permanently delete the case
                        titled &quot;{caseItem.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCase(caseItem.id!)} className="bg-destructive hover:bg-destructive/90">
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

      {/* Add/Edit Case Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{currentCase ? 'Edit Case' : 'Add New Case'}</DialogTitle>
              <DialogDescription>
                {currentCase ? 'Update the details of this case.' : 'Fill in the information for the new case.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <ScrollArea className="max-h-[70vh] p-1 pr-6">
              <div className="grid gap-6 py-4 pr-1">
                <div className="grid gap-2">
                  <Label htmlFor="title">Case Title / Name *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleFormChange} placeholder="e.g., Bello vs. XYZ Corp - Land Dispute" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="caseNumber">Case Number</Label>
                        <Input id="caseNumber" name="caseNumber" value={formData.caseNumber} onChange={handleFormChange} placeholder="e.g., SUIT/001/2024" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court">Court</Label>
                        <Input id="court" name="court" value={formData.court} onChange={handleFormChange} placeholder="e.g., High Court of Lagos State" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input id="clientName" name="clientName" value={formData.clientName} onChange={handleFormChange} placeholder="Your client's name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="opponentName">Opponent Name / Other Side</Label>
                        <Input id="opponentName" name="opponentName" value={formData.opponentName} onChange={handleFormChange} placeholder="Opposing party's name" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="parties">Parties Involved (Detailed)</Label>
                    <Textarea id="parties" name="parties" value={formData.parties} onChange={handleFormChange} placeholder="Full list of plaintiffs, defendants, applicants, respondents etc." className="min-h-[80px]"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Adjourned">Adjourned</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                         <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="nextAdjournmentDate">Next Adjournment Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.nextAdjournmentDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.nextAdjournmentDate ? format(formData.nextAdjournmentDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.nextAdjournmentDate || undefined}
                                onSelect={handleDateChange}
                                initialFocus
                              />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="caseNotes">Case Notes</Label>
                  <Textarea id="caseNotes" name="caseNotes" value={formData.caseNotes} onChange={handleFormChange} placeholder="Add any relevant notes, observations, or to-do items for this case..." className="min-h-[120px]"/>
                </div>
              </div>
              </ScrollArea>
              <DialogFooter className="pt-6 border-t mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || !formData.title.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentCase ? 'Save Changes' : 'Create Case'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
