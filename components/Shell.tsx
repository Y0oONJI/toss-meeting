export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-start justify-center bg-[#F0F2F5] py-0 sm:py-8">
      <div className="w-full max-w-[430px] min-h-dvh sm:min-h-0 sm:rounded-3xl overflow-hidden bg-white shadow-xl flex flex-col sm:min-h-[700px]">
        {children}
      </div>
    </div>
  );
}
