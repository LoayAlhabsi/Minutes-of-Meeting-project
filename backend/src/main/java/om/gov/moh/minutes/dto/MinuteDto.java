package om.gov.moh.minutes.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinuteDto {

  private String id;
  private String title;
  private String location;
  private String date;
  private String discussion;
  private String preparedBy;
  private List<AttendeeDto> attendees = new ArrayList<>();
  private List<DecisionDto> decisions = new ArrayList<>();
}
