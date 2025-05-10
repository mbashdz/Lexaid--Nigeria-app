// src/ai/flows/suggest-relevant-citations.ts
'use server';

/**
 * @fileOverview Suggests relevant legal citations based on the drafted content.
 *
 * - suggestRelevantCitations - A function that suggests relevant legal citations.
 * - SuggestRelevantCitationsInput - The input type for the suggestRelevantCitations function.
 * - SuggestRelevantCitationsOutput - The return type for the suggestRelevantCitations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantCitationsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the legal document being drafted.'),
});
export type SuggestRelevantCitationsInput = z.infer<
  typeof SuggestRelevantCitationsInputSchema
>;

const SuggestRelevantCitationsOutputSchema = z.object({
  citations: z
    .array(z.string())
    .describe('A list of relevant legal citations.'),
});
export type SuggestRelevantCitationsOutput = z.infer<
  typeof SuggestRelevantCitationsOutputSchema
>;

export async function suggestRelevantCitations(
  input: SuggestRelevantCitationsInput
): Promise<SuggestRelevantCitationsOutput> {
  return suggestRelevantCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantCitationsPrompt',
  input: {schema: SuggestRelevantCitationsInputSchema},
  output: {schema: SuggestRelevantCitationsOutputSchema},
  prompt: `You are a Nigerian legal expert. Given the following legal document content, suggest relevant legal citations from Nigerian law that could support the arguments or statements made. Provide the citations in a list format.\n\nDocument Content: {{{documentContent}}}`,
});

const suggestRelevantCitationsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantCitationsFlow',
    inputSchema: SuggestRelevantCitationsInputSchema,
    outputSchema: SuggestRelevantCitationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
