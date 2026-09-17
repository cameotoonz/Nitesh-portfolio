export type Project = {
  id: string
  title: string
  description: string
  category: 'long' | 'short'
  thumbnail: string
  video_url: string
  published: boolean
  position: number
}

export type Profile = {
  name: string
  experience: string
  location: string
  photo: string
  about: string
  hero_title: string
  hero_accent: string
  hero_description: string
  email: string
  whatsapp: string
  instagram: string
  available: boolean
  skills: string[]
}
