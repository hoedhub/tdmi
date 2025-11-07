import"./DsnmJJEf.js";import"./Dv0Cmu5j.js";import{o as J,q as se,aS as ie,z as D,v as p,w as le,Z as q,g as W,al as me,a0 as he,a1 as Ee,a2 as K,y,A as I,C as pe,aT as we,a6 as $,a8 as ge,aU as F,aV as P,J as Te,aW as Q,T as be,am as j,aX as fe,az as Ne,a3 as ue,a5 as Ae,aY as Ce,aZ as X,E as xe,a4 as oe,a_ as Se,x as Ie,a$ as Me,b0 as ke,b1 as De,U as de,b2 as Re,_ as ze,b3 as Oe,ax as He,I as We,p as ye,l as Be,b as ee,c as Le,D as ae,M as H,d as Ve,s as qe,r as Fe,j as Pe,a as Ue,u as Ye,aR as Xe}from"./DGvkJv8w.js";import{b as V,i as Ze}from"./k-Px6GBH.js";import{B as $e}from"./CVjgVAnJ.js";import{e as re}from"./BSHWkoDU.js";import{i as Ge}from"./ssx8ipy_.js";import{l as te,p as k}from"./BZAb9vEf.js";let R=null;function ne(s){R=s}function Je(s,a){return a}function Ke(s,a,e){for(var l=s.items,o=[],d=a.length,i=0;i<d;i++)Me(a[i].e,o,!0);var f=d>0&&o.length===0&&e!==null;if(f){var w=e.parentNode;ke(w),w.append(e),l.clear(),S(s,a[0].prev,a[d-1].next)}De(o,()=>{for(var E=0;E<d;E++){var m=a[E];f||(l.delete(m.k),S(s,m.prev,m.next)),oe(m.e,!f)}})}function Qe(s,a,e,l,o,d=null){var i=s,f={flags:a,items:new Map,first:null},w=(a&ie)!==0;if(w){var E=s;i=p?D(le(E)):E.appendChild(J())}p&&q();var m=null,_=!1,g=new Map,A=me(()=>{var c=e();return Ne(c)?c:c==null?[]:fe(c)}),r,v;function n(){je(v,r,f,g,i,o,a,l,e),d!==null&&(r.length===0?m?ue(m):m=$(()=>d(i)):m!==null&&Ae(m,()=>{m=null}))}se(()=>{v??=de,r=W(A);var c=r.length;if(_&&c===0)return;_=c===0;let T=!1;if(p){var N=he(i)===Ee;N!==(c===0)&&(i=K(),D(i),y(!1),T=!0)}if(p){for(var C=null,h,t=0;t<c;t++){if(I.nodeType===pe&&I.data===we){i=I,T=!0,y(!1);break}var u=r[t],b=l(u,t);h=G(I,f,C,null,u,b,t,o,a,e),f.items.set(b,h),C=h}c>0&&D(K())}if(p)c===0&&d&&(m=$(()=>d(i)));else if(ge()){var z=new Set,B=Te;for(t=0;t<c;t+=1){u=r[t],b=l(u,t);var M=f.items.get(b)??g.get(b);M?(a&(F|P))!==0&&ve(M,u,t,a):(h=G(null,f,null,null,u,b,t,o,a,e,!0),g.set(b,h)),z.add(b)}for(const[x,L]of f.items)z.has(x)||B.skipped_effects.add(L.e);B.oncommit(n)}else n();T&&y(!0),W(A)}),p&&(i=I)}function je(s,a,e,l,o,d,i,f,w){var E=(i&Se)!==0,m=(i&(F|P))!==0,_=a.length,g=e.items,A=e.first,r=A,v,n=null,c,T=[],N=[],C,h,t,u;if(E)for(u=0;u<_;u+=1)C=a[u],h=f(C,u),t=g.get(h),t!==void 0&&(t.a?.measure(),(c??=new Set).add(t));for(u=0;u<_;u+=1){if(C=a[u],h=f(C,u),t=g.get(h),t===void 0){var b=l.get(h);if(b!==void 0){l.delete(h),g.set(h,b);var z=n?n.next:r;S(e,n,b),S(e,b,z),Z(b,z,o),n=b}else{var B=r?r.e.nodes_start:o;n=G(B,e,n,n===null?e.first:n.next,C,h,u,d,i,w)}g.set(h,n),T=[],N=[],r=n.next;continue}if(m&&ve(t,C,u,i),(t.e.f&X)!==0&&(ue(t.e),E&&(t.a?.unfix(),(c??=new Set).delete(t))),t!==r){if(v!==void 0&&v.has(t)){if(T.length<N.length){var M=N[0],x;n=M.prev;var L=T[0],U=T[T.length-1];for(x=0;x<T.length;x+=1)Z(T[x],M,o);for(x=0;x<N.length;x+=1)v.delete(N[x]);S(e,L.prev,U.next),S(e,n,L),S(e,U,M),r=M,n=U,u-=1,T=[],N=[]}else v.delete(t),Z(t,r,o),S(e,t.prev,t.next),S(e,t,n===null?e.first:n.next),S(e,n,t),n=t;continue}for(T=[],N=[];r!==null&&r.k!==h;)(r.e.f&X)===0&&(v??=new Set).add(r),N.push(r),r=r.next;if(r===null)continue;t=r}T.push(t),n=t,r=t.next}if(r!==null||v!==void 0){for(var O=v===void 0?[]:fe(v);r!==null;)(r.e.f&X)===0&&O.push(r),r=r.next;var Y=O.length;if(Y>0){var ce=(i&ie)!==0&&_===0?o:null;if(E){for(u=0;u<Y;u+=1)O[u].a?.measure();for(u=0;u<Y;u+=1)O[u].a?.fix()}Ke(e,O,ce)}}E&&xe(()=>{if(c!==void 0)for(t of c)t.a?.apply()}),s.first=e.first&&e.first.e,s.last=n&&n.e;for(var _e of l.values())oe(_e.e);l.clear()}function ve(s,a,e,l){(l&F)!==0&&Q(s.v,a),(l&P)!==0?Q(s.i,e):s.i=e}function G(s,a,e,l,o,d,i,f,w,E,m){var _=R,g=(w&F)!==0,A=(w&Ce)===0,r=g?A?be(o,!1,!1):j(o):o,v=(w&P)===0?i:j(i),n={i:v,v:r,k:d,a:null,e:null,prev:e,next:l};R=n;try{if(s===null){var c=document.createDocumentFragment();c.append(s=J())}return n.e=$(()=>f(s,r,v,E),p),n.e.prev=e&&e.e,n.e.next=l&&l.e,e===null?m||(a.first=n):(e.next=n,e.e.next=n.e),l!==null&&(l.prev=n,l.e.prev=n.e),n}finally{R=_}}function Z(s,a,e){for(var l=s.next?s.next.e.nodes_start:e,o=a?a.e.nodes_start:e,d=s.e.nodes_start;d!==null&&d!==l;){var i=Ie(d);o.before(d),d=i}}function S(s,a,e){a===null?s.first=e:(a.next=e,a.e.next=e&&e.e),e!==null&&(e.prev=a,e.e.prev=a&&a.e)}function ea(s,a,e,l,o){p&&q();var d=a.$$slots?.[e],i=!1;d===!0&&(d=a[e==="default"?"children":e],i=!0),d===void 0?o!==null&&o(s):d(s,i?()=>l:l)}function va(s){const a={};s.children&&(a.default=!0);for(const e in s.$$slots)a[e]=!0;return a}function aa(s,a,e,l,o,d){let i=p;p&&q();var f=null;p&&I.nodeType===Re&&(f=I,q());var w=p?I:s,E=R,m=new $e(w,!1);se(()=>{const _=a()||null;var g=e||_==="svg"?Oe:null;if(_===null){m.ensure(null,null),V(!0);return}return m.ensure(_,A=>{var r=R;if(ne(E),_){if(f=p?f:g?document.createElementNS(g,_):document.createElement(_),He(f,f),l){p&&Ze(_)&&f.append(document.createComment(""));var v=p?le(f):f.appendChild(J());p&&(v===null?y(!1):D(v)),l(f,v)}de.nodes_end=f,A.before(f)}ne(r),p&&D(A)}),V(!0),()=>{_&&V(!1)}},ze),We(()=>{V(!0)}),i&&(y(!0),D(w))}/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */const ra={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var ta=Be("<svg><!><!></svg>");function ca(s,a){const e=te(a,["children","$$slots","$$events","$$legacy"]),l=te(e,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);ye(a,!1);let o=k(a,"name",8,void 0),d=k(a,"color",8,"currentColor"),i=k(a,"size",8,24),f=k(a,"strokeWidth",8,2),w=k(a,"absoluteStrokeWidth",8,!1),E=k(a,"iconNode",24,()=>[]);const m=(...r)=>r.filter((v,n,c)=>!!v&&c.indexOf(v)===n).join(" ");Ge();var _=ta();re(_,(r,v)=>({...ra,...l,width:i(),height:i(),stroke:d(),"stroke-width":r,class:v}),[()=>(H(w()),H(f()),H(i()),ae(()=>w()?Number(f())*24/Number(i()):f())),()=>(H(o()),H(e),ae(()=>m("lucide-icon","lucide",o()?`lucide-${o()}`:"",e.class)))]);var g=Ve(_);Qe(g,1,E,Je,(r,v)=>{var n=Ye(()=>Xe(W(v),2));let c=()=>W(n)[0],T=()=>W(n)[1];var N=Pe(),C=Ue(N);aa(C,c,!0,(h,t)=>{re(h,()=>({...T()}))}),ee(r,N)});var A=qe(g);ea(A,a,"default",{},null),Fe(_),ee(s,_),Le()}export{ca as I,aa as a,va as b,R as c,Qe as e,Je as i,ea as s};
