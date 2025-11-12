export default function formatTimeAgo(timestamp: number): string {
  try {
    if (typeof timestamp !== 'number' || isNaN(timestamp) || timestamp < 0) {
      return '';
    }

    const now = Date.now();
    const diffInMs = now - timestamp;

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    const remainingMinutes = diffInMinutes % 60;
    const remainingSeconds = diffInSeconds % 60;

    if (diffInHours > 0) {
      return `${diffInHours}h ${remainingMinutes}m ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m ago`;
    } else if (diffInSeconds >= 10) {
      return `${remainingSeconds}s ago`;
    } else {
      return 'Just now';
    }
  } catch (e) {
    console.log(e);
    return '';
  }
}

export function getLastFullHour() {
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0
  return currentHour.getTime();
}

export function getLastFullHourUTC(): string {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0); // round down to last full hour

  const day = String(now.getUTCDate()).padStart(2, '0');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[now.getUTCMonth()];
  const year = now.getUTCFullYear();

  let hours = now.getUTCHours();
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM'; // ✅ uppercase
  hours = hours % 12 || 12;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm} UTC`;
}
