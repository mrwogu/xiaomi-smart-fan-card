/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$3=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$4 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$4("string"==typeof t?t:t+"",void 0,s$2),i$5=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$4(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$4,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$4,getPrototypeOf:n$3}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$4(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$3(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$4(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$3=t=>t,s$1=t$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$3=`lit$${Math.random().toFixed(9).slice(2)}$`,n$2="?"+o$3,r$2=`<${n$2}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$3+x):s+o$3+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$3),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$3)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$3),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$2)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$3,t+1));)d.push({type:7,index:l}),t+=o$3.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$3(t).nextSibling;i$3(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$2 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$2._$litElement$=true,i$2["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$2});const o$2=s.litElementPolyfillSupport;o$2?.({LitElement:i$2});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$1={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o$1,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n$1(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n$1({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1},e=t=>(...e)=>({_$litDirective$:t,values:e});let i$1 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n="important",i=" !"+n,o=e(class extends i$1{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"style"!==t$1.name||t$1.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(r)),this.render(r);for(const t of this.ft)null==r[t]&&(this.ft.delete(t),t.includes("-")?s.removeProperty(t):s[t]=null);for(const t in r){const e=r[t];if(null!=e){this.ft.add(t);const r="string"==typeof e&&e.endsWith(i);t.includes("-")||r?s.setProperty(t,r?e.slice(0,-11):e,r?n:""):s[t]=e;}}return E}});

function computeDomain(entityId) {
    return entityId.substr(0, entityId.indexOf("."));
}

var NumberFormat;
(function (NumberFormat) {
    NumberFormat["language"] = "language";
    NumberFormat["system"] = "system";
    NumberFormat["comma_decimal"] = "comma_decimal";
    NumberFormat["decimal_comma"] = "decimal_comma";
    NumberFormat["space_comma"] = "space_comma";
    NumberFormat["none"] = "none";
})(NumberFormat || (NumberFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["language"] = "language";
    TimeFormat["system"] = "system";
    TimeFormat["am_pm"] = "12";
    TimeFormat["twenty_four"] = "24";
})(TimeFormat || (TimeFormat = {}));
/** States that we consider "off". */
const STATES_OFF = ["closed", "locked", "off"];

// Polymer legacy event helpers used courtesy of the Polymer project.
//
// Copyright (c) 2017 The Polymer Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.
 * @param {{ bubbles: (boolean|undefined),
 *           cancelable: (boolean|undefined),
 *           composed: (boolean|undefined) }=}
 *  options Object specifying options.  These may include:
 *  `bubbles` (boolean, defaults to `true`),
 *  `cancelable` (boolean, defaults to false), and
 *  `node` on which to fire the event (HTMLElement, defaults to `this`).
 * @return {Event} The new event that was fired.
 */
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    // @ts-ignore
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

const forwardHaptic = (hapticType) => {
    fireEvent(window, "haptic", hapticType);
};

const navigate = (_node, path, replace = false) => {
    if (replace) {
        history.replaceState(null, "", path);
    }
    else {
        history.pushState(null, "", path);
    }
    fireEvent(window, "location-changed", {
        replace
    });
};

const turnOnOffEntity = (hass, entityId, turnOn = true) => {
    const stateDomain = computeDomain(entityId);
    const serviceDomain = stateDomain === "group" ? "homeassistant" : stateDomain;
    let service;
    switch (stateDomain) {
        case "lock":
            service = turnOn ? "unlock" : "lock";
            break;
        case "cover":
            service = turnOn ? "open_cover" : "close_cover";
            break;
        default:
            service = turnOn ? "turn_on" : "turn_off";
    }
    return hass.callService(serviceDomain, service, { entity_id: entityId });
};

const toggleEntity = (hass, entityId) => {
    const turnOn = STATES_OFF.includes(hass.states[entityId].state);
    return turnOnOffEntity(hass, entityId, turnOn);
};

const handleActionConfig = (node, hass, config, actionConfig) => {
    if (!actionConfig) {
        actionConfig = {
            action: "more-info",
        };
    }
    if (actionConfig.confirmation &&
        (!actionConfig.confirmation.exemptions ||
            !actionConfig.confirmation.exemptions.some((e) => e.user === hass.user.id))) {
        forwardHaptic("warning");
        if (!confirm(actionConfig.confirmation.text ||
            `Are you sure you want to ${actionConfig.action}?`)) {
            return;
        }
    }
    switch (actionConfig.action) {
        case "more-info":
            if (config.entity || config.camera_image) {
                fireEvent(node, "hass-more-info", {
                    entityId: config.entity ? config.entity : config.camera_image,
                });
            }
            break;
        case "navigate":
            if (actionConfig.navigation_path) {
                navigate(node, actionConfig.navigation_path);
            }
            break;
        case "url":
            if (actionConfig.url_path) {
                window.open(actionConfig.url_path);
            }
            break;
        case "toggle":
            if (config.entity) {
                toggleEntity(hass, config.entity);
                forwardHaptic("success");
            }
            break;
        case "call-service": {
            if (!actionConfig.service) {
                forwardHaptic("failure");
                return;
            }
            const [domain, service] = actionConfig.service.split(".", 2);
            hass.callService(domain, service, actionConfig.service_data, actionConfig.target);
            forwardHaptic("success");
            break;
        }
        case "fire-dom-event": {
            fireEvent(node, "ll-custom", actionConfig);
        }
    }
};
const handleAction = (node, hass, config, action) => {
    let actionConfig;
    if (config.tap_action) {
        actionConfig = config.tap_action;
    }
    handleActionConfig(node, hass, config, actionConfig);
};

// Check if config or Entity changed
function hasConfigOrEntityChanged(element, changedProps, forceUpdate) {
    if (changedProps.has('config') || forceUpdate) {
        return true;
    }
    if (element.config.entity) {
        const oldHass = changedProps.get('hass');
        if (oldHass) {
            return (oldHass.states[element.config.entity]
                !== element.hass.states[element.config.entity]);
        }
        return true;
    }
    else {
        return false;
    }
}

const commonAngles = [30, 60, 90, 120, 140];
const profiles = [
    {
        model: "zhimi.fan.v2",
        label: "Mi Smart Fan V2",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120, 140, 150],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
    {
        model: "zhimi.fan.v3",
        label: "Mi Smart Fan V3",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120, 140, 150],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
    ...["zhimi.fan.sa1", "zhimi.fan.za1", "zhimi.fan.za3", "zhimi.fan.za4"].map((model) => ({
        model,
        label: "Xiaomi Smart Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [...commonAngles],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    })),
    {
        model: "zhimi.fan.za5",
        label: "Smartmi Standing Fan 3",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: true,
    },
    ...["dmaker.fan.p5", "dmaker.fan.p9", "dmaker.fan.p10", "dmaker.fan.p11", "dmaker.fan.p15"].map((model) => ({
        model,
        label: "Xiaomi Smart Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [...commonAngles],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    })),
    {
        model: "dmaker.fan.p8",
        label: "Xiaomi Smart Fan 1C",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [...commonAngles],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
    {
        model: "dmaker.fan.1c",
        label: "Xiaomi Smart Fan 1C",
        known: true,
        isXiaomi: true,
        speedLevels: 3,
        horizontalAngles: [],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
    ...["dmaker.fan.p18", "dmaker.fan.p30", "dmaker.fan.p33", "dmaker.fan.p39"].map((model) => ({
        model,
        label: "Xiaomi Smart Standing Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [...commonAngles],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: model === "dmaker.fan.p33",
    })),
    {
        model: "xiaomi.fan.p45",
        label: "Xiaomi Smart Tower Fan 2",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120, 150],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: true,
    },
    {
        model: "xiaomi.fan.p76",
        label: "Xiaomi Smart Standing Air Circulation Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120],
        verticalAngles: [30, 60, 90, 100],
        supportsVerticalSwing: true,
        supportsNudge: true,
    },
    {
        model: "xiaomi.fan.p70",
        label: "Xiaomi Smart Desktop Air Circulation Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90, 120],
        verticalAngles: [30, 60, 90, 100],
        supportsVerticalSwing: true,
        supportsNudge: true,
    },
    ...["xiaomi.fan.p30", "xiaomi.fan.p85", "xiaomi.fan.p43"].map((model) => ({
        model,
        label: "Xiaomi Smart Standing Fan",
        known: true,
        isXiaomi: true,
        speedLevels: 4,
        horizontalAngles: [30, 60, 90],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: true,
    })),
    {
        model: "xiaomi.fan.2lite",
        label: "Mi Smart Standing Fan 2 Lite",
        known: true,
        isXiaomi: true,
        speedLevels: 3,
        horizontalAngles: [],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
    {
        model: "leshow.fan.ss4",
        label: "Leshow Fan",
        known: true,
        isXiaomi: false,
        speedLevels: 4,
        horizontalAngles: [],
        verticalAngles: [],
        supportsVerticalSwing: false,
        supportsNudge: false,
    },
];
const profileMap = new Map(profiles.flatMap((profile) => (profile.model ? [[profile.model, profile]] : [])));
const unknownProfile = (model) => ({
    model,
    label: model ? `Xiaomi Fan (${model})` : "Smart Fan",
    known: false,
    isXiaomi: model?.includes(".fan.") ?? false,
    speedLevels: 4,
    horizontalAngles: [],
    verticalAngles: [],
    supportsVerticalSwing: false,
    supportsNudge: false,
});
const getModelProfile = (model) => profileMap.get(model?.trim().toLowerCase() ?? "") ?? unknownProfile(model);
const isXiaomiFanModel = (model) => getModelProfile(model).isXiaomi || model?.trim().toLowerCase().startsWith("leshow.fan.") === true;
const resolveSpeedLevels = (attributes, profile = getModelProfile()) => {
    for (const key of ["speed_levels", "speed_count", "max_speed", "fan_speed_count"]) {
        const value = Number(attributes[key]);
        if (Number.isInteger(value) && value >= 1 && value <= 20) {
            return value;
        }
    }
    const modes = [attributes["preset_modes"], attributes["speed_list"], attributes["speed_modes"]].find((value) => Array.isArray(value) && value.length > 0) ?? [];
    if (Array.isArray(modes)) {
        const levels = modes
            .map(String)
            .map((mode) => mode.match(/(?:level|speed)\s*(\d+)/i)?.[1] ?? (mode.match(/^\d+$/) ?? [])[0])
            .map(Number)
            .filter((level) => Number.isInteger(level) && level > 0 && level <= 20);
        if (levels.length > 0) {
            return Math.max(...levels);
        }
    }
    return profile.speedLevels;
};

const FAN_FEATURE_OSCILLATE = 2;
const FAN_FEATURE_DIRECTION = 4;
const hasAttribute = (entity, keys) => entity !== undefined && keys.some((key) => Object.prototype.hasOwnProperty.call(entity.attributes, key));
const hasService = (services, name) => services.loaded && services.names.has(name);
const customService = (services, name) => hasService(services, `xiaomi_miio_fan.${name}`);
const hasFanFeature = (entity, bit) => {
    const supportedFeatures = Number(entity?.attributes["supported_features"]);
    return Number.isInteger(supportedFeatures) && (supportedFeatures & bit) !== 0;
};
const detectCapabilities = (entity, services = { loaded: false, names: new Set() }, related = {}) => {
    const model = typeof entity?.attributes["model"] === "string" ? entity.attributes["model"] : undefined;
    const profile = getModelProfile(model);
    const isXiaomi = profile.isXiaomi || isXiaomiFanModel(model);
    const hasHorizontalAngle = hasAttribute(entity, [
        "horizontal_swing_angle",
        "horizontal_angle",
        "swing_mode_angle",
        "angle",
    ]);
    const hasVerticalAngle = hasAttribute(entity, [
        "vertical_swing_angle",
        "vertical_oscillation_angle",
        "vertical_angle",
    ]);
    const hasSleepPreset = [
        entity?.attributes["preset_modes"],
        entity?.attributes["speed_list"],
        entity?.attributes["speed_modes"],
    ].some((value) => Array.isArray(value) && value.some((mode) => typeof mode === "string" && mode.toLowerCase().includes("sleep")));
    const hasNaturalPreset = [entity?.attributes["preset_modes"], entity?.attributes["speed_list"], entity?.attributes["speed_modes"]].some((value) => Array.isArray(value) &&
        value.some((mode) => typeof mode === "string" &&
            (mode.toLowerCase().includes("natural") || mode.toLowerCase().includes("nature")))) ||
        (typeof entity?.attributes["mode"] === "string" &&
            ["natural", "nature"].some((name) => entity.attributes["mode"].toLowerCase().includes(name)));
    return {
        isXiaomi,
        modelLabel: profile.label,
        speedLevels: resolveSpeedLevels(entity?.attributes ?? {}, profile),
        direction: hasAttribute(entity, ["direction", "current_direction"]) ||
            hasFanFeature(entity, FAN_FEATURE_DIRECTION) ||
            hasService(services, "fan.set_direction"),
        sleepMode: Boolean(related.sleepMode) || hasSleepPreset,
        favoriteLevel: Boolean(related.favoriteLevel),
        horizontalSwing: hasAttribute(entity, ["oscillating", "oscillate", "horizontal_swing", "swing_mode"]) ||
            hasFanFeature(entity, FAN_FEATURE_OSCILLATE) ||
            (profile.known && profile.isXiaomi && profile.model !== "xiaomi.fan.2lite"),
        horizontalAngle: Boolean(related.horizontalAngle) ||
            (hasHorizontalAngle && customService(services, "fan_set_oscillation_angle")) ||
            (profile.horizontalAngles.length > 0 && customService(services, "fan_set_oscillation_angle")),
        horizontalAngles: profile.horizontalAngles,
        verticalSwing: Boolean(related.verticalSwing) ||
            (hasAttribute(entity, ["vertical_swing", "vertical_oscillate", "vertical_oscillation"]) &&
                customService(services, "fan_set_vertical_oscillation_on") &&
                customService(services, "fan_set_vertical_oscillation_off")) ||
            (profile.supportsVerticalSwing &&
                customService(services, "fan_set_vertical_oscillation_on") &&
                customService(services, "fan_set_vertical_oscillation_off")),
        verticalAngle: Boolean(related.verticalAngle) ||
            (hasVerticalAngle && customService(services, "fan_set_vertical_oscillation_angle")) ||
            (profile.verticalAngles.length > 0 && customService(services, "fan_set_vertical_oscillation_angle")),
        verticalAngles: profile.verticalAngles,
        directionNudge: profile.supportsNudge && customService(services, "fan_turn"),
        naturalMode: hasNaturalPreset || (profile.known && profile.isXiaomi && !hasAttribute(entity, ["preset_modes", "speed_list"])),
        timer: Boolean(related.timer) ||
            (hasAttribute(entity, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]) &&
                customService(services, "fan_set_delay_off")) ||
            (isXiaomi && customService(services, "fan_set_delay_off")),
        childLock: Boolean(related.childLock) ||
            (hasAttribute(entity, ["child_lock"]) && customService(services, "fan_set_child_lock_on")) ||
            (isXiaomi && customService(services, "fan_set_child_lock_on")),
        led: Boolean(related.led) ||
            (hasAttribute(entity, ["led", "light", "led_brightness", "light_enum"]) &&
                customService(services, "fan_set_led_brightness")) ||
            (isXiaomi && customService(services, "fan_set_led_brightness")),
        buzzer: Boolean(related.buzzer) ||
            (hasAttribute(entity, ["buzzer", "notification_sound"]) &&
                customService(services, "fan_set_buzzer_on") &&
                customService(services, "fan_set_buzzer_off")) ||
            (isXiaomi && customService(services, "fan_set_buzzer_on") && customService(services, "fan_set_buzzer_off")),
        ionizer: Boolean(related.ionizer) ||
            (hasAttribute(entity, ["anion", "ionizer"]) &&
                customService(services, "fan_set_anion_on") &&
                customService(services, "fan_set_anion_off")) ||
            (isXiaomi && customService(services, "fan_set_anion_on") && customService(services, "fan_set_anion_off")),
    };
};

const parseTimerUnit = (value) => {
    if (typeof value === "string" && ["s", "sec", "second", "seconds"].includes(value.trim().toLowerCase())) {
        return "s";
    }
    return "min";
};
const timerValueToMinutes = (value, unit) => (unit === "s" ? value / 60 : value);
const minutesToTimerValue = (minutes, unit) => unit === "s" ? minutes * 60 : minutes;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const numberValue = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
};
/**
 * Integrations expose numbers bare or wrapped in a unit label such as `90°`
 * and `60 degrees`, which is how select options usually arrive.
 */
const numericLabel = (value) => {
    const numeric = numberValue(value);
    if (numeric !== undefined) {
        return numeric;
    }
    if (typeof value !== "string") {
        return undefined;
    }
    const match = value.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:°|degrees?)?$/i);
    return match ? Number(match[1]) : undefined;
};
const booleanValue$1 = (value) => {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1") {
        return true;
    }
    if (value === 0 || value === "0") {
        return false;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["on", "true", "yes", "enabled", "active", "bright", "sleep", "oscillate", "oscillating", "swing"].includes(normalized)) {
            return true;
        }
        if (["off", "false", "no", "disabled", "inactive", "dim", "normal", "fixed", "static"].includes(normalized)) {
            return false;
        }
    }
    return undefined;
};
const stringValue = (value) => {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return undefined;
};
const firstNumber = (attributes, keys) => {
    for (const key of keys) {
        const value = numberValue(attributes[key]);
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
};
const firstAngle = (attributes, keys) => {
    for (const key of keys) {
        const value = numericLabel(attributes[key]);
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
};
const firstBoolean = (attributes, keys) => {
    for (const key of keys) {
        const value = booleanValue$1(attributes[key]);
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
};
const timerMinutes = (attributes) => {
    const value = firstNumber(attributes, ["delay_off_countdown", "delay_time", "power_off_time", "timer"]);
    if (value === undefined) {
        return undefined;
    }
    const unit = parseTimerUnit(attributes["timer_unit"] ?? attributes["delay_time_unit"]);
    return timerValueToMinutes(value, unit);
};
const ledState = (attributes) => {
    const brightness = firstNumber(attributes, ["led_brightness"]);
    if (brightness !== undefined) {
        return brightness < 2;
    }
    const direct = firstBoolean(attributes, ["led", "light", "light_enum"]);
    if (direct !== undefined) {
        return direct;
    }
    const fallbackBrightness = firstNumber(attributes, ["light", "led"]);
    return fallbackBrightness === undefined ? undefined : fallbackBrightness < 2;
};
const readPresetModes = (...values) => {
    for (const value of values) {
        if (Array.isArray(value) && value.length > 0) {
            return value.map(String);
        }
    }
    return [];
};
const normalizeFanState = (entityId, entity) => {
    const attributes = entity?.attributes ?? {};
    const model = stringValue(attributes["model"] ?? attributes["model_name"]);
    const profile = getModelProfile(model);
    const speedLevels = resolveSpeedLevels(attributes, profile);
    const directPercentage = firstNumber(attributes, ["percentage", "direct_speed", "natural_speed"]);
    const rawSpeed = firstNumber(attributes, ["fan_speed", "speed"]);
    const rawSpeedPercentage = rawSpeed !== undefined && rawSpeed <= speedLevels ? (rawSpeed / speedLevels) * 100 : rawSpeed;
    const percentage = clamp(directPercentage ?? rawSpeedPercentage ?? 0, 0, 100);
    const presetMode = stringValue(attributes["preset_mode"])?.toLowerCase() ?? "";
    const operationMode = stringValue(attributes["mode"] ?? attributes["operation_mode"])?.toLowerCase() ?? "";
    const isNatural = (value) => value.includes("natural") || value.includes("nature");
    const mode = isNatural(presetMode) || isNatural(operationMode) ? "natural" : "normal";
    const presetModes = readPresetModes(attributes["preset_modes"], attributes["speed_list"], attributes["speed_modes"]);
    const directionValue = stringValue(attributes["direction"] ?? attributes["current_direction"])?.toLowerCase();
    const sleepMode = booleanValue$1(attributes["sleep_mode"]) ?? presetMode.includes("sleep");
    const level = percentage === 0 ? 0 : clamp(Math.round((percentage / 100) * speedLevels), 1, speedLevels);
    const friendlyName = stringValue(attributes["friendly_name"]) ?? entityId;
    return {
        entityId,
        model,
        friendlyName,
        available: entity !== undefined && entity.state !== "unavailable" && entity.state !== "unknown",
        isOn: entity?.state === "on",
        percentage,
        level,
        speedLevels,
        mode,
        favoriteLevel: firstNumber(attributes, ["favorite_level", "favorite_speed"]),
        presetMode: stringValue(attributes["preset_mode"]),
        availableModes: presetModes,
        sleepMode,
        direction: directionValue === "forward" || directionValue === "reverse" ? directionValue : undefined,
        horizontalSwing: firstBoolean(attributes, ["oscillating", "oscillate", "horizontal_swing", "swing_mode"]),
        horizontalAngle: firstAngle(attributes, [
            "horizontal_swing_angle",
            "horizontal_angle",
            "swing_mode_angle",
            "angle",
        ]),
        verticalSwing: firstBoolean(attributes, ["vertical_swing", "vertical_oscillate", "vertical_oscillation"]),
        verticalAngle: firstAngle(attributes, ["vertical_swing_angle", "vertical_oscillation_angle", "vertical_angle"]),
        timerMinutes: timerMinutes(attributes),
        childLock: booleanValue$1(attributes["child_lock"]),
        led: ledState(attributes),
        buzzer: firstBoolean(attributes, ["buzzer", "notification_sound"]),
        ionizer: firstBoolean(attributes, ["anion", "ionizer"]),
        temperature: stringValue(attributes["temperature"]),
        humidity: stringValue(attributes["humidity"]),
    };
};

const serviceName = (domain, service) => `${domain}.${service}`;
const readServiceAvailability = (response) => {
    const names = new Set();
    for (const [domain, services] of Object.entries(response)) {
        for (const service of Object.keys(services)) {
            names.add(serviceName(domain, service));
        }
    }
    return { loaded: true, names };
};
const loadServiceAvailability = async (hass) => {
    if (!hass.callWS) {
        return { loaded: false, names: new Set() };
    }
    try {
        const response = await hass.callWS({ type: "get_services" });
        return readServiceAvailability(response);
    }
    catch {
        return { loaded: false, names: new Set() };
    }
};
class ServiceDispatcher {
    constructor(hass, entityId, availability) {
        this.hass = hass;
        this.entityId = entityId;
        this.availability = availability;
    }
    canCallCustom(domain, service) {
        return !this.availability.loaded || this.availability.names.has(serviceName(domain, service));
    }
    async standard(service, data = {}) {
        await this.hass.callService("fan", service, { entity_id: this.entityId, ...data });
    }
    async custom(domain, service, data = {}) {
        if (!this.canCallCustom(domain, service)) {
            return false;
        }
        await this.hass.callService(domain, service, { entity_id: this.entityId, ...data });
        return true;
    }
}

/**
 * A dropdown turns unusable well before a fine-grained angle entity runs out of
 * steps, so a wider range reports its raw spec instead of a preset list.
 */
const MAX_ANGLE_STEPS = 24;
const MAX_TIMER_STEPS = 100;
const entityParts = (entityId) => {
    const [domain, objectId] = entityId.split(".");
    return [domain ?? "", objectId ?? ""];
};
const numericOptions = (options) => {
    if (!Array.isArray(options)) {
        return undefined;
    }
    const angles = [...new Set(options.map(numericLabel).filter((value) => value !== undefined))].sort((left, right) => left - right);
    return angles.length > 0 ? angles : undefined;
};
const numericAngleOptions = (entity) => numericOptions(entity?.attributes["options"]);
const selectOptions = (entity) => {
    const options = entity?.attributes["options"];
    return Array.isArray(options) ? options.map(String) : [];
};
/**
 * Exact labels win over substring hints because a substring search returns the
 * first matching option rather than the closest one: `Dim` would answer a
 * request for `Off`, and `on` hides inside words such as `None`.
 */
const selectOptionFor = (options, exact, hints) => {
    const normalized = options.map((option) => ({ option, key: option.trim().toLowerCase() }));
    for (const label of exact) {
        const match = normalized.find((entry) => entry.key === label);
        if (match) {
            return match.option;
        }
    }
    for (const hint of hints) {
        const match = normalized.find((entry) => entry.key.includes(hint));
        if (match) {
            return match.option;
        }
    }
    return undefined;
};
const rawSteps = (spec) => Array.from({ length: Math.floor((spec.max - spec.min) / spec.step) + 1 }, (_, index) => spec.min + index * spec.step);
const roundStep = (value) => Math.round(value * 100) / 100;
const BOOLEAN_SELECT_LABELS = {
    enabledExact: ["on", "true", "yes", "enable", "enabled"],
    enabledHints: ["bright", "enable", "active", "sleep", "oscillate", "swing", "true"],
    disabledExact: ["off", "false", "no", "disable", "disabled"],
    disabledHints: ["off", "disable", "inactive", "false", "none", "normal", "fixed", "static", "dim"],
};
const isDisabledLabel = (value) => selectOptionFor([value], BOOLEAN_SELECT_LABELS.disabledExact, ["off", "disable", "inactive"]) !== undefined;
const booleanSelectOption = (options, enabled) => enabled
    ? selectOptionFor(options, BOOLEAN_SELECT_LABELS.enabledExact, BOOLEAN_SELECT_LABELS.enabledHints)
    : selectOptionFor(options, BOOLEAN_SELECT_LABELS.disabledExact, BOOLEAN_SELECT_LABELS.disabledHints);
class StandardFanAdapter {
    constructor(hass, entityId, services, related = {}) {
        this.hass = hass;
        this.entityId = entityId;
        this.services = services;
        this.related = related;
        const actionableRelated = this.actionableRelatedEntities();
        const timerSpec = this.readTimerSpec(this.related.timer);
        this.state = normalizeFanState(entityId, this.entityWithRelatedAttributes(this.related, timerSpec));
        this.profile = getModelProfile(this.state.model);
        const detectedCapabilities = detectCapabilities(hass.states[entityId], services, actionableRelated);
        this.capabilities = {
            ...detectedCapabilities,
            horizontalAngles: this.readAngleOptions(actionableRelated.horizontalAngle) ??
                (detectedCapabilities.horizontalAngles.length > 0
                    ? detectedCapabilities.horizontalAngles
                    : (this.readAngleSteps(actionableRelated.horizontalAngle) ?? [])),
            horizontalAngleSpec: this.readNumberSpec(actionableRelated.horizontalAngle),
            verticalAngles: this.readAngleOptions(actionableRelated.verticalAngle) ??
                (detectedCapabilities.verticalAngles.length > 0
                    ? detectedCapabilities.verticalAngles
                    : (this.readAngleSteps(actionableRelated.verticalAngle) ?? [])),
            verticalAngleSpec: this.readNumberSpec(actionableRelated.verticalAngle),
            timerSteps: this.readNumberSteps(actionableRelated.timer ? timerSpec : undefined),
            timerSpec: actionableRelated.timer ? timerSpec : undefined,
        };
        this.dispatcher = new ServiceDispatcher(hass, entityId, services);
    }
    actionableRelatedEntities() {
        const actionable = { ...this.related };
        for (const key of Object.keys(actionable)) {
            const entityId = actionable[key];
            const state = entityId ? this.hass.states[entityId] : undefined;
            if (!state ||
                state.state === "unknown" ||
                state.state === "unavailable" ||
                ((key === "horizontalAngle" || key === "verticalAngle") &&
                    this.isSelectEntity(entityId) &&
                    numericAngleOptions(state) === undefined)) {
                delete actionable[key];
            }
        }
        return actionable;
    }
    isSelectEntity(entityId) {
        return entityId !== undefined && entityParts(entityId)[0] === "select";
    }
    readAngleOptions(entityId) {
        return numericAngleOptions(entityId ? this.hass.states[entityId] : undefined);
    }
    readNumberSpec(entityId) {
        const entity = entityId ? this.hass.states[entityId] : undefined;
        const minimum = Number(entity?.attributes["min"]);
        const maximum = Number(entity?.attributes["max"]);
        const step = Number(entity?.attributes["step"]);
        if (!Number.isFinite(minimum) ||
            !Number.isFinite(maximum) ||
            !Number.isFinite(step) ||
            step <= 0 ||
            maximum < minimum) {
            return undefined;
        }
        return { min: minimum, max: maximum, step };
    }
    readTimerSpec(entityId) {
        const spec = this.readNumberSpec(entityId);
        if (!spec || (spec.max - spec.min) / spec.step > MAX_TIMER_STEPS) {
            return undefined;
        }
        const entity = entityId ? this.hass.states[entityId] : undefined;
        return { ...spec, unit: parseTimerUnit(entity?.attributes["unit_of_measurement"]) };
    }
    /**
     * Angles carry no timer unit, so they never go through the timer conversion.
     * A range too wide for a dropdown reports no presets and leaves the card on
     * the bounded numeric input built from the same spec.
     */
    readAngleSteps(entityId) {
        const spec = this.readNumberSpec(entityId);
        if (!spec || (spec.max - spec.min) / spec.step > MAX_ANGLE_STEPS) {
            return undefined;
        }
        return rawSteps(spec).map(roundStep);
    }
    readNumberSteps(spec) {
        if (!spec) {
            return undefined;
        }
        return rawSteps(spec).map((value) => roundStep(timerValueToMinutes(value, spec.unit)));
    }
    entityWithRelatedAttributes(related, timerSpec) {
        const entity = this.hass.states[this.entityId];
        if (!entity) {
            return undefined;
        }
        const attributes = { ...entity.attributes };
        const relatedValues = [
            ["horizontalAngle", "horizontal_swing_angle"],
            ["sleepMode", "sleep_mode"],
            ["verticalAngle", "vertical_swing_angle"],
            ["favoriteLevel", "favorite_level"],
            ["verticalSwing", "vertical_swing"],
            ["timer", "delay_time"],
            ["childLock", "child_lock"],
            ["led", "led"],
            ["buzzer", "buzzer"],
            ["ionizer", "ionizer"],
            ["temperature", "temperature"],
            ["humidity", "humidity"],
        ];
        for (const [relatedKey, attributeKey] of relatedValues) {
            const relatedEntityId = related[relatedKey];
            const relatedState = relatedEntityId ? this.hass.states[relatedEntityId] : undefined;
            if (relatedEntityId && relatedState && relatedState.state !== "unknown" && relatedState.state !== "unavailable") {
                if (relatedKey === "led") {
                    attributes[attributeKey] = this.readRelatedLedState(relatedEntityId, relatedState);
                    delete attributes["led_brightness"];
                    continue;
                }
                // A mode selector matched as an angle entity carries no angle, so the
                // primary attribute stays authoritative instead of being overwritten.
                if ((relatedKey === "horizontalAngle" || relatedKey === "verticalAngle") &&
                    numericLabel(relatedState.state) === undefined) {
                    continue;
                }
                const value = Number(relatedState.state);
                attributes[attributeKey] =
                    relatedKey === "timer" && Number.isFinite(value) && timerSpec
                        ? timerValueToMinutes(value, timerSpec.unit)
                        : relatedState.state;
            }
            else if (relatedState) {
                delete attributes[attributeKey];
                if (relatedKey === "led") {
                    delete attributes["led_brightness"];
                }
            }
            else if (attributes[attributeKey] !== undefined && attributes[attributeKey] !== null) {
                continue;
            }
        }
        return { ...entity, attributes };
    }
    readRelatedLedState(entityId, entity) {
        const [domain] = entityParts(entityId);
        const current = numericLabel(entity.state);
        if (domain === "number" || domain === "input_number") {
            const minimum = Number(entity.attributes["min"]);
            const maximum = Number(entity.attributes["max"]);
            if (current !== undefined && Number.isFinite(minimum) && Number.isFinite(maximum) && maximum >= minimum) {
                return this.isCustomLedBrightnessMapping(entityId, minimum, maximum) ? current < 2 : current > minimum;
            }
        }
        if (domain === "select") {
            const options = numericOptions(entity.attributes["options"]) ?? [];
            if (current !== undefined && options.includes(0) && options.includes(2)) {
                return current < 2;
            }
            // A dimmed LED is still lit, so only an explicit off label reads as off.
            return !isDisabledLabel(entity.state);
        }
        return entity.state;
    }
    isCustomLedBrightnessMapping(entityId, minimum, maximum) {
        return entityId.endsWith("_led_brightness") && minimum === 0 && maximum === 2;
    }
    async togglePower() {
        await this.dispatcher.standard("toggle");
    }
    async setPercentage(percentage) {
        if (percentage <= 0) {
            await this.dispatcher.standard("turn_off");
            return;
        }
        // A stopped fan needs turn_on to carry the speed; set_percentage alone is
        // not guaranteed to start it.
        if (!this.state.isOn) {
            await this.dispatcher.standard("turn_on", { percentage });
            return;
        }
        await this.dispatcher.standard("set_percentage", { percentage });
    }
    async setMode(mode) {
        const preferred = mode === "natural" ? ["natural", "nature", "natural 1"] : ["normal", "straight", "manual", "level 1"];
        const preset = this.state.availableModes.find((candidate) => preferred.includes(candidate.toLowerCase())) ??
            this.state.availableModes.find((candidate) => {
                const normalized = candidate.toLowerCase();
                return mode === "natural"
                    ? normalized.includes("natural") || normalized.includes("nature")
                    : normalized.includes("normal") || normalized.includes("straight") || normalized.includes("manual");
            }) ??
            (mode === "natural" ? "Natural" : "Normal");
        await this.setPresetMode(preset);
    }
    async setPresetMode(preset) {
        await this.dispatcher.standard("set_preset_mode", { preset_mode: preset });
    }
    async setSleepMode(enabled) {
        if (await this.setRelatedBoolean(this.related.sleepMode, enabled)) {
            return;
        }
        const sleepPreset = this.state.availableModes.find((preset) => preset.toLowerCase().includes("sleep"));
        if (!sleepPreset) {
            throw new Error("This fan does not expose a sleep preset.");
        }
        if (enabled) {
            await this.setPresetMode(sleepPreset);
            return;
        }
        const current = this.state.presetMode?.toLowerCase();
        const normalPreset = this.state.availableModes.find((preset) => !preset.toLowerCase().includes("sleep") && preset.toLowerCase().includes("normal"));
        const fallbackPreset = this.state.availableModes.find((preset) => preset.toLowerCase() !== "off" && !preset.toLowerCase().includes("sleep"));
        await this.setPresetMode(current && !current.includes("sleep") ? this.state.presetMode : (normalPreset ?? fallbackPreset ?? "Normal"));
    }
    async setFavoriteLevel(level) {
        if (!(await this.setRelatedValue(this.related.favoriteLevel, level))) {
            throw new Error("This fan does not expose a favorite level entity.");
        }
    }
    async setHorizontalSwing(enabled) {
        await this.dispatcher.standard("oscillate", { oscillating: enabled });
    }
    async setHorizontalAngle(angle) {
        await this.startSwing("horizontal");
        if (await this.setRelatedAngle(this.related.horizontalAngle, angle)) {
            return;
        }
        await this.callCustom("fan_set_oscillation_angle", { angle });
    }
    async setVerticalSwing(enabled) {
        if (await this.setRelatedBoolean(this.related.verticalSwing, enabled)) {
            return;
        }
        await this.callCustom(enabled ? "fan_set_vertical_oscillation_on" : "fan_set_vertical_oscillation_off");
    }
    async setVerticalAngle(angle) {
        await this.startSwing("vertical");
        if (await this.setRelatedAngle(this.related.verticalAngle, angle)) {
            return;
        }
        await this.callCustom("fan_set_vertical_oscillation_angle", {
            vertical_angle: angle,
        });
    }
    async nudge(direction) {
        // Aiming the head only holds while the fan is not sweeping.
        await this.stopSwing();
        await this.callCustom("fan_turn", { direction });
    }
    /**
     * An angle only takes effect on a sweeping axis, so selecting one implies
     * starting that axis. An unknown swing state is left alone.
     */
    async startSwing(axis) {
        if (axis === "horizontal") {
            if (this.capabilities.horizontalSwing && this.state.horizontalSwing === false) {
                await this.setHorizontalSwing(true);
            }
            return;
        }
        if (this.capabilities.verticalSwing && this.state.verticalSwing === false) {
            await this.setVerticalSwing(true);
        }
    }
    async stopSwing() {
        if (this.capabilities.horizontalSwing && this.state.horizontalSwing === true) {
            await this.setHorizontalSwing(false);
        }
        if (this.capabilities.verticalSwing && this.state.verticalSwing === true) {
            await this.setVerticalSwing(false);
        }
    }
    async setDirection(direction) {
        await this.dispatcher.standard("set_direction", { direction });
    }
    async setTimer(minutes) {
        const timerSpec = this.readTimerSpec(this.related.timer);
        if (await this.setRelatedValue(this.related.timer, minutesToTimerValue(minutes, timerSpec?.unit ?? "min"))) {
            return;
        }
        await this.callCustom("fan_set_delay_off", { delay_off_countdown: minutes });
    }
    async setChildLock(enabled) {
        if (await this.setRelatedBoolean(this.related.childLock, enabled)) {
            return;
        }
        await this.callCustom(enabled ? "fan_set_child_lock_on" : "fan_set_child_lock_off");
    }
    async setLed(enabled) {
        if (await this.setRelatedLedBrightness(this.related.led, enabled)) {
            return;
        }
        if (await this.setRelatedBoolean(this.related.led, enabled)) {
            return;
        }
        await this.callCustom("fan_set_led_brightness", { brightness: enabled ? 0 : 2 });
    }
    async setBuzzer(enabled) {
        if (await this.setRelatedBoolean(this.related.buzzer, enabled)) {
            return;
        }
        await this.callCustom(enabled ? "fan_set_buzzer_on" : "fan_set_buzzer_off");
    }
    async setIonizer(enabled) {
        if (await this.setRelatedBoolean(this.related.ionizer, enabled)) {
            return;
        }
        await this.callCustom(enabled ? "fan_set_anion_on" : "fan_set_anion_off");
    }
    async callCustom(service, data = {}) {
        if (!(await this.dispatcher.custom("xiaomi_miio_fan", service, data))) {
            throw new Error(`xiaomi_miio_fan.${service} is unavailable.`);
        }
    }
    async setRelatedValue(entityId, value) {
        if (!entityId) {
            return false;
        }
        const state = this.hass.states[entityId];
        if (!state || state.state === "unknown" || state.state === "unavailable") {
            return false;
        }
        const [domain] = entityParts(entityId);
        if (domain !== "number" && domain !== "input_number") {
            return false;
        }
        await this.hass.callService(domain, "set_value", { entity_id: entityId, value });
        return true;
    }
    async setRelatedAngle(entityId, angle) {
        if (!entityId) {
            return false;
        }
        const state = this.hass.states[entityId];
        if (!state || state.state === "unknown" || state.state === "unavailable") {
            return false;
        }
        const [domain] = entityParts(entityId);
        if (domain === "number" || domain === "input_number") {
            return this.setRelatedValue(entityId, angle);
        }
        if (domain !== "select") {
            return false;
        }
        const option = selectOptions(state).find((candidate) => numericLabel(candidate) === angle);
        if (option === undefined) {
            return false;
        }
        await this.hass.callService("select", "select_option", {
            entity_id: entityId,
            option,
        });
        return true;
    }
    async setRelatedBoolean(entityId, enabled) {
        if (!entityId) {
            return false;
        }
        const state = this.hass.states[entityId];
        if (!state || state.state === "unknown" || state.state === "unavailable") {
            return false;
        }
        const [domain] = entityParts(entityId);
        if (domain === "switch" || domain === "input_boolean") {
            await this.hass.callService(domain, enabled ? "turn_on" : "turn_off", { entity_id: entityId });
            return true;
        }
        if (domain === "select") {
            const availableOptions = selectOptions(state);
            if (availableOptions.length === 0) {
                throw new Error(`Related select ${entityId} has no valid options.`);
            }
            const option = booleanSelectOption(availableOptions, enabled);
            if (option === undefined) {
                throw new Error(`Related select ${entityId} has no matching boolean option.`);
            }
            await this.hass.callService(domain, "select_option", {
                entity_id: entityId,
                option,
            });
            return true;
        }
        return false;
    }
    async setRelatedLedBrightness(entityId, enabled) {
        if (!entityId) {
            return false;
        }
        const [domain] = entityParts(entityId);
        const state = this.hass.states[entityId];
        if (!state || state.state === "unknown" || state.state === "unavailable") {
            return false;
        }
        if (domain === "select") {
            const availableOptions = selectOptions(state);
            const numericTarget = enabled ? 0 : 2;
            const option = availableOptions.find((candidate) => numericLabel(candidate) === numericTarget) ??
                booleanSelectOption(availableOptions, enabled);
            if (option === undefined) {
                return false;
            }
            await this.hass.callService("select", "select_option", {
                entity_id: entityId,
                option,
            });
            return true;
        }
        if (domain !== "number" && domain !== "input_number") {
            return false;
        }
        const minimum = Number(state?.attributes["min"]);
        const maximum = Number(state?.attributes["max"]);
        if (!state ||
            state.state === "unknown" ||
            state.state === "unavailable" ||
            !Number.isFinite(minimum) ||
            !Number.isFinite(maximum) ||
            maximum < minimum) {
            return false;
        }
        const customBrightnessMapping = this.isCustomLedBrightnessMapping(entityId, minimum, maximum);
        await this.hass.callService(domain, "set_value", {
            entity_id: entityId,
            value: enabled ? (customBrightnessMapping ? minimum : maximum) : customBrightnessMapping ? maximum : minimum,
        });
        return true;
    }
}

class XiaomiMiioFanAdapter extends StandardFanAdapter {
    constructor(hass, entityId, services, related = {}, nativeXiaomiHome = false) {
        super(hass, entityId, services, related);
        this.nativeXiaomiHome = nativeXiaomiHome;
    }
    async setMode(mode) {
        const level = this.state.level || 1;
        const prefix = mode === "natural" ? "Natural" : "Level";
        const requested = `${prefix} ${level}`;
        const requestedLower = requested.toLowerCase();
        const available = this.state.availableModes.find((candidate) => candidate.toLowerCase() === requestedLower) ??
            this.state.availableModes.find((candidate) => {
                const normalized = candidate.toLowerCase();
                return mode === "natural"
                    ? normalized.includes("natural") || normalized.includes("nature")
                    : normalized.includes("normal") || normalized.includes("straight") || normalized.includes("manual");
            });
        const fallback = this.nativeXiaomiHome ? (mode === "natural" ? "Nature" : "Normal") : requested;
        const firstAvailable = this.state.availableModes.find((candidate) => candidate.toLowerCase() !== "off");
        await this.setPresetMode(available ?? firstAvailable ?? fallback);
    }
}

const createFanAdapter = (hass, entityId, services, integration = "auto", related = {}) => {
    const useXiaomiAdapter = integration === "xiaomi_miio" || integration === "xiaomi_miio_fan";
    const scopedServices = integration === "xiaomi_miio_fan" || (integration === "auto" && useXiaomiAdapter)
        ? services
        : {
            loaded: services.loaded,
            names: new Set([...services.names].filter((name) => !name.startsWith("xiaomi_miio_fan."))),
        };
    return useXiaomiAdapter
        ? new XiaomiMiioFanAdapter(hass, entityId, scopedServices, related, integration === "xiaomi_miio")
        : new StandardFanAdapter(hass, entityId, scopedServices, related);
};

const DEFAULT_BLOCK_ORDER = ["header", "visual", "airflow", "position", "features"];
const DEFAULT_VISUAL_SIZE = 300;
const VISUAL_SIZE_MIN = 120;
const VISUAL_SIZE_MAX = 480;
const VISUAL_SIZE_STEP = 10;
const SURFACE_STYLE_TOKENS = [
    "background",
    "border",
    "border_radius",
    "color",
    "font_size",
    "gap",
    "padding",
    "shadow",
];
/**
 * Only tokens that the stylesheet actually consumes are accepted, so the visual
 * editor never offers a styling field that cannot change the rendered card.
 */
const STYLE_TOKENS = {
    card: [...SURFACE_STYLE_TOKENS, "accent"],
    header: SURFACE_STYLE_TOKENS,
    visual: [...SURFACE_STYLE_TOKENS, "size"],
    controls: [...SURFACE_STYLE_TOKENS, "height"],
    details: SURFACE_STYLE_TOKENS,
};
const DEFAULT_CONFIG = {
    type: "custom:xiaomi-fan-card",
    entity: "",
    theme: "auto",
    integration: "auto",
    header: {
        show: true,
        variant: "full",
        show_eyebrow: true,
        show_name: true,
        show_status: true,
        show_mode: true,
        show_model: true,
    },
    visual: {
        show: true,
        show_graphic: true,
        show_power: true,
        show_speed: true,
        show_details: true,
        animation: "auto",
    },
    controls: {
        show: true,
        show_speed_slider: true,
        show_speed_levels: true,
        show_modes: true,
        show_preset_mode: true,
        show_horizontal_swing: true,
        show_vertical_swing: true,
        show_sleep: true,
        show_cycle: true,
        show_horizontal_angle: true,
        show_vertical_angle: true,
        show_nudge: true,
        show_nudge_with_angles: false,
        show_direction: true,
        show_favorite_level: true,
        show_timer: true,
        show_child_lock: true,
        show_led: true,
        show_buzzer: true,
        show_ionizer: true,
        selection_mode: "auto",
        timer_mode: "cycle",
        angle_mode: "cycle",
    },
    details: {
        show: true,
        show_horizontal_angle: true,
        show_vertical_angle: true,
        show_timer: true,
        show_timer_when_off: true,
        show_temperature: true,
        show_humidity: true,
        position: "below",
    },
    layout: {
        theme: "auto",
        density: "comfortable",
        columns: "auto",
        order: [...DEFAULT_BLOCK_ORDER],
    },
    styles: {},
    disable_animation: false,
    show_sleep: true,
    show_timer: true,
    show_child_lock: true,
    show_led: true,
    show_buzzer: true,
    show_ionizer: true,
};
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const recordValue = (value) => (isRecord(value) ? value : {});
const booleanValue = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const boundedNumberValue = (value, fallback, min, max) => {
    const numeric = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
};
const enumValue = (value, allowed, fallback) => typeof value === "string" && allowed.includes(value) ? value : fallback;
const integrationValue = (value) => enumValue(value, ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"], "auto");
const themeValue = (value) => enumValue(value, ["auto", "mushroom", "minimal", "glass", "industrial"], "auto");
const normalizeHeader = (value) => {
    const input = recordValue(value);
    const variant = enumValue(input.variant, ["full", "compact"], "full");
    return {
        show: booleanValue(input.show, true),
        variant,
        show_eyebrow: booleanValue(input.show_eyebrow, variant === "full"),
        show_name: booleanValue(input.show_name, true),
        show_status: booleanValue(input.show_status, true),
        show_mode: booleanValue(input.show_mode, variant === "full"),
        show_model: booleanValue(input.show_model, variant === "full"),
    };
};
const normalizeVisual = (value) => {
    const input = recordValue(value);
    return {
        show: booleanValue(input.show, true),
        show_graphic: booleanValue(input.show_graphic, true),
        size: input.size === undefined
            ? undefined
            : boundedNumberValue(input.size, DEFAULT_VISUAL_SIZE, VISUAL_SIZE_MIN, VISUAL_SIZE_MAX),
        show_power: booleanValue(input.show_power, true),
        show_speed: booleanValue(input.show_speed, true),
        show_details: booleanValue(input.show_details, true),
        animation: enumValue(input.animation, ["auto", "enabled", "disabled"], "auto"),
    };
};
const normalizeControls = (value, legacy) => {
    const input = recordValue(value);
    return {
        show: booleanValue(input.show, true),
        show_speed_slider: booleanValue(input.show_speed_slider, true),
        show_speed_levels: booleanValue(input.show_speed_levels, true),
        show_modes: booleanValue(input.show_modes, true),
        show_preset_mode: booleanValue(input.show_preset_mode, true),
        show_horizontal_swing: booleanValue(input.show_horizontal_swing, true),
        show_vertical_swing: booleanValue(input.show_vertical_swing, true),
        show_sleep: booleanValue(input.show_sleep, legacy.showSleep),
        show_cycle: booleanValue(input.show_cycle, true),
        show_horizontal_angle: booleanValue(input.show_horizontal_angle, true),
        show_vertical_angle: booleanValue(input.show_vertical_angle, true),
        show_nudge: booleanValue(input.show_nudge, true),
        show_nudge_with_angles: booleanValue(input.show_nudge_with_angles, false),
        show_direction: booleanValue(input.show_direction, true),
        show_favorite_level: booleanValue(input.show_favorite_level, true),
        show_timer: booleanValue(input.show_timer, legacy.showTimer),
        show_child_lock: booleanValue(input.show_child_lock, legacy.showChildLock),
        show_led: booleanValue(input.show_led, legacy.showLed),
        show_buzzer: booleanValue(input.show_buzzer, legacy.showBuzzer),
        show_ionizer: booleanValue(input.show_ionizer, legacy.showIonizer),
        selection_mode: enumValue(input.selection_mode, ["auto", "buttons", "select"], "auto"),
        timer_mode: enumValue(input.timer_mode, ["cycle", "select"], "cycle"),
        angle_mode: enumValue(input.angle_mode, ["cycle", "select"], "cycle"),
    };
};
const normalizeDetails = (value) => {
    const input = recordValue(value);
    return {
        show: booleanValue(input.show, true),
        show_horizontal_angle: booleanValue(input.show_horizontal_angle, true),
        show_vertical_angle: booleanValue(input.show_vertical_angle, true),
        show_timer: booleanValue(input.show_timer, true),
        show_timer_when_off: booleanValue(input.show_timer_when_off, true),
        show_temperature: booleanValue(input.show_temperature, true),
        show_humidity: booleanValue(input.show_humidity, true),
        position: enumValue(input.position, ["below", "side"], "below"),
    };
};
const normalizeOrder = (value) => {
    if (!Array.isArray(value)) {
        return [...DEFAULT_BLOCK_ORDER];
    }
    const selected = value.filter((item) => typeof item === "string" && DEFAULT_BLOCK_ORDER.includes(item));
    return [
        ...selected.filter((item, index) => selected.indexOf(item) === index),
        ...DEFAULT_BLOCK_ORDER.filter((item) => !selected.includes(item)),
    ];
};
const normalizeLayout = (value, theme) => {
    const input = recordValue(value);
    return {
        theme: themeValue(input.theme ?? theme),
        density: enumValue(input.density, ["comfortable", "compact"], "comfortable"),
        columns: enumValue(input.columns, ["auto", "one", "two"], "auto"),
        order: normalizeOrder(input.order),
    };
};
const normalizeStyleBlock = (value, allowed) => {
    const input = recordValue(value);
    const tokens = {};
    for (const key of allowed) {
        const token = input[key];
        if (typeof token === "string" && token.trim() !== "") {
            tokens[key] = token;
        }
    }
    return tokens;
};
const normalizeStyles = (value) => {
    const input = recordValue(value);
    return {
        card: normalizeStyleBlock(input.card, STYLE_TOKENS.card),
        header: normalizeStyleBlock(input.header, STYLE_TOKENS.header),
        visual: normalizeStyleBlock(input.visual, STYLE_TOKENS.visual),
        controls: normalizeStyleBlock(input.controls, STYLE_TOKENS.controls),
        details: normalizeStyleBlock(input.details, STYLE_TOKENS.details),
    };
};
const normalizeCardConfig = (raw) => {
    const source = recordValue(raw);
    const related = recordValue(source.related_entities);
    const relatedEntity = (key) => {
        const direct = source[key];
        return typeof direct === "string" ? direct : typeof related[key] === "string" ? related[key] : undefined;
    };
    const entity = typeof source.entity === "string" && source.entity ? source.entity : (source.entity_id ?? "");
    const integration = integrationValue(source.integration ??
        (source.platform === "default"
            ? "standard"
            : source.platform === "xiaomi_miio" ||
                source.platform === "xiaomi_miio_fan" ||
                source.platform === "xiaomi_miot"
                ? source.platform
                : undefined));
    const showSleep = booleanValue(source.show_sleep ?? source.sleep_mode ?? source.force_sleep_mode_support, DEFAULT_CONFIG.show_sleep);
    const showLed = source.hide_led_button === true ? false : booleanValue(source.show_led, DEFAULT_CONFIG.show_led);
    const showTimer = booleanValue(source.show_timer, DEFAULT_CONFIG.show_timer);
    const showChildLock = booleanValue(source.show_child_lock, DEFAULT_CONFIG.show_child_lock);
    const showBuzzer = booleanValue(source.show_buzzer, DEFAULT_CONFIG.show_buzzer);
    const showIonizer = booleanValue(source.show_ionizer, DEFAULT_CONFIG.show_ionizer);
    const visual = normalizeVisual(source.visual);
    const disableAnimation = booleanValue(source.disable_animation, false) || visual.animation === "disabled";
    const controls = normalizeControls(source.controls, {
        showSleep,
        showTimer,
        showChildLock,
        showLed,
        showBuzzer,
        showIonizer,
    });
    return {
        ...DEFAULT_CONFIG,
        ...source,
        entity,
        integration,
        theme: themeValue(source.theme),
        disable_animation: disableAnimation,
        show_sleep: showSleep,
        show_timer: showTimer,
        show_child_lock: showChildLock,
        show_led: showLed,
        show_buzzer: showBuzzer,
        show_ionizer: showIonizer,
        header: normalizeHeader(source.header),
        visual,
        controls,
        details: normalizeDetails(source.details),
        layout: normalizeLayout(source.layout, source.theme),
        styles: normalizeStyles(source.styles),
        horizontal_angle_entity: relatedEntity("horizontal_angle_entity"),
        vertical_swing_entity: relatedEntity("vertical_swing_entity"),
        vertical_angle_entity: relatedEntity("vertical_angle_entity"),
        favorite_level_entity: relatedEntity("favorite_level_entity"),
        sleep_mode_entity: relatedEntity("sleep_mode_entity"),
        timer_entity: relatedEntity("timer_entity"),
        child_lock_entity: relatedEntity("child_lock_entity"),
        led_entity: relatedEntity("led_entity"),
        buzzer_entity: relatedEntity("buzzer_entity"),
        ionizer_entity: relatedEntity("ionizer_entity"),
        temperature_entity: relatedEntity("temperature_entity"),
        humidity_entity: relatedEntity("humidity_entity"),
    };
};

const RELATED_ENTITY_DOMAINS = {
    horizontal_angle_entity: ["number", "input_number", "select"],
    vertical_swing_entity: ["switch", "input_boolean", "select"],
    vertical_angle_entity: ["number", "input_number", "select"],
    favorite_level_entity: ["number", "input_number"],
    sleep_mode_entity: ["switch", "input_boolean", "select"],
    timer_entity: ["number", "input_number"],
    child_lock_entity: ["switch", "input_boolean", "select"],
    led_entity: ["switch", "input_boolean", "select", "number", "input_number"],
    buzzer_entity: ["switch", "input_boolean", "select"],
    ionizer_entity: ["switch", "input_boolean", "select"],
    temperature_entity: ["sensor"],
    humidity_entity: ["sensor"],
};

const STYLE_ICONS = {
    card: "mdi:credit-card-outline",
    header: "mdi:card-text-outline",
    visual: "mdi:fan",
    controls: "mdi:tune-variant",
    details: "mdi:information-outline",
};
const getConfigForm = () => {
    const withVisibility = (field, parents) => {
        if (!parents) {
            return field;
        }
        const names = typeof parents === "string" ? [parents] : parents;
        return {
            ...field,
            visible: names.map((field) => ({ field, value: true })),
        };
    };
    const booleanField = (name, parents) => withVisibility({ name, selector: { boolean: {} } }, parents);
    const entityField = (name, domains) => ({
        name,
        selector: { entity: { domain: domains } },
    });
    const selectField = (name, options, parents) => withVisibility({ name, selector: { select: { options, translation_key: name } } }, parents);
    const grid = (schema, columnMinWidth = "200px") => ({
        type: "grid",
        column_min_width: columnMinWidth,
        schema,
    });
    const panel = (name, icon, schema, flatten = false) => ({
        type: "expandable",
        name,
        icon,
        flatten,
        schema,
    });
    // Sub-sections share the parent data scope, which needs ha-form flatten
    // support (Home Assistant 2024.8 or newer).
    const section = (name, icon, schema) => panel(name, icon, schema, true);
    const styleGroup = (name) => panel(name, STYLE_ICONS[name], STYLE_TOKENS[name].map((token) => ({ name: token, selector: { text: {} } })));
    const relatedEntityField = (name) => entityField(name, RELATED_ENTITY_DOMAINS[name]);
    return {
        schema: [
            entityField("entity", ["fan"]),
            { name: "name", selector: { text: {} } },
            selectField("integration", ["auto", "standard", "xiaomi_miio", "xiaomi_miio_fan", "xiaomi_miot"]),
            panel("header", "mdi:card-text-outline", [
                booleanField("show"),
                selectField("variant", ["full", "compact"], "show"),
                grid([
                    booleanField("show_name", "show"),
                    booleanField("show_status", "show"),
                    booleanField("show_mode", "show"),
                    booleanField("show_model", "show"),
                    booleanField("show_eyebrow", "show"),
                ], "180px"),
            ]),
            panel("visual", "mdi:fan", [
                booleanField("show"),
                withVisibility({
                    name: "size",
                    selector: {
                        number: {
                            min: VISUAL_SIZE_MIN,
                            max: VISUAL_SIZE_MAX,
                            step: VISUAL_SIZE_STEP,
                            mode: "box",
                            unit_of_measurement: "px",
                        },
                    },
                }, ["show", "show_graphic"]),
                selectField("animation", ["auto", "enabled", "disabled"], "show"),
                grid([
                    booleanField("show_graphic", "show"),
                    booleanField("show_power", ["show", "show_graphic"]),
                    booleanField("show_speed", ["show", "show_graphic"]),
                    booleanField("show_details", "show"),
                ], "180px"),
            ]),
            panel("controls", "mdi:tune-variant", [
                booleanField("show"),
                grid([
                    selectField("selection_mode", ["auto", "buttons", "select"], "show"),
                    selectField("timer_mode", ["cycle", "select"], "show"),
                    selectField("angle_mode", ["cycle", "select"], "show"),
                ]),
                section("speed", "mdi:speedometer", [
                    grid([booleanField("show_speed_slider", "show"), booleanField("show_speed_levels", "show")], "180px"),
                ]),
                section("modes", "mdi:weather-windy", [
                    grid([booleanField("show_modes", "show"), booleanField("show_preset_mode", "show")], "180px"),
                ]),
                section("oscillation", "mdi:arrow-oscillating", [
                    grid([
                        booleanField("show_horizontal_swing", "show"),
                        booleanField("show_vertical_swing", "show"),
                        booleanField("show_cycle", "show"),
                        booleanField("show_sleep", "show"),
                    ], "180px"),
                ]),
                section("angles", "mdi:angle-acute", [
                    grid([
                        booleanField("show_horizontal_angle", "show"),
                        booleanField("show_vertical_angle", "show"),
                        booleanField("show_nudge", "show"),
                        booleanField("show_direction", "show"),
                    ], "180px"),
                    booleanField("show_nudge_with_angles", ["show", "show_nudge"]),
                ]),
                section("features", "mdi:toggle-switch-outline", [
                    grid([
                        booleanField("show_timer", "show"),
                        booleanField("show_favorite_level", "show"),
                        booleanField("show_child_lock", "show"),
                        booleanField("show_led", "show"),
                        booleanField("show_buzzer", "show"),
                        booleanField("show_ionizer", "show"),
                    ], "180px"),
                ]),
            ]),
            panel("details", "mdi:information-outline", [
                booleanField("show"),
                selectField("position", ["below", "side"], "show"),
                grid([
                    booleanField("show_horizontal_angle", "show"),
                    booleanField("show_vertical_angle", "show"),
                    booleanField("show_timer", "show"),
                    booleanField("show_timer_when_off", ["show", "show_timer"]),
                    booleanField("show_temperature", "show"),
                    booleanField("show_humidity", "show"),
                ], "180px"),
            ]),
            panel("layout", "mdi:view-dashboard-outline", [
                selectField("theme", ["auto", "mushroom", "minimal", "glass", "industrial"]),
                grid([selectField("density", ["comfortable", "compact"]), selectField("columns", ["auto", "one", "two"])]),
                {
                    name: "order",
                    selector: {
                        select: {
                            multiple: true,
                            reorder: true,
                            translation_key: "order",
                            options: [...DEFAULT_BLOCK_ORDER],
                        },
                    },
                },
            ]),
            panel("styles", "mdi:palette-outline", [
                styleGroup("card"),
                styleGroup("header"),
                styleGroup("visual"),
                styleGroup("controls"),
                styleGroup("details"),
            ]),
            {
                type: "expandable",
                name: "related_entities",
                icon: "mdi:link-variant",
                flatten: true,
                schema: [
                    relatedEntityField("horizontal_angle_entity"),
                    relatedEntityField("vertical_swing_entity"),
                    relatedEntityField("vertical_angle_entity"),
                    relatedEntityField("favorite_level_entity"),
                    relatedEntityField("sleep_mode_entity"),
                    relatedEntityField("timer_entity"),
                    relatedEntityField("child_lock_entity"),
                    relatedEntityField("led_entity"),
                    relatedEntityField("buzzer_entity"),
                    relatedEntityField("ionizer_entity"),
                    relatedEntityField("temperature_entity"),
                    relatedEntityField("humidity_entity"),
                ],
            },
        ],
    };
};

const english = {
    off: "Off",
    on: "On",
    hoursMinutes: "{hours}h {minutes}m",
    hoursOnly: "{hours}h",
    minutesOnly: "{minutes} mins",
    chooseFanEntity: "Choose a fan entity in card editor.",
    fanEntityUnavailable: "Fan entity unavailable: {entity}",
    fanCommandFailed: "Fan command failed.",
    open: "Open {title}",
    xiaomiAirCirculation: "XIAOMI AIR CIRCULATION",
    naturalBreeze: "Natural breeze",
    straightAirflow: "Straight airflow",
    running: "Running",
    standby: "Standby",
    fanStatus: "Fan status",
    unavailable: "Unavailable",
    horizontalAngleValue: "Horizontal angle {value} degrees",
    verticalAngleValue: "Vertical angle {value} degrees",
    turnFanOff: "Turn fan off",
    turnFanOn: "Turn fan on",
    airflow: "AIRFLOW",
    speedLevel: "Speed level {level}",
    fanSpeedPercentage: "Fan speed percentage",
    speedLevels: "Speed levels",
    setSpeedLevel: "Set speed level {level}",
    horizontal: "Horizontal",
    vertical: "Vertical",
    sleep: "Sleep",
    cycle: "Cycle",
    mode: "Mode",
    normal: "Normal",
    natural: "Natural",
    presetMode: "Preset mode",
    horizontalAngle: "Horizontal angle",
    verticalAngle: "Vertical angle",
    position: "Position",
    moveFanUp: "Move fan up",
    moveFanLeft: "Move fan left",
    moveFanRight: "Move fan right",
    moveFanDown: "Move fan down",
    direction: "Direction",
    forward: "Forward",
    reverse: "Reverse",
    favoriteLevel: "Favorite level",
    timer: "Timer",
    childLock: "Child lock",
    led: "LED",
    buzzer: "Buzzer",
    ionizer: "Ionizer",
    fanFeatures: "Fan features",
    header: "Header",
    full: "Full",
    compact: "Compact",
    eyebrow: "Eyebrow",
    name: "Name",
    status: "Status",
    model: "Model",
    visual: "Visual",
    graphic: "Graphic",
    power: "Power",
    speed: "Speed",
    details: "Details",
    animation: "Animation",
    enabled: "Enabled",
    disabled: "Disabled",
    controls: "Controls",
    slider: "Slider",
    levels: "Levels",
    modes: "Modes",
    preset: "Preset",
    swing: "Oscillation",
    nudge: "Position",
    favorite: "Favorite",
    layout: "Layout",
    density: "Density",
    comfortable: "Comfortable",
    columns: "Columns",
    relatedEntities: "Related entities",
    buttons: "Buttons",
    select: "Select",
    selectionMode: "Selection mode",
    timerMode: "Timer control",
    angleMode: "Angle control",
    temperature: "Temperature",
    humidity: "Humidity",
    editorFanEntity: "Fan entity",
    cardName: "Card name",
    visualTheme: "Visual theme",
    auto: "Auto",
    mushroom: "Mushroom",
    minimal: "Minimal",
    glass: "Glass",
    industrial: "Industrial",
    integration: "Integration",
    autoDetect: "Auto detect",
    standardFan: "Standard fan",
    nativeXiaomiHome: "Native Xiaomi Home (xiaomi_miio)",
    xiaomiMiioFan: "Xiaomi Miio fan",
    xiaomiMiot: "Xiaomi Miot",
    showTimer: "Show timer",
    showChildLock: "Show child lock",
    showLed: "Show LED",
    showBuzzer: "Show buzzer",
    showIonizer: "Show ionizer",
    manual: "Manual",
    show: "Show",
    variant: "Variant",
    below: "Below",
    side: "Side",
    one: "One",
    two: "Two",
    order: "Order",
    styles: "Styles",
    card: "Card",
    nudgeWithAngles: "Nudge with angles",
    showTimerWhenOff: "Show timer when off",
    airflowControls: "Airflow controls",
    positionControls: "Position controls",
    horizontalAngleEntity: "Horizontal angle entity",
    verticalSwingEntity: "Vertical oscillation entity",
    verticalAngleEntity: "Vertical angle entity",
    favoriteLevelEntity: "Favorite level entity",
    sleepModeEntity: "Sleep mode entity",
    timerEntity: "Timer entity",
    childLockEntity: "Child lock entity",
    ledEntity: "LED entity",
    buzzerEntity: "Buzzer entity",
    ionizerEntity: "Ionizer entity",
    temperatureEntity: "Temperature entity",
    humidityEntity: "Humidity entity",
    accent: "Accent color",
    background: "Background",
    border: "Border",
    borderRadius: "Border radius",
    color: "Color",
    fontSize: "Font size",
    gap: "Gap",
    height: "Height",
    padding: "Padding",
    shadow: "Shadow",
    size: "Size",
    angles: "Angles and position",
    helperIntegration: "Auto detection follows the fan entity. Override it only when the wrong integration is detected.",
    helperSelectionMode: "How speed levels and presets appear: buttons for a few options, a dropdown for many.",
    helperTimerMode: "A dropdown with every supported step, or one button that cycles through them.",
    helperAngleMode: "A dropdown with the supported angles, or one button that cycles through them.",
    helperNudgeWithAngles: "Keep the directional pad visible even when angle selectors are shown.",
    helperTheme: "Preset surface, corner, and typography treatment for the whole card.",
    helperDensity: "Compact trims padding and spacing while keeping 44 px touch targets.",
    helperColumns: "Feature panel columns. Auto follows the card width.",
    helperOrder: "Blocks render in the order selected here. Unselected blocks are appended.",
    helperStyles: "Optional CSS values per block. Leave a field empty to follow the Home Assistant theme.",
};
const TRANSLATIONS = {
    en: english,
    pl: {
        off: "Wył.",
        on: "Wł.",
        hoursMinutes: "{hours} godz. {minutes} min",
        hoursOnly: "{hours} godz.",
        minutesOnly: "{minutes} min",
        chooseFanEntity: "Wybierz encję wentylatora w edytorze karty.",
        fanEntityUnavailable: "Encja wentylatora niedostępna: {entity}",
        fanCommandFailed: "Polecenie wentylatora nie powiodło się.",
        open: "Otwórz {title}",
        xiaomiAirCirculation: "CYRKULACJA POWIETRZA XIAOMI",
        naturalBreeze: "Naturalny nawiew",
        straightAirflow: "Prosty nawiew",
        running: "Działa",
        standby: "Czuwanie",
        fanStatus: "Stan wentylatora",
        unavailable: "Niedostępne",
        horizontalAngleValue: "Kąt poziomy {value} stopni",
        verticalAngleValue: "Kąt pionowy {value} stopni",
        turnFanOff: "Wyłącz wentylator",
        turnFanOn: "Włącz wentylator",
        airflow: "NAWIEW",
        speedLevel: "Poziom prędkości {level}",
        fanSpeedPercentage: "Procentowa prędkość wentylatora",
        speedLevels: "Poziomy prędkości",
        setSpeedLevel: "Ustaw poziom prędkości {level}",
        horizontal: "Poziomo",
        vertical: "Pionowo",
        sleep: "Sen",
        cycle: "Cykl",
        mode: "Tryb",
        normal: "Normalny",
        natural: "Naturalny",
        presetMode: "Tryb wstępny",
        horizontalAngle: "Kąt poziomy",
        verticalAngle: "Kąt pionowy",
        position: "Pozycja",
        moveFanUp: "Przesuń wentylator w górę",
        moveFanLeft: "Przesuń wentylator w lewo",
        moveFanRight: "Przesuń wentylator w prawo",
        moveFanDown: "Przesuń wentylator w dół",
        direction: "Kierunek",
        forward: "Do przodu",
        reverse: "Wstecz",
        favoriteLevel: "Ulubiony poziom",
        timer: "Wyłącznik czasowy",
        childLock: "Blokada rodzicielska",
        led: "LED",
        buzzer: "Brzęczyk",
        ionizer: "Jonizator",
        fanFeatures: "Funkcje wentylatora",
        header: "Nagłówek",
        full: "Pełny",
        compact: "Kompaktowy",
        eyebrow: "Etykieta",
        name: "Nazwa",
        status: "Stan",
        model: "Model",
        visual: "Widok",
        graphic: "Grafika",
        power: "Zasilanie",
        speed: "Prędkość",
        details: "Szczegóły",
        animation: "Animacja",
        enabled: "Włączona",
        disabled: "Wyłączona",
        controls: "Sterowanie",
        slider: "Suwak",
        levels: "Poziomy",
        modes: "Tryby",
        preset: "Preset",
        swing: "Cyrkulacja",
        nudge: "Pozycja",
        favorite: "Ulubiony",
        layout: "Układ",
        density: "Gęstość",
        comfortable: "Wygodny",
        columns: "Kolumny",
        relatedEntities: "Powiązane encje",
        buttons: "Przyciski",
        select: "Wybór",
        selectionMode: "Tryb wyboru",
        timerMode: "Sterowanie czasem",
        angleMode: "Sterowanie kątem",
        temperature: "Temperatura",
        humidity: "Wilgotność",
        editorFanEntity: "Encja wentylatora",
        cardName: "Nazwa karty",
        visualTheme: "Motyw wizualny",
        auto: "Automatyczny",
        mushroom: "Mushroom",
        minimal: "Minimalny",
        glass: "Szkło",
        industrial: "Industrialny",
        integration: "Integracja",
        autoDetect: "Wykryj automatycznie",
        standardFan: "Standardowy wentylator",
        nativeXiaomiHome: "Natywny Xiaomi Home (xiaomi_miio)",
        xiaomiMiioFan: "Wentylator Xiaomi Miio",
        xiaomiMiot: "Xiaomi Miot",
        showTimer: "Pokaż wyłącznik czasowy",
        showChildLock: "Pokaż blokadę rodzicielską",
        showLed: "Pokaż LED",
        showBuzzer: "Pokaż brzęczyk",
        showIonizer: "Pokaż jonizator",
        manual: "Ręczny",
        show: "Pokaż",
        variant: "Wariant",
        below: "Poniżej",
        side: "Z boku",
        one: "Jeden",
        two: "Dwa",
        order: "Kolejność",
        styles: "Style",
        card: "Karta",
        nudgeWithAngles: "Pozycja z kątami",
        showTimerWhenOff: "Pokaż timer, gdy wentylator jest wyłączony",
        airflowControls: "Sterowanie nawiewem",
        positionControls: "Sterowanie pozycją",
        horizontalAngleEntity: "Encja kąta poziomego",
        verticalSwingEntity: "Encja pionowej cyrkulacji",
        verticalAngleEntity: "Encja kąta pionowego",
        favoriteLevelEntity: "Encja ulubionego poziomu",
        sleepModeEntity: "Encja trybu snu",
        timerEntity: "Encja timera",
        childLockEntity: "Encja blokady rodzicielskiej",
        ledEntity: "Encja LED",
        buzzerEntity: "Encja brzęczyka",
        ionizerEntity: "Encja jonizatora",
        temperatureEntity: "Encja temperatury",
        humidityEntity: "Encja wilgotności",
        accent: "Kolor akcentu",
        background: "Tło",
        border: "Obramowanie",
        borderRadius: "Promień obramowania",
        color: "Kolor",
        fontSize: "Rozmiar czcionki",
        gap: "Odstęp",
        height: "Wysokość",
        padding: "Wewnętrzny odstęp",
        shadow: "Cień",
        size: "Rozmiar",
        angles: "Kąty i pozycja",
        helperIntegration: "Automatyczne wykrywanie bazuje na encji wentylatora. Zmień je tylko wtedy, gdy wykryta integracja jest błędna.",
        helperSelectionMode: "Sposób prezentacji poziomów i presetów: przyciski przy kilku opcjach, lista przy wielu.",
        helperTimerMode: "Lista ze wszystkimi krokami albo jeden przycisk przełączający je po kolei.",
        helperAngleMode: "Lista obsługiwanych kątów albo jeden przycisk przełączający je po kolei.",
        helperNudgeWithAngles: "Zachowaj krzyżak kierunków, nawet gdy widoczne są listy kątów.",
        helperTheme: "Gotowy zestaw tła, narożników i typografii dla całej karty.",
        helperDensity: "Tryb kompaktowy zmniejsza odstępy, zachowując obszary dotyku 44 px.",
        helperColumns: "Liczba kolumn panelu funkcji. Auto dopasowuje się do szerokości karty.",
        helperOrder: "Bloki są renderowane w wybranej tutaj kolejności. Niewybrane trafiają na koniec.",
        helperStyles: "Opcjonalne wartości CSS dla każdego bloku. Puste pole oznacza motyw Home Assistant.",
    },
    es: {
        off: "Apagado",
        on: "Encendido",
        hoursMinutes: "{hours} h {minutes} min",
        hoursOnly: "{hours} h",
        minutesOnly: "{minutes} min",
        chooseFanEntity: "Selecciona una entidad de ventilador en el editor de tarjetas.",
        fanEntityUnavailable: "Entidad del ventilador no disponible: {entity}",
        fanCommandFailed: "Falló el comando del ventilador.",
        open: "Abrir {title}",
        xiaomiAirCirculation: "CIRCULACIÓN DE AIRE XIAOMI",
        naturalBreeze: "Brisa natural",
        straightAirflow: "Flujo de aire directo",
        running: "En marcha",
        standby: "En espera",
        fanStatus: "Estado del ventilador",
        unavailable: "No disponible",
        horizontalAngleValue: "Ángulo horizontal de {value} grados",
        verticalAngleValue: "Ángulo vertical de {value} grados",
        turnFanOff: "Apagar ventilador",
        turnFanOn: "Encender ventilador",
        airflow: "FLUJO DE AIRE",
        speedLevel: "Nivel de velocidad {level}",
        fanSpeedPercentage: "Porcentaje de velocidad del ventilador",
        speedLevels: "Niveles de velocidad",
        setSpeedLevel: "Establecer nivel de velocidad {level}",
        horizontal: "Horizontal",
        vertical: "Vertical",
        sleep: "Sueño",
        cycle: "Ciclo",
        mode: "Modo",
        normal: "Normal",
        natural: "Natural",
        presetMode: "Modo preestablecido",
        horizontalAngle: "Ángulo horizontal",
        verticalAngle: "Ángulo vertical",
        position: "Posición",
        moveFanUp: "Mover ventilador arriba",
        moveFanLeft: "Mover ventilador a la izquierda",
        moveFanRight: "Mover ventilador a la derecha",
        moveFanDown: "Mover ventilador abajo",
        direction: "Dirección",
        forward: "Hacia delante",
        reverse: "Hacia atrás",
        favoriteLevel: "Nivel favorito",
        timer: "Temporizador",
        childLock: "Bloqueo infantil",
        led: "LED",
        buzzer: "Zumbador",
        ionizer: "Ionizador",
        fanFeatures: "Funciones del ventilador",
        header: "Encabezado",
        full: "Completo",
        compact: "Compacto",
        eyebrow: "Etiqueta",
        name: "Nombre",
        status: "Estado",
        model: "Modelo",
        visual: "Visual",
        graphic: "Gráfico",
        power: "Encendido",
        speed: "Velocidad",
        details: "Detalles",
        animation: "Animación",
        enabled: "Activada",
        disabled: "Desactivada",
        controls: "Controles",
        slider: "Deslizador",
        levels: "Niveles",
        modes: "Modos",
        preset: "Preajuste",
        swing: "Oscilación",
        nudge: "Posición",
        favorite: "Favorito",
        layout: "Diseño",
        density: "Densidad",
        comfortable: "Cómoda",
        columns: "Columnas",
        relatedEntities: "Entidades relacionadas",
        buttons: "Botones",
        select: "Selector",
        selectionMode: "Modo de selección",
        timerMode: "Control del temporizador",
        angleMode: "Control de ángulo",
        temperature: "Temperatura",
        humidity: "Humedad",
        editorFanEntity: "Entidad del ventilador",
        cardName: "Nombre de la tarjeta",
        visualTheme: "Tema visual",
        auto: "Automático",
        mushroom: "Mushroom",
        minimal: "Minimalista",
        glass: "Cristal",
        industrial: "Industrial",
        integration: "Integración",
        autoDetect: "Detectar automáticamente",
        standardFan: "Ventilador estándar",
        nativeXiaomiHome: "Xiaomi Home nativo (xiaomi_miio)",
        xiaomiMiioFan: "Ventilador Xiaomi Miio",
        xiaomiMiot: "Xiaomi Miot",
        showTimer: "Mostrar temporizador",
        showChildLock: "Mostrar bloqueo infantil",
        showLed: "Mostrar LED",
        showBuzzer: "Mostrar zumbador",
        showIonizer: "Mostrar ionizador",
        manual: "Manual",
        show: "Mostrar",
        variant: "Variante",
        below: "Debajo",
        side: "Lateral",
        one: "Uno",
        two: "Dos",
        order: "Orden",
        styles: "Estilos",
        card: "Tarjeta",
        nudgeWithAngles: "Posición con ángulos",
        showTimerWhenOff: "Mostrar temporizador cuando esté apagado",
        airflowControls: "Controles del flujo de aire",
        positionControls: "Controles de posición",
        horizontalAngleEntity: "Entidad del ángulo horizontal",
        verticalSwingEntity: "Entidad de oscilación vertical",
        verticalAngleEntity: "Entidad del ángulo vertical",
        favoriteLevelEntity: "Entidad del nivel favorito",
        sleepModeEntity: "Entidad del modo de suspensión",
        timerEntity: "Entidad del temporizador",
        childLockEntity: "Entidad del bloqueo infantil",
        ledEntity: "Entidad LED",
        buzzerEntity: "Entidad del zumbador",
        ionizerEntity: "Entidad del ionizador",
        temperatureEntity: "Entidad de temperatura",
        humidityEntity: "Entidad de humedad",
        accent: "Color de acento",
        background: "Fondo",
        border: "Borde",
        borderRadius: "Radio del borde",
        color: "Color",
        fontSize: "Tamaño de fuente",
        gap: "Espacio",
        height: "Altura",
        padding: "Relleno",
        shadow: "Sombra",
        size: "Tamaño",
        angles: "Ángulos y posición",
        helperIntegration: "La detección automática sigue la entidad del ventilador. Cámbiala solo si detecta la integración incorrecta.",
        helperSelectionMode: "Cómo se muestran los niveles y los presets: botones con pocas opciones, lista con muchas.",
        helperTimerMode: "Una lista con todos los pasos, o un botón que los recorre.",
        helperAngleMode: "Una lista con los ángulos compatibles, o un botón que los recorre.",
        helperNudgeWithAngles: "Mantén el mando de dirección visible aunque se muestren los selectores de ángulo.",
        helperTheme: "Tratamiento predefinido de superficies, esquinas y tipografía para toda la tarjeta.",
        helperDensity: "El modo compacto reduce el espaciado y mantiene áreas táctiles de 44 px.",
        helperColumns: "Columnas del panel de funciones. Auto se adapta al ancho de la tarjeta.",
        helperOrder: "Los bloques se muestran en el orden elegido aquí. Los no seleccionados se añaden al final.",
        helperStyles: "Valores CSS opcionales por bloque. Deja el campo vacío para seguir el tema de Home Assistant.",
    },
    fr: {
        off: "Éteint",
        on: "Activé",
        hoursMinutes: "{hours} h {minutes} min",
        hoursOnly: "{hours} h",
        minutesOnly: "{minutes} min",
        chooseFanEntity: "Sélectionnez une entité de ventilateur dans l'éditeur de carte.",
        fanEntityUnavailable: "Entité du ventilateur indisponible : {entity}",
        fanCommandFailed: "La commande du ventilateur a échoué.",
        open: "Ouvrir {title}",
        xiaomiAirCirculation: "CIRCULATION D'AIR XIAOMI",
        naturalBreeze: "Brise naturelle",
        straightAirflow: "Flux d'air direct",
        running: "En marche",
        standby: "Veille",
        fanStatus: "État du ventilateur",
        unavailable: "Indisponible",
        horizontalAngleValue: "Angle horizontal de {value} degrés",
        verticalAngleValue: "Angle vertical de {value} degrés",
        turnFanOff: "Éteindre le ventilateur",
        turnFanOn: "Allumer le ventilateur",
        airflow: "FLUX D'AIR",
        speedLevel: "Niveau de vitesse {level}",
        fanSpeedPercentage: "Pourcentage de vitesse du ventilateur",
        speedLevels: "Niveaux de vitesse",
        setSpeedLevel: "Régler le niveau de vitesse {level}",
        horizontal: "Horizontal",
        vertical: "Vertical",
        sleep: "Sommeil",
        cycle: "Cycle",
        mode: "Mode",
        normal: "Normal",
        natural: "Naturel",
        presetMode: "Mode préréglé",
        horizontalAngle: "Angle horizontal",
        verticalAngle: "Angle vertical",
        position: "Position",
        moveFanUp: "Déplacer le ventilateur vers le haut",
        moveFanLeft: "Déplacer le ventilateur vers la gauche",
        moveFanRight: "Déplacer le ventilateur vers la droite",
        moveFanDown: "Déplacer le ventilateur vers le bas",
        direction: "Direction",
        forward: "Vers l'avant",
        reverse: "Vers l'arrière",
        favoriteLevel: "Niveau favori",
        timer: "Minuterie",
        childLock: "Verrouillage enfant",
        led: "LED",
        buzzer: "Avertisseur",
        ionizer: "Ioniseur",
        fanFeatures: "Fonctions du ventilateur",
        header: "En-tête",
        full: "Complet",
        compact: "Compact",
        eyebrow: "Surtitre",
        name: "Nom",
        status: "État",
        model: "Modèle",
        visual: "Visuel",
        graphic: "Graphique",
        power: "Alimentation",
        speed: "Vitesse",
        details: "Détails",
        animation: "Animation",
        enabled: "Activée",
        disabled: "Désactivée",
        controls: "Commandes",
        slider: "Curseur",
        levels: "Niveaux",
        modes: "Modes",
        preset: "Préréglage",
        swing: "Oscillation",
        nudge: "Position",
        favorite: "Favori",
        layout: "Mise en page",
        density: "Densité",
        comfortable: "Confortable",
        columns: "Colonnes",
        relatedEntities: "Entités associées",
        buttons: "Boutons",
        select: "Sélecteur",
        selectionMode: "Mode de sélection",
        timerMode: "Commande de minuterie",
        angleMode: "Commande d'angle",
        temperature: "Température",
        humidity: "Humidité",
        editorFanEntity: "Entité du ventilateur",
        cardName: "Nom de la carte",
        visualTheme: "Thème visuel",
        auto: "Automatique",
        mushroom: "Mushroom",
        minimal: "Minimal",
        glass: "Verre",
        industrial: "Industriel",
        integration: "Intégration",
        autoDetect: "Détection automatique",
        standardFan: "Ventilateur standard",
        nativeXiaomiHome: "Xiaomi Home natif (xiaomi_miio)",
        xiaomiMiioFan: "Ventilateur Xiaomi Miio",
        xiaomiMiot: "Xiaomi Miot",
        showTimer: "Afficher la minuterie",
        showChildLock: "Afficher le verrouillage enfant",
        showLed: "Afficher la LED",
        showBuzzer: "Afficher l'avertisseur",
        showIonizer: "Afficher l'ioniseur",
        manual: "Manuel",
        show: "Afficher",
        variant: "Variante",
        below: "Dessous",
        side: "Côté",
        one: "Un",
        two: "Deux",
        order: "Ordre",
        styles: "Styles",
        card: "Carte",
        nudgeWithAngles: "Position avec angles",
        showTimerWhenOff: "Afficher la minuterie lorsque le ventilateur est éteint",
        airflowControls: "Commandes du flux d'air",
        positionControls: "Commandes de position",
        horizontalAngleEntity: "Entité de l'angle horizontal",
        verticalSwingEntity: "Entité d'oscillation verticale",
        verticalAngleEntity: "Entité de l'angle vertical",
        favoriteLevelEntity: "Entité du niveau favori",
        sleepModeEntity: "Entité du mode sommeil",
        timerEntity: "Entité de la minuterie",
        childLockEntity: "Entité du verrouillage enfant",
        ledEntity: "Entité LED",
        buzzerEntity: "Entité de l'avertisseur",
        ionizerEntity: "Entité de l'ioniseur",
        temperatureEntity: "Entité de température",
        humidityEntity: "Entité d'humidité",
        accent: "Couleur d'accent",
        background: "Arrière-plan",
        border: "Bordure",
        borderRadius: "Rayon de bordure",
        color: "Couleur",
        fontSize: "Taille de police",
        gap: "Espacement",
        height: "Hauteur",
        padding: "Marge intérieure",
        shadow: "Ombre",
        size: "Taille",
        angles: "Angles et position",
        helperIntegration: "La détection automatique suit l'entité du ventilateur. Ne la remplacez que si l'intégration détectée est incorrecte.",
        helperSelectionMode: "Présentation des niveaux et des préréglages : des boutons pour quelques options, une liste pour beaucoup.",
        helperTimerMode: "Une liste avec tous les paliers, ou un bouton qui les fait défiler.",
        helperAngleMode: "Une liste des angles pris en charge, ou un bouton qui les fait défiler.",
        helperNudgeWithAngles: "Garder le pavé directionnel visible même lorsque les sélecteurs d'angle sont affichés.",
        helperTheme: "Traitement prédéfini des surfaces, des angles et de la typographie pour toute la carte.",
        helperDensity: "Le mode compact réduit les espacements tout en conservant des cibles tactiles de 44 px.",
        helperColumns: "Colonnes du panneau de fonctions. Auto suit la largeur de la carte.",
        helperOrder: "Les blocs s'affichent dans l'ordre choisi ici. Les blocs non sélectionnés sont ajoutés à la fin.",
        helperStyles: "Valeurs CSS facultatives par bloc. Laissez un champ vide pour suivre le thème Home Assistant.",
    },
    it: {
        off: "Spento",
        on: "Acceso",
        hoursMinutes: "{hours} h {minutes} min",
        hoursOnly: "{hours} h",
        minutesOnly: "{minutes} min",
        chooseFanEntity: "Seleziona un'entità ventilatore nell'editor della scheda.",
        fanEntityUnavailable: "Entità ventilatore non disponibile: {entity}",
        fanCommandFailed: "Il comando del ventilatore non ha funzionato.",
        open: "Apri {title}",
        xiaomiAirCirculation: "CIRCOLAZIONE DELL'ARIA XIAOMI",
        naturalBreeze: "Brezza naturale",
        straightAirflow: "Flusso d'aria diretto",
        running: "In funzione",
        standby: "Standby",
        fanStatus: "Stato del ventilatore",
        unavailable: "Non disponibile",
        horizontalAngleValue: "Angolo orizzontale di {value} gradi",
        verticalAngleValue: "Angolo verticale di {value} gradi",
        turnFanOff: "Spegni il ventilatore",
        turnFanOn: "Accendi il ventilatore",
        airflow: "FLUSSO D'ARIA",
        speedLevel: "Livello velocità {level}",
        fanSpeedPercentage: "Percentuale velocità ventilatore",
        speedLevels: "Livelli velocità",
        setSpeedLevel: "Imposta livello velocità {level}",
        horizontal: "Orizzontale",
        vertical: "Verticale",
        sleep: "Riposo",
        cycle: "Ciclo",
        mode: "Modalità",
        normal: "Normale",
        natural: "Naturale",
        presetMode: "Modalità preimpostata",
        horizontalAngle: "Angolo orizzontale",
        verticalAngle: "Angolo verticale",
        position: "Posizione",
        moveFanUp: "Sposta il ventilatore in alto",
        moveFanLeft: "Sposta il ventilatore a sinistra",
        moveFanRight: "Sposta il ventilatore a destra",
        moveFanDown: "Sposta il ventilatore in basso",
        direction: "Direzione",
        forward: "Avanti",
        reverse: "Indietro",
        favoriteLevel: "Livello preferito",
        timer: "Timer",
        childLock: "Blocco bambini",
        led: "LED",
        buzzer: "Cicalino",
        ionizer: "Ionizzatore",
        fanFeatures: "Funzioni del ventilatore",
        header: "Intestazione",
        full: "Completo",
        compact: "Compatto",
        eyebrow: "Etichetta",
        name: "Nome",
        status: "Stato",
        model: "Modello",
        visual: "Vista",
        graphic: "Grafica",
        power: "Alimentazione",
        speed: "Velocità",
        details: "Dettagli",
        animation: "Animazione",
        enabled: "Abilitata",
        disabled: "Disabilitata",
        controls: "Controlli",
        slider: "Cursore",
        levels: "Livelli",
        modes: "Modalità",
        preset: "Preimpostazione",
        swing: "Oscillazione",
        nudge: "Posizione",
        favorite: "Preferito",
        layout: "Layout",
        density: "Densità",
        comfortable: "Comoda",
        columns: "Colonne",
        relatedEntities: "Entità correlate",
        buttons: "Pulsanti",
        select: "Selettore",
        selectionMode: "Modalità di selezione",
        timerMode: "Controllo timer",
        angleMode: "Controllo angolo",
        temperature: "Temperatura",
        humidity: "Umidità",
        editorFanEntity: "Entità ventilatore",
        cardName: "Nome della scheda",
        visualTheme: "Tema visivo",
        auto: "Automatico",
        mushroom: "Mushroom",
        minimal: "Minimale",
        glass: "Vetro",
        industrial: "Industriale",
        integration: "Integrazione",
        autoDetect: "Rilevamento automatico",
        standardFan: "Ventilatore standard",
        nativeXiaomiHome: "Xiaomi Home nativo (xiaomi_miio)",
        xiaomiMiioFan: "Ventilatore Xiaomi Miio",
        xiaomiMiot: "Xiaomi Miot",
        showTimer: "Mostra timer",
        showChildLock: "Mostra blocco bambini",
        showLed: "Mostra LED",
        showBuzzer: "Mostra cicalino",
        showIonizer: "Mostra ionizzatore",
        manual: "Manuale",
        show: "Mostra",
        variant: "Variante",
        below: "Sotto",
        side: "Lato",
        one: "Uno",
        two: "Due",
        order: "Ordine",
        styles: "Stili",
        card: "Scheda",
        nudgeWithAngles: "Posizione con angoli",
        showTimerWhenOff: "Mostra timer quando spento",
        airflowControls: "Controlli del flusso d'aria",
        positionControls: "Controlli posizione",
        horizontalAngleEntity: "Entità angolo orizzontale",
        verticalSwingEntity: "Entità oscillazione verticale",
        verticalAngleEntity: "Entità angolo verticale",
        favoriteLevelEntity: "Entità livello preferito",
        sleepModeEntity: "Entità modalità riposo",
        timerEntity: "Entità timer",
        childLockEntity: "Entità blocco bambini",
        ledEntity: "Entità LED",
        buzzerEntity: "Entità cicalino",
        ionizerEntity: "Entità ionizzatore",
        temperatureEntity: "Entità temperatura",
        humidityEntity: "Entità umidità",
        accent: "Colore accento",
        background: "Sfondo",
        border: "Bordo",
        borderRadius: "Raggio bordo",
        color: "Colore",
        fontSize: "Dimensione carattere",
        gap: "Spaziatura",
        height: "Altezza",
        padding: "Spaziatura interna",
        shadow: "Ombra",
        size: "Dimensione",
        angles: "Angoli e posizione",
        helperIntegration: "Il rilevamento automatico segue l'entità del ventilatore. Cambialo solo se rileva l'integrazione sbagliata.",
        helperSelectionMode: "Come vengono mostrati livelli e preset: pulsanti con poche opzioni, elenco con molte.",
        helperTimerMode: "Un elenco con tutti i passi, oppure un pulsante che li scorre.",
        helperAngleMode: "Un elenco degli angoli supportati, oppure un pulsante che li scorre.",
        helperNudgeWithAngles: "Mantieni visibile il pad direzionale anche quando sono mostrati i selettori di angolo.",
        helperTheme: "Trattamento predefinito di superfici, angoli e tipografia per tutta la scheda.",
        helperDensity: "La modalità compatta riduce gli spazi mantenendo aree di tocco da 44 px.",
        helperColumns: "Colonne del pannello funzioni. Auto segue la larghezza della scheda.",
        helperOrder: "I blocchi vengono mostrati nell'ordine scelto qui. Quelli non selezionati vengono aggiunti alla fine.",
        helperStyles: "Valori CSS opzionali per blocco. Lascia il campo vuoto per seguire il tema di Home Assistant.",
    },
};
const isSupportedLanguage = (language) => Object.prototype.hasOwnProperty.call(TRANSLATIONS, language);
const baseLanguage = (language) => language?.trim().toLowerCase().replace("_", "-").split("-")[0] ?? "en";
const createTranslator = (language) => {
    const normalizedLanguage = baseLanguage(language);
    const dictionary = isSupportedLanguage(normalizedLanguage) ? TRANSLATIONS[normalizedLanguage] : TRANSLATIONS.en;
    return (key, values) => {
        const template = dictionary[key] ?? TRANSLATIONS.en[key];
        if (!values || Object.keys(values).length === 0) {
            return template;
        }
        return template.replace(/\{(\w+)\}/g, (placeholder, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder);
    };
};

const FIELD_TRANSLATIONS = {
    entity: "editorFanEntity",
    name: "cardName",
    integration: "integration",
    header: "header",
    visual: "visual",
    controls: "controls",
    details: "details",
    layout: "layout",
    styles: "styles",
    related_entities: "relatedEntities",
    speed: "speed",
    modes: "modes",
    oscillation: "swing",
    angles: "angles",
    features: "fanFeatures",
    show: "show",
    variant: "variant",
    show_eyebrow: "eyebrow",
    show_name: "name",
    show_status: "status",
    show_mode: "mode",
    show_model: "model",
    show_graphic: "graphic",
    show_power: "power",
    show_speed: "speed",
    show_details: "details",
    animation: "animation",
    show_speed_slider: "slider",
    show_speed_levels: "levels",
    show_modes: "modes",
    show_preset_mode: "preset",
    show_horizontal_swing: "swing",
    show_vertical_swing: "swing",
    show_sleep: "sleep",
    show_cycle: "cycle",
    show_horizontal_angle: "horizontalAngle",
    show_vertical_angle: "verticalAngle",
    show_nudge: "nudge",
    show_nudge_with_angles: "nudgeWithAngles",
    show_direction: "direction",
    show_favorite_level: "favorite",
    show_timer: "showTimer",
    show_timer_when_off: "showTimerWhenOff",
    show_child_lock: "showChildLock",
    show_led: "showLed",
    show_buzzer: "showBuzzer",
    show_ionizer: "showIonizer",
    selection_mode: "selectionMode",
    timer_mode: "timerMode",
    angle_mode: "angleMode",
    position: "position",
    show_temperature: "temperature",
    show_humidity: "humidity",
    theme: "visualTheme",
    density: "density",
    columns: "columns",
    order: "order",
    card: "card",
    accent: "accent",
    background: "background",
    border: "border",
    border_radius: "borderRadius",
    color: "color",
    font_size: "fontSize",
    gap: "gap",
    height: "height",
    padding: "padding",
    shadow: "shadow",
    size: "size",
    horizontal_angle_entity: "horizontalAngleEntity",
    vertical_swing_entity: "verticalSwingEntity",
    vertical_angle_entity: "verticalAngleEntity",
    favorite_level_entity: "favoriteLevelEntity",
    sleep_mode_entity: "sleepModeEntity",
    timer_entity: "timerEntity",
    child_lock_entity: "childLockEntity",
    led_entity: "ledEntity",
    buzzer_entity: "buzzerEntity",
    ionizer_entity: "ionizerEntity",
    temperature_entity: "temperatureEntity",
    humidity_entity: "humidityEntity",
};
const FIELD_HELPERS = {
    integration: "helperIntegration",
    selection_mode: "helperSelectionMode",
    timer_mode: "helperTimerMode",
    angle_mode: "helperAngleMode",
    show_nudge_with_angles: "helperNudgeWithAngles",
    theme: "helperTheme",
    density: "helperDensity",
    columns: "helperColumns",
    order: "helperOrder",
    styles: "helperStyles",
};
const OPTION_TRANSLATIONS = {
    "integration.auto": "autoDetect",
    "integration.standard": "standardFan",
    "integration.xiaomi_miio": "nativeXiaomiHome",
    "integration.xiaomi_miio_fan": "xiaomiMiioFan",
    "integration.xiaomi_miot": "xiaomiMiot",
    "variant.full": "full",
    "variant.compact": "compact",
    "animation.auto": "auto",
    "animation.enabled": "enabled",
    "animation.disabled": "disabled",
    "selection_mode.auto": "auto",
    "selection_mode.buttons": "buttons",
    "selection_mode.select": "select",
    "timer_mode.cycle": "cycle",
    "timer_mode.select": "select",
    "angle_mode.cycle": "cycle",
    "angle_mode.select": "select",
    "position.below": "below",
    "position.side": "side",
    "theme.auto": "auto",
    "theme.mushroom": "mushroom",
    "theme.minimal": "minimal",
    "theme.glass": "glass",
    "theme.industrial": "industrial",
    "density.comfortable": "comfortable",
    "density.compact": "compact",
    "columns.auto": "auto",
    "columns.one": "one",
    "columns.two": "two",
    "order.header": "header",
    "order.visual": "visual",
    "order.airflow": "airflowControls",
    "order.position": "positionControls",
    "order.features": "fanFeatures",
};
class XiaomiFanCardEditor extends i$2 {
    constructor() {
        super(...arguments);
        this.config = normalizeCardConfig(DEFAULT_CONFIG);
        this.translatorLanguage = "";
        this.translator = createTranslator();
        this.computeLabel = (schema) => {
            const key = FIELD_TRANSLATIONS[schema.name];
            return key ? this.t(key) : schema.name;
        };
        this.computeHelper = (schema) => {
            const key = FIELD_HELPERS[schema.name];
            return key ? this.t(key) : undefined;
        };
        this.localizeValue = (key) => {
            const match = /^(.+)\.options\.([^.]*)$/.exec(key);
            if (!match) {
                return "";
            }
            const translationKey = OPTION_TRANSLATIONS[`${match[1]}.${match[2]}`];
            return translationKey ? this.t(translationKey) : "";
        };
        this.handleValueChanged = (event) => {
            event.stopPropagation();
            fireEvent(this, "config-changed", { config: event.detail.value });
        };
    }
    setConfig(config) {
        this.config = normalizeCardConfig(config);
    }
    render() {
        const { schema } = getConfigForm();
        return b `
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${schema}
        .computeLabel=${this.computeLabel}
        .computeHelper=${this.computeHelper}
        .localizeValue=${this.localizeValue}
        @value-changed=${this.handleValueChanged}
      ></ha-form>
    `;
    }
    t(key) {
        const language = this.hass?.language ?? "";
        if (language !== this.translatorLanguage) {
            this.translatorLanguage = language;
            this.translator = createTranslator(language);
        }
        return this.translator(key);
    }
}
__decorate([
    n$1({ attribute: false })
], XiaomiFanCardEditor.prototype, "hass", void 0);
__decorate([
    r()
], XiaomiFanCardEditor.prototype, "config", void 0);
if (!customElements.get("xiaomi-fan-card-editor")) {
    customElements.define("xiaomi-fan-card-editor", XiaomiFanCardEditor);
}

const suffixes = {
    sleepMode: ["_sleep_mode"],
    verticalSwing: ["_vertical_swing", "_vertical_oscillate", "_vertical_oscillation"],
    horizontalAngle: ["_oscillation_angle", "_horizontal_swing_angle", "_swing_mode_angle", "_horizontal_angle"],
    verticalAngle: ["_vertical_oscillation_angle", "_vertical_swing_angle", "_vertical_angle"],
    favoriteLevel: ["_favorite_level", "_favorite_speed"],
    timer: ["_delay_off_countdown", "_delay_time", "_power_off_time", "_timer"],
    childLock: ["_child_lock"],
    led: ["_led", "_led_brightness", "_light"],
    buzzer: ["_buzzer", "_notification_sound"],
    ionizer: ["_anion", "_ionizer"],
    temperature: ["_temperature"],
    humidity: ["_humidity"],
};
const findBySuffix = (entries, allowedDomains, wantedSuffixes) => {
    const candidates = entries.filter((entry) => {
        const [domain] = entry.entity_id.split(".");
        return domain !== undefined && allowedDomains.includes(domain);
    });
    const exact = candidates.find((entry) => wantedSuffixes.some((suffix) => entry.entity_id.endsWith(suffix)));
    if (exact) {
        return exact.entity_id;
    }
    const hintGroups = wantedSuffixes.map((suffix) => suffix.split("_").filter((part) => part.length > 2));
    return candidates.find((entry) => {
        const searchable = `${entry.entity_id} ${entry.name ?? ""} ${entry.original_name ?? ""}`.toLowerCase();
        return hintGroups.some((hints) => hints.every((hint) => searchable.includes(hint.toLowerCase())));
    })?.entity_id;
};
/**
 * A translated Home Assistant install names sensors in the user language, so a
 * suffix table would need one entry per locale. The device class is the same
 * in every language and only falls back to the suffix search when missing.
 */
const findSensorByDeviceClass = (hass, entries, deviceClass, fallbackSuffixes) => {
    const match = entries.find((entry) => {
        if (!entry.entity_id.startsWith("sensor.")) {
            return false;
        }
        const registered = entry.device_class ?? entry.original_device_class;
        return registered === deviceClass || hass.states[entry.entity_id]?.attributes["device_class"] === deviceClass;
    });
    return match?.entity_id ?? findBySuffix(entries, ["sensor"], fallbackSuffixes);
};
/**
 * Resolves to undefined when the registry lookup itself failed, which is what
 * a reconnecting Home Assistant looks like. Callers keep their previous result
 * in that case instead of collapsing to an empty device.
 */
const resolveRelatedEntities = async (hass, entityId) => {
    if (!hass.callWS) {
        return {};
    }
    try {
        const registry = await hass.callWS({ type: "config/entity_registry/list" });
        const primary = registry.find((entry) => entry.entity_id === entityId);
        if (!primary?.device_id) {
            return {};
        }
        const entries = registry.filter((entry) => entry.device_id === primary.device_id);
        const related = {};
        const numeric = ["number", "input_number"];
        const angle = [...numeric, "select"];
        const boolean = ["switch", "input_boolean"];
        const select = ["select"];
        // The vertical angle resolves first and then drops out of the remaining
        // searches: `_vertical_oscillation_angle` also ends with the horizontal
        // `_oscillation_angle`, and both angle names contain the vertical swing
        // hints once a `select` angle entity is allowed.
        related.verticalAngle = findBySuffix(entries, angle, suffixes.verticalAngle);
        const withoutVerticalAngle = entries.filter((entry) => entry.entity_id !== related.verticalAngle);
        related.horizontalAngle = findBySuffix(withoutVerticalAngle, angle, suffixes.horizontalAngle);
        const withoutAngles = withoutVerticalAngle.filter((entry) => entry.entity_id !== related.horizontalAngle);
        related.sleepMode = findBySuffix(withoutAngles, [...boolean, "select"], suffixes.sleepMode);
        related.verticalSwing = findBySuffix(withoutAngles, [...boolean, "select"], suffixes.verticalSwing);
        related.favoriteLevel = findBySuffix(entries, numeric, suffixes.favoriteLevel);
        related.timer = findBySuffix(entries, numeric, suffixes.timer);
        related.childLock = findBySuffix(entries, [...boolean, ...select], suffixes.childLock);
        related.led = findBySuffix(entries, [...boolean, ...select, ...numeric], suffixes.led);
        related.buzzer = findBySuffix(entries, [...boolean, ...select], suffixes.buzzer);
        related.ionizer = findBySuffix(entries, [...boolean, ...select], suffixes.ionizer);
        related.temperature = findSensorByDeviceClass(hass, entries, "temperature", suffixes.temperature);
        related.humidity = findSensorByDeviceClass(hass, entries, "humidity", suffixes.humidity);
        return related;
    }
    catch {
        return undefined;
    }
};

const getAirflowAxis = (horizontal, vertical) => {
    if (horizontal && vertical) {
        return "dual";
    }
    if (horizontal) {
        return "horizontal";
    }
    if (vertical) {
        return "vertical";
    }
    return "still";
};

const TIMER_STEPS = [0, 60, 120, 180, 240, 300, 360, 420, 480];
const STYLE_VARIABLES = {
    accent: "accent",
    background: "background",
    border: "border",
    border_radius: "border-radius",
    color: "color",
    font_size: "font-size",
    gap: "gap",
    height: "height",
    padding: "padding",
    shadow: "shadow",
    size: "size",
};
/**
 * Accent drives every tint through color-mix, so it has to land on the shared
 * variable instead of a block scoped one, and inline styles are what lets it
 * win over a theme class.
 */
const GLOBAL_STYLE_VARIABLES = {
    accent: "--fan-accent",
};
const asHassLike = (hass) => hass;
const styleMapFor = (group, prefix) => Object.entries(group).reduce((styles, [key, value]) => {
    const token = key;
    const variable = STYLE_VARIABLES[token];
    if (variable && typeof value === "string") {
        styles[GLOBAL_STYLE_VARIABLES[token] ?? `--${prefix}-${variable}`] = value;
    }
    return styles;
}, {});
class XiaomiFanCard extends i$2 {
    constructor() {
        super(...arguments);
        this.config = normalizeCardConfig(DEFAULT_CONFIG);
        this.services = { loaded: false, names: new Set() };
        this.related = {};
        this.actionError = "";
        this.speedDragging = false;
        this.serviceLoadKey = "";
        this.loadRequestId = 0;
        this.retryDelay = 0;
        this.translatorLanguage = "";
        this.translator = createTranslator();
        this.onPercentagePreview = (event) => {
            this.speedDragging = true;
            this.speedPreview = Number(event.currentTarget.value);
        };
        this.onHeaderClick = () => {
            if (this.hass && this.config) {
                handleAction(this, this.hass, this.config);
            }
        };
    }
    static getConfigElement() {
        return document.createElement("xiaomi-fan-card-editor");
    }
    static getConfigForm() {
        return getConfigForm();
    }
    static getStubConfig() {
        return {
            ...DEFAULT_CONFIG,
            name: "Xiaomi Fan",
        };
    }
    getCardSize() {
        return this.estimatedRows();
    }
    getGridOptions() {
        const rows = this.estimatedRows();
        return { columns: 12, rows, min_columns: 6, min_rows: Math.min(rows, 2) };
    }
    setConfig(config) {
        const entity = config?.entity ?? config?.entity_id;
        if (!config || !entity) {
            throw new Error("Missing required fan entity.");
        }
        const nextConfig = normalizeCardConfig({ ...config, entity });
        const loaderChanged = this.config.entity !== nextConfig.entity ||
            this.config.integration !== nextConfig.integration ||
            this.relatedConfigKey(this.config) !== this.relatedConfigKey(nextConfig);
        this.config = nextConfig;
        if (loaderChanged) {
            this.serviceLoadKey = "";
            this.related = {};
            this.loadRequestId += 1;
        }
    }
    shouldUpdate(changedProperties) {
        if (!this.config || !this.hass) {
            return false;
        }
        return (hasConfigOrEntityChanged(this, changedProperties, false) ||
            changedProperties.has("hass") ||
            changedProperties.has("services") ||
            changedProperties.has("related") ||
            changedProperties.has("actionError") ||
            changedProperties.has("speedPreview"));
    }
    updated(changedProperties) {
        if (changedProperties.has("hass") && this.speedPreview !== undefined && !this.speedDragging) {
            this.speedPreview = undefined;
        }
        const entityId = this.config.entity;
        const loadKey = `${entityId}:${this.config.integration ?? "auto"}`;
        if (!entityId || !this.hass || this.serviceLoadKey === loadKey) {
            return;
        }
        this.serviceLoadKey = loadKey;
        void this.loadCapabilities(entityId, loadKey);
    }
    connectedCallback() {
        super.connectedCallback();
        // A card that comes back from a suspended tab or a rebuilt view has to look
        // the service registry up again instead of trusting a stale lookup.
        this.serviceLoadKey = "";
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.clearCapabilityRetry();
    }
    async loadCapabilities(entityId, loadKey) {
        const hass = asHassLike(this.hass);
        const requestId = ++this.loadRequestId;
        const shouldLoadCustomServices = this.config.integration !== "standard";
        const [services, discovered] = await Promise.all([
            shouldLoadCustomServices
                ? loadServiceAvailability(hass)
                : Promise.resolve({ loaded: true, names: new Set() }),
            resolveRelatedEntities(hass, entityId),
        ]);
        // hass is replaced on every state update, so only the request, the entity,
        // and the loader key decide whether this answer is still wanted.
        if (requestId !== this.loadRequestId || this.config.entity !== entityId || this.serviceLoadKey !== loadKey) {
            return;
        }
        if (!services.loaded || discovered === undefined) {
            // Home Assistant was unreachable. Keeping the previous capabilities stops
            // the card from degrading to a plain fan until the retry succeeds.
            this.scheduleCapabilityRetry(entityId, loadKey);
            return;
        }
        this.clearCapabilityRetry();
        this.services = services;
        this.related = this.withConfiguredRelatedEntities(discovered);
    }
    scheduleCapabilityRetry(entityId, loadKey) {
        if (this.retryTimer !== undefined) {
            return;
        }
        this.retryDelay = Math.min(this.retryDelay === 0 ? 2000 : this.retryDelay * 2, 30000);
        this.retryTimer = setTimeout(() => {
            this.retryTimer = undefined;
            if (this.config.entity !== entityId || this.serviceLoadKey !== loadKey || !this.hass) {
                return;
            }
            void this.loadCapabilities(entityId, loadKey);
        }, this.retryDelay);
    }
    clearCapabilityRetry() {
        if (this.retryTimer !== undefined) {
            clearTimeout(this.retryTimer);
            this.retryTimer = undefined;
        }
        this.retryDelay = 0;
    }
    render() {
        if (!this.hass || !this.config?.entity) {
            return b `<ha-card><div class="empty">${this.t("chooseFanEntity")}</div></ha-card>`;
        }
        const adapter = createFanAdapter(asHassLike(this.hass), this.config.entity, this.services, this.config.integration, this.related);
        if (!adapter.state.available) {
            return b `
        <ha-card class="card ${this.themeClass}">
          <div class="empty" role="status">
            <ha-icon icon="mdi:fan-alert"></ha-icon>
            <span>${this.t("fanEntityUnavailable", { entity: this.config.entity })}</span>
          </div>
        </ha-card>
      `;
        }
        const sections = {
            header: this.config.header.show ? this.renderHeader(adapter) : b ``,
            visual: this.config.visual.show ? this.renderVisual(adapter) : b ``,
            airflow: this.config.controls.show ? this.renderAirflowControls(adapter) : b ``,
            position: this.config.controls.show ? this.renderPositionControls(adapter) : b ``,
            features: this.config.controls.show ? this.renderFeatureControls(adapter) : b ``,
        };
        return b `
      <ha-card class="card ${this.themeClass}" style=${o(styleMapFor(this.config.styles.card, "fan-card"))}>
        ${this.config.layout.order.map((section) => sections[section])}
        ${this.actionError
            ? b `<div class="action-error" role="alert">
                <ha-icon icon="mdi:alert-circle-outline" aria-hidden="true"></ha-icon>
                <span>${this.actionError}</span>
              </div>`
            : ""}
      </ha-card>
    `;
    }
    get themeClass() {
        return [
            `theme-${this.config.layout.theme}`,
            `density-${this.config.layout.density}`,
            `columns-${this.config.layout.columns}`,
            `header-${this.config.header.variant}`,
        ].join(" ");
    }
    t(key, values) {
        const language = this.hass?.language ?? "";
        if (language !== this.translatorLanguage) {
            this.translatorLanguage = language;
            this.translator = createTranslator(language);
        }
        return this.translator(key, values);
    }
    displayTimer(minutes) {
        if (!minutes) {
            return this.t("off");
        }
        const hours = Math.floor(minutes / 60);
        const remainder = minutes % 60;
        return hours > 0
            ? remainder > 0
                ? this.t("hoursMinutes", { hours, minutes: remainder })
                : this.t("hoursOnly", { hours })
            : this.t("minutesOnly", { minutes: remainder });
    }
    estimatedRows() {
        const { header, visual, controls } = this.config;
        let rows = 1;
        if (header.show) {
            rows += header.variant === "full" ? 2 : 1;
        }
        if (visual.show && visual.show_graphic) {
            rows += 5;
        }
        else if (visual.show && visual.show_details) {
            rows += 1;
        }
        if (controls.show) {
            if (controls.show_speed_slider || controls.show_speed_levels) {
                rows += 3;
            }
            if (controls.show_modes) {
                rows += 2;
            }
            rows += 2;
        }
        return rows;
    }
    relatedUnit(kind, fallback) {
        const entityId = kind === "temperature"
            ? (this.config.temperature_entity ?? this.related.temperature)
            : (this.config.humidity_entity ?? this.related.humidity);
        const unit = entityId ? this.hass?.states[entityId]?.attributes["unit_of_measurement"] : undefined;
        return typeof unit === "string" && unit.trim() !== "" ? unit : fallback;
    }
    relatedAngleValue(axis, fallback) {
        const entityId = axis === "horizontal"
            ? (this.config.horizontal_angle_entity ?? this.related.horizontalAngle)
            : (this.config.vertical_angle_entity ?? this.related.verticalAngle);
        const raw = entityId ? this.hass?.states[entityId]?.state : undefined;
        return numericLabel(raw) ?? fallback;
    }
    withConfiguredRelatedEntities(discovered) {
        return {
            ...discovered,
            sleepMode: this.config.sleep_mode_entity ?? discovered.sleepMode,
            horizontalAngle: this.config.horizontal_angle_entity ?? discovered.horizontalAngle,
            verticalSwing: this.config.vertical_swing_entity ?? discovered.verticalSwing,
            verticalAngle: this.config.vertical_angle_entity ?? discovered.verticalAngle,
            favoriteLevel: this.config.favorite_level_entity ?? discovered.favoriteLevel,
            timer: this.config.timer_entity ?? discovered.timer,
            childLock: this.config.child_lock_entity ?? discovered.childLock,
            led: this.config.led_entity ?? discovered.led,
            buzzer: this.config.buzzer_entity ?? discovered.buzzer,
            ionizer: this.config.ionizer_entity ?? discovered.ionizer,
            temperature: this.config.temperature_entity ?? discovered.temperature,
            humidity: this.config.humidity_entity ?? discovered.humidity,
        };
    }
    relatedConfigKey(config) {
        return [
            config.horizontal_angle_entity,
            config.vertical_swing_entity,
            config.vertical_angle_entity,
            config.favorite_level_entity,
            config.sleep_mode_entity,
            config.timer_entity,
            config.child_lock_entity,
            config.led_entity,
            config.buzzer_entity,
            config.ionizer_entity,
            config.temperature_entity,
            config.humidity_entity,
        ]
            .map((value) => value ?? "")
            .join("|");
    }
    execute(action) {
        this.actionError = "";
        void action().catch((error) => {
            this.actionError = error instanceof Error ? error.message : this.t("fanCommandFailed");
        });
    }
    renderHeader(adapter) {
        const state = adapter.state;
        const title = this.config.name || state.friendlyName;
        const modeLabel = state.mode === "natural" ? this.t("naturalBreeze") : this.t("straightAirflow");
        const status = state.isOn ? this.t("running") : this.t("standby");
        return b `
      <header class="header" style=${o(styleMapFor(this.config.styles.header, "fan-header"))}>
        <button class="title-button" @click=${this.onHeaderClick} aria-label=${this.t("open", { title })}>
          ${
        // The eyebrow names a Xiaomi product line, so a generic fan entity
        // must never claim it even when the full header is active.
        this.config.header.show_eyebrow && adapter.capabilities.isXiaomi
            ? b `<span class="eyebrow">${this.t("xiaomiAirCirculation")}</span>`
            : ""}
          ${this.config.header.show_name ? b `<span class="title">${title}</span>` : ""}
          ${this.config.header.show_status || this.config.header.show_mode
            ? b `
                  <span class="subtitle">
                    ${this.config.header.show_status
                ? b `<span class="status-dot ${state.isOn ? "on" : ""}"></span>${status}`
                : ""}
                    ${this.config.header.show_mode ? b `<span>${modeLabel}</span>` : ""}
                  </span>
                `
            : ""}
        </button>
        ${this.config.header.show_model && adapter.profile.known
            ? b `<span class="model-badge">${adapter.profile.model?.split(".").at(-1) ?? "XIAOMI"}</span>`
            : ""}
      </header>
    `;
    }
    renderVisual(adapter) {
        const state = adapter.state;
        const speed = this.speedPreview ?? (state.isOn ? state.percentage : 0);
        const style = `--speed:${speed}; --spin-duration:${Math.max(1.8, 12 - speed / 11)}s;`;
        const axis = getAirflowAxis(state.horizontalSwing, state.verticalSwing);
        const animationDisabled = this.config.disable_animation || this.config.visual.animation === "disabled";
        return b `
      <section
        class="visual-section details-${this.config.details.position} ${this.config.visual.show_graphic ? "details-with-graphic" : "details-only"}"
        aria-label=${this.t("fanStatus")}
        style=${o({
            ...(this.config.visual.size === undefined ? {} : { "--fan-visual-size": `${this.config.visual.size}px` }),
            ...styleMapFor(this.config.styles.visual, "fan-visual"),
        })}
      >
        ${this.config.visual.show_graphic
            ? b `
                <div
                  class="airflow-visual axis-${axis} ${state.isOn ? "running" : ""} ${animationDisabled ? "no-motion" : ""}"
                  style=${style}
                >
                  <div class="orbit orbit-one"></div>
                  <div class="orbit orbit-two"></div>
                  <div class="speed-ring" aria-hidden="true"></div>
                  <div class="wind wind-horizontal"></div>
                  <div class="wind wind-vertical"></div>
                  <div class="rotor" aria-hidden="true">
                    <span class="blade blade-one"></span>
                    <span class="blade blade-two"></span>
                    <span class="blade blade-three"></span>
                    <span class="blade blade-four"></span>
                    <span class="hub"></span>
                  </div>
                  ${this.config.visual.show_power
                ? b `
                          <button
                            class="power-button ${state.isOn ? "active" : ""}"
                            @click=${() => this.execute(() => adapter.togglePower())}
                            aria-label=${state.isOn ? this.t("turnFanOff") : this.t("turnFanOn")}
                            aria-pressed=${state.isOn}
                          >
                            <ha-icon icon="mdi:power"></ha-icon>
                          </button>
                        `
                : ""}
                  ${this.config.visual.show_speed
                ? b `
                          <span class="speed-readout">
                            <strong>${speed}%</strong>
                            <small>${this.t("airflow")}</small>
                          </span>
                        `
                : ""}
                </div>
              `
            : ""}
        ${this.config.visual.show_details ? this.renderDetails(adapter) : ""}
      </section>
    `;
    }
    renderDetails(adapter) {
        const state = adapter.state;
        const details = this.config.details;
        const horizontalAngle = this.relatedAngleValue("horizontal", state.horizontalAngle);
        const verticalAngle = this.relatedAngleValue("vertical", state.verticalAngle);
        if (!details.show) {
            return "";
        }
        const hasDetails = (details.show_horizontal_angle && adapter.capabilities.horizontalAngle && horizontalAngle !== undefined) ||
            (details.show_vertical_angle && adapter.capabilities.verticalAngle && verticalAngle !== undefined) ||
            (details.show_timer &&
                adapter.capabilities.timer &&
                (details.show_timer_when_off || Boolean(state.timerMinutes))) ||
            (details.show_temperature && state.temperature !== undefined) ||
            (details.show_humidity && state.humidity !== undefined);
        if (!hasDetails) {
            return "";
        }
        const temperatureUnit = this.relatedUnit("temperature", "°C");
        const humidityUnit = this.relatedUnit("humidity", "%");
        return b `
      <div class="visual-meta" role="list" style=${o(styleMapFor(this.config.styles.details, "fan-details"))}>
        ${details.show_horizontal_angle && adapter.capabilities.horizontalAngle && horizontalAngle !== undefined
            ? this.renderMetaItem("mdi:arrow-left-right", `${horizontalAngle}°`, this.t("horizontalAngleValue", { value: horizontalAngle }))
            : ""}
        ${details.show_vertical_angle && adapter.capabilities.verticalAngle && verticalAngle !== undefined
            ? this.renderMetaItem("mdi:swap-vertical", `${verticalAngle}°`, this.t("verticalAngleValue", { value: verticalAngle }))
            : ""}
        ${details.show_timer && (details.show_timer_when_off || Boolean(state.timerMinutes))
            ? this.renderMetaItem("mdi:timer-outline", this.displayTimer(state.timerMinutes), `${this.t("timer")}: ${this.displayTimer(state.timerMinutes)}`, Boolean(state.timerMinutes))
            : ""}
        ${details.show_temperature && state.temperature !== undefined
            ? this.renderMetaItem("mdi:thermometer", `${state.temperature}${temperatureUnit}`, `${this.t("temperature")}: ${state.temperature}${temperatureUnit}`)
            : ""}
        ${details.show_humidity && state.humidity !== undefined
            ? this.renderMetaItem("mdi:water-percent", `${state.humidity}${humidityUnit} RH`, `${this.t("humidity")}: ${state.humidity}${humidityUnit}`)
            : ""}
      </div>
    `;
    }
    renderMetaItem(icon, value, label, active = false) {
        return b `
      <span class="meta-item ${active ? "active" : ""}" role="listitem" aria-label=${label}>
        <ha-icon icon=${icon} aria-hidden="true"></ha-icon>
        <span class="meta-value">${value}</span>
      </span>
    `;
    }
    renderAirflowControls(adapter) {
        const state = adapter.state;
        const controls = this.config.controls;
        const levelLabels = Array.from({ length: adapter.capabilities.speedLevels }, (_, index) => index + 1);
        const useSpeedSelect = controls.selection_mode === "select" || (controls.selection_mode === "auto" && levelLabels.length > 5);
        const hasSpeedControls = controls.show_speed_slider || controls.show_speed_levels;
        const hasModeControls = controls.show_modes &&
            (adapter.capabilities.naturalMode ||
                (controls.show_preset_mode && state.availableModes.some((mode) => mode.toLowerCase() !== "off")));
        const hasChipControls = (controls.show_horizontal_swing && adapter.capabilities.horizontalSwing) ||
            (controls.show_vertical_swing && adapter.capabilities.verticalSwing) ||
            (controls.show_sleep && adapter.capabilities.sleepMode) ||
            (controls.show_cycle && adapter.capabilities.horizontalSwing && adapter.capabilities.verticalSwing);
        if (!hasSpeedControls && !hasModeControls && !hasChipControls) {
            return "";
        }
        // A stopped fan reports its last speed, which would otherwise make the
        // slider jump back to that value right after it was dragged to zero.
        const displayPercentage = this.speedPreview ?? (state.isOn ? state.percentage : 0);
        const displayLevel = this.speedPreview === undefined
            ? (state.isOn ? state.level : 0) || 0
            : Math.round((this.speedPreview / 100) * adapter.capabilities.speedLevels);
        return b `
      <section
        class="controls airflow-controls"
        aria-label=${this.t("airflow")}
        style=${o(styleMapFor(this.config.styles.controls, "fan-control"))}
      >
        ${controls.show_speed_slider || controls.show_speed_levels
            ? b `
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">${this.t("airflow")}</span>
                    <strong>${this.t("speedLevel", { level: displayLevel })}</strong>
                  </div>
                  <span class="value">${displayPercentage}%</span>
                </div>
              `
            : ""}
        ${controls.show_speed_slider
            ? b `
                <input
                  class="speed-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  .value=${String(displayPercentage)}
                  style=${o({ "--fan-speed-progress": String(displayPercentage) })}
                  @input=${this.onPercentagePreview}
                  @change=${(event) => this.onPercentageChange(event, adapter)}
                  aria-label=${this.t("fanSpeedPercentage")}
                  aria-valuetext="${displayPercentage}%"
                />
              `
            : ""}
        ${controls.show_speed_levels
            ? useSpeedSelect
                ? this.renderSpeedSelector(adapter, levelLabels)
                : b `
                  <div class="level-row" role="group" aria-label=${this.t("speedLevels")}>
                    ${levelLabels.map((level) => b `
                        <button
                          class="level-button ${displayLevel === level ? "selected" : ""}"
                          @click=${() => this.execute(() => adapter.setPercentage(Math.round((level / adapter.capabilities.speedLevels) * 100)))}
                          aria-label=${this.t("setSpeedLevel", { level })}
                          aria-pressed=${displayLevel === level}
                        >
                          ${level}
                        </button>
                      `)}
                  </div>
                `
            : ""}
        ${controls.show_modes ? this.renderModeControls(adapter) : ""}
        <div class="chip-row" ?hidden=${!hasChipControls} role="group" aria-label=${this.t("swing")}>
          ${controls.show_horizontal_swing && adapter.capabilities.horizontalSwing
            ? b `
                  <button
                    class="chip ${state.horizontalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setHorizontalSwing(!state.horizontalSwing))}
                    aria-pressed=${state.horizontalSwing}
                  >
                    <ha-icon icon="mdi:arrow-left-right"></ha-icon>
                    ${this.t("horizontal")}
                  </button>
                `
            : ""}
          ${controls.show_vertical_swing && adapter.capabilities.verticalSwing
            ? b `
                  <button
                    class="chip ${state.verticalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setVerticalSwing(!state.verticalSwing))}
                    aria-pressed=${state.verticalSwing}
                  >
                    <ha-icon icon="mdi:swap-vertical"></ha-icon>
                    ${this.t("vertical")}
                  </button>
                `
            : ""}
          ${controls.show_sleep && adapter.capabilities.sleepMode
            ? b `
                  <button
                    class="chip ${state.sleepMode ? "selected" : ""}"
                    @click=${() => this.execute(() => adapter.setSleepMode(!state.sleepMode))}
                    aria-pressed=${state.sleepMode}
                  >
                    <ha-icon icon="mdi:power-sleep"></ha-icon>
                    ${this.t("sleep")}
                  </button>
                `
            : ""}
          ${controls.show_cycle && adapter.capabilities.horizontalSwing && adapter.capabilities.verticalSwing
            ? b `
                  <button
                    class="chip ${state.horizontalSwing && state.verticalSwing ? "selected" : ""}"
                    @click=${() => this.execute(() => this.toggleCycle(adapter))}
                    aria-pressed=${state.horizontalSwing && state.verticalSwing}
                  >
                    <ha-icon icon="mdi:autorenew"></ha-icon>
                    ${this.t("cycle")}
                  </button>
                `
            : ""}
        </div>
      </section>
    `;
    }
    renderSpeedSelector(adapter, levels) {
        const current = adapter.state.level || levels[0] || 1;
        return b `
      <label class="feature-select speed-select">
        <span>${this.t("speedLevels")}</span>
        <select
          .value=${String(current)}
          aria-label=${this.t("speedLevels")}
          @change=${(event) => {
            const level = Number(event.currentTarget.value);
            this.execute(() => adapter.setPercentage(Math.round((level / adapter.capabilities.speedLevels) * 100)));
        }}
        >
          ${levels.map((level) => b `<option value=${level} ?selected=${level === current}>${this.t("speedLevel", { level })}</option>`)}
        </select>
      </label>
    `;
    }
    renderModeControls(adapter) {
        const state = adapter.state;
        const controls = this.config.controls;
        const availableModes = state.availableModes.filter((mode) => mode.toLowerCase() !== "off");
        const extraModes = availableModes.filter((mode) => {
            const normalized = mode.toLowerCase();
            return !(normalized.includes("natural") ||
                normalized.includes("nature") ||
                normalized.includes("normal") ||
                normalized.includes("straight") ||
                normalized.includes("manual") ||
                /^level\s*\d+$/i.test(mode));
        });
        if (adapter.capabilities.naturalMode && controls.show_modes) {
            return b `
        <div class="mode-section">
          <span class="control-label">${this.t("mode")}</span>
          <div class="mode-row" role="group" aria-label=${this.t("mode")}>
            <button
              class="mode-button ${state.mode === "normal" ? "selected" : ""}"
              @click=${() => this.execute(() => adapter.setMode("normal"))}
              aria-pressed=${state.mode === "normal"}
            >
              <span class="mode-icon"><ha-icon icon="mdi:weather-windy"></ha-icon></span>
              <span>${this.t("normal")}</span>
            </button>
            <button
              class="mode-button ${state.mode === "natural" ? "selected" : ""}"
              @click=${() => this.execute(() => adapter.setMode("natural"))}
              aria-pressed=${state.mode === "natural"}
            >
              <span class="mode-icon"><ha-icon icon="mdi:leaf"></ha-icon></span>
              <span>${this.t("natural")}</span>
            </button>
          </div>
        </div>
        ${controls.show_preset_mode && extraModes.length > 0 ? this.renderPresetChoices(adapter, extraModes) : ""}
      `;
        }
        if (!controls.show_preset_mode || availableModes.length === 0) {
            return "";
        }
        return this.renderPresetChoices(adapter, availableModes);
    }
    renderPresetChoices(adapter, modes) {
        const useButtons = this.config.controls.selection_mode === "buttons" ||
            (this.config.controls.selection_mode === "auto" && modes.length <= 4);
        if (useButtons) {
            return b `
        <div class="preset-section">
          <span class="control-label">${this.t("presetMode")}</span>
          <div class="preset-row" role="group" aria-label=${this.t("presetMode")}>
            ${modes.map((mode) => b `
                <button
                  class="preset-button ${adapter.state.presetMode === mode ? "selected" : ""}"
                  @click=${() => this.execute(() => adapter.setPresetMode(mode))}
                  aria-pressed=${adapter.state.presetMode === mode}
                >
                  ${mode}
                </button>
              `)}
          </div>
        </div>
      `;
        }
        return this.renderPresetSelector(adapter, modes);
    }
    renderPresetSelector(adapter, modes) {
        const current = adapter.state.presetMode ?? modes[0] ?? "";
        return b `
      <label class="feature-select mode-select">
        <span>${this.t("presetMode")}</span>
        <select
          .value=${current}
          aria-label=${this.t("presetMode")}
          @change=${(event) => this.execute(() => adapter.setPresetMode(event.currentTarget.value))}
        >
          ${modes.map((mode) => b `<option value=${mode} ?selected=${mode === current}>${mode}</option>`)}
        </select>
      </label>
    `;
    }
    renderPositionControls(adapter) {
        const state = adapter.state;
        const controls = this.config.controls;
        const horizontalAngle = this.relatedAngleValue("horizontal", state.horizontalAngle);
        const verticalAngle = this.relatedAngleValue("vertical", state.verticalAngle);
        const angleFeatures = [];
        const nudgeFeatures = [];
        if (controls.show_horizontal_angle && adapter.capabilities.horizontalAngle) {
            const angles = adapter.capabilities.horizontalAngles;
            angleFeatures.push(controls.angle_mode === "cycle" && angles.length > 0
                ? this.renderAngleCycleButton(this.t("horizontalAngle"), horizontalAngle, angles, (angle) => this.execute(() => adapter.setHorizontalAngle(angle)), "mdi:arrow-left-right")
                : this.renderAngleControl(this.t("horizontalAngle"), horizontalAngle, angles, (angle) => this.execute(() => adapter.setHorizontalAngle(angle)), adapter.capabilities.horizontalAngleSpec));
        }
        if (controls.show_vertical_angle && adapter.capabilities.verticalAngle) {
            const angles = adapter.capabilities.verticalAngles;
            angleFeatures.push(controls.angle_mode === "cycle" && angles.length > 0
                ? this.renderAngleCycleButton(this.t("verticalAngle"), verticalAngle, angles, (angle) => this.execute(() => adapter.setVerticalAngle(angle)), "mdi:swap-vertical")
                : this.renderAngleControl(this.t("verticalAngle"), verticalAngle, angles, (angle) => this.execute(() => adapter.setVerticalAngle(angle)), adapter.capabilities.verticalAngleSpec));
        }
        const hasAutomaticAngle = (controls.show_horizontal_angle && adapter.capabilities.horizontalAngle) ||
            (controls.show_vertical_angle && adapter.capabilities.verticalAngle);
        if (controls.show_nudge &&
            adapter.capabilities.directionNudge &&
            (!hasAutomaticAngle || controls.show_nudge_with_angles)) {
            nudgeFeatures.push(b `
        <div class="nudge-control">
          <span>${this.t("position")}</span>
          <div class="nudge-grid">
            <button @click=${() => this.execute(() => adapter.nudge("up"))} aria-label=${this.t("moveFanUp")}>
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("left"))} aria-label=${this.t("moveFanLeft")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("right"))} aria-label=${this.t("moveFanRight")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            <button @click=${() => this.execute(() => adapter.nudge("down"))} aria-label=${this.t("moveFanDown")}>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </button>
          </div>
        </div>
      `);
        }
        if (angleFeatures.length === 0 && nudgeFeatures.length === 0) {
            return "";
        }
        const hasTwoColumns = angleFeatures.length > 0 && nudgeFeatures.length > 0;
        return b `
      <div
        class="angle-layout ${hasTwoColumns ? "two-column" : "single-column"}"
        style=${o(styleMapFor(this.config.styles.controls, "fan-control"))}
      >
        ${angleFeatures.length > 0
            ? b `<section class="controls angle-controls" aria-label=${this.t("angleMode")}>
                ${angleFeatures}
              </section>`
            : ""}
        ${nudgeFeatures.length > 0
            ? b `<section class="controls nudge-controls" aria-label=${this.t("position")}>${nudgeFeatures}</section>`
            : ""}
      </div>
    `;
    }
    renderFeatureControls(adapter) {
        const state = adapter.state;
        const controls = this.config.controls;
        const features = [];
        if (controls.show_direction && adapter.capabilities.direction && !adapter.capabilities.directionNudge) {
            const direction = state.direction === "reverse" ? "forward" : "reverse";
            features.push(b `
        <button class="feature-button" @click=${() => this.execute(() => adapter.setDirection(direction))}>
          <ha-icon icon="mdi:rotate-orbit"></ha-icon>
          <span>
            <small>${this.t("direction")}</small>
            <strong>${state.direction === "reverse" ? this.t("reverse") : this.t("forward")}</strong>
          </span>
        </button>
      `);
        }
        if (controls.show_favorite_level && adapter.capabilities.favoriteLevel) {
            features.push(b `
        <label class="feature-select">
          <span>${this.t("favoriteLevel")}</span>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            .value=${String(adapter.state.favoriteLevel ?? adapter.state.level ?? 1)}
            @change=${(event) => this.execute(() => adapter.setFavoriteLevel(Number(event.currentTarget.value)))}
          />
        </label>
      `);
        }
        if (controls.show_timer && adapter.capabilities.timer) {
            features.push(controls.timer_mode === "select"
                ? this.renderTimerSelector(adapter, state.timerMinutes, adapter.capabilities.timerSteps ?? TIMER_STEPS)
                : this.renderTimerCycleButton(adapter, state.timerMinutes, adapter.capabilities.timerSteps));
        }
        if (controls.show_child_lock && adapter.capabilities.childLock) {
            features.push(b `
        <button
          class="feature-button ${state.childLock ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setChildLock(!state.childLock))}
        >
          <ha-icon icon="mdi:lock${state.childLock ? "" : "-open-outline"}"></ha-icon>
          <span>
            <small>${this.t("childLock")}</small><strong>${state.childLock ? this.t("on") : this.t("off")}</strong>
          </span>
        </button>
      `);
        }
        if (controls.show_led && adapter.capabilities.led) {
            features.push(b `
        <button
          class="feature-button ${state.led ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setLed(!state.led))}
        >
          <ha-icon icon="mdi:led-outline"></ha-icon>
          <span><small>${this.t("led")}</small><strong>${state.led ? this.t("on") : this.t("off")}</strong></span>
        </button>
      `);
        }
        if (controls.show_buzzer && adapter.capabilities.buzzer) {
            features.push(b `
        <button
          class="feature-button ${state.buzzer ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setBuzzer(!state.buzzer))}
        >
          <ha-icon icon="mdi:bell-outline"></ha-icon>
          <span><small>${this.t("buzzer")}</small><strong>${state.buzzer ? this.t("on") : this.t("off")}</strong></span>
        </button>
      `);
        }
        if (controls.show_ionizer && adapter.capabilities.ionizer) {
            features.push(b `
        <button
          class="feature-button ${state.ionizer ? "selected" : ""}"
          @click=${() => this.execute(() => adapter.setIonizer(!state.ionizer))}
        >
          <ha-icon icon="mdi:air-filter"></ha-icon>
          <span>
            <small>${this.t("ionizer")}</small><strong>${state.ionizer ? this.t("on") : this.t("off")}</strong>
          </span>
        </button>
      `);
        }
        return features.length > 0
            ? b `<section
          class="controls feature-controls"
          aria-label=${this.t("fanFeatures")}
          style=${o(styleMapFor(this.config.styles.controls, "fan-control"))}
        >
          ${features}
        </section>`
            : "";
    }
    renderTimerCycleButton(adapter, current, steps) {
        const nextTimer = this.nextTimer(current, steps);
        return b `
      <button
        class="feature-button ${current ? "selected" : ""}"
        @click=${() => this.execute(() => adapter.setTimer(nextTimer))}
      >
        <ha-icon icon="mdi:timer-outline"></ha-icon>
        <span><small>${this.t("timer")}</small><strong>${this.displayTimer(current)}</strong></span>
      </button>
    `;
    }
    renderAngleCycleButton(label, current, angles, onChange, icon) {
        const nextAngle = this.nextAngle(current, angles);
        return b `
      <button class="feature-button angle-cycle-button" @click=${() => onChange(nextAngle)}>
        <ha-icon icon=${icon}></ha-icon>
        <span>
          <small>${label}</small>
          <strong>${current !== undefined ? `${current}°` : this.t("unavailable")}</strong>
        </span>
      </button>
    `;
    }
    nextAngle(current, angles) {
        return angles.find((angle) => angle > (current ?? -Infinity)) ?? angles[0] ?? current ?? 0;
    }
    renderTimerSelector(adapter, current, steps) {
        const options = steps.includes(current ?? 0) ? steps : [...steps, current ?? 0].sort((left, right) => left - right);
        return b `
      <label class="feature-select timer-select ${current ? "selected" : ""}">
        <span>${this.t("timer")}</span>
        <select
          .value=${String(current ?? 0)}
          aria-label=${this.t("timer")}
          @change=${(event) => this.execute(() => adapter.setTimer(Number(event.currentTarget.value)))}
        >
          ${options.map((minutes) => b `<option value=${minutes} ?selected=${minutes === current}>
                ${minutes === 0 ? this.t("off") : this.displayTimer(minutes)}
              </option>`)}
        </select>
      </label>
    `;
    }
    renderAngleControl(label, value, angles, onChange, spec) {
        const current = value ?? angles[0] ?? spec?.min ?? 0;
        const options = angles.includes(current) ? angles : [...angles, current].sort((left, right) => left - right);
        return b `
      <label class="feature-select">
        <span>${label}</span>
        ${angles.length > 0
            ? b `
                <select
                  .value=${String(current)}
                  aria-label=${label}
                  @change=${(event) => onChange(Number(event.currentTarget.value))}
                >
                  ${options.map((angle) => b `<option value=${angle} ?selected=${angle === current}>${angle}°</option>`)}
                </select>
              `
            : b `
                <input
                  type="number"
                  min=${spec?.min ?? 0}
                  max=${spec?.max ?? 360}
                  step=${spec?.step ?? 1}
                  .value=${String(current)}
                  @change=${(event) => onChange(Number(event.currentTarget.value))}
                  aria-label=${label}
                />
              `}
      </label>
    `;
    }
    nextTimer(current, steps = TIMER_STEPS) {
        const next = steps.find((step) => step > (current ?? 0));
        return next ?? steps[0] ?? 0;
    }
    async toggleCycle(adapter) {
        const enabled = !(adapter.state.horizontalSwing && adapter.state.verticalSwing);
        await adapter.setHorizontalSwing(enabled);
        await adapter.setVerticalSwing(enabled);
    }
    onPercentageChange(event, adapter) {
        const value = Number(event.currentTarget.value);
        this.speedDragging = false;
        this.speedPreview = value;
        this.execute(() => adapter.setPercentage(value));
    }
    static { this.styles = i$5 `
    :host {
      display: block;
      container-type: inline-size;

      /* Theme inputs */
      --fan-accent: var(--state-fan-active-color, var(--state-active-color, var(--primary-color, #5c8dff)));
      --fan-background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      --fan-text: var(--primary-text-color, #f5f7fb);
      --fan-text-muted: var(--secondary-text-color, #9aa0ab);
      --fan-focus: var(--ha-focus-color, var(--primary-color, var(--fan-accent)));
      --fan-error: var(--error-color, #db4437);

      /* Geometry */
      --fan-radius-card: var(--ha-card-border-radius, 24px);
      --fan-radius-panel: 18px;
      --fan-radius-control: 12px;
      --fan-radius-pill: 999px;
      --fan-gutter: 16px;
      --fan-block-gap: 12px;
      --fan-panel-padding: 16px;
      --fan-control-height: 48px;
      --fan-control-gap: 10px;
      --fan-visual-size: 300px;

      /* Type scale */
      --fan-font-micro: 11px;
      --fan-font-small: 12px;
      --fan-font-body: 14px;
      --fan-font-title: 18px;
      --fan-font-metric: 24px;
      --fan-tracking-micro: 0.08em;
      --fan-display-font: inherit;
      --fan-label-transform: none;

      /* Motion */
      --fan-transition: 160ms cubic-bezier(0.2, 0, 0.2, 1);
    }

    [hidden] {
      display: none !important;
    }

    /*
     * Derived colors live on ha-card, not :host, so a theme class on the same
     * element can override --fan-accent and every tint recomputes with it.
     */
    ha-card {
      --fan-accent-soft: color-mix(in srgb, var(--fan-accent) 16%, transparent);
      --fan-accent-hover: color-mix(in srgb, var(--fan-accent) 26%, transparent);
      --fan-surface: var(--fan-background);
      --fan-panel: color-mix(in srgb, var(--fan-text) 5%, transparent);
      --fan-panel-hover: color-mix(in srgb, var(--fan-text) 9%, transparent);
      --fan-control-surface: color-mix(in srgb, var(--fan-text) 7%, transparent);
      --fan-border: color-mix(in srgb, var(--fan-text) 14%, transparent);
      --fan-border-strong: color-mix(in srgb, var(--fan-text) 26%, transparent);
      --fan-shadow: var(--ha-card-box-shadow, 0 10px 28px rgb(0 0 0 / 12%));

      display: flex;
      flex-direction: column;
      gap: var(--fan-card-gap, var(--fan-block-gap));
      overflow: hidden;
      padding: var(--fan-card-padding, var(--fan-gutter));
      border: var(--fan-card-border, 1px solid var(--fan-border));
      border-radius: var(--fan-card-border-radius, var(--fan-radius-card));
      background: var(--fan-card-background, var(--fan-surface));
      color: var(--fan-card-color, var(--fan-text));
      font-size: var(--fan-card-font-size, inherit);
      box-shadow: var(--fan-card-shadow, var(--fan-shadow));
    }

    button,
    select,
    input {
      font: inherit;
      color: inherit;
    }

    button {
      border: 0;
      cursor: pointer;
      touch-action: manipulation;
    }

    button:focus-visible,
    select:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--fan-focus);
      outline-offset: 2px;
    }

    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fan-header-gap, 12px);
      min-width: 0;
      padding: var(--fan-header-padding, 0);
      border: var(--fan-header-border, 0 solid transparent);
      border-radius: var(--fan-header-border-radius, 0);
      background: var(--fan-header-background, transparent);
      color: var(--fan-header-color, inherit);
      font-size: var(--fan-header-font-size, inherit);
      box-shadow: var(--fan-header-shadow, none);
    }

    .header-full .header {
      margin: 0 calc(-1 * var(--fan-gutter));
      padding: var(--fan-header-padding, 0 var(--fan-gutter) 14px);
      border-bottom: 1px solid var(--fan-border);
    }

    .header-full .title {
      font-size: 20px;
    }

    .header-full .eyebrow {
      color: var(--fan-accent);
    }

    .title-button {
      display: grid;
      gap: 4px;
      min-width: 0;
      min-height: 44px;
      align-content: center;
      padding: 0;
      border-radius: var(--fan-radius-control);
      background: transparent;
      color: inherit;
      text-align: left;
      transition: opacity var(--fan-transition);
    }

    .eyebrow {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
      text-transform: uppercase;
    }

    .title {
      min-width: 0;
      overflow: hidden;
      font-size: var(--fan-font-title);
      font-weight: 700;
      letter-spacing: -0.01em;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      min-width: 0;
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--fan-text-muted);
      transition: background-color var(--fan-transition);
    }

    .status-dot.on {
      background: var(--fan-accent);
      box-shadow: 0 0 0 4px var(--fan-accent-soft);
    }

    .model-badge {
      flex: 0 0 auto;
      padding: 6px 10px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-pill);
      color: var(--fan-text-muted);
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
    }

    /* Visual status */
    .visual-section {
      display: grid;
      gap: var(--fan-visual-gap, var(--fan-block-gap));
      padding: var(--fan-visual-padding, 0);
      border: var(--fan-visual-border, 0 solid transparent);
      border-radius: var(--fan-visual-border-radius, 0);
      background: var(--fan-visual-background, transparent);
      color: var(--fan-visual-color, inherit);
      box-shadow: var(--fan-visual-shadow, none);
    }

    .details-side.details-with-graphic {
      grid-template-columns: minmax(0, 1fr) minmax(112px, auto);
      align-items: center;
    }

    .details-side.details-with-graphic .visual-meta {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }

    .airflow-visual {
      position: relative;
      display: grid;
      place-items: center;
      width: min(100%, var(--fan-visual-size));
      aspect-ratio: 1;
      margin: 0 auto;
      isolation: isolate;
    }

    .airflow-visual::before {
      position: absolute;
      inset: 14%;
      border: 1px solid var(--fan-accent-soft);
      border-radius: 50%;
      content: "";
    }

    .speed-ring {
      position: absolute;
      inset: 6%;
      border-radius: 50%;
      background:
        conic-gradient(from -90deg, var(--fan-accent) calc(var(--speed, 0) * 1%), transparent 0),
        color-mix(in srgb, var(--fan-text) 10%, transparent);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
      opacity: 0.9;
      transition: background var(--fan-transition);
    }

    .orbit {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--fan-accent) 22%, transparent);
      border-radius: 50%;
      transform: rotate(18deg);
    }

    .orbit-one {
      width: 74%;
      height: 30%;
    }

    .orbit-two {
      width: 86%;
      height: 44%;
      transform: rotate(-26deg);
    }

    .axis-horizontal .orbit-one,
    .axis-dual .orbit-one {
      animation: orbit-horizontal 8s ease-in-out infinite;
    }

    .axis-vertical .orbit-two,
    .axis-dual .orbit-two {
      animation: orbit-vertical 8s ease-in-out infinite;
    }

    .wind {
      position: absolute;
      width: 40%;
      height: 4px;
      border-radius: var(--fan-radius-pill);
      background: linear-gradient(90deg, transparent, var(--fan-accent), transparent);
      opacity: 0;
      transition: opacity var(--fan-transition);
    }

    .running .wind-horizontal,
    .running .wind-vertical {
      opacity: 0.65;
    }

    .wind-horizontal {
      transform: translateY(-44px) rotate(-12deg);
    }

    .wind-vertical {
      width: 4px;
      height: 40%;
      background: linear-gradient(180deg, transparent, var(--fan-accent), transparent);
      transform: translateY(44px) rotate(12deg);
    }

    .axis-horizontal.running .wind-horizontal,
    .axis-dual.running .wind-horizontal {
      animation: wind-horizontal-flow var(--spin-duration) linear infinite;
    }

    .axis-vertical.running .wind-vertical,
    .axis-dual.running .wind-vertical {
      animation: wind-vertical-flow calc(var(--spin-duration) * 1.2) ease-in-out infinite;
      animation-delay: -0.7s;
    }

    .rotor {
      position: relative;
      z-index: 2;
      width: 46%;
      aspect-ratio: 1;
      border: 12px solid color-mix(in srgb, var(--fan-accent) 16%, var(--fan-background));
      border-radius: 50%;
      background: color-mix(in srgb, var(--fan-accent) 7%, var(--fan-background));
      box-shadow:
        inset 0 0 0 1px var(--fan-accent-soft),
        0 16px 36px rgb(0 0 0 / 16%);
    }

    .running .rotor {
      animation: rotor-spin var(--spin-duration) linear infinite;
    }

    .airflow-visual:not(.running) .rotor {
      opacity: 0.55;
    }

    .blade {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 39%;
      height: 22%;
      border-radius: 100% 12% 100% 12%;
      background: linear-gradient(135deg, var(--fan-accent), color-mix(in srgb, var(--fan-accent) 40%, white));
      transform-origin: 0 50%;
      opacity: 0.88;
    }

    .blade-one {
      transform: translateY(-50%) rotate(-10deg);
    }

    .blade-two {
      transform: translateY(-50%) rotate(80deg);
    }

    .blade-three {
      transform: translateY(-50%) rotate(170deg);
    }

    .blade-four {
      transform: translateY(-50%) rotate(260deg);
    }

    .hub {
      position: absolute;
      inset: 37%;
      border-radius: 50%;
      background: var(--fan-surface);
      box-shadow: 0 0 0 5px var(--fan-accent-soft);
    }

    .airflow-visual.no-motion *,
    .airflow-visual.no-motion::before {
      animation: none !important;
    }

    .power-button {
      position: absolute;
      z-index: 3;
      display: grid;
      place-items: center;
      width: 60px;
      height: 60px;
      border: 5px solid var(--fan-background);
      border-radius: 50%;
      /* Opaque so the icon keeps card-level contrast over the lit blades. */
      background: var(--fan-background);
      color: var(--fan-text);
      box-shadow:
        0 0 0 1px var(--fan-border),
        0 8px 24px rgb(0 0 0 / 18%);
      transition:
        background-color var(--fan-transition),
        color var(--fan-transition),
        transform var(--fan-transition);
    }

    .power-button.active {
      background: var(--fan-accent);
      color: var(--text-primary-color, #fff);
    }

    .power-button:active {
      transform: scale(0.94);
    }

    .power-button ha-icon {
      --mdc-icon-size: 26px;
    }

    .speed-readout {
      position: absolute;
      right: 2%;
      bottom: 6%;
      z-index: 4;
      display: grid;
      justify-items: end;
      gap: 2px;
      padding: 6px 10px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: color-mix(in srgb, var(--fan-background) 88%, var(--fan-text));
      color: var(--fan-text-muted);
    }

    .speed-readout strong {
      color: var(--fan-text);
      font-family: var(--fan-display-font);
      font-size: 22px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .speed-readout small {
      font-size: var(--fan-font-micro);
      font-weight: 700;
      letter-spacing: var(--fan-tracking-micro);
    }

    /* Detail chips */
    .visual-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--fan-details-gap, 8px);
      padding: var(--fan-details-padding, 0);
      border: var(--fan-details-border, 0 solid transparent);
      border-radius: var(--fan-details-border-radius, 0);
      background: var(--fan-details-background, transparent);
      box-shadow: var(--fan-details-shadow, none);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--fan-radius-pill);
      background: var(--fan-panel);
      color: var(--fan-details-color, var(--fan-text-muted));
      font-size: var(--fan-details-font-size, var(--fan-font-small));
      font-weight: 600;
      white-space: nowrap;
    }

    .meta-item ha-icon {
      --mdc-icon-size: 15px;
      flex: 0 0 auto;
    }

    .meta-item.active {
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    /* Control panels */
    .controls {
      padding: var(--fan-control-padding, var(--fan-panel-padding));
      border: var(--fan-control-border, 1px solid var(--fan-border));
      border-radius: var(--fan-control-border-radius, var(--fan-radius-panel));
      background: var(--fan-control-background, var(--fan-panel));
      color: var(--fan-control-color, var(--fan-text));
      font-size: var(--fan-control-font-size, inherit);
      box-shadow: var(--fan-control-shadow, none);
    }

    .airflow-controls {
      display: grid;
      gap: 12px;
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 12px;
    }

    .section-heading div {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .section-heading strong {
      font-size: var(--fan-font-body);
      font-weight: 700;
    }

    .value {
      color: var(--fan-accent);
      font-family: var(--fan-display-font);
      font-size: var(--fan-font-metric);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    /* Speed slider */
    .speed-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 44px;
      margin: 0;
      background: transparent;
      cursor: pointer;
    }

    .speed-slider::-webkit-slider-runnable-track {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: linear-gradient(
        to right,
        var(--fan-accent) 0 calc(var(--fan-speed-progress, 0) * 1%),
        color-mix(in srgb, var(--fan-text) 12%, transparent) calc(var(--fan-speed-progress, 0) * 1%) 100%
      );
    }

    .speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      margin-top: -5px;
      border: 3px solid var(--fan-accent);
      border-radius: 50%;
      background: var(--fan-surface);
      box-shadow: 0 2px 8px rgb(0 0 0 / 24%);
      transition: box-shadow var(--fan-transition);
    }

    .speed-slider::-moz-range-track {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: color-mix(in srgb, var(--fan-text) 12%, transparent);
    }

    .speed-slider::-moz-range-progress {
      height: 12px;
      border-radius: var(--fan-radius-pill);
      background: var(--fan-accent);
    }

    .speed-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border: 3px solid var(--fan-accent);
      border-radius: 50%;
      background: var(--fan-surface);
    }

    .speed-slider:focus-visible {
      outline: none;
    }

    .speed-slider:focus-visible::-webkit-slider-thumb {
      box-shadow: 0 0 0 4px var(--fan-accent-hover);
    }

    .speed-slider:focus-visible::-moz-range-thumb {
      box-shadow: 0 0 0 4px var(--fan-accent-hover);
    }

    /* Segmented rows */
    .level-row,
    .chip-row,
    .preset-row,
    .mode-row {
      display: grid;
      gap: 8px;
    }

    .level-row {
      grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    }

    .chip-row {
      grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    }

    .preset-row {
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    }

    .mode-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .level-button,
    .chip,
    .preset-button,
    .mode-button {
      min-height: max(44px, var(--fan-control-height));
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: transparent;
      color: var(--fan-text-muted);
      transition:
        background-color var(--fan-transition),
        border-color var(--fan-transition),
        color var(--fan-transition),
        transform var(--fan-transition);
    }

    .level-button {
      font-size: var(--fan-font-body);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 10px;
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .chip ha-icon {
      --mdc-icon-size: 17px;
      flex: 0 0 auto;
    }

    .preset-button {
      padding: 0 10px;
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .mode-button {
      display: grid;
      justify-items: center;
      gap: 6px;
      padding: 8px 6px;
      border-radius: var(--fan-radius-panel);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .mode-icon {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--fan-panel-hover);
      transition:
        background-color var(--fan-transition),
        color var(--fan-transition);
    }

    .mode-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .level-button.selected,
    .chip.selected,
    .preset-button.selected,
    .mode-button.selected {
      border-color: color-mix(in srgb, var(--fan-accent) 45%, transparent);
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .mode-button.selected .mode-icon {
      background: var(--fan-accent);
      color: var(--text-primary-color, #fff);
    }

    .mode-section,
    .preset-section {
      display: grid;
      gap: 8px;
    }

    .control-label {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    /* Position and feature panels */
    .angle-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--fan-control-gap, 10px);
    }

    .angle-layout.single-column {
      grid-template-columns: minmax(0, 1fr);
    }

    .angle-controls,
    .feature-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
      gap: var(--fan-control-gap, 10px);
      align-content: start;
    }

    .angle-controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .nudge-controls {
      display: grid;
      align-content: center;
      justify-items: center;
    }

    .nudge-control {
      display: grid;
      gap: 8px;
      justify-items: center;
      width: 100%;
    }

    .feature-select,
    .nudge-control {
      min-width: 0;
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .feature-select {
      position: relative;
      display: grid;
      gap: 6px;
      align-self: start;
    }

    .feature-select > span,
    .nudge-control > span {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    .feature-select.selected > span {
      color: var(--fan-accent);
    }

    .feature-select select,
    .feature-select input[type="number"] {
      box-sizing: border-box;
      width: 100%;
      min-height: max(44px, var(--fan-control-height));
      padding: 0 12px;
      border: 1px solid var(--fan-border-strong);
      border-radius: var(--fan-radius-control);
      outline: none;
      background: var(--fan-control-surface);
      color: var(--fan-text);
      font-size: var(--fan-font-body);
      font-weight: 600;
      transition:
        border-color var(--fan-transition),
        background-color var(--fan-transition),
        color var(--fan-transition);
    }

    .feature-select select {
      -webkit-appearance: none;
      appearance: none;
      padding-right: 32px;
    }

    .feature-select:has(select)::after {
      position: absolute;
      right: 14px;
      bottom: calc(max(44px, var(--fan-control-height)) / 2 - 5px);
      width: 7px;
      height: 7px;
      border-right: 2px solid var(--fan-text-muted);
      border-bottom: 2px solid var(--fan-text-muted);
      content: "";
      pointer-events: none;
      transform: rotate(45deg);
    }

    .feature-select.selected:has(select)::after {
      border-color: var(--fan-accent);
    }

    .feature-select select:focus-visible,
    .feature-select input[type="number"]:focus-visible {
      border-color: var(--fan-focus);
      outline: 2px solid var(--fan-focus);
      outline-offset: 1px;
    }

    .feature-select.selected select,
    .feature-select.selected input[type="number"] {
      border-color: color-mix(in srgb, var(--fan-accent) 55%, transparent);
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .feature-button {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      min-height: max(44px, var(--fan-control-height));
      padding: 10px 12px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-control);
      background: var(--fan-control-surface);
      color: var(--fan-text);
      text-align: left;
      transition:
        background-color var(--fan-transition),
        border-color var(--fan-transition),
        transform var(--fan-transition);
    }

    .feature-button ha-icon {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
      padding: 7px;
      border-radius: 10px;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
    }

    .feature-button span {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .feature-button small {
      color: var(--fan-text-muted);
      font-size: var(--fan-font-small);
      font-weight: 600;
      letter-spacing: var(--fan-label-tracking, normal);
      text-transform: var(--fan-label-transform);
    }

    .feature-button strong {
      overflow: hidden;
      font-size: var(--fan-font-body);
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .feature-button.selected {
      border-color: color-mix(in srgb, var(--fan-accent) 45%, transparent);
      background: var(--fan-accent-soft);
    }

    .nudge-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas:
        ". up ."
        "left center right"
        ". down .";
      align-items: center;
      justify-items: center;
      gap: 6px;
      max-width: 180px;
      margin: 0 auto;
      padding: 6px;
      border: 1px solid var(--fan-border);
      border-radius: var(--fan-radius-panel);
      background: var(--fan-panel);
    }

    .nudge-grid button {
      display: grid;
      place-items: center;
      width: 44px;
      min-height: 44px;
      padding: 0;
      border-radius: 50%;
      background: var(--fan-accent-soft);
      color: var(--fan-accent);
      transition:
        background-color var(--fan-transition),
        transform var(--fan-transition);
    }

    .nudge-grid button:nth-child(1) {
      grid-area: up;
    }

    .nudge-grid button:nth-child(2) {
      grid-area: left;
    }

    .nudge-grid button:nth-child(3) {
      grid-area: right;
    }

    .nudge-grid button:nth-child(4) {
      grid-area: down;
    }

    /* Hover and press feedback */
    @media (hover: hover) {
      .title-button:hover {
        opacity: 0.75;
      }

      .level-button:hover,
      .chip:hover,
      .preset-button:hover,
      .mode-button:hover,
      .feature-button:hover {
        border-color: var(--fan-border-strong);
        background: var(--fan-panel-hover);
        color: var(--fan-text);
      }

      .level-button.selected:hover,
      .chip.selected:hover,
      .preset-button.selected:hover,
      .mode-button.selected:hover,
      .feature-button.selected:hover {
        background: var(--fan-accent-hover);
        color: var(--fan-accent);
      }

      .nudge-grid button:hover {
        background: var(--fan-accent-hover);
      }

      .power-button:hover {
        background: color-mix(in srgb, var(--fan-background) 74%, var(--fan-accent));
      }

      .power-button.active:hover {
        background: color-mix(in srgb, var(--fan-accent) 88%, black);
      }

      .feature-select select:hover,
      .feature-select input[type="number"]:hover {
        border-color: color-mix(in srgb, var(--fan-accent) 60%, transparent);
      }
    }

    .level-button:active,
    .chip:active,
    .preset-button:active,
    .mode-button:active,
    .feature-button:active,
    .nudge-grid button:active {
      transform: scale(0.97);
    }

    /* Empty and error states */
    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 96px;
      color: var(--fan-text-muted);
      text-align: center;
    }

    .action-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid color-mix(in srgb, var(--fan-error) 55%, transparent);
      border-radius: var(--fan-radius-control);
      background: color-mix(in srgb, var(--fan-error) 12%, transparent);
      color: var(--fan-error);
      font-size: var(--fan-font-small);
      font-weight: 600;
    }

    .action-error ha-icon {
      --mdc-icon-size: 18px;
      flex: 0 0 auto;
    }

    /* Themes */
    .theme-minimal {
      --fan-surface: transparent;
      --fan-panel: transparent;
      --fan-radius-card: 14px;
      --fan-radius-panel: 12px;
      --fan-radius-control: 10px;
      --fan-visual-size: 250px;
      --fan-shadow: none;
      --fan-card-border: 0 solid transparent;
      --fan-control-border: 0 solid transparent;
      --fan-panel-padding: 0;
      --fan-block-gap: 16px;
    }

    .theme-minimal .controls + .controls,
    .theme-minimal .angle-layout > .controls {
      border-top: 0;
    }

    .theme-mushroom {
      --fan-surface: color-mix(in srgb, var(--fan-background) 92%, var(--fan-accent));
      --fan-panel: color-mix(in srgb, var(--fan-accent) 10%, transparent);
      --fan-radius-card: 26px;
      --fan-radius-panel: 22px;
      --fan-radius-control: 14px;
      --fan-visual-size: 270px;
      --fan-shadow: 0 12px 30px rgb(0 0 0 / 10%);
      --fan-card-border: 0 solid transparent;
      --fan-control-border: 0 solid transparent;
    }

    .theme-mushroom .chip,
    .theme-mushroom .preset-button,
    .theme-mushroom .level-button {
      border-radius: var(--fan-radius-pill);
    }

    .theme-glass {
      --fan-surface: color-mix(in srgb, var(--fan-background) 58%, transparent);
      --fan-panel: color-mix(in srgb, var(--fan-text) 8%, transparent);
      --fan-border: color-mix(in srgb, var(--fan-text) 22%, transparent);
      --fan-radius-card: 26px;
      --fan-radius-panel: 20px;
      --fan-radius-control: 14px;
      --fan-shadow: 0 18px 44px rgb(0 0 0 / 20%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      backdrop-filter: blur(18px) saturate(140%);
    }

    .theme-industrial {
      /* Amber is this theme's identity, so it does not follow the Home
         Assistant fan color, which is usually the default accent. */
      --fan-accent: var(--fan-industrial-accent, #e9a23b);
      --fan-radius-card: 6px;
      --fan-radius-panel: 6px;
      --fan-radius-control: 4px;
      --fan-radius-pill: 4px;
      --fan-panel: color-mix(in srgb, var(--fan-accent) 6%, transparent);
      --fan-shadow: none;
      --fan-display-font: ui-monospace, SFMono-Regular, Menlo, monospace;
      --fan-label-transform: uppercase;
      --fan-label-tracking: 0.06em;
      --fan-visual-size: 270px;
    }

    /* Density */
    .density-compact {
      --fan-control-height: 44px;
      --fan-control-gap: 8px;
      --fan-panel-padding: 12px;
      --fan-block-gap: 8px;
      --fan-gutter: 12px;
      --fan-visual-size: 240px;
    }

    /* Column overrides */
    .columns-one .feature-controls,
    .columns-one .angle-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .columns-two .feature-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .columns-two .angle-layout.two-column {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    /* Responsive behavior driven by the card width */
    @container (max-width: 460px) {
      .details-side.details-with-graphic {
        grid-template-columns: minmax(0, 1fr);
      }

      .details-side.details-with-graphic .visual-meta {
        flex-direction: row;
        justify-content: center;
      }

      .feature-controls,
      .columns-two .feature-controls,
      .angle-layout,
      .columns-two .angle-layout.two-column {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @container (max-width: 360px) {
      :host {
        --fan-gutter: 12px;
        --fan-panel-padding: 12px;
      }

      .chip-row {
        grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
      }

      .value {
        font-size: 20px;
      }

      .speed-readout strong {
        font-size: 18px;
      }
    }

    @keyframes rotor-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes wind-horizontal-flow {
      0% {
        transform: translateX(-20px) scaleX(0.5);
      }
      50% {
        transform: translateX(20px) scaleX(1);
      }
      100% {
        transform: translateX(65px) scaleX(0.5);
      }
    }

    @keyframes wind-vertical-flow {
      0% {
        transform: translateY(-20px) scaleY(0.5);
      }
      50% {
        transform: translateY(20px) scaleY(1);
      }
      100% {
        transform: translateY(65px) scaleY(0.5);
      }
    }

    @keyframes orbit-horizontal {
      0%,
      100% {
        transform: rotate(18deg) scaleX(1);
      }
      50% {
        transform: rotate(18deg) scaleX(0.7);
      }
    }

    @keyframes orbit-vertical {
      0%,
      100% {
        transform: rotate(-26deg) scaleY(1);
      }
      50% {
        transform: rotate(-26deg) scaleY(0.7);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition-duration: 1ms !important;
      }

      .level-button:active,
      .chip:active,
      .preset-button:active,
      .mode-button:active,
      .feature-button:active,
      .nudge-grid button:active,
      .power-button:active {
        transform: none;
      }
    }

    @media (forced-colors: active) {
      ha-card,
      .controls,
      .level-button,
      .chip,
      .preset-button,
      .mode-button,
      .feature-button,
      .nudge-grid,
      .meta-item,
      .feature-select select,
      .feature-select input[type="number"] {
        border: 1px solid CanvasText;
      }

      .level-button.selected,
      .chip.selected,
      .preset-button.selected,
      .mode-button.selected,
      .feature-button.selected,
      .feature-select.selected select {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }

      .status-dot.on {
        background: Highlight;
      }
    }
  `; }
}
__decorate([
    n$1({ attribute: false })
], XiaomiFanCard.prototype, "hass", void 0);
__decorate([
    r()
], XiaomiFanCard.prototype, "config", void 0);
__decorate([
    r()
], XiaomiFanCard.prototype, "services", void 0);
__decorate([
    r()
], XiaomiFanCard.prototype, "related", void 0);
__decorate([
    r()
], XiaomiFanCard.prototype, "actionError", void 0);
__decorate([
    r()
], XiaomiFanCard.prototype, "speedPreview", void 0);
if (!customElements.get("xiaomi-fan-card")) {
    customElements.define("xiaomi-fan-card", XiaomiFanCard);
}

const customCards = window.customCards ?? [];
if (!customCards.some((card) => typeof card === "object" && card !== null && card.type === "xiaomi-fan-card")) {
    customCards.push({
        type: "xiaomi-fan-card",
        name: "Xiaomi Fan Card",
        description: "Modern capability-aware card for Xiaomi and generic Home Assistant fans.",
        preview: true,
    });
}
window.customCards = customCards;
