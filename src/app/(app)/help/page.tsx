'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I start drafting a new document?",
      answer: "Navigate to the Dashboard using the sidebar. From there, you can see a list of available document types. Click on the document you wish to draft, and you'll be taken to the drafting page where you can input the necessary details."
    },
    {
      question: "Can I save my drafts and continue later?",
      answer: "Yes, the 'Saved Drafts' feature (coming soon) will allow you to save your progress and return to your documents at any time. Your drafts will be accessible from the 'Saved Drafts' section in the sidebar."
    },
    {
      question: "How does the AI document generation work?",
      answer: "Our AI uses the information you provide in the dynamic form (facts of the case, parties involved, etc.) to generate a legally relevant and structured document. The more specific your input, the more tailored the output will be."
    },
    {
      question: "Is my data secure?",
      answer: "We take data security very seriously. All data is encrypted in transit and at rest. We are committed to ensuring the confidentiality and integrity of your information. For more details, please refer to our Privacy Policy (link to be added)."
    },
    {
      question: "What if I need a document type not listed?",
      answer: "You can use the 'Other Legal Document' option on the dashboard. Provide as much detail as possible about the document you need, and the AI will assist in drafting it. We are also continuously expanding our list of supported document types based on user feedback."
    }
  ];

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Help & FAQs</h1>
        <p className="text-lg text-muted-foreground mt-1">Find answers to your questions and learn more about LexAid Nigeria.</p>
      </header>

      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <LifeBuoy className="mr-3 h-7 w-7" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about using LexAid Nigeria.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-base font-semibold hover:text-primary text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">No FAQs available at the moment. Content coming soon.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Mail className="mr-3 h-7 w-7" />
            Contact Support
          </CardTitle>
          <CardDescription>Need further assistance? Reach out to our support team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you can&apos;t find the answer to your question in the FAQs, please don&apos;t hesitate to contact us. 
            Our support team is ready to help you with any issues or inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled>
              <MessageSquare className="mr-2 h-5 w-5" /> Live Chat (Coming Soon)
            </Button>
            <Button variant="outline" size="lg" className="py-3 text-base border-primary text-primary hover:bg-primary/10" disabled>
              <Mail className="mr-2 h-5 w-5" /> Email Support (support@lexaid.ng)
            </Button>
          </div>
           <p className="text-sm text-muted-foreground pt-2">Support channels are currently under development and will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
