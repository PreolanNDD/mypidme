import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <PageErrorBoundary>
        <AppShell>
          {children}
        </AppShell>
      </PageErrorBoundary>
    </ProtectedRoute>
  );
}