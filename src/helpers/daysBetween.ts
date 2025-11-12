export default function daysBetweenTimestamps(timestamp1: number, timestamp2?: number) {
  const secondTimestamp = timestamp2 || Date.now();
  const difference_In_Days = Math.round((secondTimestamp - timestamp1) / (1000 * 3600 * 24));
  return difference_In_Days;
}
