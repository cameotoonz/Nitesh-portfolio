export function safeUrl(value: string): string {
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''
  } catch { return '' }
}

export function getVideoSource(value: string): { type: 'youtube' | 'vimeo' | 'instagram' | 'video' | 'external'; src: string; original: string } {
  const original = safeUrl(value)
  if (!original) return { type: 'external', src: '', original: '' }
  let url: URL
  try { url = new URL(original, window.location.origin) } catch { return { type: 'external', src: '', original: '' } }
  const host = url.hostname.replace(/^www\./, '')
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean)[1]
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, original }
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.split('/').find(s => /^\d+$/.test(s))
    if (id) return { type: 'vimeo', src: `https://player.vimeo.com/video/${id}?autoplay=1${url.searchParams.get('h') ? `&h=${encodeURIComponent(url.searchParams.get('h')!)}` : ''}`, original }
  }
  if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
    if (match) return { type: 'instagram', src: `https://www.instagram.com/${match[1]}/${match[2]}/embed/`, original }
  }
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(original) || url.pathname.includes('/storage/v1/object/')) return { type: 'video', src: original, original }
  return { type: 'external', src: original, original }
}

export function youtubeThumbnail(value: string): string {
  const source = getVideoSource(value)
  if (source.type !== 'youtube') return ''
  const id = source.src.split('/embed/')[1].split('?')[0]
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  return `https://wa.me/${digits}`
}
