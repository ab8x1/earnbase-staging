export default function fetchWithTimeout(uri: RequestInfo | URL, options = {}, time: number) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timed out.'));
    }, time);
    fetch(uri, options).then(
      response => {
        clearTimeout(timer);
        resolve(response);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
