package om.gov.moh.minutes.entity;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Minute {

  private String id;
  private String title;
  private String location;
  private String date;
  private String discussion;
  private String preparedBy;
  private List<Attendee> attendees = new ArrayList<>();
  private List<Decision> decisions = new ArrayList<>();
}
