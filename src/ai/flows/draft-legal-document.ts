// src/ai/flows/draft-legal-document.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for drafting legal documents specific to Nigerian legal practice.
 *
 * - draftLegalDocument - A function that takes case details and generates a draft legal document.
 * - DraftLegalDocumentInput - The input type for the draftLegalDocument function.
 * - DraftLegalDocumentOutput - The return type for the draftLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftLegalDocumentInputSchema = z.object({
  facts: z.string().describe('The facts of the case.'),
  courtTypeAndLocation: z.string().describe('The type and location of the court (e.g., High Court of Bauchi State).'),
  partiesInvolved: z.string().describe('The parties involved in the case (e.g., names of plaintiff and defendant).'),
  matterCategory: z.string().describe('The category or type of matter (e.g., criminal, civil, land).'),
  stageOfProceedings: z.string().describe('The stage of the proceedings (e.g., statement of claim, defense).'),
  documentType: z.string().describe('The type of legal document to draft (e.g., Statement of Claim, Bail Application).'),
});

export type DraftLegalDocumentInput = z.infer<typeof DraftLegalDocumentInputSchema>;

const DraftLegalDocumentOutputSchema = z.object({
  draftDocument: z.string().describe('The drafted legal document.'),
});

export type DraftLegalDocumentOutput = z.infer<typeof DraftLegalDocumentOutputSchema>;

export async function draftLegalDocument(input: DraftLegalDocumentInput): Promise<DraftLegalDocumentOutput> {
  return draftLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftLegalDocumentPrompt',
  input: {schema: DraftLegalDocumentInputSchema},
  output: {schema: DraftLegalDocumentOutputSchema},
  prompt: `You are an expert Nigerian legal practitioner. Based on the information provided, draft a complete legal document, properly formatted, using correct legal language and structure relevant to Nigerian courts.

Facts of the case: {{{facts}}}
Court type and location: {{{courtTypeAndLocation}}}
Parties involved: {{{partiesInvolved}}}
Category/type of matter: {{{matterCategory}}}
Stage of the proceedings: {{{stageOfProceedings}}}
Document type: {{{documentType}}}

Draft the legal document:
`,
});

const draftLegalDocumentFlow = ai.defineFlow(
  {
    name: 'draftLegalDocumentFlow',
    inputSchema: DraftLegalDocumentInputSchema,
    outputSchema: DraftLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
