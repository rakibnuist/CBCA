-- CBCA Supabase database setup
-- Run the complete script in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

do $$ begin create type public.admin_role as enum ('pending','content_editor','reviewer','complaint_officer','super_admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.publication_status as enum ('draft','review','published','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.member_status as enum ('pending','active','suspended','expired','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.case_status as enum ('submitted','under_review','evidence_requested','notice_sent','response_received','mediation','resolved','referred','closed','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.policy_rating as enum ('unreviewed','positive','conditional','concerning','high_risk'); exception when duplicate_object then null; end $$;

create table if not exists public.allowed_admins(
 email text primary key check(email=lower(email)), role public.admin_role not null default 'pending', active boolean not null default true, note text, added_at timestamptz not null default now());
insert into public.allowed_admins(email,role,active,note) values
('cbcabd2026@gmail.com','super_admin',true,'Founding super administrator')
on conflict(email) do update set role=excluded.role,active=true;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade, email text not null, full_name text,
 role public.admin_role not null default 'pending', active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare assigned public.admin_role;
begin
 select role into assigned from public.allowed_admins where email=lower(new.email) and active=true;
 insert into public.profiles(id,email,full_name,role) values(new.id,lower(new.email),coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),coalesce(assigned,'pending'))
 on conflict(id) do update set email=excluded.email;
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles(id,email,full_name,role)
select u.id,lower(u.email),coalesce(u.raw_user_meta_data->>'full_name',split_part(u.email,'@',1)),coalesce(a.role,'pending')
from auth.users u left join public.allowed_admins a on a.email=lower(u.email) and a.active=true
on conflict(id) do update set role=excluded.role,email=excluded.email;

create or replace function public.has_role(roles text[]) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role::text=any(roles)); $$;
create or replace function public.can_edit() returns boolean language sql stable security definer set search_path=public as $$ select public.has_role(array['content_editor','reviewer','super_admin']); $$;
create or replace function public.can_publish() returns boolean language sql stable security definer set search_path=public as $$ select public.has_role(array['reviewer','super_admin']); $$;
create or replace function public.can_complaints() returns boolean language sql stable security definer set search_path=public as $$ select public.has_role(array['complaint_officer','super_admin']); $$;
create or replace function public.is_super() returns boolean language sql stable security definer set search_path=public as $$ select public.has_role(array['super_admin']); $$;

