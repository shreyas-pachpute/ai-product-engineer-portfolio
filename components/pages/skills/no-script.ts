/**
 * The order board without JavaScript: the radio buttons alone choose which
 * lines are live and which panel shows, read with :has(). Rendered inside
 * <noscript>, so these rules only exist when no script runs; with one, the
 * page uses data-order instead (see the note at the top of
 * app/skills/skills.css for why).
 */
export const NO_SCRIPT = `.page--skills:has(#sp-o-0:checked) [data-o~="0"],
.page--skills:has(#sp-o-1:checked) [data-o~="1"],
.page--skills:has(#sp-o-2:checked) [data-o~="2"],
.page--skills:has(#sp-o-3:checked) [data-o~="3"],
.page--skills:has(#sp-o-4:checked) [data-o~="4"],
.page--skills:has(#sp-o-5:checked) [data-o~="5"],
.page--skills:has(#sp-o-6:checked) [data-o~="6"],
.page--skills:has(#sp-o-7:checked) [data-o~="7"],
.page--skills:has(#sp-o-all:checked) [data-o]:not([data-o=""]) { --live: 1; }
.page--skills:has(#sp-o-0:checked) [data-for="0"],
.page--skills:has(#sp-o-1:checked) [data-for="1"],
.page--skills:has(#sp-o-2:checked) [data-for="2"],
.page--skills:has(#sp-o-3:checked) [data-for="3"],
.page--skills:has(#sp-o-4:checked) [data-for="4"],
.page--skills:has(#sp-o-5:checked) [data-for="5"],
.page--skills:has(#sp-o-6:checked) [data-for="6"],
.page--skills:has(#sp-o-7:checked) [data-for="7"],
.page--skills:has(#sp-o-all:checked) [data-for="all"] { display: var(--show, block); }`;
