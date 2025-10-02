"use client";

import Image from "next/image";

export function OnboardingView({
  SLIDES,
  BRAND,
  slide,
  i,
  isLast,
  setI,
  next,
  finish,
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <main className="min-h-dvh bg-neutral-100 text-neutral-900">
      <div
        className="mx-auto grid min-h-dvh w-full max-w-[520px] grid-rows-[auto_1fr]
                   sm:max-w-[640px] md:max-w-none
                   lg:grid-rows-1 lg:grid-cols-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full overflow-hidden lg:min-h-dvh">
          <div className="relative h-[clamp(260px,40vh,420px)] md:h-[clamp(320px,42vh,520px)] lg:h-full">
            <img
              key={slide?.key}
              src={slide?.src}
              alt={slide?.title || "Onboarding"}
              className="absolute inset-0 h-full w-full select-none object-cover"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.05)_50%,rgba(255,255,255,0)_100%)] lg:bg-transparent" />
          </div>
        </div>
        <div className="min-h-0 bg-white lg:bg-white lg:mx-0 flex">
          <section
            className="relative -mt-6 flex min-h-0 flex-1 flex-col justify-between
                       rounded-t-3xl bg-white px-6 pt-6 shadow-sm ring-1 ring-black/5
                       sm:px-8 sm:pt-8 sm:pb-10
                       pb-[calc(env(safe-area-inset-bottom)+16px)]
                       lg:mt-0 lg:rounded-none lg:ring-0 lg:shadow-none lg:px-10 lg:py-12 lg:min-h-dvh"
          >
            <div className="font-poppins">
              <div className="mb-18 mt-6 flex items-center gap-2 sm:mb-24">
                <span className="bg-gradient-to-r from-[#9334eb] to-[#6b21a8] bg-clip-text text-[36px] sm:text-[68px] font-extrabold leading-none text-transparent">
                  {BRAND}
                </span>
              </div>

              <h1 className="whitespace-pre-line text-center font-extrabold leading-snug text-[28px] md:text-[40px] lg:text-[40px]">
                {slide?.title}
              </h1>
              <p className="font-grotesk mt-4 text-center leading-relaxed text-neutral-600 text-[16px] sm:text-[20px] md:text-[26px]">
                {slide?.desc}
              </p>
            </div>

            <div className="relative mt-10 h-[68px] sm:h-[72px]">
              <div className="absolute left-0 bottom-0 flex items-center gap-2 sm:gap-2.5">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.key}
                    onClick={() => setI(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`rounded-full transition-all ${
                      idx === i
                        ? "h-2 w-6 sm:h-2.5 sm:w-7 bg-gradient-to-r from-[#9334eb] to-[#6b21a8]"
                        : "h-2 w-2 sm:h-2.5 sm:w-2.5 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={finish}
                className="font-grotesk absolute right-[88px] sm:right-[98px] bottom-1.5 text-[13px] sm:text-[14px] font-medium text-neutral-700 hover:text-neutral-900"
              >
                Lewati
              </button>
              <button
                onClick={next}
                aria-label={isLast ? "Selesai" : "Lanjut"}
                className="absolute right-0 bottom-0 grid h-[54px] w-[54px] sm:h-[56px] sm:w-[56px] place-items-center
                           rounded-2xl bg-gradient-to-r from-[#9334eb] to-[#6b21a8]
                           text-white shadow-lg active:scale-[0.98] transition-transform"
              >
                <Image
                  width={20}
                  height={20}
                  src="/icons/arrow-right.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5 sm:h-[22px] sm:w-[22px] pointer-events-none select-none"
                  draggable={false}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
