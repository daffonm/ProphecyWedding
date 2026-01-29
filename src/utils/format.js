export function formatRupiah(value) {
  if (value === null || value === undefined || value === "") return "Rp 0";

  const number = Number(value);
  if (Number.isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}