create table if not exists public.members(
 id uuid primary key default gen_random_uuid(), member_code text unique, name text not null, member_type text default 'new', representative text,
 committee_role text,address text,phone text,email text,website text,facebook text,logo_url text,description text,
 member_status public.member_status not null default 'pending',verification_date date,expiry_date date,
 publication_status public.publication_status not null default 'draft',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.events(
 id uuid primary key default gen_random_uuid(),title text not null,summary text,description text,event_type text,starts_at timestamptz,ends_at timestamptz,
 venue text,registration_url text,cover_url text,event_status text default 'upcoming',publication_status public.publication_status default 'draft',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.scholarships(
 id uuid primary key default gen_random_uuid(),university_name text not null,scholarship_name text not null,degree_levels text,eligible_programs text,intake text,
 application_open date,application_deadline date,tuition_coverage text,accommodation_coverage text,stipend text,application_fee text,deposit text,
 insurance_and_other_costs text,language_requirements text,renewal_conditions text,cancellation_conditions text,refund_terms text,hidden_costs text,
 cbca_assessment text,policy_rating public.policy_rating default 'unreviewed',official_source_url text not null,last_verified_at date,
 publication_status public.publication_status default 'draft',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.announcements(
 id uuid primary key default gen_random_uuid(),title text not null,summary text,body text,category text,cover_url text,published_at timestamptz,
 publication_status public.publication_status default 'draft',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.corrections(
 id uuid primary key default gen_random_uuid(),case_reference text unique,organization_name text not null,platform text,post_url text,incorrect_claim text not null,
 verified_information text not null,official_source_url text,evidence_url text,notice_sent_at timestamptz,response_deadline timestamptz,response_text text,
 internal_notes text,resolution text,case_status public.case_status default 'submitted',public_summary text,
 publication_status public.publication_status default 'draft',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.membership_applications(
 id uuid primary key default gen_random_uuid(),case_reference text unique default ('MEM-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(gen_random_uuid()::text,1,6))),
 consultancy_name text not null,representative text not null,contact_email text not null,contact_phone text,office_address text not null,website text,social_media text,
 operating_since date,trade_licence_number text,application_notes text,review_notes text,status text default 'submitted',consent boolean not null default false,
 created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.complaints(
 id uuid primary key default gen_random_uuid(),case_reference text unique default ('CMP-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(gen_random_uuid()::text,1,6))),
 complainant_name text not null,complainant_email text not null,complainant_phone text,passport_last_four text,accused_organization text not null,
 incident_summary text not null,amount_in_dispute text,expected_resolution text,internal_notes text,resolution text,case_status public.case_status default 'submitted',
 consent boolean not null default false,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.audit_logs(id bigint generated always as identity primary key,table_name text,record_id uuid,action text,changed_by uuid,old_data jsonb,new_data jsonb,changed_at timestamptz default now());

create or replace function public.touch() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create or replace function public.approve_publish() returns trigger language plpgsql as $$ begin if new.publication_status='published' and not public.can_publish() then raise exception 'Reviewer approval required to publish.'; end if; return new; end $$;

do $$ declare t text; begin
 foreach t in array array['members','events','scholarships','announcements','corrections','membership_applications','complaints'] loop
  execute format('drop trigger if exists touch_%I on public.%I',t,t);
  execute format('create trigger touch_%I before update on public.%I for each row execute procedure public.touch()',t,t);
 end loop;
 foreach t in array array['members','events','scholarships','announcements','corrections'] loop
  execute format('drop trigger if exists publish_%I on public.%I',t,t);
  execute format('create trigger publish_%I before insert or update on public.%I for each row execute procedure public.approve_publish()',t,t);
 end loop;
end $$;

alter table public.allowed_admins enable row level security; alter table public.profiles enable row level security;
alter table public.members enable row level security; alter table public.events enable row level security; alter table public.scholarships enable row level security;
alter table public.announcements enable row level security; alter table public.corrections enable row level security;
alter table public.membership_applications enable row level security; alter table public.complaints enable row level security; alter table public.audit_logs enable row level security;

grant select on public.profiles to authenticated; grant select,insert,update,delete on public.allowed_admins to authenticated;
grant select on public.members,public.events,public.scholarships,public.announcements,public.corrections to anon,authenticated;
grant insert,update,delete on public.members,public.events,public.scholarships,public.announcements,public.corrections to authenticated;
grant insert on public.membership_applications,public.complaints to anon,authenticated;
grant select,update,delete on public.membership_applications,public.complaints to authenticated;

drop policy if exists profile_read on public.profiles; create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()) or public.has_role(array['super_admin']));
drop policy if exists admin_allowlist on public.allowed_admins; create policy admin_allowlist on public.allowed_admins for all to authenticated using(public.is_super()) with check(public.is_super());

do $$ declare t text; begin
 foreach t in array array['events','scholarships','announcements','corrections'] loop
  execute format('drop policy if exists public_%I on public.%I',t,t); execute format('create policy public_%I on public.%I for select to anon,authenticated using(publication_status=''published'')',t,t);
  execute format('drop policy if exists staff_read_%I on public.%I',t,t); execute format('create policy staff_read_%I on public.%I for select to authenticated using(public.can_edit())',t,t);
  execute format('drop policy if exists staff_insert_%I on public.%I',t,t); execute format('create policy staff_insert_%I on public.%I for insert to authenticated with check(public.can_edit())',t,t);
  execute format('drop policy if exists staff_update_%I on public.%I',t,t); execute format('create policy staff_update_%I on public.%I for update to authenticated using(public.can_edit()) with check(public.can_edit())',t,t);
  execute format('drop policy if exists staff_delete_%I on public.%I',t,t); execute format('create policy staff_delete_%I on public.%I for delete to authenticated using(public.is_super())',t,t);
 end loop;
end $$;
drop policy if exists public_members on public.members; create policy public_members on public.members for select to anon,authenticated using(publication_status='published' and member_status='active');
drop policy if exists staff_members_read on public.members; create policy staff_members_read on public.members for select to authenticated using(public.can_edit());
drop policy if exists staff_members_insert on public.members; create policy staff_members_insert on public.members for insert to authenticated with check(public.can_edit());
drop policy if exists staff_members_update on public.members; create policy staff_members_update on public.members for update to authenticated using(public.can_edit()) with check(public.can_edit());
drop policy if exists staff_members_delete on public.members; create policy staff_members_delete on public.members for delete to authenticated using(public.is_super());
drop policy if exists membership_submit on public.membership_applications; create policy membership_submit on public.membership_applications for insert to anon,authenticated with check(consent=true);
drop policy if exists membership_staff on public.membership_applications; create policy membership_staff on public.membership_applications for all to authenticated using(public.has_role(array['reviewer','super_admin'])) with check(public.has_role(array['reviewer','super_admin']));
drop policy if exists complaint_submit on public.complaints; create policy complaint_submit on public.complaints for insert to anon,authenticated with check(consent=true);
drop policy if exists complaint_staff on public.complaints; create policy complaint_staff on public.complaints for all to authenticated using(public.can_complaints()) with check(public.can_complaints());

insert into public.members(member_code,name,member_type,representative,committee_role,member_status,publication_status) values
('CBCA-FM-001','MalishaEdu','founding','Dr. Maruf Mollah','President','active','published'),
('CBCA-FM-002','Atlas Study Consultants','founding','Md Asiful Mowla Rehan','Vice President','active','published'),
('CBCA-FM-003','DreamEdu Consultancy','founding','Engr. Md. Sakhayot Hosen','General Secretary','active','published'),
('CBCA-FM-004','AR Education','founding','Md. Kazi Amir Khan','Joint Secretary','active','published'),
('CBCA-FM-005','DemoticEdu','founding','Fardin Shahriar Azad','Treasurer','active','published'),
('CBCA-FM-006','Silk Road Education','founding','Maruf Ul Haque','Media & Communications Secretary','active','published'),
('CBCA-FM-007','World Wider Consultancy (WWC)','founding','Khan Pappu','Public Relations Secretary','active','published'),
('CBCA-FM-008','Dream Abroad Education','founding','Adnan Habib','Event & Activities Secretary','active','published'),
('CBCA-FM-009','EduExpress International','founding','Abdullah Al Rakib','IT, Website & Social Media Secretary','active','published'),
('CBCA-FM-010','RM International','founding','Ranzee Anwer','Emergency & Crisis Coordinator','active','published'),
('CBCA-FM-011','CSH International','founding','Rayhanul Islam Rajib','Executive Member','active','published')
on conflict(member_code) do nothing;
