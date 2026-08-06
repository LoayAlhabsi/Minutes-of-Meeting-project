# Minutes of Meeting

```
trainee project/
  frontend/   → React + Vite + TypeScript
  backend/    → Spring Boot + Firebase Firestore
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

## Backend

1. Add Firebase service account as:
   `backend/src/main/resources/serviceAccountKey.json`
2. Run:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

API at http://localhost:8080/api/minutes

## Future plans (roles)

Later we will add **Admin** and **User** accounts:

- **User:** can create minutes and see **only their own** meetings
- **Admin:** can see **all** meetings and manage/view **all users**
# Minutes-of-Meeting-project
