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
  facts: z.string().describe('The facts of the case or matter.'),
  courtTypeAndLocation: z.string().describe('The type and location of the court (e.g., High Court of Bauchi State).').optional(),
  partiesInvolved: z.string().describe('The parties involved in the case (e.g., names of plaintiff and defendant, or parties to an agreement).'),
  matterCategory: z.string().describe('The category or type of matter (e.g., criminal, civil, land, contract).').optional(),
  stageOfProceedings: z.string().describe('The stage of the proceedings (e.g., statement of claim, defense, judgement).').optional(),
  documentType: z.string().describe('The type of legal document to draft (e.g., Statement of Claim, Bail Application, Judgement, Legal Opinion, Contract).'),
  // Fields specific to Judgement drafting
  issuesForDetermination: z.string().describe('For judgements, the key legal questions the court needs to decide.').optional(),
  summaryOfArgumentsPlaintiff: z.string().describe('For judgements, a brief summary of the main arguments of the claimant or applicant.').optional(),
  summaryOfArgumentsDefendant: z.string().describe('For judgements, a brief summary of the main arguments of the defendant or respondent.').optional(),
  analysisAndDecision: z.string().describe('For judgements, instructions on the court\'s reasoning, application of law to facts, and final orders/decision to be detailed.').optional(),
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
  prompt: `You are an expert Nigerian legal practitioner. Based on the information provided, draft a complete legal document, properly formatted, using correct legal language and structure relevant to Nigerian courts or legal practice.

Document Type: {{{documentType}}}
Facts of the case/matter: {{{facts}}}
{{#if courtTypeAndLocation}}Court type and location: {{{courtTypeAndLocation}}}{{/if}}
Parties involved: {{{partiesInvolved}}}
{{#if matterCategory}}Category/type of matter: {{{matterCategory}}}{{/if}}
{{#if stageOfProceedings}}Stage of the proceedings: {{{stageOfProceedings}}}{{/if}}

{{#if issuesForDetermination}}Issues for Determination (for Judgement): {{{issuesForDetermination}}}{{/if}}
{{#if summaryOfArgumentsPlaintiff}}Summary of Claimant/Applicant's Arguments (for Judgement): {{{summaryOfArgumentsPlaintiff}}}{{/if}}
{{#if summaryOfArgumentsDefendant}}Summary of Defendant/Respondent's Arguments (for Judgement): {{{summaryOfArgumentsDefendant}}}{{/if}}
{{#if analysisAndDecision}}Analysis and Decision to be Detailed (for Judgement): {{{analysisAndDecision}}}{{/if}}

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
