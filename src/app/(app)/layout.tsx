import type { ReactNode } from 'react';
import AppLayoutComponent from '@/components/layout/AppLayout';

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutComponent>{children}</AppLayoutComponent>;
}
