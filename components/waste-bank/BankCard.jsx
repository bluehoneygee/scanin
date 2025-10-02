"use client";

export default function BankCard({ bank }) {
  if (!bank) return null;
  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-semibold font-poppins">{bank.nama}</p>
      <p className="mt-0.5 text-[12px] text-neutral-500 font-grotesk">
        {bank.wilayah} • {bank.kecamatan} • {bank.kelurahan}
      </p>
      {bank.alamat ? (
        <p className="mt-1 text-[12px] text-neutral-500">{bank.alamat}</p>
      ) : null}
    </div>
  );
}
