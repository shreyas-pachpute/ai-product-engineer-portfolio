/**
 * The opening's on/off switch.
 *
 * `data-intro` on <html> is "play" while the mark is drawing, "lift" while
 * the page opens, and "done" afterwards. This file holds the one piece
 * that has to run before React does: a blocking script in <head> that
 * decides, before first paint, whether this page load gets the opening.
 *
 *   - once per browser session — it is an introduction, and being
 *     introduced again on every visit would be a toll booth;
 *   - never under `prefers-reduced-motion`.
 *
 * It has to be inline and blocking rather than an effect: by the time
 * React hydrates the browser has already painted, and a returning visitor
 * would see the overlay flash before it was removed.
 *
 * Any failure (storage blocked, old browser) falls through to "done", so
 * the worst case is no opening — never a stuck one. And with JavaScript
 * off the attribute is never set, which the CSS treats as "done".
 */

export const INTRO_STORAGE_KEY = "sp-intro";

export const INTRO_HEAD_SCRIPT = `(function(){var d=document.documentElement;try{var seen=sessionStorage.getItem("${INTRO_STORAGE_KEY}")==="1";var still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;d.setAttribute("data-intro",seen||still?"done":"play")}catch(e){d.setAttribute("data-intro","done")}})();`;
