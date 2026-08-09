# Minutes of Meeting API (Spring Boot + Firebase)

## Setup

1. Install **JDK 21**
2. Download Firebase service account:
   - Firebase Console → Project settings → Service accounts
   - Generate new private key
   - Save as `src/main/resources/serviceAccountKey.json`
3. Enable **Cloud Firestore** in Firebase (test mode is fine for training)
4. Run:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

API base: `http://localhost:8080/api/minutes`
