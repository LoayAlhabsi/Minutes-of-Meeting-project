package om.gov.moh.minutes.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendee {

  private String id;
  private String name;
  private String designation;
}
