export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Keen</h1>
          <p className="mt-2 text-sm text-muted-foreground">Master vocabulary through engaging word games</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
