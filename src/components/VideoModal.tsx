import { useEffect, useRef } from 'react'
import { ArrowUpRight, Film, X } from 'lucide-react'
import { getVideoSource, safeUrl } from '../lib/media'
import type { Project } from '../lib/types'

export default function VideoModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const source = getVideoSource(project.video_url)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = ''; previous?.focus() }
  }, [])
  return <dialog ref={dialog} className={`video-dialog ${project.category === 'short' ? 'vertical-dialog' : ''}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} aria-labelledby="video-title">
    <div className="video-modal-content">
      <div className="video-modal-header"><span className="eyebrow">{project.category === 'long' ? 'LONG FORM' : 'SHORT FORM'} / NOW PLAYING</span><button className="icon-button" onClick={onClose} aria-label="Close video"><X size={22} /></button></div>
      <div className={`video-player ${source.type === 'instagram' ? 'instagram-player' : ''}`}>
        {source.type === 'video' ? <video src={source.src} controls autoPlay playsInline poster={safeUrl(project.thumbnail)} /> : source.type !== 'external' ? <iframe src={source.src} title={project.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="external-video"><Film size={36} /><h3>Watch the full story</h3><p>This video provider opens in its own player.</p><a href={source.original} className="button primary" target="_blank" rel="noreferrer">Open video <ArrowUpRight size={18} /></a></div>}
      </div>
      <div className="video-modal-caption"><div><h3 id="video-title">{project.title}</h3><p>{project.description}</p></div><a href={source.original} target="_blank" rel="noreferrer" className="external-watch" aria-label="Watch on original platform"><ArrowUpRight size={22} /></a></div>
      {source.type !== 'video' && <p className="embed-note">Player not loading? <a href={source.original} target="_blank" rel="noreferrer">Watch on {source.type === 'youtube' ? 'YouTube' : source.type === 'vimeo' ? 'Vimeo' : source.type === 'instagram' ? 'Instagram' : 'the original platform'} ↗</a>{source.type === 'instagram' && ' · Instagram may require sign-in or block embeds.'}</p>}
    </div>
  </dialog>
}
