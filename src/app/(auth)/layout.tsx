export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-background">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
