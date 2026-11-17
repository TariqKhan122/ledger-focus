const CURRENCY = "USD"; // change to your currency code, e.g. "PKR"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY });
export const formatCurrency = (n: number): string => money.format(n);

// "sv-SE" formats as YYYY-MM-DD in the user's LOCAL time zone (toISOString would use UTC).
export const todayISO = (): string => new Date().toLocaleDateString("sv-SE");
export const currentMonthKey = (): string => todayISO().slice(0, 7);

export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const formatClock = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
