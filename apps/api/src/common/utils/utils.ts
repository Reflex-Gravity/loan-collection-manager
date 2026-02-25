export function differenceInDays(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((from.getTime() - to.getTime()) / msPerDay);
}
