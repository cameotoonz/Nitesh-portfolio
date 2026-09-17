import type { Profile, Project } from './types'

export const initialProfile: Profile = {
  name: 'Nitesh Kumar',
  experience: '1+',
  location: 'Delhi, India',
  photo: '/images/nitesh.webp',
  about: "Hey, I'm Nitesh — a video editor and motion graphic designer from Delhi. I've spent the last year turning footage, ideas, and timelines into content that actually feels alive.\n\nWhat I enjoy most about editing is that moment when everything suddenly clicks — the cut, the music, the motion, the typography, and the pacing all working together.",
  hero_title: 'Every frame.',
  hero_accent: 'A feeling.',
  hero_description: 'I turn raw footage into stories that connect. Thoughtful cuts, purposeful motion, and a little bit of feeling.',
  email: 'niteshedits2002@gmail.com',
  whatsapp: '9315841623',
  instagram: 'framesbyniteshh',
  available: true,
  skills: ['Video Editing', 'Motion Graphics', 'Visual Design', 'Visual Storytelling', 'Sound Design', 'Color Grading'],
}

const videos: [string, string, string, 'long' | 'short'][] = [
  ['2dtas6lbR80', 'A designer’s journey', 'UI/UX student success story · ADMEC', 'long'],
  ['ZdN2ptci7ok', 'Learning to see differently', 'UI/UX course & student feedback · ADMEC', 'long'],
  ['pXREsurAuEE', 'From learning to creating', 'Graphic design student journey · ADMEC', 'long'],
  ['0eVg1vVAmYo', 'The story behind the skill', 'Tauseef’s PHP & MySQL journey · ADMEC', 'long'],
  ['pPoCS82plQQ', 'Creativity, in competition', 'Mega design competition · ADMEC', 'long'],
  ['xl4ou0YNxDM', 'Designing a new beginning', 'Graphic design student review · ADMEC', 'long'],
  ['7TuPSZmzOqY', 'The power of an edit', 'Editing breakdown · YouTube Shorts', 'short'],
  ['WM5w5YWv5jA', 'A story in seconds', 'Documentary-style edit · YouTube Shorts', 'short'],
  ['e3TQGlrSkCY', 'Made to move', 'Motion graphics · YouTube Shorts', 'short'],
  ['ATLVCgPAqFM', 'The Flipkart story', 'Business documentary · YouTube Shorts', 'short'],
  ['6UCzopp1q5M', 'Behind the timeline', 'Video editing course · ADMEC', 'short'],
  ['FkyK4tV-kO4', 'Design your first impression', '3 résumé design tips · ADMEC', 'short'],
]

export const initialProjects: Project[] = videos.map(([video, title, description, category], index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  title, description, category,
  thumbnail: `/images/projects/${video}.webp`,
  video_url: category === 'short' ? `https://www.youtube.com/shorts/${video}` : `https://www.youtube.com/watch?v=${video}`,
  published: true,
  position: index,
}))

export const editingSteps = [
  { name: 'Cut', detail: 'Keep what matters. Remove distractions, repetition, and anything that doesn’t serve the story.' },
  { name: 'Flow', detail: 'Connect each moment with intention. Build a clear story with seamless transitions and thoughtful B-roll.' },
  { name: 'Rhythm', detail: 'Find the heartbeat. Shape the pacing around the emotion, energy, and attention of the viewer.' },
  { name: 'Motion', detail: 'Make the idea visible. Add purposeful motion graphics, typography, and visual elements where they make a difference.' },
  { name: 'Sound', detail: 'Give every frame a voice. Layer music, atmosphere, and sound effects that bring the edit to life.' },
  { name: 'Polish', detail: 'Bring it all together. Balance the colors, refine the details, and review the complete video, frame by frame.' },
]

export const processSteps = [
  { name: 'Understand', short: 'A good edit starts with a good conversation.', detail: 'We talk through your idea, audience, references, and purpose. I review the footage and find the story worth telling.', tag: 'THE BIG PICTURE', icon: 'understand' },
  { name: 'Build', short: 'Find the story. Then give it a rhythm.', detail: 'I build the structure, choose the cuts, and shape the pacing. Storytelling and visual flow guide every decision.', tag: 'THE FIRST CUT', icon: 'build' },
  { name: 'Polish', short: 'The little details make the big difference.', detail: 'Motion graphics, typography, sound design, and color grading bring the edit together. Every detail gets a second look.', tag: 'THE FINISHING TOUCH', icon: 'polish' },
  { name: 'Deliver', short: 'Ready for your audience. Ready to make an impact.', detail: 'A final review, a clean timeline, and the right export for your platform. Your finished video, delivered and ready to share.', tag: 'THE FINAL FRAME', icon: 'deliver' },
]
