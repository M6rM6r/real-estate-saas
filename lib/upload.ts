import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export interface ProcessedFile {
  buffer: Buffer
  filename: string
  contentType: 'image/webp'
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileValidationError'
  }
}

export async function processUpload(
  file: File,
  options: { maxSize?: number; width?: number; height?: number; quality?: number } = {}
): Promise<ProcessedFile> {
  const { maxSize = MAX_FILE_SIZE, width = 1920, height, quality = 85 } = options

  // Validate MIME type (never trust Content-Type header; check magic bytes after buffer)
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new FileValidationError('Only JPEG, PNG, and WebP images are allowed')
  }

  if (file.size > maxSize) {
    throw new FileValidationError(
      `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // Validate magic bytes
  validateMagicBytes(inputBuffer)

  // Process with sharp: resize + convert to WebP
  const sharpInstance = sharp(inputBuffer)
    .resize(width, height ?? undefined, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })

  const outputBuffer = await sharpInstance.toBuffer()

  return {
    buffer: outputBuffer,
    filename: `${uuidv4()}.webp`,
    contentType: 'image/webp',
  }
}

function validateMagicBytes(buffer: Buffer): void {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return
  // WebP: RIFF????WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return

  throw new FileValidationError('Invalid image file')
}
