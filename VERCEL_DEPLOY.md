# Vercel Deployment

This project can be deployed to Vercel with static pages plus Node.js serverless functions under `api/`.

## What is included

- Static pages: `index.html`, `leave-detail.html`, `styles.css`, `leave-detail.js`
- Serverless APIs:
  - `/api/health`
  - `/api/student-contacts`
  - `/api/students/search`
  - `/api/students/nfc-search`

## Required environment variables

Create these variables in the Vercel project settings:

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_JXT_NAME=jxt_dev
DB_UCENTER_NAME=ucenter_dev
DB_CHARSET=utf8mb4
DB_CONNECTION_LIMIT=3
```

## Deployment steps

1. Import `yukiandcece/kindergarten-leave-system` into Vercel.
2. Keep the project root as the repository root.
3. Add the environment variables above in `Settings -> Environment Variables`.
4. Deploy the project.
5. After deployment, open `/api/health` to verify the database connection.

## Important notes

- GitHub Pages is not enough for this project because it cannot run Node.js APIs.
- Your MySQL server must allow inbound connections from Vercel.
- Do not keep database passwords hardcoded in source files.
