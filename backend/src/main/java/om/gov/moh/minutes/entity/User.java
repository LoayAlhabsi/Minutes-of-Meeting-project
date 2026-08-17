package om.gov.moh.minutes.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

  private String id;
  private String name;
  private String email;
  private String passwordHash;
  /** U = normal user, A = admin */
  private String role;
  private boolean enabled = true;
  /** True when admin created the account and the user must choose a password */
  private boolean mustSetPassword;
  private String createdAt;
}
