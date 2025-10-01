"use strict";(()=>{var e={};e.id=261,e.ids=[261],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1235:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>d});var n={};a.r(n),a.d(n,{POST:()=>l});var i=a(9303),s=a(8716),r=a(3131),o=a(7070),c=a(6578);async function l(e){try{let t=(await e.formData()).get("file");if(!(t instanceof Blob))return o.NextResponse.json({error:"PDF is required (field name: file)"},{status:400});let a=`Please provide comprehensive tax optimization strategies focusing on:

1. Entity Structure Optimization
   - LLC/S-Corp analysis for business income
   - Real estate holding company considerations
   - Professional service corporation options

2. Tax-Advantaged Account Maximization
   - Traditional/Roth strategy based on income levels
   - Backdoor and Mega Backdoor Roth opportunities
   - HSA/FSA optimization strategies
   - Solo 401(k) and SEP IRA analysis

3. Real Estate Tax Strategies
   - Cost segregation opportunities
   - 1031 exchange evaluation
   - QBI deduction optimization
   - Short-term vs long-term rental considerations

4. Investment Tax Optimization
   - Tax-loss harvesting opportunities
   - Asset location optimization across accounts
   - Tax-efficient fund selection criteria
   - Capital gains management strategies

5. Estate Planning Integration
   - Trust structure recommendations
   - Gifting strategies and annual limits
   - Legacy planning considerations
   - Generation-skipping strategies

6. Risk Management
   - Asset protection structures
   - Insurance integration with tax planning
   - Liability mitigation strategies

Please provide specific action items with:
- Estimated financial impact [Estimated]
- Implementation timeline
- Required professional assistance
- Compliance requirements
- Ongoing maintenance needs`,n=await (0,c.Am)(a);return o.NextResponse.json({ok:!0,message:n.response,sha256:n.requestHash,filename:t?.name??"upload.pdf"})}catch(e){return o.NextResponse.json({error:e?.message||"Unexpected error"},{status:500})}}let p=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/tax-scan/route",pathname:"/api/tax-scan",filename:"route",bundlePath:"app/api/tax-scan/route"},resolvedPagePath:"/Users/ianjoachim/Documents/GitHub/MoneyXprt/app/api/tax-scan/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:u,staticGenerationAsyncStorage:d,serverHooks:m}=p,g="/api/tax-scan/route";function h(){return(0,r.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:d})}},6578:(e,t,a)=>{a.d(t,{e3:()=>m,Am:()=>d});var n=a(4122);let i=require("crypto");function s(e){return(0,i.createHash)("sha256").update(e,"utf8").digest("hex")}let r={ssn:/\b\d{3}-?\d{2}-?\d{4}\b/g,creditCard:/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,phone:/\b\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g,email:/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,bankAccount:/\b\d{8,17}\b/g,ein:/\b\d{2}-?\d{7}\b/g,routing:/\b\d{9}\b/g,address:/\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct)\b/gi};function o(e,t={}){let{preserveFormat:a=!0,customPatterns:n={},redactionChar:i="*"}=t,s=e;return Object.entries(r).forEach(([e,t])=>{s=s.replace(t,t=>a?t.length<=2?i.repeat(t.length):t[0]+i.repeat(Math.max(1,t.length-2))+t[t.length-1]:`[${e.toUpperCase()}_REDACTED]`)}),Object.entries(n).forEach(([e,t])=>{s=s.replace(t,`[${e.toUpperCase()}_REDACTED]`)}),s}function c(e,t,a){let n=o(t),i=a?o(JSON.stringify(a)):void 0;console[e](`[SAFE_LOG] ${n}`,i?JSON.parse(i):"")}function l(e){let t;let a=o((t=e,[/\$[\d,]+(?:\.\d{2})?\s*(?:per\s+year|annually|\/year|salary|income)/gi,/(?:income|salary|earning)\s*:?\s*\$[\d,]+(?:\.\d{2})?/gi,/(?:make|making|earn|earning)\s+\$[\d,]+(?:\.\d{2})?/gi].forEach(e=>{t=t.replace(e,e=>{let t=parseFloat(e.replace(/[^\d.]/g,""));return t<5e4?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[<50K]"):t<1e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[50K-100K]"):t<2e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[100K-200K]"):t<5e5?e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[200K-500K]"):e.replace(/\$[\d,]+(?:\.\d{2})?/,"$[>500K]")})}),t).replace(/\$[\d,]+(?:\.\d{2})?/g,e=>{let t=parseFloat(e.replace(/[$,]/g,""));return t<1e3?"$[<1K]":t<1e4?"$[1K-10K]":t<1e5?"$[10K-100K]":t<1e6?"$[100K-1M]":"$[>1M]"})),n=Object.values(r).some(t=>t.test(e)),i=(e.match(/\*/g)||[]).length-(a.match(/\*/g)||[]).length;return{sanitized:a,hasPII:n,redactionCount:Math.abs(i)}}let p=new n.ZP({apiKey:process.env.OPENAI_API_KEY});async function u(e){let{prompt:t,context:a="",systemPrompt:n=`
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
`,userId:i,maxTokens:r=500,temperature:o=.2}=e,u=s(`${t}:${a}:${Date.now()}`);try{if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY not configured");let{sanitized:e,hasPII:d}=l(t),{sanitized:m,hasPII:g}=l(a),h=d||g;c("info","AI request initiated",{requestHash:u,userId:i?s(i).substring(0,8):void 0,hasPII:h,sanitized:h,promptLength:t.length,contextLength:a.length});let f=[{role:"system",content:n},...m?[{role:"system",content:`Context: ${m}`}]:[],{role:"user",content:e}],y=await p.chat.completions.create({model:"gpt-4o",temperature:o,max_tokens:r,messages:f}),x=y.choices[0]?.message?.content?.trim()||"";return c("info","AI request completed",{requestHash:u,responseLength:x.length,tokensUsed:y.usage?.total_tokens||0,promptTokens:y.usage?.prompt_tokens||0,completionTokens:y.usage?.completion_tokens||0}),{response:x,requestHash:u,hasPII:h,sanitized:h}}catch(e){return c("error","AI request failed",{requestHash:u,error:e.message,userId:i?s(i).substring(0,8):void 0}),{response:"",requestHash:u,hasPII:!1,sanitized:!1,error:e.message||"Unknown error"}}}async function d(e,t,a){return u({prompt:e,context:t,systemPrompt:`
You are **MoneyXprt Tax Scanner**, specializing in tax optimization for high-income earners.

Core function: Analyze tax situations and identify optimization opportunities.

Rules:
- Focus on legitimate tax strategies: retirement contributions, HSAs, tax-loss harvesting, entity structures
- Never guarantee tax savings amounts
- Always include "consult a tax professional" disclaimers
- Prioritize highest-impact strategies first
- Label estimates with [Estimated] tags

Specialties: High-income tax brackets, real estate investor benefits, business entity optimization, retirement strategies.
`,userId:a,maxTokens:600})}async function m(e,t,a){return u({prompt:e,context:t,systemPrompt:`
You are **MoneyXprt Entity Optimizer**, specializing in business structure optimization.

Core function: Recommend optimal entity formations for tax efficiency and liability protection.

Rules:
- Compare 2-3 most relevant entity options with pros/cons
- Include setup costs and compliance requirements with [Estimated] labels
- Never guarantee legal protection or tax savings
- Always include "consult an attorney and CPA" disclaimers
- Focus on legitimate structures: LLC, S-Corp, Solo 401k, real estate holding companies

Specialties: Real estate holding structures, high-income optimization, multi-state considerations, self-employment tax.
`,userId:a,maxTokens:600})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),n=t.X(0,[948,972,122],()=>a(1235));module.exports=n})();