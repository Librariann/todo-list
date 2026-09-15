const IMAGE_UPLOAD_URL =
  process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL ??
  'https://upload-server-upload.up.railway.app/api/upload/growdo/image';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface UploadResponse {
  url?: unknown;
  error?: string;
  message?: string;
}

export async function uploadRewardImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('JPG, PNG, WebP 이미지만 업로드할 수 있어요.');
  }

  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('이미지는 10MB 이하의 파일로 선택해 주세요.');
  }

  const body = new FormData();
  body.append('file', file);

  const response = await fetch(IMAGE_UPLOAD_URL, {
    method: 'POST',
    body,
  });
  const result = (await response.json().catch(() => null)) as UploadResponse | null;

  if (!response.ok) {
    throw new Error(result?.error ?? result?.message ?? '이미지를 업로드하지 못했어요.');
  }

  if (typeof result?.url !== 'string') {
    throw new Error('업로드는 완료됐지만 이미지 주소를 받지 못했어요.');
  }

  try {
    const uploadedUrl = new URL(result.url);
    if (uploadedUrl.protocol !== 'https:') throw new Error();
  } catch {
    throw new Error('업로드 서버에서 올바른 이미지 주소를 받지 못했어요.');
  }

  return result.url;
}
