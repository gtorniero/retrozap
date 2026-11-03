import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {test} from 'node:test';
function database(){const sqlite=new DatabaseSync(':memory:');const prepare=(sql,values=[])=>({bind:(...v)=>prepare(sql,v),first:async()=>sqlite.prepare(sql).get(...values)||null,all:async()=>({results:sqlite.prepare(sql).all(...values)}),run:async()=>({meta:{changes:sqlite.prepare(sql).run(...values).changes}})});return {prepare,batch:async(s)=>Promise.all(s.map(x=>x.run()))};}
async function seed(db){await promoTables(db);await db.prepare('INSERT INTO promo_codes(id,hash,label,sites,created) VALUES (?,?,?,?,?)').bind('test',await promoHash('BTW-TEST-FRIENDS'),'Test','["retrozap","sportdna"]',Date.now()).run();}
import {promo,acesso,recuperar} from '../functions/api/pix.js';
import {promoTables,promoHash} from '../functions/api/promos.mjs';
const origin='https://retrozap.com.br';const req=(route,body)=>new Request(origin+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('coupon grants Premium, rejects invalid codes and retains access without paid revenue',async()=>{
 const db=database();await seed(db);const env={DB:db,PROMOS:db,COBRANCA:'ligada'};
 assert.equal((await promo({env,request:req('/api/promo',{email:'guest@example.com',codigo:'BAD-CODE'})})).status,400);
 const body={email:'guest@example.com',codigo:'BTW-TEST-FRIENDS'};
 const a=await (await promo({env,request:req('/api/promo',body)})).json();assert.equal(a.ok,true);
 const b=await (await promo({env,request:req('/api/promo',body)})).json();assert.equal(a.codigo,b.codigo);
 const result=await (await acesso({env,request:req('/api/acesso',{codigo:a.codigo})})).json();assert.equal(result.ok,true);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM compras").first()).n,0);
});
