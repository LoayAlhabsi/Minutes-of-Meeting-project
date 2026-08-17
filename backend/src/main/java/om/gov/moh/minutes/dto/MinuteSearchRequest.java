package om.gov.moh.minutes.dto;

import lombok.Data;

@Data
public class MinuteSearchRequest {

  private String title;
  private String person;
  private String dateFrom;
  private String dateTo;
  /** all | en | ar */
  private String language;
  /** all | mine | users (admin only) */
  private String creatorFilter;
  /** title | date | preparedBy */
  private String sortKey;
  /** asc | desc */
  private String sortDir;
  private Integer page;
  private Integer size;
}
