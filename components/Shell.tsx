export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-2xl mx-auto flex flex-col min-h-dvh">
        {children}
      </div>
    </div>
  );
}
