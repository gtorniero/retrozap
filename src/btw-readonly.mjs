// GET /api/btw/metrics: aggregate-only integration; disabled until BTW_READ_TOKEN is configured.
export function acceptableToken(s){return typeof s==='string'&&!/\s/.test(s)&&new Set(s).size>=10&&((s.length>=32)||(s.length>=15&&/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/\d/.test(s)&&/[^a-zA-Z0-9]/.test(s)));}
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
const digest=s=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(x=>new Uint8Array(x));
async function equal(a,b){const [x,y]=await Promise.all([digest(a),digest(b)]);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0;}
const safe=async(fn)=>{try{return {status:'available',data:await fn()};}catch{return {status:'error',data:null};}};
export function createMetricsHandler({analytics,busca}){
 return async({request,env})=>{
  if(request.method!=='GET')return reply({error:'method_not_allowed'},405);
  if(!acceptableToken(env.BTW_READ_TOKEN))return reply({error:'integration_not_configured'},503);
  const auth=request.headers.get('Authorization')||'';
  if(!auth.startsWith('Bearer ')||!await equal(auth.slice(7),env.BTW_READ_TOKEN))return reply({error:'unauthorized'},401);
  // Fixed Retrozap resources, no arbitrary URLs/property selectors and no admin writes.
  const [ga,search,payments]=await Promise.all([
   safe(async()=>{const x=await analytics(env);if(x.erro||!Array.isArray(x.total))throw Error();return {period:'29daysAgo..today',users:number(x.total[0]),sessions:number(x.total[1]),pageviews:number(x.total[2]),channels:(x.canais||[]).slice(0,8).filter(x=>Array.isArray(x)&&typeof x[0]==='string').map(x=>[x[0].slice(0,100),number(x[1])])};}),
   safe(async()=>{const x=await busca(env);if(x.erro||!x.total)throw Error();return {period:'30daysAgo..yesterday',clicks:number(x.total.cliques),impressions:number(x.total.impressoes),ctr:number(x.total.ctr),position:number(x.total.posicao)};}),
   safe(async()=>{if(!env.DB)throw Error();const r=await env.DB.prepare("SELECT COUNT(*) AS count, COUNT(DISTINCT email) AS customers, SUM(CAST(valor AS REAL)) AS gross_brl FROM compras WHERE modo = 'ligada' AND status = 'pago'").first();if(!r)throw Error();return {source:'Retrozap D1 compras',period:'accumulated',count:number(r.count),customers:number(r.customers),gross_brl:number(r.gross_brl),fees_brl:null,bank_payout_brl:null};})
  ]);
  return reply({product:'Retrozap',observed_at:new Date().toISOString(),analytics:ga,search,payments});
 };
}
