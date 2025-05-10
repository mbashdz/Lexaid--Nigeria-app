'use client';

import type { DocumentTypeConfig, DocumentField, ALL_DOCUMENT_FIELDS_CONFIG as AllFieldsConfigType } from '@/config/documents';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sparkles, Loader2 } from 'lucide-react';

export type FormData = Partial<Record<DocumentField, string>>;

interface DraftingFormProps {
  documentTypeConfig: DocumentTypeConfig;
  allDocumentFieldsConfig: typeof AllFieldsConfigType; // Renamed to avoid conflict with variable
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export function DraftingForm({ documentTypeConfig, allDocumentFieldsConfig, onSubmit, isLoading }: DraftingFormProps) {
  
  const schemaObject = documentTypeConfig.fields.reduce((acc, fieldKey) => {
    // All fields are optional strings. AI can handle missing fields.
    // Add .min(1) for required fields if needed, but for AI flexibility, optional is better.
    acc[fieldKey] = z.string().optional();
    return acc;
  }, {} as Record<DocumentField, z.ZodString | z.ZodOptional<z.ZodString>>);
  
  const formSchema = z.object(schemaObject);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: documentTypeConfig.fields.reduce((acc, fieldKey) => {
      acc[fieldKey] = '';
      return acc;
    }, {} as FormValues),
  });

  // Reset form when documentTypeConfig changes (e.g., navigating between draft pages for different types)
  // This is not strictly needed with current setup as page re-mounts, but good practice if component was reused differently.
  // useEffect(() => {
  //   form.reset(documentTypeConfig.fields.reduce((acc, fieldKey) => {
  //     acc[fieldKey] = '';
  //     return acc;
  //   }, {} as FormValues));
  // }, [documentTypeConfig, form]);


  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    await onSubmit(data as FormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {documentTypeConfig.fields.map((fieldKey) => {
          const fieldConfig = allDocumentFieldsConfig[fieldKey];
          if (!fieldConfig) return null;

          return (
            <FormField
              key={fieldKey}
              control={form.control}
              name={fieldKey}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-foreground">{fieldConfig.label}</FormLabel>
                  <FormControl>
                    {fieldConfig.component === 'textarea' ? (
                      <Textarea
                        placeholder={fieldConfig.placeholder}
                        className="min-h-[120px] bg-background border-border focus:border-primary shadow-sm text-base"
                        {...field}
                      />
                    ) : (
                      <Input
                        type="text"
                        placeholder={fieldConfig.placeholder}
                        className="bg-background border-border focus:border-primary shadow-sm text-base py-3"
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-md shadow-md"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Generate Document
        </Button>
      </form>
    </Form>
  );
}
