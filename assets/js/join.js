(function(){
  if(!window.supabase||!window.CBCA_SUPABASE)return;
  const sb=supabase.createClient(CBCA_SUPABASE.url,CBCA_SUPABASE.publishableKey);
  const form=document.querySelector('#joinForm');
  if(!form)return;
  const msg=document.querySelector('#joinMsg');
  function showMsg(kind,html){msg.hidden=false;msg.className='callout '+(kind==='green'?'callout-green':kind==='yellow'?'callout-yellow':'');msg.innerHTML=html}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.elements['consent'].checked){showMsg('yellow','Please confirm the declaration checkbox before submitting.');return}
    const btn=form.querySelector('button[type=submit]');
    btn.disabled=true;const originalLabel=btn.textContent;btn.textContent='Submitting…';
    const fd=new FormData(form);
    const payload={};
    for(const [k,v] of fd.entries()){
      if(k==='consent')continue;
      payload[k]=v===''?null:v;
    }
    payload.consent=true;
    const {error}=await sb.from('membership_applications').insert(payload);
    btn.disabled=false;btn.textContent=originalLabel;
    if(error){showMsg('',`Could not submit the application: ${error.message}. Please try again or email ${window.CBCA_CONFIG?.membershipEmail||'the membership team'} directly.`);return}
    form.querySelectorAll('input,textarea,button[type=submit]').forEach(el=>el.disabled=true);
    showMsg('green','<strong>Application received.</strong> The Membership Review & Audit Team will contact you at the email you provided. There is no need to submit this form again.');
  });
})();
