import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup local uploads storage for development
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `ehr-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/dicom',
    'application/octet-stream',
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.dcm')) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE: Only PDF, JPEG, PNG, and DICOM medical files are permitted.'));
  }
};

export const uploadEHRDocument = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
  fileFilter,
});
