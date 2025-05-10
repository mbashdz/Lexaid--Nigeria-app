import type { DocumentTypeConfig } from '@/config/documents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DocumentSelectorCardProps {
  docType: DocumentTypeConfig;
}

export function DocumentSelectorCard({ docType }: DocumentSelectorCardProps) {
  const IconComponent = docType.icon;
  return (
    <Link href={`/draft/${docType.id}`} passHref legacyBehavior>
      <a className="block h-full group">
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer bg-card border-border hover:border-primary rounded-lg overflow-hidden transform hover:-translate-y-1">
          <CardHeader className="p-5 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <IconComponent className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {docType.name}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex-grow">
            <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {docType.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="p-5 border-t border-border bg-card">
            <Button variant="link" className="w-full justify-start text-primary p-0 h-auto hover:no-underline group-hover:text-accent transition-colors">
              Start Drafting <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
