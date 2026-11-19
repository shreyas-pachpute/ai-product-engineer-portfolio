/**
 * The opening, as one small script.
 *
 * `data-intro` on <html> is "play" while the sheet is written on and its
 * top half folds back, "lift" while the rest folds into a boat and goes to
 * the water, and "done" afterwards. The play is CSS keyed to that
 * attribute (section 9 of app/globals.css). This script is the only logic:
 * it decides whether the opening plays, keeps time, listens for a skip,
 * draws the folding diagram to fit the screen, and runs the lift.
 *
 * WHY IT IS INLINE, IN <head>, AND NOT A REACT COMPONENT
 *
 *   - It has to run before first paint. By the time React hydrates the
 *     browser has already painted, and a returning visitor would see the
 *     sheet flash before it was removed.
 *   - It must not depend on the app's JavaScript arriving. If the opening
 *     were driven by a component, a slow connection would hold the sheet
 *     until the bundle loaded, and a failed one would hold it for ever.
 *     Inline, it finishes on its own clock and can be skipped from the
 *     first millisecond, whatever else is still loading.
 *
 * THE HAND-OFF
 * The boat the sheet folds into sails down to where the paper boat in the
 * 3D world is. The world publishes that while the opening runs, as
 * `data-boat` on <html> ("tipX,tipY,halfLength" in CSS pixels; see
 * components/world/stage.tsx), read at the moment the boat sets off. If
 * the world is not up yet, the boat goes to where the world will put it:
 * measured, the sail's tip sits 57.7% of the way down the screen, 60%
 * across on a wide screen and centred on a tall one. Either way it fades
 * as it lands.
 *
 * RULES
 *   - once per browser session (sessionStorage); it is an introduction,
 *     not a toll booth;
 *   - never under `prefers-reduced-motion`;
 *   - any input skips it: wheel, touch, key, pointer, or a plain click
 *     (which is what assistive technology sends);
 *   - a tab opened in the background waits, paused, until it is looked at;
 *   - on a page with no sheet (the 404) it does nothing and is not
 *     "used up";
 *   - any failure (storage blocked, old browser) lands on "done". The
 *     worst case is no opening, never a stuck one. With JavaScript off
 *     the attribute is never set, which the CSS also treats as "done".
 *
 * It is written as a plain string of old-fashioned JavaScript on purpose:
 * nothing here passes through the bundler, so nothing can be rewritten
 * into something that needs a helper that is not on the page yet.
 */

export const INTRO_STORAGE_KEY = "sp-intro";

/** How long the sheet plays (written on, fold 1) before it folds on its own. */
const PLAY_MS = 1900;
/** How long the folding and the hand-off take, normally and when skipped. */
const LIFT_MS = 1300;
const LIFT_FAST_MS = 560;

/*
 * The boat's proportions, as fractions of its length; the same numbers as
 * the CSS custom properties in section 9 of app/globals.css.
 */
const SAIL_HALF = 0.139;
const RIM_HALF = 0.5;
const KEEL_HALF = 0.306;
const SAIL = 0.256;
const HULL = 0.2;

/*
 * Each piece that folds away: its crease (a unit vector along it, in
 * screen axes with y down) and which way round is "back", away from the
 * viewer. The foot folds about the keel line.
 */
const FOLDS = `[["tl",-0.477,0.879,-1,0],["tr",0.477,0.879,1,0],["bl",0.696,0.718,-1,0.08],["br",-0.696,0.718,1,0.08],["foot",1,0,-1,0.04]]`;

