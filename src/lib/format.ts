export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatHours(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export function formatStudents(count: number) {
  if (count >= 1000) {
    const thousands = count / 1000;
    return `${thousands.toFixed(thousands >= 10 ? 0 : 1)}k`;
  }
  return count.toLocaleString("en-BD");
}
