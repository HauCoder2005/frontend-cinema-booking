export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#121212] flex justify-center px-4 py-6 text-slate-100">
      <div className="w-full max-w-7xl flex flex-col gap-6 md:flex-row">
        {children}
      </div>
    </main>
  );
}
