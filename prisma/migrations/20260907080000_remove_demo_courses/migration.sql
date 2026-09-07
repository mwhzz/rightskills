-- Remove catalogue seed courses. Real courses (any other slug) stay.
DELETE oi FROM `OrderItem` oi
INNER JOIN `Course` c ON c.id = oi.courseId
WHERE c.slug IN (
  'fullstack-web-nextjs',
  'freelance-graphic-upwork',
  'facebook-ads-bd',
  'spoken-english-job',
  'excel-office',
  'ielts-band-7',
  'python-data',
  'content-writing',
  'wordpress-business',
  'figma-uiux',
  'youtube-video-edit',
  'b2b-sales-bd'
);

DELETE FROM `Course`
WHERE `slug` IN (
  'fullstack-web-nextjs',
  'freelance-graphic-upwork',
  'facebook-ads-bd',
  'spoken-english-job',
  'excel-office',
  'ielts-band-7',
  'python-data',
  'content-writing',
  'wordpress-business',
  'figma-uiux',
  'youtube-video-edit',
  'b2b-sales-bd'
);
