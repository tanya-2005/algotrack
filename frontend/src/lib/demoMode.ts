const DEMO_MODE_KEY = "dsa-demo-mode";

// Demo Mode's local question/pattern/activity state (see MemoryContext.tsx).
export const DEMO_STORAGE_KEY = "dsa-memory-data:demo";

export function enableDemoMode() {
  sessionStorage.setItem(DEMO_MODE_KEY, "true");
  // Every fresh "Explore Demo" click starts from the same canonical seed
  // dataset, not whatever was left over from a previous demo session in
  // this browser.
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

export function disableDemoMode() {
  sessionStorage.removeItem(DEMO_MODE_KEY);
}

export function isDemoMode() {
  return sessionStorage.getItem(DEMO_MODE_KEY) === "true";
}
