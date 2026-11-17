function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("İstek iptal edildi.", "AbortError"));
    };
    if (signal?.aborted)
      return reject(new DOMException("İstek iptal edildi.", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export async function requestWithRetry(
  url,
  options = {},
  { fetcher = fetch, sleep = pause } = {},
) {
  const readOnly = (options.method || "GET").toUpperCase() === "GET";
  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await fetcher(url, options);
    } catch (error) {
      if (
        !readOnly ||
        attempt ||
        options.signal?.aborted ||
        error.name === "AbortError"
      )
        throw error;
      await sleep(600, options.signal);
      continue;
    }
    if (readOnly && !attempt && [502, 503, 504].includes(response.status)) {
      await response.body?.cancel();
      await sleep(600, options.signal);
      continue;
    }
    return response;
  }
}
