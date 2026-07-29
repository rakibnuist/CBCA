
(function(){
  const cfg = window.CBCA_CONFIG || {};
  document.querySelectorAll('[data-email="official"]').forEach(el=>{el.textContent=cfg.officialEmail; el.href='mailto:'+cfg.officialEmail});
  document.querySelectorAll('[data-email="complaints"]').forEach(el=>{el.textContent=cfg.complaintsEmail; el.href='mailto:'+cfg.complaintsEmail});
  document.querySelectorAll('[data-email="membership"]').forEach(el=>{el.textContent=cfg.membershipEmail; el.href='mailto:'+cfg.membershipEmail});
  document.querySelectorAll('[data-email="corrections"]').forEach(el=>{el.textContent=cfg.correctionsEmail; el.href='mailto:'+cfg.correctionsEmail});
  document.querySelectorAll('[data-facebook]').forEach(el=>el.href=cfg.facebook);

  const btn=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(btn && nav){btn.addEventListener('click',()=>{nav.classList.toggle('open'); btn.setAttribute('aria-expanded',nav.classList.contains('open'));});}

  document.querySelectorAll('[data-mail-form]').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const type=form.dataset.mailForm;
      const target = type==='complaint' ? cfg.complaintsEmail : type==='membership' ? cfg.membershipEmail : type==='correction' ? cfg.correctionsEmail : cfg.officialEmail;
      const data=new FormData(form);
      const subject=(data.get('subject')||form.dataset.subject||'CBCA Website Enquiry').toString();
      let body='';
      for(const [k,v] of data.entries()){
        if(k==='subject') continue;
        body += `${k.replaceAll('_',' ')}: ${v}\n\n`;
      }
      body += 'Please attach supporting files manually before sending this email.';
      window.location.href=`mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });

  const search=document.querySelector('#memberSearch');
  if(search){
    search.addEventListener('input',()=>{
      const q=search.value.toLowerCase().trim();
      document.querySelectorAll('.member-card').forEach(card=>{
        card.hidden = q && !card.textContent.toLowerCase().includes(q);
      });
    });
  }

  const year=document.querySelector('#year'); if(year) year.textContent=new Date().getFullYear();
})();
