export function confirmNavigation(isDirty) {
  if (!isDirty) return true;
  return window.confirm(
    "You have unsaved changes. Are you sure you want to leave this page?"
  );
}
