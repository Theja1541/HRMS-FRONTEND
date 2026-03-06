export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return "-";

  const number = Number(amount);

  if (isNaN(number)) return "-";

  return "₹ " + number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};