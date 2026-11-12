import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
alter table storage.objects enable row level security;
grant usage on schema public,auth,storage to anon,authenticated;
grant select,insert on storage.objects to authenticated;
create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;`);
const root=fileURLToPath(new URL('../supabase',import.meta.url));
if(process.argv.includes('--setup')){
 await db.exec(await readFile(root+'/setup.sql','utf8'));console.log('Applied setup.sql');
}else{
 for(const name of (await readdir(root+'/migrations')).sort().filter(name=>!process.argv.includes('--skip-006')||!name.includes('006_defer_payments'))){
 // Reproduce an existing helper from an earlier manually applied access script.
 if(name.includes('002_viewer_access'))await db.exec('create function private.can_view_admin() returns boolean language sql as $$select false$$');
 await db.exec(await readFile(root+'/migrations/'+name,'utf8'));console.log('Applied',name);
}
}
await db.exec(await readFile(root+'/seed.sql','utf8'));
console.log('Seed OK');
const admin='10000000-0000-4000-8000-000000000001';
const delegate='10000000-0000-4000-8000-000000000002';
const other='10000000-0000-4000-8000-000000000003';
const key='20000000-0000-4000-8000-000000000001';
let checks=0;
async function identity(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.query("select set_config('request.jwt.claims',$1,false)",[role==='anonymous'?'{}':JSON.stringify({is_anonymous:id===delegate})]);await db.exec(`set role ${role==='anonymous'?'anon':role}`);}
async function denied(action,pattern){await assert.rejects(action,pattern);checks++;}
await db.exec(`insert into auth.users values('${admin}','admin@example.test',now()),('${delegate}','delegate@example.test',now()),('${other}','other@example.test',now());insert into public.admin_memberships(user_id,role) values('${admin}','admin');`);
await denied(()=>db.exec(`insert into public.admin_memberships(user_id,role) values('${other}','admin')`),/duplicate key/);
await identity(null,'anon');
await denied(()=>db.query('select * from public.registrations'),/permission denied/);
await denied(()=>db.query('select public.admin_shop_settings(true)'),/permission denied/);
await denied(()=>db.query('select public.place_order($1,$2,$3)',[key,'[]',100]),/permission denied/);
await identity(other);
await denied(()=>db.query('select public.admin_bank_details($1,$2,$3,$4)',['Bank','Event','123','Branch']),/Not authorized/);
await identity(admin);
await denied(()=>db.query('select public.admin_shop_settings(false)'),/Add the bank/);
await db.query('select public.admin_bank_details($1,$2,$3,$4)',['Test bank','Test event','123456','Test branch']);
assert.equal((await db.query('select coming_soon from public.shop_settings')).rows[0].coming_soon,true);checks++;
await db.query('select public.admin_shop_settings(false)');
await identity(delegate);
const answers={name:'Test Delegate',gender:'Other',nic:'200012345678',aiesecEmail:'delegate@example.test',email:'delegate@example.test',phone:'0771234567',year:'2nd Year',sem:'Semester 1',faculty:'Other','faculty-sp':'Test faculty',path:'oGV',rank:'Team Member',circle:'Other relevant function','circle-sp':'Test function',type:'The Scout',seek:'Leadership',drive:'Test motivation',diet:'Vegetarian',allergy:'Yes','allergy-sp':'Test allergy',safety:'Yes','safety-sp':'Test safety need',ecName:'Test contact',ecPhone:'0777654321'};
await db.query("insert into storage.objects(bucket_id,name,metadata) values('delegate-cvs',$1,$2)",[delegate+'/cv-key/cv',JSON.stringify({size:100,mimetype:'application/pdf'})]);
const file={storage_key:delegate+'/cv-key/cv',original_name:'test-cv.pdf'};
await denied(()=>db.query('select public.submit_registration($1,$2,$3) result',[key,JSON.stringify({...answers,'allergy-sp':''}),JSON.stringify(file)]),/Specify details/);
const registered=await db.query('select public.submit_registration($1,$2,$3) result',[key,JSON.stringify(answers),JSON.stringify(file)]);
const rid=registered.rows[0].result.id;
const wellbeing=await db.query('select * from public.registration_wellbeing where registration_id=$1',[rid]);
assert.equal(wellbeing.rows[0].has_allergies,true);assert.equal(wellbeing.rows[0].has_safety_needs,true);checks+=2;
assert.equal((await db.query('select university from public.registrations where id=$1',[rid])).rows[0].university,'SLIIT');checks++;
const repeated=await db.query('select public.submit_registration($1,$2,$3) result',[key,JSON.stringify(answers),JSON.stringify(file)]);assert.equal(repeated.rows[0].result.id,rid);checks++;
await identity(other);assert.equal((await db.query('select * from public.registrations')).rows.length,0);checks++;
await identity(admin);await db.query('select public.admin_shop_settings(true)');
await identity(delegate);assert.equal((await db.query('select * from public.products')).rows.length,0);checks++;
await identity(admin);await db.query('select public.admin_shop_settings(false)');
const variant=(await db.query('select id,price_minor from public.product_variants limit 1')).rows[0];
await identity(delegate);
const receiptKey=delegate+'/payment/test-receipt';
await db.query("insert into storage.objects(bucket_id,name,metadata) values('payment-receipts',$1,$2)",[receiptKey,JSON.stringify({size:100,mimetype:'application/pdf'})]);
const receipt={storage_key:receiptKey,original_name:'test-payment.pdf'};
const items=JSON.stringify([{variant_id:variant.id,quantity:2}]);
await denied(()=>db.query('select public.place_order($1,$2,$3)',[key,items,variant.price_minor*2]),/permission denied/);
await denied(()=>db.query('select public.place_preorder($1,$2,$3,$4)',[key,items,1,JSON.stringify(receipt)]),/Prices changed/);
assert.equal((await db.query('select * from public.orders')).rows.length,0);checks++;
const placed=(await db.query('select public.place_preorder($1,$2,$3,$4) result',[key,items,variant.price_minor*2,JSON.stringify(receipt)])).rows[0].result;
assert.ok(placed.reference.startsWith('CAT7-ORDER-'));checks++;
const repeatedOrder=(await db.query('select public.place_preorder($1,$2,$3,$4) result',[key,items,variant.price_minor*2,JSON.stringify(receipt)])).rows[0].result;assert.equal(repeatedOrder.id,placed.id);checks++;
assert.equal((await db.query('select * from public.order_receipts')).rows.length,1);checks++;
await identity(other);assert.equal((await db.query('select * from storage.objects')).rows.length,0);checks++;
await denied(()=>db.query('select public.admin_review_receipt($1,true)',[placed.id]),/Not authorized/);
assert.equal((await db.query('select * from public.orders')).rows.length,0);assert.equal((await db.query('select * from public.order_receipts')).rows.length,0);checks+=2;
await identity(admin);await db.query('select public.admin_shop_settings(true)');
await identity(delegate);const newKey='20000000-0000-4000-8000-000000000002';
await denied(()=>db.query('select public.place_preorder($1,$2,$3,$4)',[newKey,items,variant.price_minor*2,JSON.stringify(receipt)]),/temporarily coming soon/);
await identity(admin);await db.query('select public.admin_shop_settings(false)');
await denied(()=>db.query('select public.admin_order($1,$2)',[placed.id,'collected']),/Invalid order transition/);
await db.query('select public.admin_order($1,$2)',[placed.id,'ready_for_pickup']);
await denied(()=>db.query('select public.admin_order($1,$2)',[placed.id,'collected']),/Verify payment/);
await denied(()=>db.query('select public.admin_review_receipt($1,false)',[placed.id]),/Provide a reason/);
await db.query('select public.admin_review_receipt($1,false,$2)',[placed.id,'Test unreadable receipt']);
assert.equal((await db.query('select payment_status from public.orders where id=$1',[placed.id])).rows[0].payment_status,'unpaid');checks++;
await db.query('select public.admin_review_receipt($1,true)',[placed.id]);await db.query('select public.admin_review_receipt($1,true)',[placed.id]);
assert.equal((await db.query('select count(*)::int n from public.payments')).rows[0].n,1);checks++;
assert.equal((await db.query('select method from public.payments')).rows[0].method,'bank_transfer');checks++;
await db.query('select public.admin_order($1,$2)',[placed.id,'collected']);
const stock=(await db.query('select stock_on_hand,stock_reserved from public.product_variants where id=$1',[variant.id])).rows[0];assert.equal(stock.stock_on_hand,0);assert.equal(stock.stock_reserved,0);checks+=2;
const summary=(await db.query('select public.admin_summary() data')).rows[0].data;assert.equal(summary.schema_version,7);checks++;assert.equal(summary.pending_registrations,1);assert.equal(summary.awaiting_collection,0);checks+=2;
const unpaidAccess=(await db.query("select case when to_regprocedure('public.submit_preorder(uuid,jsonb,bigint)') is null then false else has_function_privilege('authenticated',to_regprocedure('public.submit_preorder(uuid,jsonb,bigint)'),'EXECUTE') end allowed")).rows[0].allowed;
assert.equal(unpaidAccess,false);checks++;
// Anonymous registration can submit only as its own anonymous Auth identity.
const anonymous='10000000-0000-4000-8000-000000000004';
const anonymousKey='20000000-0000-4000-8000-000000000004';
await identity(null,'anon');
await denied(()=>db.query('select public.submit_unverified_registration($1,$2,$3,null)',[anonymous,anonymousKey,JSON.stringify(answers)]),/permission denied/);
await db.exec('reset role');
await db.query('insert into auth.users values($1,$2,null)',[anonymous,null]);
await db.exec('reset role');
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[anonymous]);
await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({is_anonymous:true})]);
await db.exec('set role authenticated');
const anonAnswers={...answers,email:'delegate@example.test',aiesecEmail:'delegate@example.test'};
const anonRegistration=(await db.query('select public.submit_unverified_registration($1,$2,$3,null) result',[anonymous,anonymousKey,JSON.stringify(anonAnswers)])).rows[0].result;
assert.ok(anonRegistration.reference.startsWith('CAT7-DEL-'));checks++;
const retry=(await db.query('select public.submit_unverified_registration($1,$2,$3,null) result',[anonymous,anonymousKey,JSON.stringify(anonAnswers)])).rows[0].result;
assert.equal(retry.id,anonRegistration.id);checks++;
await denied(()=>db.query('select public.submit_unverified_registration($1,$2,$3,null)',[admin,anonymousKey,JSON.stringify(anonAnswers)]),/Start a new registration session/);
await db.exec('reset role');
assert.equal((await db.query('select email_confirmed_at from auth.users where id=$1',[anonymous])).rows[0].email_confirmed_at,null);checks++;
// Registration is persisted before anonymous identity has an Auth email.
await db.exec('reset role');
assert.equal((await db.query('select email from auth.users where id=$1',[anonymous])).rows[0].email,null);checks++;
// Sheets export: worker-only payload, retries, and concurrent registration edits.
await identity(other);
await denied(()=>db.query('select public.admin_sheet_sync_status()'),/Not authorized/);
await denied(()=>db.query('select public.admin_requeue_sheet_sync(true)'),/Not authorized/);
await denied(()=>db.query('select public.sheet_sync_batch()'),/permission denied/);
await denied(()=>db.query('select public.sheet_sync_ack($1,1)',[rid]),/permission denied/);
await identity(null,'anon');
await denied(()=>db.query('select public.admin_sheet_sync_status()'),/permission denied/);
await identity(admin);
let syncStatus=(await db.query('select public.admin_sheet_sync_status() s')).rows[0].s;
assert.equal(syncStatus.total,2);assert.equal(syncStatus.pending,2);checks+=2;
await db.exec('reset role');
const batch=(await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs;
const job=batch.find(j=>j.registration_id===rid);
assert.equal(job.cells.length,27);assert.equal(job.cells[0],rid);
assert.ok(!JSON.stringify(job).includes('Test allergy'));checks+=3;
await db.query('select public.sheet_sync_ack($1,$2,$3)',[rid,job.version,'test write failure']);
assert.ok(!(await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs.some(j=>j.registration_id===rid));checks++;
await identity(admin);await db.query('select public.admin_requeue_sheet_sync(false)');
await db.exec('reset role');
const retryJob=(await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs.find(j=>j.registration_id===rid);
await db.query("update public.registrations set status='approved' where id=$1",[rid]);
await db.query('select public.sheet_sync_ack($1,$2)',[rid,retryJob.version]);
const newerJob=(await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs.find(j=>j.registration_id===rid);
assert.ok(newerJob.version>retryJob.version);assert.equal(newerJob.cells[24],'approved');checks+=2;
await db.query('select public.sheet_sync_ack($1,$2)',[rid,newerJob.version]);
assert.ok(!(await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs.some(j=>j.registration_id===rid));checks++;
await identity(admin);await db.query('select public.admin_requeue_sheet_sync(true)');
await db.exec('reset role');
assert.ok((await db.query('select public.sheet_sync_batch() jobs')).rows[0].jobs.some(j=>j.registration_id===rid));checks++;
// Viewer permissions: run against real RLS policies and RPCs, never the live project.
const viewer='10000000-0000-4000-8000-000000000005';
const viewer2='10000000-0000-4000-8000-000000000006';
await db.exec('reset role');
await db.query('insert into auth.users values($1,$2,now()),($3,$4,now())',[viewer,'eb@example.test',viewer2,'viewer2@example.test']);
await db.query("insert into public.admin_memberships(user_id,role) values($1,'viewer'),($2,'viewer')",[viewer,viewer2]);
await denied(()=>db.query("insert into public.admin_memberships(user_id,role) values($1,'admin')",[other]),/duplicate key/);
await denied(()=>db.query("insert into public.admin_memberships(user_id,role) values($1,'owner')",[other]),/check constraint/);
await db.query("insert into storage.objects(bucket_id,name) values('delegate-cvs',$1)",[delegate+'/orphan/cv']);
const writeRpcs=(await db.query(`select p.proname, array(select format_type(t,null) from unnest(p.proargtypes::oid[]) t) argtypes
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname like 'admin_%'
 and p.proname not in ('admin_summary','admin_sheet_sync_status')`)).rows;
assert.ok(writeRpcs.length>=10);checks++;
await identity(viewer);
assert.equal((await db.query('select private.can_view_admin() allowed')).rows[0].allowed,true);checks++;
// Even passing viewer to the mutation helper must never authorize a viewer.
assert.equal((await db.query("select private.has_role(array['admin','owner','registration_manager','merch_manager','viewer']) allowed")).rows[0].allowed,false);checks++;
assert.equal((await db.query('select public.admin_summary() data')).rows[0].data.registrations,2);checks++;
assert.equal((await db.query('select public.admin_sheet_sync_status() data')).rows[0].data.total,2);checks++;
for(const table of ['registrations','registration_wellbeing','registration_files','products','product_variants','orders','order_items','payments','order_receipts','audit_events','registration_sheet_sync']){
 assert.ok((await db.query(`select * from public.${table}`)).rows.length>0,`Viewer can read ${table}`);checks++;
}
assert.equal((await db.query('select count(*)::int n from public.admin_memberships')).rows[0].n,1);checks++;
assert.equal((await db.query('select count(*)::int n from storage.objects')).rows[0].n,2);checks++;
for(const rpc of writeRpcs){
 const args=rpc.argtypes.map(type=>`null::${type}`).join(',');
 await denied(()=>db.query(`select public.${rpc.proname}(${args})`),/Not authorized|permission denied/);
}
for(const table of ['admin_memberships','registrations','registration_wellbeing','registration_files','products','product_variants','orders','order_items','payments','order_receipts','inventory_movements','audit_events','shop_settings','partnership_settings','registration_sheet_sync']){
 await denied(()=>db.query(`delete from public.${table}`),/permission denied/);
 await denied(()=>db.query(`insert into public.${table} default values`),/permission denied/);
}
await denied(()=>db.query("update public.admin_memberships set role='admin' where user_id=$1",[viewer]),/permission denied/);
await denied(()=>db.query("update public.registrations set status='rejected' where id=$1",[rid]),/permission denied/);
await denied(()=>db.query("insert into storage.objects(bucket_id,name) values('delegate-cvs',$1)",[delegate+'/viewer-upload/cv']),/row-level security/);
await denied(()=>db.query('select public.sheet_sync_batch()'),/permission denied/);
await denied(()=>db.query('select public.sheet_sync_ack($1,1)',[rid]),/permission denied/);
await identity(viewer2);
assert.equal((await db.query('select public.admin_summary() data')).rows[0].data.registrations,2);checks++;
// Revocation takes effect at the database even for an existing signed-in user.
await db.exec('reset role');
await db.query('update public.admin_memberships set is_active=false where user_id=$1',[viewer]);
await identity(viewer);
await denied(()=>db.query('select public.admin_summary()'),/Not authorized/);
await denied(()=>db.query('select public.admin_sheet_sync_status()'),/Not authorized/);
assert.equal((await db.query('select * from public.registrations')).rows.length,0);checks++;
assert.equal((await db.query('select * from storage.objects')).rows.length,0);checks++;
await identity(other);
await denied(()=>db.query('select public.admin_summary()'),/Not authorized/);
assert.equal((await db.query('select * from public.registrations')).rows.length,0);checks++;
await identity(admin);
assert.equal((await db.query("select role from public.admin_memberships where user_id=$1",[admin])).rows[0].role,'admin');checks++;
await db.query("select public.admin_registration($1,'approved',true)",[rid]);
assert.ok((await db.query('select checked_in_at from public.registrations where id=$1',[rid])).rows[0].checked_in_at);checks++;
await db.query('select public.admin_shop_settings(true)');
// Viewers can inspect hidden catalogue entries while the public shop is paused.
await identity(viewer2);
assert.ok((await db.query('select * from public.products')).rows.length>0);checks++;
await identity(other);
assert.equal((await db.query('select * from public.products')).rows.length,0);checks++;
// The provisioning template is safe to rerun and refuses to demote the admin.
await db.exec('reset role');
const provision=await readFile(root+'/templates/provision-viewer.sql','utf8');
await denied(()=>db.exec(provision),/Create the eb@cat.com Auth user/);
await db.exec('rollback');
const provisionViewer=provision.replaceAll('eb@cat.com','eb@example.test');
await db.exec(provisionViewer);await db.exec(provisionViewer);
assert.equal((await db.query('select role,is_active from public.admin_memberships where user_id=$1',[viewer])).rows[0].role,'viewer');checks++;
assert.equal((await db.query('select is_active from public.admin_memberships where user_id=$1',[viewer])).rows[0].is_active,true);checks++;
await denied(()=>db.exec(provision.replaceAll('eb@cat.com','admin@example.test')),/Refusing to change their role/);
await db.exec('rollback');
assert.equal((await db.query('select role from public.admin_memberships where user_id=$1',[admin])).rows[0].role,'admin');checks++;
// Rerunning the viewer upgrade with existing functions, policies and user data is safe.
const upgrade=await readFile(root+'/migrations/202611120002_viewer_access.sql','utf8');
const membershipsBefore=(await db.query('select * from public.admin_memberships order by user_id')).rows;
const registrationsBefore=(await db.query('select * from public.registrations order by id')).rows;
await db.exec(upgrade);await db.exec(upgrade);
assert.deepEqual((await db.query('select * from public.admin_memberships order by user_id')).rows,membershipsBefore);checks++;
assert.deepEqual((await db.query('select * from public.registrations order by id')).rows,registrationsBefore);checks++;
await identity(viewer);
assert.equal((await db.query('select public.admin_summary() data')).rows[0].data.registrations,2);checks++;
await denied(()=>db.query('select public.admin_shop_settings(false)'),/Not authorized/);
await identity(null,'anon');
await denied(()=>db.query('select private.can_view_admin()'),/permission denied/);
await denied(()=>db.query('select public.admin_summary()'),/permission denied/);
console.log(`PASS: ${checks} database assertions (normalization, identity isolation, permissions, viewer access, provisioning, pre-order atomicity, pause, payment and collection).`);
await db.close();
