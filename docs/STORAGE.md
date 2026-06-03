# Storage Architecture

## Overview

| Data type | Storage | MongoDB stores |
|-----------|---------|----------------|
| Users, auth, profiles | MongoDB Atlas | Documents + references |
| Internships, applications, tasks | MongoDB Atlas | Documents |
| Profile pictures | **Cloudinary** | URL + `publicId` + metadata only |
| Resume PDF/DOC | **Cloudinary** | URL + `publicId` + metadata only |

Binary files are **never** stored in MongoDB.

## MongoDB Atlas

Set in `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/internship_platform?retryWrites=true&w=majority
```

Connection uses pooling, retry writes, and `w=majority` for Atlas clusters.

## Cloudinary

Set in `.env`:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=imp
```

Folders:
- `imp/profile-pictures/` — student avatars (512×512 crop)
- `imp/resumes/` — PDF/DOC (raw resource type)

## Student profile API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/students/profile` | Student JWT | Full profile |
| PUT | `/api/v1/students/profile` | Student JWT | Update text fields |
| POST | `/api/v1/students/profile/picture` | Student JWT | Upload image (multipart `file`) |
| DELETE | `/api/v1/students/profile/picture` | Student JWT | Remove picture |
| POST | `/api/v1/students/profile/resume` | Student JWT | Upload resume (multipart `file`) |
| DELETE | `/api/v1/students/profile/resume` | Student JWT | Remove resume |

### Upload validation

| Type | MIME | Max size |
|------|------|----------|
| Profile picture | jpeg, png, webp | 2 MB |
| Resume | pdf, doc, docx | 5 MB |

Replacing a file deletes the previous Cloudinary asset automatically.

## Student document shape (MongoDB)

```javascript
{
  userId, fullName, phone, college, degree, skills, bio,
  linkedIn, github, portfolio, location,
  profilePicture: { url, publicId, filename, mimeType, size, uploadedAt },
  resume: { url, publicId, filename, mimeType, size, uploadedAt },
  education: [...],
  projects: [...],
  experience: [...],
  certifications: [...]
}
```

## Security

- All upload routes require JWT + `student` role
- Multer memory storage (no disk writes)
- Joi validation on profile JSON updates
- File type and size enforced before Cloudinary upload
