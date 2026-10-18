(()=>{
  const c=PG_CONFIG,$=id=>document.getElementById(id);let db,people=[],outsiders=[],allResidents=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const say=(id,s)=>$(id).textContent=s;
  const safeName=s=>String(s||'Resident').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
  function init(){if(!window.supabase||!c.SUPABASE_URL||c.SUPABASE_URL.includes('PASTE_')||!c.SUPABASE_ANON_KEY||c.SUPABASE_ANON_KEY.includes('PASTE_'))throw Error('Update config.js with your Supabase URL and publishable/anon key.');db=supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY)}
  const admin=e=>String(e||'').toLowerCase()===String(c.ADMIN_EMAIL||'').toLowerCase();
  async function start(){const {data:{session}}=await db.auth.getSession();if(session&&admin(session.user.email)){$('login-panel').hidden=true;$('dashboard').hidden=false;await loadPeople();await loadMeals()}else{if(session)await db.auth.signOut();$('login-panel').hidden=false;$('dashboard').hidden=true}}
  $('login-form').onsubmit=async e=>{e.preventDefault();try{if(!db)init();const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;const {data:{user}}=await db.auth.getUser();if(!admin(user.email)){await db.auth.signOut();throw Error('Not authorized for admin access')}await start()}catch(x){say('login-message',x.message)}};
  $('logout').onclick=async()=>{await db.auth.signOut();start()};
  document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));['residents','meals','qr'].forEach(id=>$(id).hidden=id!==b.dataset.tab);if(b.dataset.tab==='meals')loadMeals()});
  $('refresh').onclick=loadPeople;$('view-all').onclick=async()=>{await loadAllResidents();$('all-members').hidden=false};$('close-all').onclick=()=>$('all-members').hidden=true;
  $('date').value=new Date().toLocaleDateString('en-CA');$('date').onchange=loadMeals;
  function residentFields(r){return [
    ['Joining date',r.joining_date],['Full name',r.full_name],['Date of birth',r.date_of_birth],['Mobile number',r.phone],['Email',r.email],['Aadhaar number',r.aadhaar_number],['Government ID type',r.government_id_type],['College/company name',r.college_company_name],['College/company address',r.college_company_address],['Parent/guardian name',r.parent_guardian_name],['Parent/guardian phone',r.parent_guardian_phone],['Permanent address',r.permanent_address]
  ]}
  async function loadPeople(){
    const {data,error}=await db.from('residents').select('*').eq('is_active',true).order('full_name');
    if(error){$('resident-list').textContent=error.message;return}people=data||[];
    $('resident-list').innerHTML=people.length?'<div class="table"><table><thead><tr><th>Name</th><th>Phone</th><th>Joining date</th><th>Actions</th></tr></thead><tbody>'+people.map(r=>`<tr><td>${esc(r.full_name)}</td><td>${esc(r.phone)}</td><td>${esc(r.joining_date||'')}</td><td class="actions"><button data-view="${esc(r.id)}">View</button><button class="danger" data-move="${esc(r.id)}">Delete / moved out</button></td></tr>`).join('')+'</tbody></table></div>':'No active residents.';
    $('resident-list').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>viewResident(b.dataset.view));
    $('resident-list').querySelectorAll('[data-move]').forEach(b=>b.onclick=async()=>{const r=people.find(x=>x.id===b.dataset.move);if(r&&confirm('Mark '+r.full_name+' as moved out? They will be removed from active lists, while historical attendance is preserved.')){const {error}=await db.from('residents').update({is_active:false}).eq('id',r.id);if(error)alert(error.message);else{await loadPeople();await loadMeals()}}});
  }
  async function loadAllResidents(){const {data,error}=await db.from('residents').select('*').order('full_name');if(error){$('all-members-list').textContent=error.message;return}allResidents=data||[];$('all-members-list').innerHTML=allResidents.length?'<div class="table"><table><thead><tr><th>Name</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead><tbody>'+allResidents.map(r=>`<tr><td>${esc(r.full_name)}</td><td>${esc(r.phone)}</td><td>${r.is_active?'Active':'Moved out'}</td><td><button data-all-view="${esc(r.id)}">View / download</button></td></tr>`).join('')+'</tbody></table></div>':'No registration records found.';$('all-members-list').querySelectorAll('[data-all-view]').forEach(b=>b.onclick=()=>viewResident(b.dataset.allView))}
  function viewResident(id){const r=[...people,...allResidents].find(x=>x.id===id);if(!r)return;const fields=residentFields(r);$('detail').hidden=false;$('detail').innerHTML='<div class="bar"><h3>Admission details</h3><div><button id="download-form">Download registration form</button><button id="close-detail" class="secondary">Close</button></div></div><dl>'+fields.map(([k,v])=>`<dt><b>${esc(k)}</b></dt><dd>${esc(v||'—')}</dd>`).join('')+'</dl><p id="download-status" class="muted">Private identity files remain in secure storage and are not exposed as public links.</p>';$('close-detail').onclick=()=>$('detail').hidden=true;$('download-form').onclick=()=>downloadRegistration(r,fields)}
  function loadHtml2Pdf(){
    if(window.html2pdf)return Promise.resolve();
    if(window.__pgHtml2PdfLoading)return window.__pgHtml2PdfLoading;
    window.__pgHtml2PdfLoading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload=()=>window.html2pdf?resolve():reject(Error('PDF library did not load'));
      script.onerror=()=>reject(Error('Could not load the PDF generator. Check your internet connection and try again.'));
      document.head.appendChild(script);
    });
    return window.__pgHtml2PdfLoading;
  }
  async function downloadRegistration(r,fields){
    const button=$('download-form');
    button.disabled=true;
    say('download-status','Preparing your PDF registration form and submitted attachments…');
    let holder;
    try{
      const rows=fields.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v||'—')}</td></tr>`).join('');
      const attachments=[];
      for(const [label,path,kind] of [['Resident photo',r.photo_path,'photo'],['Government ID document',r.government_id_path,'document'],['College/work ID',r.college_id_path,'document'],['Signature',r.signature_path,'photo']]){
        if(!path)continue;
        try{
          const {data,error}=await db.storage.from(c.STORAGE_BUCKET).download(path);
          if(error)throw error;
          const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(data)});
          const type=data.type||'application/octet-stream';
          attachments.push({label,kind,type,dataUrl});
        }catch(err){attachments.push({label,kind:'missing',type:'',dataUrl:''});}
      }
      const attachmentHtml=attachments.length?'<h2>Submitted attachments</h2>'+attachments.map(a=>{
        if(!a.dataUrl)return `<p><b>${esc(a.label)}:</b> Could not retrieve this file from private storage.</p>`;
        if(a.kind==='photo'||a.type.startsWith('image/'))return `<section class="attachment"><h3>${esc(a.label)}</h3><img class="photo" src="${a.dataUrl}" alt="${esc(a.label)}"></section>`;
        return `<section class="attachment"><h3>${esc(a.label)}</h3><p>The original submitted document is stored separately in the PG system and is not merged into this PDF.</p></section>`;
      }).join(''):'';
      const body=`<h1>Radha Krishna PG Admission Form</h1><p class="sub">Resident registration record</p><table>${rows}</table>${attachmentHtml}<div class="signatures"><span>Resident signature</span><span>PG administrator signature</span></div><p class="note">This PDF contains the selected resident's saved registration details and any retrieved photo. Original government ID documents remain in private storage. Keep this PDF confidential.</p>`;
      const css='body{font:14px Arial,sans-serif;color:#111;margin:0}h1{text-align:center;font-size:22px;margin:0 0 5px}.sub{text-align:center;margin:0 0 20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #555;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{width:34%;background:#f0f0f0}.signatures{display:flex;justify-content:space-between;gap:30px;margin-top:54px}.signatures span{border-top:1px solid #333;padding-top:7px;width:42%;text-align:center}.note{font-size:10px;margin-top:22px}.attachment{margin-top:18px;page-break-inside:avoid}.photo{max-width:220px;max-height:260px;object-fit:contain}h2{font-size:16px;margin-top:24px}h3{font-size:13px}';
      await loadHtml2Pdf();
      holder=document.createElement('div');
      holder.style.cssText='position:fixed;left:-10000px;top:0;width:760px;padding:24px;background:#fff;color:#111;z-index:-1;';
      const style=document.createElement('style');style.textContent=css;holder.appendChild(style);
      const content=document.createElement('div');content.innerHTML=body;holder.appendChild(content);document.body.appendChild(holder);
      await window.html2pdf().set({
        margin:10,
        filename:'Radha-Krishna-PG-Admission-'+safeName(r.full_name)+'.pdf',
        image:{type:'jpeg',quality:0.98},
        html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false},
        jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
        pagebreak:{mode:['css','legacy']}
      }).from(holder).save();
      say('download-status','PDF download started. Check your Downloads folder. Keep this file private.');
    }catch(err){
      say('download-status','PDF download failed: '+(err.message||'Please check your internet connection and try again.'));
    }finally{
      if(holder)holder.remove();
      button.disabled=false;
    }
  }
  async function loadMeals(){
    if(!db)return;const date=$('date').value;if(!date)return;
    const [residentRes,outRes,legacyRes,attendanceRes]=await Promise.all([
      db.from('residents').select('id,full_name,phone,is_active').eq('is_active',true).order('full_name'),
      db.from('outside_customers').select('id,full_name,phone,is_active').order('full_name'),
      db.from('meal_attendance').select('customer_id,customer_name,resident_id').is('resident_id',null),
      db.from('meal_attendance').select('*').eq('meal_date',date).in('meal',['lunch','dinner']).order('customer_name')
    ]);
    const failure=[residentRes,outRes,legacyRes,attendanceRes].find(x=>x.error);if(failure){$('meal-checklist').innerHTML=`<tr><td colspan="5">${esc(failure.error.message)}</td></tr>`;$('records').textContent=failure.error.message;return}
    people=residentRes.data||[];const allDirectory=outRes.data||[],directory=allDirectory.filter(x=>x.is_active),directoryPhones=new Set(allDirectory.map(x=>String(x.phone)));
    const legacyByPhone=new Map();for(const row of (legacyRes.data||[])){if(row.customer_id&&!directoryPhones.has(String(row.customer_id))&&!legacyByPhone.has(String(row.customer_id)))legacyByPhone.set(String(row.customer_id),{id:null,full_name:row.customer_name,phone:String(row.customer_id),is_active:true,legacy:true})}
    outsiders=[...directory,...legacyByPhone.values()];const all=[...people.map(r=>({...r,kind:'resident',customer_id:r.id,display_phone:r.phone})),...outsiders.map(o=>({...o,kind:'outside',customer_id:String(o.phone),display_phone:o.phone}))];
    const records=attendanceRes.data||[],recordKeys=new Set(records.map(r=>`${r.customer_id}|${r.meal}`));
    $('meal-checklist').innerHTML=all.length?all.map(p=>`<tr><td><b>${esc(p.full_name)}</b></td><td>${p.kind==='resident'?'PG resident':'Outside · '+esc(p.display_phone)}</td><td class="center"><input aria-label="Lunch for ${esc(p.full_name)}" type="checkbox" data-customer="${esc(p.customer_id)}" data-name="${esc(p.full_name)}" data-type="${p.kind}" data-resident="${p.kind==='resident'?esc(p.id):''}" data-meal="lunch" ${recordKeys.has(`${p.customer_id}|lunch`)?'checked':''}></td><td class="center"><input aria-label="Dinner for ${esc(p.full_name)}" type="checkbox" data-customer="${esc(p.customer_id)}" data-name="${esc(p.full_name)}" data-type="${p.kind}" data-resident="${p.kind==='resident'?esc(p.id):''}" data-meal="dinner" ${recordKeys.has(`${p.customer_id}|dinner`)?'checked':''}></td><td><button class="danger small-btn" data-person-delete="${esc(p.kind)}" data-person-id="${esc(p.id||'')}" data-phone="${esc(p.phone)}" data-name="${esc(p.full_name)}">Delete</button></td></tr>`).join(''):'<tr><td colspan="5">No active residents or outside customers yet.</td></tr>';
    $('meal-checklist').querySelectorAll('[data-person-delete]').forEach(b=>b.onclick=()=>deactivatePerson(b.dataset.personDelete,b.dataset.personId,b.dataset.phone,b.dataset.name));
    updateMealCounts();$('meal-checklist').querySelectorAll('input[type=checkbox]').forEach(ch=>ch.onchange=updateMealCounts);renderAttendance(records,all);
  }
  function updateMealCounts(){const checks=[...$('meal-checklist').querySelectorAll('input[type=checkbox]')];$('total').textContent=new Set(checks.map(x=>x.dataset.customer)).size;$('lunch-total').textContent=checks.filter(x=>x.dataset.meal==='lunch'&&x.checked).length;$('dinner-total').textContent=checks.filter(x=>x.dataset.meal==='dinner'&&x.checked).length}
  async function deactivatePerson(kind,id,phone,name){if(!confirm('Remove '+name+' from the active '+(kind==='resident'?'resident':'outside customer')+' list? Existing attendance records will be preserved.'))return;try{if(kind==='resident'){const {error}=await db.from('residents').update({is_active:false}).eq('id',id);if(error)throw error}else if(id){const {error}=await db.from('outside_customers').update({is_active:false}).eq('id',id);if(error)throw error}else{const {error}=await db.from('outside_customers').insert({full_name:name,phone:String(phone),is_active:false});if(error)throw error}say('meal-message',name+' removed from active lists. Historical attendance is preserved.');await loadPeople();await loadMeals()}catch(x){say('meal-message',x.message)}}
  function renderAttendance(rows,all){const byCustomer=new Map();for(const r of rows){const key=String(r.customer_id);if(!byCustomer.has(key))byCustomer.set(key,{name:r.customer_name,customer_id:key,lunch:false,dinner:false});const item=byCustomer.get(key);if(r.meal==='lunch')item.lunch=true;if(r.meal==='dinner')item.dinner=true}
    // Include current people with No/No so the records always match the daily checklist.
    for(const p of all){const key=String(p.customer_id);if(!byCustomer.has(key))byCustomer.set(key,{name:p.full_name,customer_id:key,lunch:false,dinner:false})}
    const list=[...byCustomer.values()].sort((a,b)=>a.name.localeCompare(b.name));$('records').innerHTML=list.length?'<div class="table"><table><thead><tr><th>Customer name</th><th>Lunch</th><th>Dinner</th></tr></thead><tbody>'+list.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.lunch?'Yes':'No'}</td><td>${r.dinner?'Yes':'No'}</td></tr>`).join('')+'</tbody></table></div>':'No attendance records for this date.';
  }
  $('save-meals').onclick=async()=>{const btn=$('save-meals');btn.disabled=true;try{const date=$('date').value;if(!date)throw Error('Choose a date first');const {data:existing,error:fetchError}=await db.from('meal_attendance').select('id,customer_id,customer_name,resident_id,meal').eq('meal_date',date).in('meal',['lunch','dinner']);if(fetchError)throw fetchError;const current=new Map((existing||[]).map(r=>[`${r.customer_id}|${r.meal}`,r]));const checks=[...$('meal-checklist').querySelectorAll('input[type=checkbox]')];const inserts=[],deletes=[];
      for(const ch of checks){const key=`${ch.dataset.customer}|${ch.dataset.meal}`,old=current.get(key);if(ch.checked&&!old){inserts.push({customer_id:ch.dataset.customer,customer_name:ch.dataset.name,resident_id:ch.dataset.type==='resident'?ch.dataset.resident:null,meal:ch.dataset.meal,meal_date:date})}else if(!ch.checked&&old){deletes.push(old.id)}}
      if(inserts.length){const {error}=await db.from('meal_attendance').insert(inserts);if(error)throw error}if(deletes.length){const {error}=await db.from('meal_attendance').delete().in('id',deletes);if(error)throw error}say('meal-message','Lunch and dinner checklist saved for '+date+'.');await loadMeals()
    }catch(x){say('meal-message',x.message)}finally{btn.disabled=false}};
  $('outside').onsubmit=async e=>{e.preventDefault();try{const name=$('out-name').value.trim(),phone=$('out-phone').value.trim();if(!name||!phone)throw Error('Enter the customer name and phone number.');const {data,error}=await db.from('outside_customers').select('id,full_name,phone,is_active').eq('phone',phone).limit(1);if(error)throw error;const existing=(data||[])[0];if(existing){if(existing.is_active){throw Error('An active outside customer already uses this phone number.')}const {error:updateError}=await db.from('outside_customers').update({full_name:name,is_active:true}).eq('id',existing.id);if(updateError)throw updateError}else{const {error:insertError}=await db.from('outside_customers').insert({full_name:name,phone,is_active:true});if(insertError)throw insertError}$('outside').reset();say('meal-message','Outside customer added. Select Lunch and/or Dinner beside their name, then save.');await loadMeals()}catch(x){say('meal-message',x.message)}};
  function setupQr(){const regUrl=new URL('register.html',window.location.href).href;const qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=360x360&format=png&data='+encodeURIComponent(regUrl);$('registration-qr').src=qrUrl;$('registration-link').href=regUrl;$('download-qr').onclick=()=>{const a=document.createElement('a');a.href=qrUrl;a.download='Radha-Krishna-PG-Registration-QR.png';a.target='_blank';a.rel='noopener';a.click()};$('print-qr').onclick=()=>{const w=window.open('','_blank');if(!w){alert('Allow pop-ups to print the QR code.');return}w.document.write('<!doctype html><html><head><title>Radha Krishna PG Registration QR Code</title><style>body{font-family:Arial;text-align:center;padding:24px}img{width:320px;height:320px}p{overflow-wrap:anywhere}</style></head><body><h1>Radha Krishna PG Admission Form</h1><img src="'+qrUrl+'" alt="Registration QR Code"><p>'+regUrl+'</p><script>window.onload=function(){window.print()}<\/script></body></html>');w.document.close()}}
  try{setupQr();init();start().catch(x=>say('login-message',x.message))}catch(x){say('login-message',x.message)}
})();
