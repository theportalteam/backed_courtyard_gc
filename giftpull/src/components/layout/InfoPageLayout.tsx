interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function InfoPageLayout({ title, subtitle, lastUpdated, children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tighter italic text-text-primary mb-3">{title}</h1>
          {subtitle && (
            <p className="text-lg text-text-secondary">{subtitle}</p>
          )}
          {lastUpdated && (
            <p className="text-sm text-text-tertiary mt-2">Last updated: {lastUpdated}</p>
          )}
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary [&_h2]:text-xl [&_h2]:font-headline [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-headline [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:text-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}
