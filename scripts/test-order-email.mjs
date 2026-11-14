import assert from 'node:assert/strict';
import { renderOrderEmail, canRequestOrderEmail, sendOrderEmail } from '../lib/order-email.ts';
import handler, { createOrderEmailHandler } from '../api/order-email.ts';
const job = { order_id:'10000000-0000-4000-8000-000000000001',kind:'received',recipient:'delegate@example.test',full_name:'<Delegate & team>',reference:'ORDER-TEST',total_minor:250000,items:[{name:'<T-shirt>',variant:'Official',size:'M',quantity:2,unit_price_minor:125000}],pickup_location:'Merch desk',claim_token:'claim' };
const origin='https://catalyst.example.test';
const received=renderOrderEmail(job,origin);
assert.match(received.subject,/awaiting verification/);
assert.match(received.text,/still under verification/);
assert.match(received.html,/&lt;Delegate &amp; team&gt;/);
assert.match(received.html,/&lt;T-shirt&gt;/);
assert.ok(!received.html.includes('<Delegate'));
assert.match(received.text,/LKR 2,500.00/);
const confirmed=renderOrderEmail({...job,kind:'confirmed'},origin);
assert.match(confirmed.subject,/Order confirmed/);
assert.match(confirmed.text,/verified your payment/);
assert.match(confirmed.text,/does not mean your order is ready/);
assert.throws(()=>renderOrderEmail(job,'http://unsafe.test'),/HTTPS/);
function mockDb(){
 let claimed=false;
 return { finish:null, async rpc(name,args){
  if(name==='claim_order_email'){
   assert.equal(args.p_kind,'received');
   if(claimed)return {data:[],error:null};
   claimed=true;return {data:[job],error:null};
  }
  this.finish=args;return {data:true,error:null};
 } };
}
const db=mockDb();let sent=0;
const smtp=async mail=>{sent++;assert.equal(mail.to,job.recipient);assert.match(mail.messageId,/catalyst-order-received-/);return {accepted:[mail.to],messageId:mail.messageId};};
const args=[origin,'sender@example.test'];
assert.deepEqual((await Promise.all([sendOrderEmail(db,job.order_id,'received',smtp,...args),sendOrderEmail(db,job.order_id,'received',smtp,...args)])).map(x=>x.status).sort(),['sent','unchanged']);
assert.equal(sent,1);assert.equal(db.finish.p_status,'sent');
for(const [error,status] of [[{code:'EAUTH'},'failed'],[{command:'RCPT TO'},'failed'],[{responseCode:550},'failed'],[{command:'DATA',code:'ETIMEDOUT'},'uncertain'],[new Error('interrupted'),'uncertain']]){
 const d=mockDb();assert.equal((await sendOrderEmail(d,job.order_id,'received',async()=>{throw error;},...args)).status,status);assert.equal(d.finish.p_status,status);
}
const broken=mockDb();const rpc=broken.rpc.bind(broken);broken.rpc=(name,params)=>name==='finish_order_email'?Promise.resolve({data:null,error:{message:'offline'}}):rpc(name,params);
assert.equal((await sendOrderEmail(broken,job.order_id,'received',smtp,...args)).status,'uncertain');
function accessDb(role,active,owner){return {from(table){return {select(){return this;},eq(){return this;},async maybeSingle(){return {data:table==='admin_memberships'?{role,is_active:active}:table==='orders'?{registration_id:'registration'}:{user_id:owner},error:null};}};}};}
assert.equal(await canRequestOrderEmail(accessDb(null,false,'caller'),'caller',job.order_id),true);
assert.equal(await canRequestOrderEmail(accessDb(null,false,'other'),'caller',job.order_id),false);
assert.equal(await canRequestOrderEmail(accessDb('viewer',true,'other'),'caller',job.order_id),false);
assert.equal(await canRequestOrderEmail(accessDb('admin',false,'other'),'caller',job.order_id),false);
assert.equal(await canRequestOrderEmail(accessDb('admin',true,'other'),'caller',job.order_id),true);
let code,body;const response={setHeader(){},set statusCode(value){code=value;},end(value){body=JSON.parse(value);}};
await handler({method:'GET',headers:{}},response);assert.equal(code,405);
await handler({method:'POST',headers:{}},response);assert.equal(code,401);
const saved={...process.env};
try{
 process.env.SUPABASE_URL=origin;process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';delete process.env.GMAIL_APP_PASSWORD;
 for(const [role,owner,anonymous,kind,expected] of [[null,'caller',true,'received',401],['viewer','other',false,'received',403],['admin','other',false,'invalid',400],[null,'caller',false,'received',503],['admin','other',false,'confirmed',503]]){
  const h=createOrderEmailHandler(()=>({...accessDb(role,true,owner),auth:{async getUser(){return {data:{user:{id:'caller',is_anonymous:anonymous}},error:null};}}}));
  await h({method:'POST',headers:{authorization:'Bearer test'},body:{orderId:job.order_id,kind}},response);assert.equal(code,expected);
 }
 assert.ok(!JSON.stringify(body).includes(job.recipient));
}finally{for(const key of Object.keys(process.env))if(!(key in saved))delete process.env[key];Object.assign(process.env,saved);}
console.log('PASS: order email contents, escaping, concurrent sends, failures, uncertain delivery, ownership and API guards. Fake SMTP only.');
