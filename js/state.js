// Live ESM binding — importers always see the current value when they read
// `activeSection`, no getter wrapper needed.
export let activeSection = null;

export function setActiveSection(section) {
  activeSection = section;
}
