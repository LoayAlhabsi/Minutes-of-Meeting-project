package om.gov.moh.minutes.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

  private List<T> content = new ArrayList<>();
  private int page;
  private int size;
  private long totalElements;
  private int totalPages;
  /** Total matches before creatorFilter (admin facets). */
  private Long allCount;
  private Long mineCount;
  private Long userCount;

  public static <T> PageResponse<T> of(List<T> items, int page, int size) {
    int safeSize = size <= 0 ? 10 : Math.min(size, 100);
    int safePage = Math.max(page, 0);
    int total = items.size();
    int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
    if (totalPages > 0 && safePage >= totalPages) {
      safePage = totalPages - 1;
    }
    int from = Math.min(safePage * safeSize, total);
    int to = Math.min(from + safeSize, total);
    PageResponse<T> response = new PageResponse<>();
    response.setContent(new ArrayList<>(items.subList(from, to)));
    response.setPage(safePage);
    response.setSize(safeSize);
    response.setTotalElements(total);
    response.setTotalPages(totalPages);
    return response;
  }
}