export const INTRO_HEAD_SCRIPT = `(function(){
var d=document.documentElement,KEY="${INTRO_STORAGE_KEY}",play=false;
function set(v){d.setAttribute("data-intro",v)}
try{play=sessionStorage.getItem(KEY)!=="1"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(!play){set("done");return}
set("play");
var lifted=false,timer=0,events=["wheel","touchmove","keydown","pointerdown","click"];
function geo(o){var f=o&&o.querySelector(".intro__leaf");if(!f||!f.offsetWidth)return null;var W=f.offsetWidth,H=f.offsetHeight*2,L=Math.min(.92*W,1.09*H);return{W:W,H:H,cx:W/2,T:H/2,L:L,s:L*${SAIL_HALF},R:L*${RIM_HALF},K:L*${KEEL_HALF},Yr:H/2+L*${SAIL},Yk:H/2+L*${SAIL + HULL}}}
function line(o,k,x1,y1,x2,y2){var l=o.querySelector('[data-crease="'+k+'"]');if(!l)return;l.setAttribute("x1",x1);l.setAttribute("y1",y1);l.setAttribute("x2",x2);l.setAttribute("y2",y2)}
function step(o,n,x,y){var g=o.querySelector('[data-step="'+n+'"]');if(g)g.setAttribute("transform","translate("+x+" "+y+")")}
function diagram(){try{var o=document.querySelector(".intro"),g=geo(o);if(!g)return;
line(o,"sl",g.cx,g.T,g.cx-g.s,g.Yr);line(o,"sr",g.cx,g.T,g.cx+g.s,g.Yr);
line(o,"hl",g.cx-g.R,g.Yr,g.cx-g.K,g.Yk);line(o,"hr",g.cx+g.R,g.Yr,g.cx+g.K,g.Yk);line(o,"keel",0,g.Yk,g.W,g.Yk);
step(o,2,g.cx-g.s*0.5-26,(g.T+g.Yr)/2);step(o,3,g.cx-(g.R+g.K)/2-26,(g.Yr+g.Yk)/2)}catch(e){}}
function finish(){set("done");d.removeAttribute("data-intro-skip");setTimeout(function(){d.removeAttribute("data-intro-played");d.removeAttribute("data-boat")},3000)}
function fly(o,from,to,ms,E){var x=o.querySelector(from),y=document.querySelector(to);if(!x||!y)return;
if(x.getAnimations){var A=x.getAnimations({subtree:true});for(var i=0;i<A.length;i++)A[i].finish()}
var a=x.getBoundingClientRect(),b=y.getBoundingClientRect();if(!a.height||!b.height)return;
x.style.transformOrigin="0 0";x.animate([{transform:"none",opacity:1},{opacity:1,offset:.78},{transform:"translate("+(b.left-a.left)+"px,"+(b.top-a.top)+"px) scale("+(b.height/a.height)+")",opacity:0}],{duration:ms*.8,easing:E,fill:"forwards"})}
function fold(o,fast,ms){
if(!o.animate)return;var g=geo(o);if(!g)return;var E="cubic-bezier(0.65,0,0.35,1)",IN="cubic-bezier(0.5,0,0.8,0.4)";
var leaf=o.querySelector(".intro__leaf");
if(leaf&&leaf.getAnimations){var A=leaf.getAnimations({subtree:true});for(var i=0;i<A.length;i++){var t=A[i].effect&&A[i].effect.getComputedTiming?A[i].effect.getComputedTiming():null;if(t&&t.endTime&&A[i].currentTime<t.endTime){A[i].playbackRate=Math.max(1,(t.endTime-A[i].currentTime)/(ms*.35))}}}
var F=${FOLDS},dur=fast?ms*.5:ms*.4;
for(var j=0;j<F.length;j++){var p=o.querySelector(".intro__piece--"+F[j][0]);if(!p)continue;
var turn=F[j][0]==="foot"?"rotateX("+(F[j][3]*168)+"deg)":"rotate3d("+F[j][1]+","+F[j][2]+",0,"+(F[j][3]*168)+"deg)";
var del=fast?0:F[j][4]*ms;
p.animate([{transform:"none",opacity:1},{opacity:1,offset:.55},{transform:turn,opacity:0}],{duration:dur,delay:del,easing:IN,fill:"forwards"});
var sh=p.querySelector(".intro__shade");if(sh)sh.animate([{opacity:0},{opacity:.22}],{duration:dur*.6,delay:del,easing:"ease-in",fill:"forwards"})}
var c=o.querySelector(".intro__creases");if(c)c.animate([{opacity:1},{opacity:0}],{duration:ms*.2,delay:fast?0:ms*.12,fill:"forwards"});
var boat=o.querySelector(".intro__boat");if(boat){var go=function(){
var b=(d.getAttribute("data-boat")||"").split(","),tx=+b[0],ty=+b[1],hl=+b[2];
if(!(hl>4&&tx>-g.W&&tx<2*g.W&&ty>-g.H&&ty<2*g.H)){var n=Math.min(1,Math.max(0,(1.2-g.W/g.H)/0.25));tx=g.W*(0.6-0.1*n);ty=g.H*0.577;hl=(1-n)*0.312*g.H+n*0.27*g.W}
var k=hl/g.R;boat.style.transformOrigin=g.cx+"px "+g.T+"px";
boat.animate([{transform:"none",opacity:1},{opacity:1,offset:.7},{transform:"translate("+(tx-g.cx)+"px,"+(ty-g.T)+"px) scale("+k+")",opacity:0}],{duration:fast?ms*.68:ms*.56,easing:E,fill:"forwards"})};
setTimeout(go,fast?ms*.3:ms*.44)}
fly(o,".intro__name",".identity__name",ms,E);fly(o,".intro__role",".identity__role",ms,E)}
function lift(fast){
if(lifted)return;lifted=true;clearTimeout(timer);
for(var i=0;i<events.length;i++)window.removeEventListener(events[i],skip);
d.removeAttribute("data-intro-wait");
var o=document.querySelector(".intro");
if(!o){set("done");return}
try{sessionStorage.setItem(KEY,"1")}catch(e){}
if(fast)d.setAttribute("data-intro-skip","");
var ms=fast?${LIFT_FAST_MS}:${LIFT_MS};
try{fold(o,fast,ms)}catch(e){}
d.setAttribute("data-intro-played","");
set("lift");
setTimeout(finish,ms)
}
function skip(){lift(true)}
function start(){d.removeAttribute("data-intro-wait");requestAnimationFrame(function(){if(!lifted)timer=setTimeout(function(){lift(false)},${PLAY_MS})})}
for(var i=0;i<events.length;i++)window.addEventListener(events[i],skip,{passive:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",diagram);else diagram();
window.addEventListener("resize",diagram);
if(document.hidden){
d.setAttribute("data-intro-wait","");
document.addEventListener("visibilitychange",function seen(){if(!document.hidden){document.removeEventListener("visibilitychange",seen);if(!lifted)start()}})
}else start();
window.addEventListener("pageshow",function(e){if(e.persisted&&d.getAttribute("data-intro")!=="done"){lifted=true;clearTimeout(timer);finish()}})
})();`;
