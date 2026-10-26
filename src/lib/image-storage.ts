export type StoredImage = { id: string; dataUrl: string; alt: string; name: string; size: number; uploadedAt: string };

const KEY = 'auvrantis-create:images:v1';
const MAX_IMAGES = 50;
const MAX_SIZE = 5 * 1024 * 1024;

function getStore(): StoredImage[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredImage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStore(images: StoredImage[]) {
  try {
    const trimmed = images.slice(-MAX_IMAGES);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* localStorage full or unavailable */
  }
}

export function listImages(): StoredImage[] {
  return getStore();
}

export function storeImage(file: File, alt: string): Promise<StoredImage> {
  if (!alt.trim()) throw new Error('Alt text is required for images.');
  if (file.size > MAX_SIZE) throw new Error('Images must be 5 MB or smaller.');
  if (!file.type.startsWith('image/')) throw new Error('Only images can be uploaded.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const images = getStore();
        const image: StoredImage = {
          id: crypto.randomUUID(),
          dataUrl: reader.result as string,
          alt: alt.trim().slice(0, 200),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        images.push(image);
        setStore(images);
        resolve(image);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export function deleteImage(id: string) {
  const images = getStore().filter(img => img.id !== id);
  setStore(images);
}

export function getImage(id: string): StoredImage | undefined {
  return getStore().find(img => img.id === id);
}
