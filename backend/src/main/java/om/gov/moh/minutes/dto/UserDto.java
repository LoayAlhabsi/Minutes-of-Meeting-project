package om.gov.moh.minutes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
  private String id;
  private String name;
  private String email;
  private String role;
  private boolean enabled;
  private boolean mustSetPassword;
  private String createdAt;
}
