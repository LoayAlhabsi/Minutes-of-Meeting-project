package om.gov.moh.minutes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendeeDto {

  private String id;
  private String name;
  private String designation;
}
