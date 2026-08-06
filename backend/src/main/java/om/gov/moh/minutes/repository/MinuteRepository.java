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
import java.util.concurrent.ExecutionException;
import om.gov.moh.minutes.entity.Attendee;
import om.gov.moh.minutes.entity.Decision;
import om.gov.moh.minutes.entity.Minute;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class MinuteRepository {

  private static final String COLLECTION = "meeting_minutes";

  @Autowired
  private Firestore firestore;

  public List<Minute> findAll() throws ExecutionException, InterruptedException {
    ApiFuture<QuerySnapshot> future =
        firestore
            .collection(COLLECTION)
            .orderBy("savedAt", com.google.cloud.firestore.Query.Direction.DESCENDING)
            .get();
    List<QueryDocumentSnapshot> docs = future.get().getDocuments();
    List<Minute> result = new ArrayList<>();
    for (QueryDocumentSnapshot doc : docs) {
      result.add(fromDocument(doc));
    }
    return result;
  }

  public Minute save(Minute minute) throws ExecutionException, InterruptedException {
    Map<String, Object> data = toDataMap(minute);
    data.put("savedAt", com.google.cloud.Timestamp.now());

    DocumentReference ref = firestore.collection(COLLECTION).document();
    ApiFuture<WriteResult> write = ref.set(data);
    write.get();

    minute.setId(ref.getId());
    return minute;
  }

  public Minute update(String id, Minute minute)
      throws ExecutionException, InterruptedException {
    DocumentReference ref = firestore.collection(COLLECTION).document(id);
    DocumentSnapshot existing = ref.get().get();
    if (!existing.exists()) {
      throw new IllegalArgumentException("Meeting minutes not found");
    }

    Map<String, Object> data = toDataMap(minute);
    Object savedAt = existing.get("savedAt");
    data.put("savedAt", savedAt != null ? savedAt : com.google.cloud.Timestamp.now());
    data.put("updatedAt", com.google.cloud.Timestamp.now());

    ApiFuture<WriteResult> write = ref.set(data);
    write.get();

    minute.setId(id);
    return minute;
  }

  public void deleteById(String id) throws ExecutionException, InterruptedException {
    DocumentReference ref = firestore.collection(COLLECTION).document(id);
    DocumentSnapshot existing = ref.get().get();
    if (!existing.exists()) {
      throw new IllegalArgumentException("Meeting minutes not found");
    }
    ref.delete().get();
  }

  private Map<String, Object> toDataMap(Minute minute) {
    Map<String, Object> data = new HashMap<>();
    data.put("meetingTitle", minute.getTitle());
    data.put("meetingLocation", minute.getLocation());
    data.put("meetingDate", minute.getDate());
    data.put("discussionAndSummary", minute.getDiscussion());
    data.put("preparedByName", minute.getPreparedBy());
    data.put("attendanceList", toAttendanceMaps(minute.getAttendees()));
    data.put("recommendationsAndDecisions", toDecisionMaps(minute.getDecisions()));
    return data;
  }

  private Minute fromDocument(DocumentSnapshot doc) {
    Minute minute = new Minute();
    minute.setId(doc.getId());
    minute.setTitle(firstString(doc, "meetingTitle", "title"));
    minute.setLocation(firstString(doc, "meetingLocation", "location"));
    minute.setDate(firstString(doc, "meetingDate", "date"));
    minute.setDiscussion(firstString(doc, "discussionAndSummary", "discussion"));
    minute.setPreparedBy(firstString(doc, "preparedByName", "preparedBy"));
    minute.setAttendees(readAttendees(doc));
    minute.setDecisions(readDecisions(doc));
    return minute;
  }

  private String firstString(DocumentSnapshot doc, String primary, String fallback) {
    Object value = doc.get(primary);
    if (value == null) {
      value = doc.get(fallback);
    }
    return value == null ? "" : String.valueOf(value);
  }

  private List<Attendee> readAttendees(DocumentSnapshot doc) {
    Object raw = doc.get("attendanceList");
    if (raw == null) {
      raw = doc.get("attendees");
    }
    List<Attendee> list = new ArrayList<>();
    if (!(raw instanceof List<?> items)) {
      return list;
    }
    for (Object item : items) {
      if (!(item instanceof Map<?, ?> map)) {
        continue;
      }
      Attendee attendee = new Attendee();
      attendee.setId(asString(map.get("id")));
      attendee.setName(asString(map.get("fullName") != null ? map.get("fullName") : map.get("name")));
      attendee.setDesignation(
          asString(map.get("jobTitle") != null ? map.get("jobTitle") : map.get("designation")));
      list.add(attendee);
    }
    return list;
  }

  private List<Decision> readDecisions(DocumentSnapshot doc) {
    Object raw = doc.get("recommendationsAndDecisions");
    if (raw == null) {
      raw = doc.get("decisions");
    }
    List<Decision> list = new ArrayList<>();
    if (!(raw instanceof List<?> items)) {
      return list;
    }
    for (Object item : items) {
      if (!(item instanceof Map<?, ?> map)) {
        continue;
      }
      Decision decision = new Decision();
      decision.setId(asString(map.get("id")));
      decision.setText(
          asString(map.get("decisionText") != null ? map.get("decisionText") : map.get("text")));
      list.add(decision);
    }
    return list;
  }

  private List<Map<String, Object>> toAttendanceMaps(List<Attendee> attendees) {
    List<Map<String, Object>> list = new ArrayList<>();
    if (attendees == null) {
      return list;
    }
    for (Attendee attendee : attendees) {
      Map<String, Object> map = new HashMap<>();
      map.put("id", attendee.getId());
      map.put("fullName", attendee.getName());
      map.put("jobTitle", attendee.getDesignation());
      list.add(map);
    }
    return list;
  }

  private List<Map<String, Object>> toDecisionMaps(List<Decision> decisions) {
    List<Map<String, Object>> list = new ArrayList<>();
    if (decisions == null) {
      return list;
    }
    for (Decision decision : decisions) {
      Map<String, Object> map = new HashMap<>();
      map.put("id", decision.getId());
      map.put("decisionText", decision.getText());
      list.add(map);
    }
    return list;
  }

  private String asString(Object value) {
    return value == null ? "" : String.valueOf(value);
  }
}
