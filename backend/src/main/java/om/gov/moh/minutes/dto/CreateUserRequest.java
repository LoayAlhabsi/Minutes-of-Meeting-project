package om.gov.moh.minutes.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
  private String name;
  private String email;
  /** U or A */
  private String role;
}
