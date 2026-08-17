package om.gov.moh.minutes.dto;

import lombok.Data;

@Data
public class UserSearchRequest {

  /** Matches name or email. */
  private String query;
  /** all | U | A */
  private String role;
  /** all | active | disabled */
  private String status;
  /** name | email | role | createdAt */
  private String sortKey;
  /** asc | desc */
  private String sortDir;
  private Integer page;
  private Integer size;
}
