export default function LicensePlate({
  plate,
  className = "",
}: {
  plate?: string | null;
  className?: string;
}) {
  if (!plate || !plate.trim()) return null;

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-md border border-neutral-300/80 bg-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.5)] ring-1 ring-white/10 ${className}`}
      title={`Registration: ${plate}`}
    >
      {/* Blue IND section */}
      <div className="flex h-full flex-col items-center justify-center bg-[#003893] px-1.5 py-1 text-[8px] font-bold leading-none text-white select-none">
        <span className="text-[7px] opacity-80">●</span>
        <span className="tracking-tighter">IND</span>
      </div>

      {/* Plate characters */}
      <div className="px-2.5 py-1 font-mono text-xs sm:text-sm font-extrabold uppercase tracking-widest text-neutral-900 select-all">
        {plate}
      </div>
    </div>
  );
}


