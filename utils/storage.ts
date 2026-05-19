const SALT = "v2_ragecube_secure_salt_7319!";

function getSecureHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36); // base36 for shorter string
}

export function signData(data: any): { data: any, hash: string } {
  const jsonString = JSON.stringify(data);
  const hash = getSecureHash(jsonString + SALT);
  return { data, hash };
}

export function verifyData(payload: any): any {
  if (payload && payload.data && payload.hash) {
    const expectedHash = getSecureHash(JSON.stringify(payload.data) + SALT);
    if (expectedHash === payload.hash) {
      return payload.data;
    } else {
      console.warn(`Tampering detected in payload!`);
      return null;
    }
  }
  return null;
}

export function secureSave(key: string, data: any) {
  try {
    const payload = signData(data);
    localStorage.setItem(key + "_secured", JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to secure save", e);
  }
}

export function secureLoad(key: string, fallback: any = null): any {
  try {
    const securedData = localStorage.getItem(key + "_secured");
    if (securedData) {
      const parsed = JSON.parse(securedData);
      const verified = verifyData(parsed);
      if (verified !== null) {
        return verified;
      } else {
        console.warn(`Tampering detected for ${key}! Returning fallback.`);
        return fallback;
      }
    }
    
    // Migration: Attempt to load un-secured data and save it securely
    const legacyData = localStorage.getItem(key);
    if (legacyData) {
      const parsedLegacy = JSON.parse(legacyData);
      secureSave(key, parsedLegacy); // Upgrade it
      localStorage.removeItem(key); // Remove legacy
      return parsedLegacy;
    }
  } catch (e) {
    console.error("Failed to secure load", e);
  }
  return fallback;
}
