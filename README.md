# Skills Bangladesh

Production LMS on cPanel: course catalogue, student accounts (mobile + password), manual bKash/Nagad checkout with admin TrxID approval, and a shared admin/teacher panel for courses and video uploads.

## Run locally

1. Create a MySQL database.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` + `SESSION_SECRET`.
3. `npm install`
4. `npx prisma migrate deploy`
5. `npx prisma db seed` (admin phone `01700000000`, password from `ADMIN_PASSWORD` or `Admin1234!`)
6. `npm run dev`

Open [http://localhost:43127](http://localhost:43127).

## Roles

- **Student:** `/register`, buy courses, paste TrxID on `/account/orders`, watch on `/learn`
- **Teacher / admin:** `/admin` after login. Teachers manage their courses. Admins also approve orders and create teachers.

## cPanel env

Set `DATABASE_URL`, `SESSION_SECRET`, and optionally `UPLOADS_DIR` (default `./uploads`) on the Node.js app. After deploy, run seed once if the catalogue is empty.
