// fileController.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const verifyToken = require('./authMiddleware');
const { encryptFile, decryptFile } = require('./cryptoUtils');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// File Upload Endpoint
// fileController.js (excerpt)
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.file.filename);
  const encryptedPath = filePath + '.enc';

  encryptFile(filePath, encryptedPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Encryption failed', error: err.message });
    }
    // Remove the original file only after encryption finishes
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting original file:', unlinkErr);
    });
    res.json({ message: 'File uploaded and encrypted successfully!', fileName: req.file.filename + '.enc' });
  });
});



// File Download Endpoint
// fileController.js (excerpt)
router.get('/download/:fileName', verifyToken, (req, res) => {
  const encryptedPath = path.join(UPLOADS_DIR, req.params.fileName);
  const decryptedPath = encryptedPath.replace('.enc', '');

  if (!fs.existsSync(encryptedPath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  decryptFile(encryptedPath, decryptedPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Decryption failed', error: err.message });
    }

    // Serve the file once decryption is complete
    res.download(decryptedPath, path.basename(decryptedPath), (downloadErr) => {
      // Delete the decrypted file after download finishes
      fs.unlink(decryptedPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting decrypted file:', unlinkErr);
      });
      if (downloadErr) {
        console.error('Download error:', downloadErr);
      }
    });
  });
});


module.exports = router;

