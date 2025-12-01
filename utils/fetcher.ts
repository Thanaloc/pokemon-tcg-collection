export async function fetchJson<T = any>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    } catch (err) {
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        throw err;
      }
      
      // Backoff exponentiel : 1s, 2s, 3s...
      const delay = 1000 * (attempt + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retry ${attempt + 1}/${retries} for ${url}...`);
    }
  }
  
  throw new Error('Should never reach here');
}