export function TopBar() {
  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">menu</span>
          </button>
          <h1 className="font-headline font-extrabold tracking-tight text-xl text-slate-900">
            Precision Editorial
          </h1>
        </div>
        {/* User Profile Avatar Placeholder */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            U
          </div>
        </div>
      </div>
    </header>
  );
}