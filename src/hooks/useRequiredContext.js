export function useRequiredContext(context, name) {
  if (!context) {
    throw new Error(`${name} must be used inside its provider`);
  }
  return context;
}
