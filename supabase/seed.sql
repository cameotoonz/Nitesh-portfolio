-- Run after schema.sql. Safe to rerun: existing content is not overwritten.
begin;
insert into public.portfolio_profile (id, data)
values (true, $profile${
  "name": "Nitesh Kumar",
  "experience": "1+",
  "location": "Delhi, India",
  "photo": "/images/nitesh.webp",
  "about": "Hey, I'm Nitesh — a video editor and motion graphic designer from Delhi. I've spent the last year turning footage, ideas, and timelines into content that actually feels alive.\n\nWhat I enjoy most about editing is that moment when everything suddenly clicks — the cut, the music, the motion, the typography, and the pacing all working together.",
  "hero_title": "Every frame.",
  "hero_accent": "A feeling.",
  "hero_description": "I turn raw footage into stories that connect. Thoughtful cuts, purposeful motion, and a little bit of feeling.",
  "email": "niteshedits2002@gmail.com",
  "whatsapp": "9315841623",
  "instagram": "framesbynitesh",
  "available": true,
  "skills": ["Video Editing", "Motion Graphics", "Visual Design", "Visual Storytelling", "Sound Design", "Color Grading"]
}$profile$::jsonb) on conflict (id) do nothing;

insert into public.projects (id, title, description, category, thumbnail, video_url, published, position) values
('00000000-0000-4000-8000-000000000001','A designer’s journey','UI/UX student success story · ADMEC','long','/images/projects/2dtas6lbR80.webp','https://www.youtube.com/watch?v=2dtas6lbR80',true,0),
('00000000-0000-4000-8000-000000000002','Learning to see differently','UI/UX course & student feedback · ADMEC','long','/images/projects/ZdN2ptci7ok.webp','https://www.youtube.com/watch?v=ZdN2ptci7ok',true,1),
('00000000-0000-4000-8000-000000000003','From learning to creating','Graphic design student journey · ADMEC','long','/images/projects/pXREsurAuEE.webp','https://www.youtube.com/watch?v=pXREsurAuEE',true,2),
('00000000-0000-4000-8000-000000000004','The story behind the skill','Tauseef’s PHP & MySQL journey · ADMEC','long','/images/projects/0eVg1vVAmYo.webp','https://www.youtube.com/watch?v=0eVg1vVAmYo',true,3),
('00000000-0000-4000-8000-000000000005','Creativity, in competition','Mega design competition · ADMEC','long','/images/projects/pPoCS82plQQ.webp','https://www.youtube.com/watch?v=pPoCS82plQQ',true,4),
('00000000-0000-4000-8000-000000000006','Designing a new beginning','Graphic design student review · ADMEC','long','/images/projects/xl4ou0YNxDM.webp','https://www.youtube.com/watch?v=xl4ou0YNxDM',true,5),
('00000000-0000-4000-8000-000000000007','The power of an edit','Editing breakdown · YouTube Shorts','short','/images/projects/7TuPSZmzOqY.webp','https://www.youtube.com/shorts/7TuPSZmzOqY',true,6),
('00000000-0000-4000-8000-000000000008','A story in seconds','Documentary-style edit · YouTube Shorts','short','/images/projects/WM5w5YWv5jA.webp','https://www.youtube.com/shorts/WM5w5YWv5jA',true,7),
('00000000-0000-4000-8000-000000000009','Made to move','Motion graphics · YouTube Shorts','short','/images/projects/e3TQGlrSkCY.webp','https://www.youtube.com/shorts/e3TQGlrSkCY',true,8),
('00000000-0000-4000-8000-000000000010','The Flipkart story','Business documentary · YouTube Shorts','short','/images/projects/ATLVCgPAqFM.webp','https://www.youtube.com/shorts/ATLVCgPAqFM',true,9),
('00000000-0000-4000-8000-000000000011','Behind the timeline','Video editing course · ADMEC','short','/images/projects/6UCzopp1q5M.webp','https://www.youtube.com/shorts/6UCzopp1q5M',true,10),
('00000000-0000-4000-8000-000000000012','Design your first impression','3 résumé design tips · ADMEC','short','/images/projects/FkyK4tV-kO4.webp','https://www.youtube.com/shorts/FkyK4tV-kO4',true,11)
on conflict (id) do nothing;
commit;
