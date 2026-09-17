import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const db = new PGlite()
try {
  // Only test harness scaffolding: Supabase provides these roles and tables in production.
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth, public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated;
    grant select, insert, update, delete on storage.objects to authenticated;
  `)
  await db.exec(await readFile('supabase/schema.sql', 'utf8'))
  await db.exec(await readFile('supabase/seed.sql', 'utf8'))
  await db.exec(await readFile('supabase/schema.sql', 'utf8'))
  await db.exec(await readFile('supabase/seed.sql', 'utf8'))
  assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count, 12)
  console.log('PASS: schema and seed execute idempotently; 12 imported projects.')
  const owner = '11111111-1111-4111-8111-111111111111'
  const other = '22222222-2222-4222-8222-222222222222'
  await db.query('insert into auth.users(id,email) values ($1,$2),($3,$4)', [owner, 'owner@example.test', other, 'visitor@example.test'])
  await db.query('insert into public.portfolio_admins(user_id) values ($1)', [owner])
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`)
  assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, true)
  const draftId = '33333333-3333-4333-8333-333333333333'
  await db.query("insert into public.projects(id,title,category,thumbnail,video_url,published,position) values($1,'Test draft','long','/test.webp','https://example.test/video.mp4',false,12)", [draftId])
  assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count, 13)
  await db.query("update public.projects set title='Edited draft' where id=$1", [draftId])
  await db.query("update public.portfolio_profile set data=jsonb_set(data,'{name}','\"Owner test\"') where id=true")
  await db.query("insert into storage.objects(bucket_id,name) values ('portfolio-assets','image/test.webp')")
  const ids = (await db.query('select id from public.projects order by position desc')).rows.map(row => row.id)
  await db.query('select public.reorder_projects($1::uuid[])', [ids])
  assert.equal((await db.query('select id from public.projects order by position limit 1')).rows[0].id, draftId)
  console.log('PASS: owner can create, edit, reorder, update profile, and upload metadata.')

  await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub','',false);")
  assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count, 12)
  assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, false)
  await assert.rejects(db.query("insert into public.projects(title,category,thumbnail,video_url) values('Attack','long','/x','https://example.test')"))
  await assert.rejects(db.query('select * from public.portfolio_admins'))
  await assert.rejects(db.query('select public.reorder_projects($1::uuid[])', [ids]))
  console.log('PASS: anonymous visitors see published projects only and cannot write, reorder, or read owners.')

  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${other}',false);`)
  assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, false)
  await assert.rejects(db.query("insert into public.projects(title,category,thumbnail,video_url) values('Attack','long','/x','https://example.test')"))
  await assert.rejects(db.query('insert into public.portfolio_admins(user_id) values ($1)', [other]))
  await assert.rejects(db.query('select public.reorder_projects($1::uuid[])', [ids]))
  await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('portfolio-assets','attack.mp4')"))
  const updated = await db.query("update public.portfolio_profile set data='{}' returning id")
  assert.equal(updated.rows.length, 0)
  const deleted = await db.query('delete from public.projects returning id')
  assert.equal(deleted.rows.length, 0)
  console.log('PASS: authenticated non-owner cannot self-promote, modify profile/projects, upload, or reorder.')

  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`)
  await assert.rejects(db.query('select public.reorder_projects($1::uuid[])', [[draftId, draftId]]))
  await db.query('update public.projects set published=true where id=$1', [draftId])
  await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub','',false);")
  assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count, 13)
  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`)
  await db.query('delete from public.projects where id=$1', [draftId])
  assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count, 12)
  console.log('PASS: invalid reorders rejected; publish and delete reflected in public queries.')
  console.log('All database tests passed. Live Supabase account connection remains an owner setup step.')
} finally { await db.close() }
