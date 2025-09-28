"use client";

export default function HeroHeader({
  name = "User",
  points = 77.25,
  cardNumber = "7677 5588 4490",
  mascot = "🐾",
}) {
  return (
    <div className="px-4">
      <p className="text-base font-semibold">Halo, {name} </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[12px] opacity-80">Points</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold leading-none tracking-tight">
              {points}
            </span>
            <span className="mb-[2px] text-xs font-semibold opacity-90">
              PTS
            </span>
          </div>
          <p className="mt-2 text-[12px] opacity-80">{cardNumber}</p>
        </div>
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-white/20" />
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            {mascot}
          </div>
          <div className="pointer-events-none absolute -bottom-2 left-2 h-16 w-16 animate-ping rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
