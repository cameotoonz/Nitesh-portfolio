import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, AudioLines, Check, ChevronDown, Clapperboard, Diamond, Film, Instagram, Layers3, Mail, MapPin, Menu, MessageCircle, Mouse, MoveUpRight, Palette, Play, ScanLine, Scissors, Sparkles, X } from 'lucide-react'
import type { Profile, Project } from '../lib/types'
import { editingSteps, processSteps } from '../lib/data'
import { safeUrl, whatsappLink } from '../lib/media'
import VideoModal from '../components/VideoModal'

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <motion.div initial={{ y: reduced ? 0 : 18 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
}

function ProjectCard({ project, index, onPlay }: { project: Project; index: number; onPlay: (project: Project) => void }) {
  const [failedUrl, setFailedUrl] = useState('')
  return <Reveal delay={(index % 4) * 0.07} className={`project-card ${project.category === 'short' ? 'short-card' : ''}`}>
    <button className="project-image" onClick={() => onPlay(project)} aria-label={`Play ${project.title}`}>
      {failedUrl !== project.thumbnail && safeUrl(project.thumbnail) ? <img src={safeUrl(project.thumbnail)} alt={project.title} loading="lazy" onError={() => setFailedUrl(project.thumbnail)} /> : <div className="thumbnail-fallback"><Film size={40} /><span>{project.title}</span></div>}
      <div className="project-shade" />
      <span className="project-number">{String(index + 1).padStart(2, '0')} / SELECTED WORK</span>
      <span className="project-play"><Play size={19} fill="currentColor" strokeWidth={1} /></span>
      <span className="project-format">{project.category === 'long' ? '16:9' : '9:16'} <ScanLine size={13} /></span>
      <span className="watch-label">WATCH PROJECT <ArrowUpRight size={14} /></span>
    </button>
    <button className="project-caption" onClick={() => onPlay(project)}><div><h3>{project.title}</h3><p>{project.description}</p></div><ArrowUpRight size={21} /></button>
  </Reveal>
}

const serviceIcons = [Scissors, Layers3, Palette, Film, AudioLines, ScanLine]

export default function Portfolio({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const [category, setCategory] = useState<'long' | 'short'>('long')
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [editingStep, setEditingStep] = useState(0)
  const [process, setProcess] = useState(0)
  const visibleProjects = projects.filter(p => p.published && p.category === category)
  const displayProjects = expanded ? visibleProjects : visibleProjects.slice(0, category === 'long' ? 2 : 4)
  const featured = projects.find(p => p.published && p.category === 'short') || projects.find(p => p.published)
  const firstName = profile.name.split(' ')[0]

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveNav(entry.target.id) })
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 })
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!mobileMenu) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenu(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [mobileMenu])

  return <div className="portfolio-site">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header container">
      <a href="#home" className="wordmark" aria-label={`${profile.name}, home`}><span className="brand">nk<span>.</span></span><span className="wordmark-name">{profile.name}<span>INDEPENDENT CREATIVE</span></span></a>
      <nav className={`main-nav ${mobileMenu ? 'is-open' : ''}`} aria-label="Main navigation">
        {[['work', 'Work'], ['about', 'About'], ['process', 'Process']].map(([id, label]) => <a className={activeNav === id ? 'active' : ''} key={id} href={`#${id}`} onClick={() => setMobileMenu(false)}>{label}</a>)}
        <a className="nav-contact" href="#contact" onClick={() => setMobileMenu(false)}>Let’s talk <ArrowUpRight size={16} /></a>
      </nav>
      <button className="menu-toggle icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenu}>{mobileMenu ? <X /> : <Menu />}</button>
    </header>

    <main id="main">
      <section id="home" className="hero container">
        <div className="hero-content">
          <Reveal><div className="availability"><span className="status-dot" />{profile.available ? 'AVAILABLE FOR SELECT PROJECTS' : 'LET’S CREATE SOMETHING MEANINGFUL'}</div></Reveal>
          <Reveal delay={0.08}><h1>{profile.hero_title}<br /><em>{profile.hero_accent}</em><span className="heading-asterisk">✳</span></h1></Reveal>
          <Reveal delay={0.16}><p className="hero-intro">Video Editor <span>×</span> Motion Graphic Designer</p><p className="hero-description">{profile.hero_description}</p></Reveal>
          <Reveal delay={0.24} className="hero-buttons"><a href="#work" className="button primary">Explore my work <ArrowDownRight size={18} /></a><a href="#contact" className="button text-button">Let’s create something <ArrowUpRight size={17} /></a></Reveal>
          <Reveal delay={0.3} className="hero-meta"><div><strong>{profile.experience}</strong><span>YEARS OF CRAFTING STORIES</span></div><span className="meta-divider" /><div className="hero-location"><MapPin size={17} /><span>BASED IN<br /><b>{profile.location}</b></span></div></Reveal>
        </div>
        <Reveal delay={0.15} className="hero-art">
          <div className="portrait-frame">
            <div className="frame-header"><span><span className="tiny-square" /> THE PERSON BEHIND THE CUT</span><span>01 / 01</span></div>
            <div className="hero-portrait"><img src={safeUrl(profile.photo)} alt={`${profile.name}, video editor and motion designer`} fetchPriority="high" /><div className="portrait-vignette" /><span className="portrait-cross cross-one">+</span><span className="portrait-cross cross-two">+</span><div className="portrait-name"><span>HEY, I’M</span><h2>{profile.name}<span>↗</span></h2><p>Editing stories. Creating feelings.</p></div>
              {featured && <button className="portrait-play" aria-label="Play a glimpse of my work" onClick={() => setSelected(featured)}><Play size={20} fill="currentColor" strokeWidth={1} /></button>}
            </div>
            <div className="mini-timeline" aria-hidden="true"><div className="timeline-ruler"><span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span></div><div className="timeline-track"><span className="clip clip-one">story.mp4</span><span className="clip clip-two">a little motion</span><span className="clip clip-three" /></div><div className="audio-track">{Array.from({ length: 62 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 17 + i % 5 * 13) % 14)}px` }} />)}</div><div className="timeline-playhead"><span /></div></div>
          </div>
          <div className="art-caption"><span><span className="status-dot" /> MADE OF CURIOSITY & A FEW GOOD CUTS</span><ArrowDownRight size={16} /></div>
          <span className="side-label">PORTFOLIO — 2026</span>
        </Reveal>
        <a href="#work" className="hero-scroll"><Mouse size={15} /><span>SCROLL TO EXPLORE</span><ArrowDown size={13} /></a>
      </section>

      <div className="discipline-strip"><div className="container"><span>VIDEO EDITOR</span><span className="strip-star">✳</span><span>MOTION DESIGNER</span><span className="strip-star">✳</span><span>VISUAL STORYTELLER</span><span className="strip-star last-star">✳</span></div></div>

      <section id="work" className="work-section section-space container">
        <Reveal className="section-heading"><div><span className="eyebrow"><span className="section-dash" /> 01 / SELECTED WORK</span><h2>Less noise.<br className="mobile-break" /> <span className="muted-heading">More impact.</span></h2></div><p>A few stories I’ve helped bring to life.<br />Different formats. The same attention to detail.</p></Reveal>
        <div className="work-controls"><div className="work-tabs" role="tablist" aria-label="Project format"><button id="long-tab" role="tab" aria-selected={category === 'long'} aria-controls="projects-panel" className={category === 'long' ? 'active' : ''} onClick={() => { setCategory('long'); setExpanded(false) }}><Clapperboard size={16} />LONG FORM VIDEOS <span>{String(projects.filter(p => p.published && p.category === 'long').length).padStart(2, '0')}</span></button><button id="short-tab" role="tab" aria-selected={category === 'short'} aria-controls="projects-panel" className={category === 'short' ? 'active' : ''} onClick={() => { setCategory('short'); setExpanded(false) }}><Film size={16} />SHORT FORM VIDEOS <span>{String(projects.filter(p => p.published && p.category === 'short').length).padStart(2, '0')}</span></button></div><span className="format-note">{category === 'long' ? 'STORIES WITH ROOM TO BREATHE' : 'SMALL FORMAT. BIG FEELING.'}</span></div>
        <div id="projects-panel" role="tabpanel" aria-labelledby={`${category}-tab`} className={`projects-grid ${category === 'short' ? 'short-grid' : ''}`} key={category}>{displayProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onPlay={setSelected} />)}</div>
        {visibleProjects.length === 0 && <div className="empty-projects"><Film size={30} /><p>New stories are in the making.</p><a href="#contact">Let’s make the next one together ↗</a></div>}
        {visibleProjects.length > (category === 'long' ? 2 : 4) && <div className="more-projects"><span>EVERY PROJECT, A DIFFERENT PERSPECTIVE.</span><button className="button outline" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show selected projects' : `View all ${category === 'long' ? 'long' : 'short'} form work`}<ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></button></div>}
      </section>

      <section id="about" className="about-section section-space"><div className="container about-grid"><Reveal className="about-visual"><div className="about-photo"><img src={safeUrl(profile.photo)} alt={`${firstName} — the person behind the timeline`} loading="lazy" /><span className="photo-corner top-left" /><span className="photo-corner bottom-right" /><div className="about-photo-tag"><span>NOT JUST AN EDITOR.</span><span>A STORY PERSON.</span></div></div><div className="photo-bottom"><span>{profile.location.toUpperCase()} ↗</span><span>ALWAYS A WORK IN PROGRESS.</span></div></Reveal><Reveal className="about-copy"><span className="eyebrow"><span className="section-dash" /> 02 / BEHIND THE TIMELINE</span><h2>A little about<br />the <em>person.</em></h2>{profile.about.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="about-signoff"><span className="signature">{firstName}.</span><span>CURIOUS BY NATURE.<br />CREATIVE BY CHOICE.</span></div></Reveal></div></section>

      <section id="skills" className="skills-section section-space container"><Reveal className="section-heading"><div><span className="eyebrow"><span className="section-dash" /> 03 / WHAT I BRING</span><h2>More than <span className="muted-heading">just cuts.</span></h2></div><p>One story. Many moving parts.<br />I make sure they all move together.</p></Reveal><div className="services-grid">{profile.skills.map((skill, index) => { const Icon = serviceIcons[index % serviceIcons.length]; return <Reveal key={skill + index} delay={index * 0.04} className="service-item"><Icon size={22} strokeWidth={1.35} /><span>{skill}</span><span className="service-index">0{index + 1}</span></Reveal> })}</div><Reveal className="editing-dna"><div className="dna-heading"><span className="eyebrow">MY EDITING DNA</span><span>GOOD EDITING IS FELT, NOT NOTICED.</span></div><div className="dna-steps" role="tablist" aria-label="Editing approach">{editingSteps.map((step, index) => <div key={step.name}><button id={`dna-${index}`} role="tab" aria-selected={editingStep === index} aria-controls="dna-description" className={editingStep === index ? 'active' : ''} onClick={() => setEditingStep(index)}><span className="keyframe" />{step.name}</button>{index < editingSteps.length - 1 && <ArrowRight size={15} />}</div>)}</div><div className="dna-detail" id="dna-description" role="tabpanel" aria-labelledby={`dna-${editingStep}`}><span>0{editingStep + 1}</span><AnimatePresence mode="wait"><motion.p key={editingStep} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>{editingSteps[editingStep].detail}</motion.p></AnimatePresence></div></Reveal></section>

      <section id="process" className="process-section section-space"><div className="container"><Reveal className="section-heading"><div><span className="eyebrow"><span className="section-dash" /> 04 / FROM RAW TO REMARKABLE</span><h2>A process with <em>purpose.</em></h2></div><p>No unnecessary complexity.<br />Just a clear path to a better video.</p></Reveal><div className="process-layout"><div className="process-list" role="tablist" aria-label="My creative process">{processSteps.map((step, index) => <button key={step.name} id={`process-tab-${index}`} role="tab" aria-selected={process === index} aria-controls="process-panel" className={`process-step ${process === index ? 'active' : ''}`} onClick={() => setProcess(index)}><span className="process-number">0{index + 1}</span><div><h3>{step.name}</h3><p>{step.short}</p></div><ArrowUpRight size={23} /></button>)}</div><div className="process-display" id="process-panel" role="tabpanel" aria-labelledby={`process-tab-${process}`}><AnimatePresence mode="wait"><motion.div key={process} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="process-display-inner"><div className={`process-graphic graphic-${process}`} aria-hidden="true">{process === 0 ? <><div className="focus-box"><span /><span /><span /><span /><div className="focus-dot"><Diamond size={34} strokeWidth={1} /></div></div><div className="orbit-label label-a">THE IDEA</div><div className="orbit-label label-b">THE AUDIENCE</div><div className="orbit-label label-c">THE STORY</div></> : process === 1 ? <div className="graphic-clips"><span /><span /><span /><span /><span /></div> : process === 2 ? <><svg viewBox="0 0 280 160"><path d="M20 140C120 140 130 20 260 20" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 140L100 140M180 20H260" fill="none" stroke="currentColor" strokeDasharray="3 5" /><circle cx="20" cy="140" r="4" fill="currentColor" /><circle cx="260" cy="20" r="4" fill="currentColor" /></svg><Sparkles className="graphic-spark" size={24} /></> : <div className="delivery-icon"><Check size={52} strokeWidth={1} /><span>EXPORT COMPLETE</span></div>}</div><div className="process-display-copy"><span className="eyebrow">0{process + 1} — {processSteps[process].tag}</span><h3>{processSteps[process].name} the {process === 0 ? 'possibilities.' : process === 1 ? 'story.' : process === 2 ? 'details.' : 'feeling.'}</h3><p>{processSteps[process].detail}</p></div></motion.div></AnimatePresence><span className="process-display-corner">↗</span></div></div></div></section>

      <section id="contact" className="contact-section section-space container"><Reveal><div className="contact-top"><span className="eyebrow"><span className="section-dash" /> 05 / YOUR STORY, NEXT</span><span className="availability"><span className="status-dot" />{profile.available ? 'OPEN FOR COLLABORATIONS' : 'LET’S STAY IN TOUCH'}</span></div><div className="contact-headline"><h2>LET’S WORK<br /><em>TOGETHER.</em></h2><a href={whatsappLink(profile.whatsapp)} target="_blank" rel="noreferrer" className="contact-big-arrow" aria-label="Start a conversation on WhatsApp"><MoveUpRight strokeWidth={1} /></a></div><p className="contact-intro">Have a video, idea, or project in mind?<br />Let’s turn it into something people want to watch.</p><div className="contact-links"><a href={whatsappLink(profile.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={21} /><div><span>WHATSAPP</span><strong>{profile.whatsapp.length === 10 ? '+91 ' : ''}{profile.whatsapp}</strong></div><ArrowUpRight size={20} /></a><a href={`mailto:${profile.email}`}><Mail size={21} /><div><span>EMAIL</span><strong>{profile.email}</strong></div><ArrowUpRight size={20} /></a><a href={`https://www.instagram.com/${profile.instagram.replace(/^@/, '')}/`} target="_blank" rel="noreferrer"><Instagram size={21} /><div><span>INSTAGRAM</span><strong>@{profile.instagram.replace(/^@/, '')}</strong></div><ArrowUpRight size={20} /></a></div></Reveal></section>
    </main>
    <footer className="site-footer container"><a href="#home" className="brand" aria-label="Back to home">nk<span>.</span></a><p>© {new Date().getFullYear()} {profile.name}. Crafted with intention.</p><div><a href="/admin" className="studio-link">Studio</a><a href="#home" className="back-top">BACK TO TOP <ArrowUp size={14} /></a></div></footer>
    {selected && <VideoModal project={selected} onClose={() => setSelected(null)} />}
  </div>
}
