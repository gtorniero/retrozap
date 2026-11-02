import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { acesso, recuperar } from '../fonte/build/pix.js';
let sqlite, env, enviados, fetchOriginal;
const email='retrozap-qa@example.com';
function db(sqlite) {
 const prepare=(sql,values=[])=>({bind:(...v)=>prepare(sql,v),first:async()=>sqlite.prepare(sql).get(...values)||null,run:async()=>({meta:{changes:sqlite.prepare(sql).run(...values).changes}})});
 return {prepare};
}
function req(data){return new Request('https://retrozap.com.br/api/recuperar',{method:'POST',body:JSON.stringify(data)})}
function compra(id,status='pago',modo='ligada') {sqlite.prepare('INSERT INTO compras(ref,email,status,codigo,pago,modo) VALUES (?,?,?,?,?,?)').run(id,email,status,'RZ-ABCD-EFGH',new Date().toISOString(),modo)}
beforeEach(()=>{
 sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE compras(ref TEXT PRIMARY KEY,ordem TEXT,email TEXT,status TEXT,codigo TEXT,criado TEXT,pago TEXT,valor TEXT,modo TEXT)');
 env={DB:db(sqlite),COBRANCA:'ligada',RESEND_KEY:'re_fixture',EMAIL_DE:'Retrozap <oi@retrozap.com.br>'};
 enviados=[];fetchOriginal=globalThis.fetch;globalThis.fetch=async(_url,options)=>{enviados.push(JSON.parse(options.body));return new Response('{}',{status:200})};
});
afterEach(()=>{globalThis.fetch=fetchOriginal;sqlite.close()});
test('e-mail sozinho nunca devolve o código nem libera acesso',async()=>{compra('paga');const r=await acesso({request:req({email}),env});const j=await r.json();assert.equal(j.ok,false);assert.equal(j.codigo,undefined);assert.equal(enviados.length,0)});
test('recuperação envia apenas à compra aprovada e não devolve código',async()=>{compra('paga');const r=await recuperar({request:req({email}),env});assert.deepEqual(await r.json(),{ok:true});assert.equal(enviados.length,1);assert.deepEqual(enviados[0].to,[email]);assert.equal(enviados[0].from,env.EMAIL_DE);assert.equal(enviados[0].reply_to,'oi@retrozap.com.br');assert.match(enviados[0].text,/RZ-ABCD-EFGH/)});
test('não revela quem comprou e ignora compras pendentes ou de teste',async()=>{compra('pendente','pendente');compra('teste','pago','teste');assert.deepEqual(await(await recuperar({request:req({email}),env})).json(),{ok:true});assert.equal(enviados.length,0)});
test('limita reenvio a um por dois minutos',async()=>{compra('paga');await recuperar({request:req({email}),env});await recuperar({request:req({email}),env});assert.equal(enviados.length,1)});
test('mantém a validação do código e bloqueia código de teste em produção',async()=>{compra('teste','pago','teste');assert.deepEqual(await(await acesso({request:req({codigo:'RZ-ABCD-EFGH'}),env})).json(),{ok:false});compra('paga');assert.deepEqual(await(await acesso({request:req({codigo:'RZ-ABCD-EFGH'}),env})).json(),{ok:true})});
