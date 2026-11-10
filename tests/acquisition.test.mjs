import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAcquisitionCollector,publicPage,label,selectSite} from '../src/btw-acquisition.mjs';
import worker from '../src/index.js';

test('existing endpoint still requires its server credential before collecting any report',async()=>{
 for(const suffix of ['', '?scope=acquisition', '?section=acquisition']) for(const headers of [{},{Authorization:'Bearer invalid'}]){
  const response=await worker.fetch(new Request('https://retrozap.com.br/api/btw/metrics'+suffix,{headers}),{BTW_READ_TOKEN:'1234567890abcdef-abcdef1234567890-test'},{waitUntil(p){p.catch(()=>{});}});
  assert.equal(response.status,401);
 }
});

test('private URLs and querystrings never appear in landing pages or search labels',()=>{
 assert.equal(publicPage('/criar?email=a@example.com','Quiddo'),'/criar');
 for(const p of ['/host/ABCD','/ABCD','/conta/pessoa','/api/login?token=secret'])assert.equal(publicPage(p,'Quiddo'),'(outras rotas)');
 assert.equal(label('a@example.com'),'(omitido)');assert.equal(label('11975976215'),'(omitido)');
 assert.equal(selectSite([{siteUrl:'sc-domain:quiddo.com.br',permissionLevel:'siteUnverifiedUser'}],'quiddo.com.br'),null);
});
test('public Retrozap blog pages retain SEO visibility without private paths or query data',()=>{
 assert.equal(publicPage('https://retrozap.com.br/blog/girias-mais-usadas-no-whatsapp?email=a@example.com#private','Retrozap'),'/blog/girias-mais-usadas-no-whatsapp');
 assert.equal(publicPage('/blog','Retrozap'),'/blog');
 for(const path of ['/blog/a@example.com','/blog/user-11975976215','/blog/%61%40example.com','/blog/private/token','/blog/'+ 'a'.repeat(102)])assert.equal(publicPage(path,'Retrozap'),'(outras rotas)');
 assert.equal(publicPage('/blog/girias-mais-usadas-no-whatsapp','Quiddo'),'(outras rotas)');
});
test('both periods, independent search totals, scoped GA fields, explicit per-product denial and cached reads',async()=>{
 const calls=[];
 const google=async(env,url,body)=>{
  calls.push({url,body});
  if(body.requests)return {reports:await Promise.all(body.requests.map(request=>google(env,url.replace(':batchRunReports',':runReport'),request)))};
  if(url.includes('analyticsdata')){
   const names=body.dimensions.map(x=>x.name);
   assert(!names.includes('landingPagePlusQueryString'));
   assert.equal(body.currencyCode,'BRL');
   if(names.includes('sessionSourceMedium'))return {metadata:{timeZone:'America/Sao_Paulo'},rows:[{dimensionValues:[{value:'google / cpc'},{value:'Paid Search'}],metricValues:[{value:'9'},{value:'0'},{value:'0'},{value:'0'}]}]};
   if(names.includes('landingPage'))return {metadata:{timeZone:'America/Sao_Paulo'},rows:[{dimensionValues:[{value:'/criar?token=SECRET'}],metricValues:[{value:'3'},{value:'1'}]}]};
   return {metadata:{timeZone:'America/Sao_Paulo'},rows:[{dimensionValues:[{value:'page_view'}],metricValues:[{value:'4'},{value:'2'}]}]};
  }
  if(!body.dimensions)return {rows:[{clicks:100,impressions:500,ctr:.2,position:4}]};
  if(body.dimensions[0]==='query')return {rows:[{keys:['quiz online'],clicks:2,impressions:10,ctr:.2,position:3}]};
  if(body.dimensions[0]==='page')return {rows:[{keys:['https://retrozap.com.br/arquivo?email=secret'],clicks:2,impressions:10,ctr:.2,position:3}]};
  return {rows:[]};
 };
 const collector=createAcquisitionCollector(google,async()=>({siteEntry:[{siteUrl:'sc-domain:retrozap.com.br',permissionLevel:'siteOwner'}]}));
 const now=Date.parse('2026-11-08T00:00:00Z');const data=await collector({GOOGLE_SA:'present'},now);
 assert.equal(data.Quiddo.reports.length,2);
 assert.equal(data.Quiddo.reports[0].traffic.rows[0].source_medium,'google / cpc');
 assert.equal(data.Quiddo.reports[0].landing_pages.rows[0].path,'/criar');
 assert.equal(data.Quiddo.reports[0].search.error_code,'GSC_ACCESS_DENIED');
 assert.equal(data.Retrozap.reports[0].search.totals.clicks,100);
 assert.equal(data.Retrozap.reports[0].search.queries[0].clicks,2);
 assert.equal(data.Retrozap.reports[0].search.end_date,'2026-11-06');
 assert.equal(data.Quiddo.reports[0].end_date,'2026-11-07');
 assert(!JSON.stringify(data).includes('SECRET'));assert(!JSON.stringify(data).includes('secret'));
 const count=calls.length;await collector({GOOGLE_SA:'present'},now+1000);assert.equal(calls.length,count);
});
test('failure of one report does not hide other reports, and missing dates are not invented',async()=>{
 const collector=createAcquisitionCollector(async(_env,url,body)=>{
  if(body.requests)throw Error('INVALID_ARGUMENT: dimension invalid');
  if(url.includes('analyticsdata')&&body.dimensions[0].name==='landingPage')throw Error('Permission denied');
  return {metadata:{timeZone:'America/Rio_Branco'},rows:[]};
 },async()=>({siteEntry:[]}));
 const d=await collector({GOOGLE_SA:'present'});
 assert.equal(d.Retrozap.reports[0].landing_pages.error_code,'GA_ACCESS_DENIED');
 assert.equal(d.Retrozap.reports[0].traffic.status,'available');
 assert.equal(d.Retrozap.reports[0].time_zone,'America/Rio_Branco');
});

