import { createClient } from '@supabase/supabase-js'
import { Upload } from 'tus-js-client'
import type { Profile, Project } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase = url && key ? createClient(url, key) : null
export const isConnected = Boolean(supabase)

export async function fetchPortfolio(admin = false) {
  if (!supabase) throw new Error('Database is not connected. Follow the setup guide to connect your Supabase project.')
  let query = supabase.from('projects').select('*').order('position', { ascending: true })
  if (!admin) query = query.eq('published', true)
  const [projectsResult, profileResult] = await Promise.all([query, supabase.from('portfolio_profile').select('data').eq('id', true).single()])
  if (projectsResult.error) throw projectsResult.error
  if (profileResult.error) throw profileResult.error
  return { projects: projectsResult.data as Project[], profile: profileResult.data.data as Profile }
}

export async function isAdmin() {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_portfolio_admin')
  if (error) throw error
  return data === true
}

export async function saveProject(project: Project) {
  if (!supabase) throw new Error('Database is not connected.')
  const { error } = await supabase.from('projects').upsert(project)
  if (error) throw error
}

export async function deleteProject(id: string) {
  if (!supabase) throw new Error('Database is not connected.')
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function reorderProjects(ids: string[]) {
  if (!supabase) throw new Error('Database is not connected.')
  const { error } = await supabase.rpc('reorder_projects', { project_ids: ids })
  if (error) throw error
}

export async function saveProfile(profile: Profile) {
  if (!supabase) throw new Error('Database is not connected.')
  const { error } = await supabase.from('portfolio_profile').upsert({ id: true, data: profile })
  if (error) throw error
}

export async function uploadAsset(file: File, kind: 'image' | 'video', onProgress: (value: number) => void): Promise<string> {
  if (!supabase || !url) throw new Error('Database is not connected.')
  const allowed = kind === 'image' ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] : ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
  if (!allowed.includes(file.type)) throw new Error(kind === 'image' ? 'Choose a JPG, PNG, WebP, or AVIF image.' : 'Choose an MP4, WebM, or MOV video. MP4 works best across browsers.')
  if (file.size > (kind === 'image' ? 10 * 1024 * 1024 : 1024 * 1024 * 1024)) throw new Error(kind === 'image' ? 'Images must be smaller than 10 MB.' : 'Videos must be smaller than 1 GB. Your storage plan may have a lower limit.')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Please sign in again to upload.')
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || (kind === 'image' ? 'jpg' : 'mp4')
  const path = `${kind}/${crypto.randomUUID()}.${ext}`
  const client = supabase
  if (file.size <= 6 * 1024 * 1024) {
    onProgress(10)
    const { error } = await client.storage.from('portfolio-assets').upload(path, file, { contentType: file.type, upsert: false })
    if (error) throw error
    onProgress(100)
    return client.storage.from('portfolio-assets').getPublicUrl(path).data.publicUrl
  }
  const storageHost = url.replace(/\.supabase\.co\/?$/, '.storage.supabase.co')
  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${storageHost}/storage/v1/upload/resumable`,
      headers: { authorization: `Bearer ${session.access_token}` },
      retryDelays: [0, 3000, 5000, 10000, 20000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: { bucketName: 'portfolio-assets', objectName: path, contentType: file.type, cacheControl: '3600' },
      chunkSize: 6 * 1024 * 1024,
      onError: reject,
      onProgress: (sent, total) => onProgress(Math.round(sent / total * 100)),
      onSuccess: () => resolve(client.storage.from('portfolio-assets').getPublicUrl(path).data.publicUrl),
    })
    upload.start()
  })
}
