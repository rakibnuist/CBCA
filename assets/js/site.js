/* CBCA — shared site behaviour */
(function(){
  'use strict';
  var cfg = window.CBCA_CONFIG || {};

  /* --- Official mailbox binding (Handbook 17.2) --- */
  var mailMap = {
    official:     cfg.officialEmail,
    secretariat:  cfg.secretariatEmail,
    membership:   cfg.membershipEmail,
    complaints:   cfg.complaintsEmail,
    verification: cfg.verificationEmail,
    corrections:  cfg.correctionsEmail,
    media:        cfg.mediaEmail,
    events:       cfg.eventsEmail,
    it:           cfg.itEmail
  };
  Object.keys(mailMap).forEach(function(key){
    var addr = mailMap[key];
    if(!addr) return;
    document.querySelectorAll('[data-email="'+key+'"]').forEach(function(el){
      if(!el.hasAttribute('data-keep-text')) el.textContent = addr;
      el.setAttribute('href','mailto:'+addr);
    });
  });
  document.querySelectorAll('[data-facebook]').forEach(function(el){
    if(cfg.facebook) el.setAttribute('href',cfg.facebook);
  });

  /* --- Mandatory disclaimers (Handbook 10.5 / 7.4) --- */
  document.querySelectorAll('[data-disclaimer="standard"]').forEach(function(el){
    el.textContent = cfg.standardDisclaimer || '';
  });
  document.querySelectorAll('[data-disclaimer="member"]').forEach(function(el){
    el.textContent = cfg.memberDisclaimer || '';
  });

  /* --- Mobile navigation --- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
    });
    document.addEventListener('click', function(e){
      if(!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')){
        nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.focus();
      }
    });
  }

  /* --- Toast helper --- */
  window.cbcaToast = function(message){
    var t = document.querySelector('#toast');
    if(!t){ return; }
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function(){ t.classList.remove('show'); }, 4200);
  };

  /* --- Email-composition forms (no data stored on the website) --- */
  document.querySelectorAll('[data-mail-form]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var type = form.dataset.mailForm;
      var target = mailMap[type] || cfg.officialEmail;
      var data = new FormData(form);
      var subject = (data.get('subject') || form.dataset.subject || 'CBCA Website Enquiry').toString();
      var body = '';
      data.forEach(function(v,k){
        if(k === 'subject') return;
        body += k.replace(/_/g,' ') + ': ' + v + '\n\n';
      });
      body += 'Please attach supporting files manually before sending this email.';
      window.location.href = 'mailto:' + encodeURIComponent(target) +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });

  /* --- Directory search + status filter --- */
  var search = document.querySelector('#memberSearch');
  var chips = document.querySelectorAll('[data-filter]');
  function applyFilters(){
    var q = search ? search.value.toLowerCase().trim() : '';
    var active = document.querySelector('[data-filter].active');
    var filter = active ? active.dataset.filter : 'all';
    var shown = 0;
    document.querySelectorAll('.member-card').forEach(function(card){
      var matchText = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
      var matchType = filter === 'all' || (card.dataset.memberType || '') === filter;
      var show = matchText && matchType;
      card.hidden = !show;
      if(show) shown++;
    });
    var none = document.querySelector('#noMemberResults');
    if(none) none.hidden = shown !== 0;
    var count = document.querySelector('#memberCount');
    if(count) count.textContent = shown;
  }
  if(search) search.addEventListener('input', applyFilters);
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      chips.forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      applyFilters();
    });
  });
  window.cbcaApplyFilters = applyFilters;

  /* --- Footer year --- */
  var year = document.querySelector('#year');
  if(year) year.textContent = new Date().getFullYear();
})();
