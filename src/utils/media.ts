const MEDIA_FOLDER = `${import.meta.env.BASE_URL}media/`;

// Tên file trong public/media/ được đổi thành URL; đường dẫn tuyệt đối và URL đầy đủ giữ nguyên.
export function resolveMediaPath(path: string): string {
  const trimmedPath = path.trim();
  if (/^(https?:|data:|blob:|\/)/.test(trimmedPath)) return trimmedPath;
  return MEDIA_FOLDER + encodeURI(trimmedPath);
}
