import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollTo; stub it so component scroll resets stay quiet in CI.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
