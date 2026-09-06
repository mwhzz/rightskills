export const instructorPhotos: Record<string, string> = {
  "Rafiul Hasan": "/instructors/rafiul.jpg",
  "Nusrat Jahan": "/instructors/nusrat.jpg",
  "Tanvir Ahmed": "/instructors/tanvir.jpg",
  "Farhana Rahman": "/instructors/farhana.jpg",
  "Mahmudul Islam": "/instructors/mahmudul.jpg",
  "Shaila Karim": "/instructors/shaila.jpg",
};

export function instructorPhotoSrc(
  name: string,
  uploaded?: string | null
) {
  if (uploaded?.trim()) {
    const path = uploaded.trim();
    return path.startsWith("/") ? path : `/api/media/${path}`;
  }
  return instructorPhotos[name];
}
