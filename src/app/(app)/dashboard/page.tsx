'use client';
import { useState } from 'react';
import { DocumentSelectorCard } from '@/components/dashboard/DocumentSelectorCard';
import { DOCUMENT_TYPES } from '@/config/documents';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Basic filtering example - can be expanded
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allCategories = Array.from(new Set(DOCUMENT_TYPES.map(doc => doc.fields.includes('matterCategory') ? 'Has Category Field' : 'No Category Field'))); // Example filter

  const filteredDocumentTypes = DOCUMENT_TYPES.filter(docType => {
    const matchesSearch = docType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          docType.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Add category filter logic if needed
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome, Barrister!</h1>
        <p className="text-lg text-muted-foreground mt-1">Select a legal document to begin drafting with AI precision.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search document types (e.g., Affidavit, Motion...)"
            className="w-full pl-12 pr-4 py-3 text-base bg-card border-border focus:border-primary rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Placeholder for future filter button 
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="py-3 text-base shadow-sm rounded-lg border-border bg-card">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allCategories.map(category => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  setSelectedCategories(prev => 
                    checked ? [...prev, category] : prev.filter(c => c !== category)
                  );
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        */}
      </div>
      
      {filteredDocumentTypes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocumentTypes.map((docType) => (
            <DocumentSelectorCard key={docType.id} docType={docType} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">No Documents Found</h3>
          <p className="text-muted-foreground">Try adjusting your search term or filters.</p>
        </div>
      )}
    </div>
  );
}
