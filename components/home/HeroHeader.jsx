import Image from "next/image";

export default function HeroHeader({ name, points }) {
  return (
    <div className="px-4">
      <p className="font-poppins text-4xl font-semibold">Halo, {name}</p>
      <div className="mt-16 flex items-center justify-between">
        <div>
          <p className="font-grotesk text-[18px] opacity-80">Points</p>
          <div className="flex items-end gap-1">
            <span className="font-poppins text-3xl font-bold leading-none tracking-tight">
              {points}
            </span>
            <span className="mb-[2px] font-poppins text-xs font-semibold opacity-90">
              PTS
            </span>
          </div>
        </div>
        <div className="relative h-32 w-24">
          <Image
            src="/icons/logo2.png"
            alt="logo"
            width={100}
            height={100}
            className="h-full object-contain"
            priority
          />
          <div className="pointer-events-none absolute -bottom-2 left-2 h-16 w-16 animate-ping rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
