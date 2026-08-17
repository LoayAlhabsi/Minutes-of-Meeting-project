package om.gov.moh.minutes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
  private long totalMinutes;
  private long totalUsers;
  private long meetingsThisMonth;
}
