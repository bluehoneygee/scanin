import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="min-w-full px-4 py-10 sm:min-w-[520px] sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="mx-auto max-w-xl space-y-2.5 text-center">
            <span className=" block bg-gradient-to-r from-[#9334eb] to-[#6b21a8] bg-clip-text text-[36px] sm:text-[50px] font-extrabold leading-none text-transparent">
              Scanin
            </span>
            <p className="text-neutral-600 ">
              Scan produk, atur jemputan bank sampah, dan kumpulkan poin
            </p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
};

export default AuthLayout;
