const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto').webcrypto;
const head = fs.readFileSync(__dirname + '/prod_head.js','utf8').split('/* ---------- Uma página')[0];
function client(choice='sim', safe=true){
 const storage = new Map([['rz_cookies',choice],['rz_marketing_v1',choice]]), hits=[], meta=[];
 const context={state:{sample:false},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{origin:'https://retrozap.com.br',pathname:'/'},window:{addEventListener(){},rzSafeMeasurementPage:()=>safe,rzMetaPurchase:(...x)=>meta.push(x),rzMetaEvent:(...x)=>meta.push(x)},dataLayer:hits};
 vm.createContext(context);vm.runInContext(head,context);return {context,hits,meta,storage};
}
const id='a'.repeat(64);
let c=client();
c.context.evento('premio_revelado',{premio:'NOME PRIVADO',email:'pessoa@example.com',mensagens:222,modo:'amigos'});
assert(!JSON.stringify(c.hits).includes('NOME PRIVADO'));assert(!JSON.stringify(c.hits).includes('example.com'));assert(!JSON.stringify(c.hits).includes('222'));
c.hits.length=0;c.meta.length=0;
c.context.compraConfirmada({id,valor:6.99,moeda:'BRL'});c.context.compraConfirmada({id,valor:6.99,moeda:'BRL'});
assert.equal(c.hits.filter(x=>x[1]==='purchase').length,1);assert.equal(c.meta.length,1);
for(const x of [client('nao'),client('sim',false)]){x.context.compraConfirmada({id,valor:8.99,moeda:'BRL'});assert.equal(x.hits.length,0);assert.equal(x.meta.length,0);}
c=client();for(const m of [null,{id:'RZ-SEGREDO',valor:6.99,moeda:'BRL'},{id,valor:-1,moeda:'BRL'},{id,valor:6.99,moeda:'USD'}])c.context.compraConfirmada(m);assert.equal(c.hits.length,0);
c=client();
for(const event of ['view_offer','checkout_attempt','checkout_error'])c.context.evento(event,{offer_context:'video',payment_type:'pix',error_category:'network',email:'PRIVATE',ref:'PRIVATE',message:'PRIVATE',nomes:['PRIVATE']});
assert.deepEqual(Array.from(c.hits,x=>x[1]),['view_offer','checkout_attempt','checkout_error']);
assert(!JSON.stringify(c.hits).includes('PRIVATE'));
assert.equal(c.hits[2][2].error_category,'network');
c.context.evento('checkout_error',{offer_context:'PRIVATE',payment_type:'PRIVATE',error_category:'PRIVATE'});
assert.deepEqual(Object.keys(c.hits.at(-1)[2]),[]);
c.storage.set('rz_cookies','nao');c.storage.set('rz_marketing_v1','nao');
const before=c.hits.length;c.context.evento('checkout_attempt',{offer_context:'casal',payment_type:'card'});assert.equal(c.hits.length,before);
console.log('OK: oferta, tentativa e erro distintos de compra; parâmetros limitados e revogação respeitada.');
(async()=>{
 const source=fs.readFileSync(__dirname+'/pix.js','utf8');
 const module=await import(require('node:url').pathToFileURL(__dirname+'/pix.js').href);
 global.crypto=crypto;
 for(const [mode,paid,amount] of [['ligada',true,'6.99'],['teste',true,'6.99'],['ligada',false,'6.99'],['ligada',true,'-1']]){
  const row={status:paid?'pago':'pendente',codigo:paid?'RZ-TEST-ONLY':null,valor:amount,modo:mode,ordem:'stripe:cs_test_only'};
  const env={STRIPE_KEY:'test-placeholder-not-a-key',DB:{prepare(sql){return {bind(){return this},async run(){return {meta:{changes:0}}},async first(){return row}}}}};
  const original=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({payment_status:'unpaid'})});
  const res=await module.status({request:new Request('https://retrozap.com.br/api/pix/status',{method:'POST',body:JSON.stringify({ref:'reference-only-for-unit-test'})}),env});global.fetch=original;
  const body=await res.json();assert.equal(body.pago,paid);
  if(mode==='ligada'&&paid&&Number(amount)>0){assert.match(body.medicao.id,/^[a-f0-9]{64}$/);assert.equal(body.medicao.valor,6.99);assert.equal(body.medicao.moeda,'BRL');assert(!JSON.stringify(body.medicao).includes('reference-only'));}
  else assert.equal(body.medicao,undefined);
 }
 console.log('OK: consentimento, campos privados, URL segura, venda única, metadata de venda real, pendente e modo teste. Sem rede ou cobrança real.');
})().catch(e=>{console.error(e);process.exitCode=1});
// URLs de campanha continuam atribuíveis, mas pagamento/e-mail/fragmento nunca entram no GA4.
const html=fs.readFileSync(__dirname+'/../../public/index.html','utf8');
const configScript=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes("gtag('config', 'G-R8R1EN0KQN'"));
const calls=[];
vm.runInNewContext(configScript,{URL,Date,location:{href:'https://retrozap.com.br/?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01&ref=SEGREDO&email=pessoa%40example.com#PRIVADO',origin:'https://retrozap.com.br',pathname:'/'},gtag:(...x)=>calls.push(x)});
const cfg=calls.find(x=>x[0]==='config')[2];
assert.equal(cfg.page_title,'Retrozap');assert.equal(cfg.page_referrer,'');
assert.equal(cfg.page_location,'https://retrozap.com.br/?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01');
console.log('OK: atribuição de campanha preservada, ref/e-mail/fragmento removidos dos parâmetros Google.');
