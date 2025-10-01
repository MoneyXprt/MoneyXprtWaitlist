"use strict";(()=>{var e={};e.id=925,e.ids=[925],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1303:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>I,patchFetch:()=>P,requestAsyncStorage:()=>$,routeModule:()=>v,serverHooks:()=>x,staticGenerationAsyncStorage:()=>A});var a={};n.r(a),n.d(a,{POST:()=>b});var s=n(9303),r=n(8716),i=n(3131),o=n(7070),c=n(4122);let l=require("crypto");function p(e){return(0,l.createHash)("sha256").update(e,"utf8").digest("hex")}let d={ssn:/\b\d{3}-?\d{2}-?\d{4}\b/g,creditCard:/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,phone:/\b\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g,email:/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,bankAccount:/\b\d{8,17}\b/g,ein:/\b\d{2}-?\d{7}\b/g,routing:/\b\d{9}\b/g,address:/\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct)\b/gi};function u(e,t={}){let{preserveFormat:n=!0,customPatterns:a={},redactionChar:s="*"}=t,r=e;return Object.entries(d).forEach(([e,t])=>{r=r.replace(t,t=>n?t.length<=2?s.repeat(t.length):t[0]+s.repeat(Math.max(1,t.length-2))+t[t.length-1]:`[${e.toUpperCase()}_REDACTED]`)}),Object.entries(a).forEach(([e,t])=>{r=r.replace(t,`[${e.toUpperCase()}_REDACTED]`)}),r}function m(e,t,n){let a=u(t),s=n?u(JSON.stringify(n)):void 0;console[e](`[SAFE_LOG] ${a}`,s?JSON.parse(s):"")}function g(e){let t;let n=u((t=e,[/\$[\d,]+(?:\.\d{2})?\s*(?:per\s+year|annually|\/year|salary|income)/gi,/(?:income|salary|earning)\s*:?\s*\$[\d,]+(?:\.\d{2})?/gi,/(?:make|making|earn|earning)\s+\$[\d,]+(?:\.\d{2})?/gi].forEach(e=>{t=t.replace(e,e=>{let t=parseFloat(e.replace(/[^\d.]/g,""));return t<5e4?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[<50K]"):t<1e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[50K-100K]"):t<2e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[100K-200K]"):t<5e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[200K-500K]"):e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[>500K]")})}),t).replace(/\$[\d,]+(?:\.\d{2})?/g,e=>{let t=parseFloat(e.replace(/[$,]/g,""));return t<1e3?"$[<1K]":t<1e4?"$[1K-10K]":t<1e5?"$[10K-100K]":t<1e6?"$[100K-1M]":"$[>1M]"})),a=Object.values(d).some(t=>t.test(e)),s=(e.match(/\*/g)||[]).length-(n.match(/\*/g)||[]).length;return{sanitized:n,hasPII:a,redactionCount:Math.abs(s)}}let h=new c.ZP({apiKey:process.env.OPENAI_API_KEY});async function f(e){let{prompt:t,context:n="",systemPrompt:a=`
You are **MoneyXprt**, an AI financial co-pilot for high-income W-2 earners and real estate investors.

Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if info is missing.
- Avoid guarantees or absolutes ("prevents," "ensures," "guarantees"). If the user asks for certainty, explain limits.
- Prefer Next.js + Supabase + Tailwind + Vercel patterns in code suggestions.
- When code is needed, provide copy-paste blocks with minimal explanation.

Output format:
- Short paragraphs, bullets when helpful.
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified].
- Always include appropriate disclaimers for financial advice.

Privacy Notice: User data has been automatically sanitized to protect PII.
`,userId:s,maxTokens:r=500,temperature:i=.2}=e,o=p(`${t}:${n}:${Date.now()}`);try{if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY not configured");let{sanitized:e,hasPII:c}=g(t),{sanitized:l,hasPII:d}=g(n),u=c||d;m("info","AI request initiated",{requestHash:o,userId:s?p(s).substring(0,8):void 0,hasPII:u,sanitized:u,promptLength:t.length,contextLength:n.length});let f=[{role:"system",content:a},...l?[{role:"system",content:`Context: ${l}`}]:[],{role:"user",content:e}],y=await h.chat.completions.create({model:"gpt-4o",temperature:i,max_tokens:r,messages:f}),b=y.choices[0]?.message?.content?.trim()||"";return m("info","AI request completed",{requestHash:o,responseLength:b.length,tokensUsed:y.usage?.total_tokens||0,promptTokens:y.usage?.prompt_tokens||0,completionTokens:y.usage?.completion_tokens||0}),{response:b,requestHash:o,hasPII:u,sanitized:u}}catch(e){return m("error","AI request failed",{requestHash:o,error:e.message,userId:s?p(s).substring(0,8):void 0}),{response:"",requestHash:o,hasPII:!1,sanitized:!1,error:e.message||"Unknown error"}}}async function y(e,t,n){return f({prompt:e,context:t,systemPrompt:`
You are **MoneyXprt Entity Optimizer**, specializing in business structure optimization.

Core function: Recommend optimal entity formations for tax efficiency and liability protection.

Rules:
- Compare 2-3 most relevant entity options with pros/cons
- Include setup costs and compliance requirements with [Estimated] labels
- Never guarantee legal protection or tax savings
- Always include "consult an attorney and CPA" disclaimers
- Focus on legitimate structures: LLC, S-Corp, Solo 401k, real estate holding companies

Specialties: Real estate holding structures, high-income optimization, multi-state considerations, self-employment tax.
`,userId:n,maxTokens:600})}async function b(e){try{let{w2:t,re_units:n,side_income:a}=await e.json().catch(()=>({})),s=`Please analyze and recommend optimal entity structures for this situation:

Income Sources:
- W2 Income: $${t||0}
- Real Estate Units: ${n||0}
- Side Business Income: $${a||0}

Please provide:
1. Recommended entity structure(s) with rationale
2. Tax implications and potential savings
3. Asset protection considerations
4. State-specific factors to consider
5. Setup and maintenance requirements
6. Next steps and timeline
7. Estimated costs for setup and ongoing maintenance`,r=await y(s);return o.NextResponse.json({ok:!0,message:r.response,sha256:r.requestHash})}catch(e){return o.NextResponse.json({error:e?.message||"Unexpected error"},{status:500})}}let v=new s.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/entity-opt/route",pathname:"/api/entity-opt",filename:"route",bundlePath:"app/api/entity-opt/route"},resolvedPagePath:"/Users/ianjoachim/Documents/GitHub/MoneyXprt/app/api/entity-opt/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:$,staticGenerationAsyncStorage:A,serverHooks:x}=v,I="/api/entity-opt/route";function P(){return(0,i.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:A})}}};var t=require("../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),a=t.X(0,[948,972,122],()=>n(1303));module.exports=a})();