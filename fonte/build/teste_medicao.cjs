const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto').webcrypto;
const head = fs.readFileSync(__dirname + '/prod_head.js','utf8').split('/* ---------- Uma página')[0];
function client(choice='sim', safe=true, win={}){
 const storage = new Map([['rz_cookies',choice],['rz_marketing_v1',choice]]), hits=[], meta=[];
 const context={state:{sample:false},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{origin:'https://retrozap.com.br',pathname:'/'},window:Object.assign({addEventListener(){},rzSafeMeasurementPage:()=>safe,rzMetaPurchase:(...x)=>meta.push(x),rzMetaEvent:(...x)=>meta.push(x)},win),dataLayer:hits};
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
// cada etapa do funil também vira o evento recomendado de e-commerce do GA4, com valor em BRL
assert.deepEqual(Array.from(c.hits,x=>x[1]),['view_offer','view_item','checkout_attempt','begin_checkout','checkout_error']);
assert(!JSON.stringify(c.hits).includes('PRIVATE'));
assert.equal(c.hits[4][2].error_category,'network');
assert.equal(c.hits[1][2].value,13.99);assert.equal(c.hits[1][2].currency,'BRL');assert.equal(c.hits[3][2].items[0].item_id,'rz-premium');
c.hits.length=0;c.context.evento('pix_gerado');c.context.evento('cartao_aberto');
assert.deepEqual(Array.from(c.hits,x=>[x[1],x[2].payment_type]),[['pix_gerado',undefined],['add_payment_info','pix'],['cartao_aberto',undefined],['add_payment_info','card']]);
c.context.evento('checkout_error',{offer_context:'PRIVATE',payment_type:'PRIVATE',error_category:'PRIVATE'});
assert.deepEqual(Object.keys(c.hits.at(-1)[2]),[]);
c.storage.set('rz_cookies','nao');c.storage.set('rz_marketing_v1','nao');
const before=c.hits.length;c.context.evento('checkout_attempt',{offer_context:'casal',payment_type:'card'});assert.equal(c.hits.length,before);
// a Meta recebe só o nome do evento e, no Lead, grupo/casal; nunca os parâmetros livres
c=client();c.context.evento('final_visto',{modo:'casal',nome:'PRIVATE'});
assert.deepEqual(JSON.parse(JSON.stringify(c.meta.at(-1))),['final_visto',false,{modo:'casal'}]);
// Google Ads no GTM: rz_purchase com valor e id irreversível, só com aceite de marketing e GTM ligado
c=client('sim',true,{RZ_GTM:1});c.context.compraConfirmada({id,valor:8.99,moeda:'BRL'});
assert.deepEqual(JSON.parse(JSON.stringify(c.hits.find(x=>x.event==='rz_purchase'))),{event:'rz_purchase',value:8.99,currency:'BRL',transaction_id:id});
assert.equal(c.hits.find(x=>x[1]==='purchase')[2].items[0].item_id,'rz-premium');
// modo interno (?btw_interno=1): nada vai para GA4, Meta ou GTM
c=client('sim',true,{RZ_INTERNO:true,RZ_GTM:1});c.context.evento('view_offer');c.context.compraConfirmada({id,valor:8.99,moeda:'BRL'});
assert.equal(c.hits.length,0);assert.equal(c.meta.length,0);
// preço da oferta: o que o servidor mandou ao abrir o paywall (promoção), senão o preço cheio
c=client('sim',true,{RZ_PRECO:8.99});c.context.evento('view_offer');assert.equal(c.hits.find(x=>x[1]==='view_item')[2].value,8.99);
console.log('OK: oferta, tentativa e erro distintos de compra; e-commerce do GA4; rz_purchase; modo interno; parâmetros limitados e revogação respeitada.');
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
 // preço cobrado decidido pelo servidor: R$ 13,99; promoção de lançamento só quando ligada e dentro das datas (horário de Brasília)
 const cfg=await (await module.config({env:{COBRANCA:'ligada',MP_TOKEN:'x',DB:{},STRIPE_KEY:'x'}})).json();
 assert.equal(cfg.preco,'13,99');assert.equal(cfg.precoCartao,'13,99');assert.equal(cfg.promo,null);assert.equal(module.precoAtual(),'13.99');
 const P={ligado:true,de:'13,99',por:'8,99',inicio:'2026-12-01',fim:'2026-12-31'},t=Date.parse;
 assert.deepEqual(['2026-12-01T02:59:00Z','2026-12-01T03:00:00Z','2027-01-01T02:59:00Z','2027-01-01T03:00:00Z'].map(d=>module.precoAtual(t(d),P)),['13.99','8.99','8.99','13.99']);
 assert.equal(module.precoAtual(t('2026-12-15T12:00:00Z'),{...P,ligado:false}),'13.99');
 console.log('OK: consentimento, campos privados, URL segura, venda única, metadata de venda real, pendente e modo teste; preço 13,99 e promoção só na janela. Sem rede ou cobrança real.');
})().catch(e=>{console.error(e);process.exitCode=1});
// URLs de campanha continuam atribuíveis, mas pagamento/e-mail/fragmento nunca entram no GA4.
// confere o site recém-montado (fonte/retrozap-site) quando existe; senão, o publicado na raiz
const montado=__dirname+'/../retrozap-site/public/index.html';
const html=fs.readFileSync(fs.existsSync(montado)?montado:__dirname+'/../../public/index.html','utf8');
const configScript=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes("gtag('config', 'G-R8R1EN0KQN'"));
const config=(href,referrer)=>{const calls=[];vm.runInNewContext(configScript,{URL,Date,document:{referrer},location:{href,origin:'https://retrozap.com.br',pathname:'/'},gtag:(...x)=>calls.push(x)});return calls.find(x=>x[0]==='config')[2];};
let cfg=config('https://retrozap.com.br/?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01&ref=SEGREDO&email=pessoa%40example.com#PRIVADO','');
assert.equal(cfg.page_title,'Retrozap');assert.equal(cfg.page_referrer,'');
assert.equal(cfg.page_location,'https://retrozap.com.br/?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01');
// quem indicou a visita: só a origem (busca/rede social deixam de cair em Direto), nunca o caminho
cfg=config('https://retrozap.com.br/','https://www.google.com/search?q=retrospectiva+do+grupo');
assert.equal(cfg.page_referrer,'https://www.google.com/');
// nome de campanha com espaço/acento continua; UTM com e-mail sai
cfg=config('https://retrozap.com.br/?utm_campaign=Black%20Friday%20A%C3%A7%C3%A3o&utm_source=pessoa%40example.com&gclid=abc','https://l.instagram.com/?u=x');
assert.equal(new URL(cfg.page_location).searchParams.get('utm_campaign'),'Black Friday Ação');assert(!cfg.page_location.includes('example'));
assert.equal(new URL(cfg.page_location).searchParams.get('gclid'),'abc');assert.equal(cfg.page_referrer,'https://l.instagram.com/');
console.log('OK: atribuição de campanha e origem da visita preservadas, ref/e-mail/fragmento removidos dos parâmetros Google.');
