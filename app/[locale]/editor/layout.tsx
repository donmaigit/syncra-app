export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {children}
    </div>
  );
}