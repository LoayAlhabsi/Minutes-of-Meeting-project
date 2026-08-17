package om.gov.moh.minutes.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import om.gov.moh.minutes.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

  private static final String COLLECTION = "users";

  @Autowired
  private Firestore firestore;

  public Optional<User> findById(String id) throws ExecutionException, InterruptedException {
    DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
    if (!doc.exists()) {
      return Optional.empty();
    }
    return Optional.of(fromDocument(doc));
  }

  public Optional<User> findByEmail(String email)
      throws ExecutionException, InterruptedException {
    ApiFuture<QuerySnapshot> future =
        firestore.collection(COLLECTION).whereEqualTo("email", normalizeEmail(email)).limit(1).get();
    List<QueryDocumentSnapshot> docs = future.get().getDocuments();
    if (docs.isEmpty()) {
      return Optional.empty();
    }
    return Optional.of(fromDocument(docs.get(0)));
  }

  public List<User> findAll() throws ExecutionException, InterruptedException {
    ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
    List<User> users = new ArrayList<>();
    for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
      users.add(fromDocument(doc));
    }
    users.sort((a, b) -> String.valueOf(b.getCreatedAt()).compareTo(String.valueOf(a.getCreatedAt())));
    return users;
  }

  public long count() throws ExecutionException, InterruptedException {
    return findAll().size();
  }

  public User save(User user) throws ExecutionException, InterruptedException {
    Map<String, Object> data = toDataMap(user);
    DocumentReference ref =
        user.getId() == null || user.getId().isBlank()
            ? firestore.collection(COLLECTION).document()
            : firestore.collection(COLLECTION).document(user.getId());
    ApiFuture<WriteResult> write = ref.set(data);
    write.get();
    user.setId(ref.getId());
    return user;
  }

  public User update(User user) throws ExecutionException, InterruptedException {
    if (user.getId() == null || user.getId().isBlank()) {
      throw new IllegalArgumentException("User id is required");
    }
    DocumentReference ref = firestore.collection(COLLECTION).document(user.getId());
    DocumentSnapshot existing = ref.get().get();
    if (!existing.exists()) {
      throw new IllegalArgumentException("User not found");
    }
    ApiFuture<WriteResult> write = ref.set(toDataMap(user));
    write.get();
    return user;
  }

  private Map<String, Object> toDataMap(User user) {
    Map<String, Object> data = new HashMap<>();
    data.put("name", user.getName());
    data.put("email", normalizeEmail(user.getEmail()));
    data.put("passwordHash", user.getPasswordHash() == null ? "" : user.getPasswordHash());
    data.put("role", user.getRole());
    data.put("enabled", user.isEnabled());
    data.put("mustSetPassword", user.isMustSetPassword());
    data.put("createdAt", user.getCreatedAt());
    return data;
  }

  private User fromDocument(DocumentSnapshot doc) {
    User user = new User();
    user.setId(doc.getId());
    user.setName(asString(doc.get("name")));
    user.setEmail(asString(doc.get("email")));
    user.setPasswordHash(asString(doc.get("passwordHash")));
    user.setRole(asString(doc.get("role")));
    Boolean enabled = doc.getBoolean("enabled");
    user.setEnabled(enabled == null || enabled);
    Boolean mustSetPassword = doc.getBoolean("mustSetPassword");
    user.setMustSetPassword(Boolean.TRUE.equals(mustSetPassword));
    user.setCreatedAt(asString(doc.get("createdAt")));
    return user;
  }

  private String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }

  private String asString(Object value) {
    return value == null ? "" : String.valueOf(value);
  }
}
