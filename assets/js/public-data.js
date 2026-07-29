/* CBCA — public data rendering from Supabase (published records only, enforced by RLS) */
(function(){
  'use strict';
  if(!window.supabase || !window.CBCA_SUPABASE) return;
  var sb = supabase.createClient(CBCA_SUPABASE.url, CBCA_SUPABASE.publishableKey);
  var cfg = window.CBCA_CONFIG || {};

  function E(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function dateOnly(v){
    if(!v) return '';
    var d = new Date(v);
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }
  function initials(name){
    return String(name||'?').trim().split(/\s+/).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();
  }
  function safeUrl(u){
    var s = String(u||'').trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }

  /* Handbook 7.4 — directory status tags */
  function statusBadge(m){
    if(m.member_status === 'suspended') return '<span class="badge badge-warn">Suspended</span>';
    if(m.member_status === 'expired')   return '<span class="badge badge-neutral">Expired</span>';
    if(m.member_status === 'cancelled') return '<span class="badge badge-neutral">Former member</span>';
    if(m.member_status === 'pending')   return '<span class="badge badge-provisional">Provisional member</span>';
    if(m.member_type === 'founding')    return '<span class="badge badge-founding">★ Founding Member</span>';
    return '<span class="badge badge-verified">Verified member</span>';
  }

  /* ---------- Verified member directory ---------- */
  async function members(){
    var el = document.querySelector('#memberDirectory');
    if(!el) return;
    var res = await sb.from('members').select('*').order('member_type').order('member_code');
    var data = res.data;
    if(res.error || !data || !data.length){
      el.innerHTML = '<div class="empty-state"><div class="icon">◍</div><p>The verified member directory is being prepared. Published member records will appear here.</p></div>';
      return;
    }
    el.innerHTML = data.map(function(m){
      var logo = safeUrl(m.logo_url);
      var site = safeUrl(m.website);
      var fb   = safeUrl(m.facebook);
      var links = '';
      if(site) links += '<a href="'+E(site)+'" target="_blank" rel="noopener noreferrer">Website ↗</a>';
      if(fb)   links += '<a href="'+E(fb)+'" target="_blank" rel="noopener noreferrer">Facebook ↗</a>';
      return '<article class="member-card" data-member-type="'+E(m.member_type||'new')+'">'+
        '<div class="member-head">'+
          (logo
            ? '<img class="member-logo" src="'+E(logo)+'" alt="'+E(m.name)+' logo" loading="lazy" '+
              'onerror="this.outerHTML=\'<div class=&quot;member-logo-fallback&quot;>'+E(initials(m.name))+'</div>\'">'
            : '<div class="member-logo-fallback" aria-hidden="true">'+E(initials(m.name))+'</div>')+
          '<div class="member-title"><h3>'+E(m.name)+'</h3>'+
            '<div class="badge-row">'+statusBadge(m)+'</div>'+
          '</div>'+
        '</div>'+
        '<div class="member-body">'+
          '<div class="data-row"><b>Member record</b><span>'+E(m.member_code||'—')+'</span></div>'+
          '<div class="data-row"><b>Representative</b><span>'+E(m.representative||'—')+'</span></div>'+
          '<div class="data-row"><b>Office address</b><span>'+E(m.address||'Pending verified submission')+'</span></div>'+
          '<div class="data-row"><b>Contact</b><span>'+E(m.phone || m.email || 'Pending verified submission')+'</span></div>'+
          (links ? '<div class="member-links">'+links+'</div>' : '')+
          '<p class="member-meta">'+(m.verification_date
              ? 'Information last verified '+E(dateOnly(m.verification_date))+'.'
              : 'Verification date pending.')+'</p>'+
        '</div>'+
      '</article>';
    }).join('');
    if(window.cbcaApplyFilters) window.cbcaApplyFilters();
  }

  /* ---------- Announcements (homepage + news page) ---------- */
  function announceCard(a){
    var d = a.published_at ? new Date(a.published_at) : (a.created_at ? new Date(a.created_at) : null);
    var day = d && !isNaN(d) ? d.getDate() : '';
    var mo  = d && !isNaN(d) ? d.toLocaleDateString('en-GB',{month:'short'}).toUpperCase() : '';
    var yr  = d && !isNaN(d) ? d.getFullYear() : '';
    return '<article class="announce-item">'+
      '<div class="announce-date"><span>'+E(day)+'</span>'+E(mo)+' '+E(yr)+'</div>'+
      '<div class="announce-body">'+
        (a.category ? '<span class="tag">'+E(a.category)+'</span>' : '')+
        '<h3>'+E(a.title)+'</h3>'+
        (a.summary ? '<p>'+E(a.summary)+'</p>' : '')+
        (a.body ? '<details><summary>Read the full notice</summary><div class="announce-full">'+E(a.body)+'</div></details>' : '')+
      '</div>'+
    '</article>';
  }

  async function announcements(){
    var home = document.querySelector('#homeAnnouncements');
    var page = document.querySelector('#allAnnouncements');
    if(!home && !page) return;
    var q = sb.from('announcements').select('*').order('published_at',{ascending:false, nullsFirst:false});
    var res = await q;
    var data = (res.data || []);
    if(res.error || !data.length){
      var empty = '<div class="empty-state"><div class="icon">◷</div><p>No public announcements have been published yet. Official notices will be posted here.</p></div>';
      if(home){
        var hs = document.querySelector('#homeAnnouncementsSection');
        if(hs) hs.hidden = true; else home.innerHTML = empty;
      }
      if(page) page.innerHTML = empty;
      return;
    }
    if(home) home.innerHTML = data.slice(0,3).map(announceCard).join('');
    if(page) page.innerHTML = data.map(announceCard).join('');
  }

  /* ---------- Events ---------- */
  async function events(){
    var el = document.querySelector('#supabaseEvents');
    if(!el) return;
    var res = await sb.from('events').select('*').order('starts_at',{ascending:true, nullsFirst:false});
    var data = res.data;
    if(res.error || !data || !data.length){
      el.innerHTML = '<div class="empty-state"><div class="icon">◷</div><p>No public events are currently scheduled. Approved seminars and pre-departure programs will be listed here.</p></div>';
      return;
    }
    el.innerHTML = data.map(function(x){
      var reg = safeUrl(x.registration_url);
      return '<article class="card card-hover">'+
        '<span class="tag">'+E(x.event_status||'upcoming')+'</span>'+
        '<h3 style="margin-top:12px">'+E(x.title)+'</h3>'+
        (x.summary ? '<p>'+E(x.summary)+'</p>' : '')+
        '<div class="data-row"><b>When</b><span>'+E(x.starts_at ? new Date(x.starts_at).toLocaleString('en-GB') : 'To be announced')+'</span></div>'+
        '<div class="data-row"><b>Venue</b><span>'+E(x.venue||'To be announced')+'</span></div>'+
        (reg ? '<a class="card-link" href="'+E(reg)+'" target="_blank" rel="noopener noreferrer">Registration details ↗</a>' : '')+
      '</article>';
    }).join('');
  }

  /* ---------- Scholarship policy records ---------- */
  async function scholarships(){
    var body = document.querySelector('#supabaseScholarships');
    if(!body) return;
    var res = await sb.from('scholarships').select('*').order('application_deadline',{ascending:true, nullsFirst:false});
    var data = res.data;
    if(res.error || !data || !data.length){
      body.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="icon">▤</div>'+
        '<p>Verified scholarship policy records are being prepared. Only records with an identified official source are published.</p></div></td></tr>';
      return;
    }
    body.innerHTML = data.map(function(x){
      var src = safeUrl(x.official_source_url);
      var coverage = [x.tuition_coverage, x.accommodation_coverage, x.stipend].filter(Boolean).join(' · ');
      var costs = [x.application_fee, x.deposit, x.hidden_costs].filter(Boolean).join(' · ');
      return '<tr>'+
        '<td><b>'+E(x.university_name)+'</b><br><span class="muted">'+E(x.scholarship_name)+'</span></td>'+
        '<td>'+E(coverage||'—')+'</td>'+
        '<td>'+E(costs||'—')+'</td>'+
        '<td>'+E(x.renewal_conditions||'—')+'</td>'+
        '<td>'+E(x.application_deadline ? dateOnly(x.application_deadline) : '—')+'</td>'+
        '<td>'+(src ? '<a href="'+E(src)+'" target="_blank" rel="noopener noreferrer">Official source ↗</a><br>' : '')+
          '<span class="muted">'+(x.last_verified_at ? 'Verified '+E(dateOnly(x.last_verified_at)) : 'Verification pending')+'</span></td>'+
      '</tr>';
    }).join('');
  }

  /* ---------- Public correction register (Handbook 14.3) ---------- */
  async function corrections(){
    var body = document.querySelector('#supabaseCorrections');
    if(!body) return;
    var res = await sb.from('corrections').select('*').order('created_at',{ascending:false});
    var data = res.data;
    if(res.error || !data || !data.length){
      body.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="icon">✎</div>'+
        '<p>No correction cases have been published. Cases appear only after due process and right of reply.</p></div></td></tr>';
      return;
    }
    body.innerHTML = data.map(function(x){
      return '<tr>'+
        '<td><b>'+E(x.case_reference||'—')+'</b></td>'+
        '<td>'+E(x.organization_name)+(x.platform ? '<br><span class="muted">'+E(x.platform)+'</span>' : '')+'</td>'+
        '<td>'+E(x.public_summary || x.incorrect_claim || '—')+'</td>'+
        '<td>'+E(x.verified_information||'—')+'</td>'+
        '<td><span class="badge badge-neutral">'+E(String(x.case_status||'').replace(/_/g,' '))+'</span><br>'+
          '<span class="muted">'+E(dateOnly(x.created_at))+'</span></td>'+
      '</tr>';
    }).join('');
  }

  members(); announcements(); events(); scholarships(); corrections();
})();
