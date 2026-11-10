import { useSyncExternalStore } from "react";

/**
 * Whether the quiz moves to the next question on its own once an answer is
 * revealed. On by default; a reader can turn it off for good (WCAG 2.2.1: a
 * time limit the reader can switch off), and the choice is remembered on this
 * device. Same external-store shape as `motion-prefs.ts`.
 */
const KEY = "metri.quiz.autoAdvance";
const EVENT = "metri:quiz-auto-advance";

export const readQuizAutoAdvance = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
};

export const setQuizAutoAdvance = (on: boolean): void => {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* storage refused: the event still applies it to this page */
  }
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** The reader's choice; on, on the server and the first paint. */
export const useQuizAutoAdvance = (): boolean =>
  useSyncExternalStore(subscribe, readQuizAutoAdvance, () => true);
