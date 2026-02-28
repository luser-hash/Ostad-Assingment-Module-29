export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(8,145,178,0.18),transparent_36%),radial-gradient(circle_at_80%_8%,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.08),transparent_45%)]" />
      <div className="relative mx-auto w-full max-w-7xl">
        {children}
      </div>
    </div>
  );
}
