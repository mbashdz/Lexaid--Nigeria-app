'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DOCUMENT_TYPES, ALL_DOCUMENT_FIELDS_CONFIG } from '@/config/documents';
import { DraftingForm, type FormData } from '@/components/draft/DraftingForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { draftLegalDocument, type DraftLegalDocumentInput } from '@/ai/flows/draft-legal-document';
import { suggestRelevantCitations, type SuggestRelevantCitationsInput, type SuggestRelevantCitationsOutput } from '@/ai/flows/suggest-relevant-citations';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles, BookOpen, Loader2, Download, Edit3, FileText as FileIcon, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function DraftPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const documentSlug = params.documentSlug as string;

  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [suggestedCitations, setSuggestedCitations] = useState<string[] | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSuggestingCitations, setIsSuggestingCitations] = useState(false);
  const [documentTypeConfig, setDocumentTypeConfig] = useState(DOCUMENT_TYPES.find(doc => doc.id === documentSlug));

  useEffect(() => {
    if (!documentTypeConfig && documentSlug) {
       const config = DOCUMENT_TYPES.find(doc => doc.id === documentSlug);
       if(config) {
         setDocumentTypeConfig(config);
       } else {
        // Handle case where config is not found after initial client render
        toast({
            title: "Error",
            description: "Document type configuration not found.",
            variant: "destructive",
        });
        router.push('/dashboard'); // Redirect if config not found
       }
    }
  }, [documentSlug, documentTypeConfig, router, toast]);


  if (!documentTypeConfig) {
    // This will show a loading/skeleton state or a brief "not found" before useEffect kicks in or if slug is truly invalid.
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">Loading document type...</p>
        </div>
    );
  }

  const handleFormSubmit = async (formData: FormData) => {
    setIsDrafting(true);
    setGeneratedDocument(null);
    setSuggestedCitations(null);

    const aiInput: DraftLegalDocumentInput = {
      documentType: documentTypeConfig.aiDocumentType, // Use aiDocumentType from config
      facts: formData.facts || '',
      courtTypeAndLocation: formData.courtTypeAndLocation || '',
      partiesInvolved: formData.partiesInvolved || '',
      matterCategory: formData.matterCategory || '',
      stageOfProceedings: formData.stageOfProceedings || '',
    };

    try {
      const result = await draftLegalDocument(aiInput);
      setGeneratedDocument(result.draftDocument);
      toast({
        title: "Document Drafted!",
        description: "Your legal document has been generated successfully.",
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error drafting document:", error);
      toast({
        title: "Drafting Failed",
        description: (error as Error).message || "Could not generate the document. Please check your input and try again.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSuggestCitations = async () => {
    if (!generatedDocument) {
      toast({
        title: "No Document Content",
        description: "Please draft a document first to suggest citations.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggestingCitations(true);
    setSuggestedCitations(null);
    try {
      const citationInput: SuggestRelevantCitationsInput = { documentContent: generatedDocument };
      const result: SuggestRelevantCitationsOutput = await suggestRelevantCitations(citationInput);
      setSuggestedCitations(result.citations);
      toast({
        title: "Citations Suggested!",
        description: "Relevant citations have been generated.",
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error suggesting citations:", error);
      toast({
        title: "Citation Suggestion Failed",
        description: (error as Error).message || "Could not generate citations. Please try again.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsSuggestingCitations(false);
    }
  };
  
  const IconComponent = documentTypeConfig.icon;

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-2 text-sm hover:bg-primary/5 hover:text-primary border-border shadow-sm">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <header className="pb-4 border-b border-border">
        <div className="flex items-center gap-4 mb-1">
          <div className="p-3 bg-primary/10 rounded-lg inline-block">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{documentTypeConfig.name}</h1>
        </div>
        <p className="text-lg text-muted-foreground ml-[calc(2rem+1.75rem)]"> {/* Align with title text */}
          Fill in the details below to generate your <span className="font-semibold text-primary">{documentTypeConfig.name}</span> with AI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <Card className="lg:col-span-2 shadow-lg rounded-xl border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Case Details</CardTitle>
            <CardDescription>Provide specific information for accurate document generation.</CardDescription>
          </CardHeader>
          <CardContent>
            <DraftingForm
              documentTypeConfig={documentTypeConfig}
              allDocumentFieldsConfig={ALL_DOCUMENT_FIELDS_CONFIG}
              onSubmit={handleFormSubmit}
              isLoading={isDrafting}
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {isDrafting && (
             <Card className="shadow-xl rounded-xl flex flex-col items-center justify-center p-10 min-h-[400px] bg-card border-border">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                <p className="text-2xl font-semibold text-primary">Drafting your document...</p>
                <p className="text-base text-muted-foreground mt-2">AI is meticulously crafting your legal text. Please wait.</p>
             </Card>
           )}

          {!isDrafting && generatedDocument && (
            <Card className="shadow-xl rounded-xl border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-primary"/>
                    <CardTitle className="text-2xl">Generated Document</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="shadow-sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Button variant="outline" size="sm" disabled className="shadow-sm"><Edit3 className="mr-2 h-4 w-4" /> Edit</Button>
                  </div>
                </div>
                <CardDescription>Review the AI-generated document. You can suggest citations or refine further.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px] w-full rounded-md border border-input bg-secondary/30 p-4 shadow-inner">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">{generatedDocument}</pre>
                </ScrollArea>
                <Button 
                  onClick={handleSuggestCitations} 
                  disabled={isSuggestingCitations || !generatedDocument} 
                  className="w-full mt-6 py-3 text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                >
                  {isSuggestingCitations ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-5 w-5" />
                  )}
                  Suggest Relevant Citations
                </Button>
              </CardContent>
            </Card>
          )}

          {!isDrafting && !generatedDocument && (
             <Card className="shadow-xl rounded-xl flex flex-col items-center justify-center p-10 min-h-[400px] bg-card border-border">
                <Sparkles className="h-16 w-16 text-primary/70 mb-6" />
                <p className="text-2xl font-semibold text-foreground">Ready to Draft</p>
                <p className="text-base text-muted-foreground mt-2 text-center">Fill out the case details and click "Generate Document" <br/> to let our AI assistant help you.</p>
             </Card>
          )}
          
          {isSuggestingCitations && (
             <Card className="shadow-xl rounded-xl flex flex-col items-center justify-center p-10 min-h-[200px] bg-card border-border">
                <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
                <p className="text-xl font-semibold text-accent">Finding Citations...</p>
                <p className="text-sm text-muted-foreground mt-1">AI is searching for relevant legal precedents.</p>
             </Card>
          )}

          {!isSuggestingCitations && suggestedCitations && (
            <Card className="shadow-xl rounded-xl border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-accent"/>
                  <CardTitle className="text-2xl">Suggested Citations</CardTitle>
                </div>
                <CardDescription>Relevant legal citations based on the drafted document.</CardDescription>
              </CardHeader>
              <CardContent>
                {suggestedCitations.length > 0 ? (
                  <ScrollArea className="h-[250px] w-full rounded-md border border-input bg-secondary/30 p-4 shadow-inner">
                    <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
                      {suggestedCitations.map((citation, index) => (
                        <li key={index} className="font-mono">{citation}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <Alert variant="default" className="bg-secondary/30 border-accent/50 text-accent-foreground">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <AlertTitle className="text-accent">No Citations Found</AlertTitle>
                    <AlertDescription>
                      The AI could not find specific citations for this document at the moment. You can try again or manually add them.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
