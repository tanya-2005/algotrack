const DEMO_MODE_KEY = "dsa-demo-mode";

export function enableDemoMode() {
  sessionStorage.setItem(DEMO_MODE_KEY, "true");
}

export function disableDemoMode() {
  sessionStorage.removeItem(DEMO_MODE_KEY);
}

export function isDemoMode() {
  return sessionStorage.getItem(DEMO_MODE_KEY) === "true";
}