test('cold dedicated acquisition stays below the per-invocation request budget for all products',async()=>{
 let requests=1; // listSites; OAuth would add at most one more
 const collector=createAcquisitionCollector(async(_env,url,body)=>{
  requests++;assert(requests<=49);
  if(url.includes('analyticsdata')){assert.equal(body.requests.length,3);return {reports:body.requests.map(()=>({metadata:{timeZone:'America/Sao_Paulo'},rows:[]}))};}
  return {rows:[]};
 },async()=>({siteEntry:['retrozap.com.br','quiddo.com.br','sportdna.com.br'].map(domain=>({siteUrl:'sc-domain:'+domain,permissionLevel:'siteOwner'}))}));
 assert.equal(collector.peek(),null);
 const data=await collector({GOOGLE_SA:'present'});
 assert.equal(requests,31);
 for(const product of Object.values(data))for(const report of product.reports)for(const key of ['traffic','landing_pages','events','search'])assert.equal(report[key].status,'available');
 assert.deepEqual(await collector.peek(),data);
});
test('limit diagnostics do not leak raw provider errors or retry access failures',async()=>{
 let calls=0;const collector=createAcquisitionCollector(async()=>{calls++;throw Error('Too many subrequests. PRIVATE');},async()=>({siteEntry:[]}));
 const data=await collector({GOOGLE_SA:'present'});
 assert.equal(calls,6);assert.equal(data.Quiddo.reports[0].traffic.error_code,'GA_SUBREQUEST_LIMIT');assert(!JSON.stringify(data).includes('PRIVATE'));
});
test('dedicated read uses the same auth and does not touch payment/core queries',async()=>{
 let queries=0;const response=await worker.fetch(new Request('https://retrozap.com.br/api/btw/metrics?section=acquisition',{headers:{Authorization:'Bearer 1234567890abcdef-abcdef1234567890-test'}}),{BTW_READ_TOKEN:'1234567890abcdef-abcdef1234567890-test',DB:{prepare(sql){if(/compras/.test(sql))queries++;throw Error('audit log not implemented in test');}}},{waitUntil(p){p.catch(()=>{});}});
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.product,'Retrozap');assert.equal(data.acquisition.status,'error');assert.equal(queries,0);assert.equal(data.payments,undefined);assert.equal(data.diagnostics.external_requests,0);
});
