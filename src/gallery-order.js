export function reorderImages(images, from, to) {
  const next = [...images];
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= next.length ||
    to >= next.length
  )
    return next;
  const [image] = next.splice(from, 1);
  next.splice(to, 0, image);
  return next;
}

export function promoteCover(cover, images, index) {
  const next = [...images];
  if (!next[index]) return { cover_image_url: cover, gallery_images: next };
  const selected = next[index];
  next[index] = cover;
  return { cover_image_url: selected, gallery_images: next };
}
