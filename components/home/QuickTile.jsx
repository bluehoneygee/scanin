import Image from "next/image";
import Link from "next/link";

export default function QuickTile({ title, badge, iconPath, href }) {
  return (
    <Link
      href={href}
      className="relative flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#9334eb]/10 text-[#9334eb] ring-1 ring-[#9334eb]/20 dark:text-[#9334eb]">
          <Image src={iconPath} alt={title} width={24} height={24} />
        </div>
        <p className="font-poppins text-sm font-medium">{title}</p>
      </div>
      {badge && (
        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-600 ring-1 ring-rose-500/30 dark:text-rose-400">
          {badge}
        </span>
      )}
    </Link>
  );
}
