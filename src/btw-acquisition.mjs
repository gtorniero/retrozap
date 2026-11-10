const PRODUCTS = [['Retrozap','559410482','retrozap.com.br'],['Quiddo','562055723','quiddo.com.br'],['SPORT DNA','562098147','sportdna.com.br']];
const DAY = 86400000;
const offset = (date,n) => new Date(Date.parse(date)+n*DAY).toISOString().slice(0,10);
const number = value => Number.isFinite(Number(value)) && Number(value)>=0 ? Number(value) : null;
export function label(value) {
  const s=String(value||'').trim();
  return !s || s.length>160 || /@|\d[\d\s().+-]{6,}\d|[\u0000-\u001f]/.test(s) ? '(omitido)' : s;
}
export function publicPage(raw, product) {
  let path;
  try {path=new URL(String(raw), 'https://'+PRODUCTS.find(x=>x[0]===product)[2]).pathname;} catch{return '(outras rotas)';}
  path=path.replace(/\/+$/,'')||'/';
  const common=['/','/privacidade','/termos','/precos'];
  const routes=product==='Quiddo'?['/criar','/jogar','/entrar','/guias','/pagamento','/partida/anfitriao','/partida/jogador']:product==='Retrozap'?['/arquivo','/exportar','/crie-seu-premio','/ideias','/como-funciona','/exemplo','/blog']:['/surf','/racket','/run'];
  // Retrozap's blog is a static public route (public/blog/*.html), not user content.
  // Slugs exclude encoded data, nested/private paths and phone-like digit sequences.
  const article=product==='Retrozap'&&/^\/blog\/[a-z][a-z0-9-]{0,100}$/.test(path)&&!/\d{7,}/.test(path);
  return [...common,...routes].includes(path) || article || product==='Quiddo'&&/^\/guias\/[a-z][a-z0-9-]{0,80}$/.test(path) ? path : '(outras rotas)';
}
function errorCode(error,prefix) {
  const msg=String(error?.message||error);
  return prefix+(/too many subrequests|subrequest.*limit/i.test(msg)?'_SUBREQUEST_LIMIT':/permission|access|forbidden|403/i.test(msg)?'_ACCESS_DENIED':/quota|exhausted|429/i.test(msg)?'_QUOTA':/timeout|timed out|abort/i.test(msg)?'_TIMEOUT':'_REPORT_FAILED');
}
async function safe(fn,prefix) {try{return await fn();}catch(e){return {status:'error',error_code:errorCode(e,prefix),rows:[]};}}
const dimensions = names => names.map(name=>({name}));
function rows(report) {
  if (!report || !Array.isArray(report.rows||[])) throw Error('invalid_report');
  return (report.rows||[]).map(row=>({d:(row.dimensionValues||[]).map(x=>x.value),m:(row.metricValues||[]).map(x=>number(x.value))}));
}
function grouped(input,key,metrics) {
  const out=new Map();
  for(const row of input){const id=row[key];if(!out.has(id))out.set(id,{...row});else for(const metric of metrics){const prior=out.get(id);prior[metric]=prior[metric]===null||row[metric]===null?null:prior[metric]+row[metric];}}
  return [...out.values()];
}
export function selectSite(entries,domain) {
  const sites=(entries||[]).filter(x=>x.permissionLevel!=='siteUnverifiedUser').map(x=>x.siteUrl);
  return ['sc-domain:'+domain,'https://www.'+domain+'/','https://'+domain+'/'].find(x=>sites.includes(x)) || null;
}
export function createAcquisitionCollector(google, listSites) {
  let cache;
  async function ga(env,id,product,start,end) {
    const base={dateRanges:[{startDate:start,endDate:end}],currencyCode:'BRL',limit:1000};
    const requests=[
      {...base,dimensions:dimensions(['sessionSourceMedium','sessionDefaultChannelGroup']),metrics:dimensions(['sessions','engagedSessions','ecommercePurchases','purchaseRevenue']),orderBys:[{metric:{metricName:'sessions'},desc:true}]},
      {...base,dimensions:dimensions(['landingPage']),metrics:dimensions(['sessions','engagedSessions']),orderBys:[{metric:{metricName:'sessions'},desc:true}]},
      {...base,dimensions:dimensions(['eventName']),metrics:dimensions(['eventCount','totalUsers']),orderBys:[{metric:{metricName:'eventCount'},desc:true}]}
    ];
    // One HTTP request for three reports. Only a schema incompatibility falls back
    // to separate reports; access/quota failures are not retried three times.
    let reports;
    try {
      const batch=await google(env,`https://analyticsdata.googleapis.com/v1beta/properties/${id}:batchRunReports`,{requests});
      if(!Array.isArray(batch.reports)||batch.reports.length!==requests.length)throw Error('invalid_batch');
      reports=batch.reports.map(report=>({status:'available',report}));
    } catch(e) {
      if(/invalid.argument|invalid_batch|dimension|metric|not.*valid|unknown.*field/i.test(String(e?.message||''))) {
        reports=await Promise.all(requests.map(body=>safe(async()=>({status:'available',report:await google(env,`https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`,body)}),'GA')));
      } else reports=requests.map(()=>({status:'error',error_code:errorCode(e,'GA'),rows:[]}));
    }
    const [traffic,landing,events]=reports;
    const meta=r=>({thresholded:!!r.metadata?.subjectToThresholding,row_count:r.rowCount??(r.rows||[]).length,truncated:(r.rowCount||0)>1000});
    return {
      time_zone:reports.find(x=>x.report?.metadata?.timeZone)?.report.metadata.timeZone || 'unknown',
      traffic:traffic.status!=='available'?traffic:{status:'available',...meta(traffic.report),scope:'session',rows:rows(traffic.report).map(({d,m})=>({source_medium:label(d[0]),channel:label(d[1]),sessions:m[0],engaged_sessions:m[1],purchases:m[2],revenue_brl:m[3]}))},
      landing_pages:landing.status!=='available'?landing:{status:'available',...meta(landing.report),scope:'session',rows:grouped(rows(landing.report).map(({d,m})=>({path:publicPage(d[0],product),sessions:m[0],engaged_sessions:m[1]})),'path',['sessions','engaged_sessions']).slice(0,20)},
      events:events.status!=='available'?events:{status:'available',...meta(events.report),scope:'event',rows:rows(events.report).filter(({d})=>/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(d[0])&&!/\d{7,}/.test(d[0])).map(({d,m})=>({event:d[0],count:m[0],users:m[1]}))}
    };
  }
  async function search(env,site,product,start,end) {
    if(!site)return {status:'error',error_code:'GSC_ACCESS_DENIED',start_date:start,end_date:end};
    return safe(async()=>{
      const url=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
      const body={startDate:start,endDate:end,type:'web',dataState:'final'};
      const [daily,queries,pages,total]=await Promise.all([
        google(env,url,{...body,dimensions:['date'],rowLimit:31}),
        google(env,url,{...body,dimensions:['query'],rowLimit:20}),
        google(env,url,{...body,dimensions:['page'],rowLimit:20}),
        google(env,url,body)
      ]);
      const normalize = x=>({clicks:number(x?.clicks??0),impressions:number(x?.impressions??0),ctr:x?number(x.ctr):null,position:x?number(x.position):null});
      return {status:'available',property:site,start_date:start,end_date:end,time_zone:'America/Los_Angeles',data_state:'final',query_rows_complete:false,
        days:(daily.rows||[]).map(x=>({date:x.keys?.[0],clicks:number(x.clicks),impressions:number(x.impressions)})),
        queries:(queries.rows||[]).map(x=>({label:label(x.keys?.[0]),...normalize(x)})).filter(x=>x.label!=='(omitido)'),
        pages:(pages.rows||[]).map(x=>({label:publicPage(x.keys?.[0],product),...normalize(x)})).filter(x=>x.label!=='(outras rotas)'),
        totals:normalize(total.rows?.[0])};
    },'GSC').then(x=>({...x,start_date:start,end_date:end}));
  }
  async function collect(env,now=Date.now()) {
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date(now));
    if(cache?.day===today&&cache.until>now)return cache.value;
    const value=(async()=>{
      if(!env.GOOGLE_SA)throw Error('not_configured');
      const sites=await safe(()=>listSites(env),'GSC');
      return Object.fromEntries(await Promise.all(PRODUCTS.map(async([product,id,domain])=>{
        const reports=[];
        for(const days of [7,30]) {
          const start=offset(today,1-days),searchEnd=offset(today,-1),searchStart=offset(searchEnd,1-days);
          const data=await ga(env,id,product,start,today);
          const result=sites.status==='error'?{status:'error',error_code:sites.error_code,start_date:searchStart,end_date:searchEnd}:await search(env,selectSite(sites.siteEntry,domain),product,searchStart,searchEnd);
          reports.push({days,start_date:start,end_date:today,observed_at:new Date(now).toISOString(),partial_current_day:true,method:'native_property_timezone',...data,search:result});
        }
        return [product,{property_id:id,status:'available',reports}];
      })));
    })();
    cache={day:today,until:now+300000,value};
    try{return await value;}catch(e){cache=undefined;throw e;}
  }
  // The main metrics request must not launch another 30+ external requests.
  // It may reuse a fresh result collected by the separately authenticated read.
  collect.peek = (now=Date.now()) => cache?.until>now ? cache.value : null;
  return collect;
}
