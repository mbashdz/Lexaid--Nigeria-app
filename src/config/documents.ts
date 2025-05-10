import type { LucideIcon } from 'lucide-react';
import { FileText, Gavel, BookOpen, Scale, Shield, FileSignature, PencilLine, FolderArchive, Handshake, Mail, BookMarked } from 'lucide-react';

export type DocumentField = 'facts' | 'courtTypeAndLocation' | 'partiesInvolved' | 'matterCategory' | 'stageOfProceedings';

export interface DocumentTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  fields: DocumentField[];
  aiDocumentType: string; // The exact string to pass to the AI model for "documentType"
}

export const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  { id: 'statement-of-claim', name: 'Statement of Claim', description: 'Initiate a civil suit by outlining the plaintiff\'s case.', icon: FileText, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory'], aiDocumentType: 'Statement of Claim' },
  { id: 'statement-of-defence', name: 'Statement of Defence', description: 'Respond to a statement of claim, outlining the defendant\'s case.', icon: Shield, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory'], aiDocumentType: 'Statement of Defence' },
  { id: 'brief-of-argument', name: 'Brief of Argument', description: 'Submit written arguments for appellate courts (Court of Appeal & Supreme Court).', icon: BookOpen, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory', 'stageOfProceedings'], aiDocumentType: 'Brief of Argument' },
  { id: 'final-written-address', name: 'Final Written Address', description: 'Summarize arguments and evidence at the conclusion of a trial.', icon: FileText, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory', 'stageOfProceedings'], aiDocumentType: 'Final Written Address'},
  { id: 'bail-application', name: 'Bail Application', description: 'Request pre-trial release for an accused person (Magistrate/High Court).', icon: Gavel, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory', 'stageOfProceedings'], aiDocumentType: 'Bail Application' },
  { id: 'fundamental-rights', name: 'Enforcement of Fundamental Rights', description: 'Apply to the court for the protection of fundamental human rights.', icon: Scale, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory'], aiDocumentType: 'Application for Enforcement of Fundamental Rights' },
  { id: 'motion-on-notice', name: 'Motion on Notice', description: 'Make a formal application or request to the court during proceedings.', icon: FileSignature, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory', 'stageOfProceedings'], aiDocumentType: 'Motion on Notice' },
  { id: 'affidavit', name: 'Affidavit', description: 'Provide a written, sworn statement of facts for court use.', icon: PencilLine, fields: ['facts', 'partiesInvolved', 'matterCategory', 'courtTypeAndLocation', 'stageOfProceedings'], aiDocumentType: 'Affidavit' },
  { id: 'counter-affidavit', name: 'Counter-Affidavit', description: 'Respond to an affidavit, challenging its factual assertions.', icon: PencilLine, fields: ['facts', 'partiesInvolved', 'matterCategory', 'courtTypeAndLocation', 'stageOfProceedings'], aiDocumentType: 'Counter-Affidavit' },
  { id: 'legal-opinion', name: 'Legal Opinion', description: 'Offer professional advice on a specific legal matter or question.', icon: BookMarked, fields: ['facts', 'matterCategory'], aiDocumentType: 'Legal Opinion' },
  { id: 'letter-of-demand', name: 'Letter of Demand', description: 'Formally request payment or action from another party before litigation.', icon: Mail, fields: ['facts', 'partiesInvolved'], aiDocumentType: 'Letter of Demand' },
  { id: 'deed-contract', name: 'Deed / Contract', description: 'Draft various binding legal agreements and formal documents.', icon: Handshake, fields: ['facts', 'partiesInvolved', 'matterCategory'], aiDocumentType: 'Deed or Contract' },
  { id: 'other-document', name: 'Other Legal Document', description: 'For various other legal documents used in Nigerian legal practice.', icon: FolderArchive, fields: ['facts', 'courtTypeAndLocation', 'partiesInvolved', 'matterCategory', 'stageOfProceedings'], aiDocumentType: 'General Legal Document' },
];

export const ALL_DOCUMENT_FIELDS_CONFIG: Record<DocumentField, { label: string; placeholder: string, component?: 'textarea' | 'input' }> = {
  facts: { label: 'Facts of the Case', placeholder: 'Enter the detailed facts, background, and relevant events...', component: 'textarea' },
  courtTypeAndLocation: { label: 'Court Type and Location', placeholder: 'e.g., High Court of Lagos State, Ikeja Judicial Division' },
  partiesInvolved: { label: 'Parties Involved', placeholder: 'e.g., Plaintiff: Chief Adekunle Bello, Defendant: XYZ Limited' },
  matterCategory: { label: 'Category/Type of Matter', placeholder: 'e.g., Breach of Contract, Land Dispute, Matrimonial Causes' },
  stageOfProceedings: { label: 'Stage of Proceedings', placeholder: 'e.g., Pre-action, Statement of Claim, Motion for Interlocutory Injunction' },
};
