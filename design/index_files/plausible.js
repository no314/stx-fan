var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

!function(){"use strict";var t,a=window.location,o=window.document,r=o.currentScript,s=r.getAttribute("data-api")||new URL(r.src).origin+"/api/event",l=window.localStorage.plausible_ignore;function w(t){console.warn("Ignoring Event: "+t)}function e(t,e){if(/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(a.hostname)||"file:"===a.protocol)return w("localhost");if(!(window.phantom||window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)){if("true"==l)return w("localStorage flag");var i={};i.n=t,i.u=a.href,i.d=r.getAttribute("data-domain"),i.r=o.referrer||null,i.w=window.innerWidth,e&&e.meta&&(i.m=JSON.stringify(e.meta)),e&&e.props&&(i.p=JSON.stringify(e.props));var n=new XMLHttpRequest;n.open("POST",s,!0),n.setRequestHeader("Content-Type","text/plain"),n.send(JSON.stringify(i)),n.onreadystatechange=function(){4==n.readyState&&e&&e.callback&&e.callback()}}}function i(){t!==a.pathname&&(t=a.pathname,e("pageview"))}var n,p=window.history;p.pushState&&(n=p.pushState,p.pushState=function(){n.apply(this,arguments),i()},window.addEventListener("popstate",i));var d=window.plausible&&window.plausible.q||[];window.plausible=e;for(var u=0;u<d.length;u++)e.apply(this,d[u]);"prerender"===o.visibilityState?o.addEventListener("visibilitychange",function(){t||"visible"!==o.visibilityState||i()}):i()}();

}
/*
     FILE ARCHIVED ON 11:08:22 Jun 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:17:16 Jun 24, 2022.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 1055.912
  exclusion.robots: 0.103
  exclusion.robots.policy: 0.095
  RedisCDXSource: 0.784
  esindex: 0.009
  LoadShardBlock: 172.234 (3)
  PetaboxLoader3.datanode: 144.357 (4)
  CDXLines.iter: 80.453 (3)
  load_resource: 148.407
  PetaboxLoader3.resolve: 38.795
*/