package om.gov.moh.minutes.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.entity.Minute;

public final class MinuteSearchSupport {

  private MinuteSearchSupport() {}

  public static List<Minute> filterBasic(List<Minute> minutes, MinuteSearchRequest request) {
    String titleQ = normalize(request == null ? null : request.getTitle());
    String personQ = normalize(request == null ? null : request.getPerson());
    String dateFrom = blankToNull(request == null ? null : request.getDateFrom());
    String dateTo = blankToNull(request == null ? null : request.getDateTo());
    String languageFilter =
        request == null || request.getLanguage() == null
            ? "all"
            : request.getLanguage().trim().toLowerCase(Locale.ROOT);

    // If the range is inverted, swap so From/To always form a valid window.
    if (dateFrom != null && dateTo != null && dateFrom.compareTo(dateTo) > 0) {
      String swap = dateFrom;
      dateFrom = dateTo;
      dateTo = swap;
    }

    final String from = dateFrom;
    final String to = dateTo;

    return minutes.stream()
        .filter(m -> titleQ.isEmpty() || contains(m.getTitle(), titleQ))
        .filter(
            m ->
                personQ.isEmpty()
                    || contains(m.getCreatedByName(), personQ)
                    || contains(m.getCreatedByEmail(), personQ)
                    || contains(m.getCreatedByUserId(), personQ)
                    || contains(m.getPreparedBy(), personQ)
                    || contains(m.getApprovedBy(), personQ))
        .filter(m -> from == null || compareDate(m.getDate(), from) >= 0)
        .filter(m -> to == null || compareDate(m.getDate(), to) <= 0)
        .filter(m -> matchesLanguage(m.getLanguage(), languageFilter))
        .collect(Collectors.toCollection(ArrayList::new));
  }

  private static boolean matchesLanguage(String minuteLanguage, String filter) {
    if (filter == null || filter.isBlank() || "all".equals(filter)) {
      return true;
    }
    String lang =
        minuteLanguage == null || minuteLanguage.isBlank()
            ? "en"
            : minuteLanguage.trim().toLowerCase(Locale.ROOT);
    return filter.equals(lang);
  }

  public static List<Minute> applyCreatorFilter(
      List<Minute> minutes, String creatorFilter, String currentUserId, Set<String> userCreatorIds) {
    String filter = creatorFilter == null ? "all" : creatorFilter.trim().toLowerCase(Locale.ROOT);
    if ("mine".equals(filter)) {
      if (currentUserId == null || currentUserId.isBlank()) {
        return new ArrayList<>();
      }
      return minutes.stream()
          .filter(m -> currentUserId.equals(m.getCreatedByUserId()))
          .collect(Collectors.toCollection(ArrayList::new));
    }
    if ("users".equals(filter)) {
      return minutes.stream()
          .filter(
              m ->
                  m.getCreatedByUserId() != null
                      && userCreatorIds != null
                      && userCreatorIds.contains(m.getCreatedByUserId()))
          .collect(Collectors.toCollection(ArrayList::new));
    }
    return new ArrayList<>(minutes);
  }

  public static void sort(List<Minute> minutes, MinuteSearchRequest request) {
    String sortKey =
        request == null || request.getSortKey() == null || request.getSortKey().isBlank()
            ? "date"
            : request.getSortKey().trim();
    boolean asc =
        request != null
            && request.getSortDir() != null
            && "asc".equalsIgnoreCase(request.getSortDir().trim());

    Comparator<Minute> comparator =
        switch (sortKey) {
          case "title" -> Comparator.comparing(
              m -> nullToEmpty(m.getTitle()), String.CASE_INSENSITIVE_ORDER);
          case "preparedBy" -> Comparator.comparing(
              m -> nullToEmpty(m.getPreparedBy()), String.CASE_INSENSITIVE_ORDER);
          default -> Comparator.comparing(m -> nullToEmpty(m.getDate()), String.CASE_INSENSITIVE_ORDER);
        };
    if (!asc) {
      comparator = comparator.reversed();
    }
    minutes.sort(comparator);
  }

  public static int page(MinuteSearchRequest request) {
    return request == null || request.getPage() == null ? 0 : request.getPage();
  }

  public static int size(MinuteSearchRequest request) {
    return request == null || request.getSize() == null ? 10 : request.getSize();
  }

  private static String normalize(String value) {
    return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private static boolean contains(String value, String query) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(query);
  }

  private static int compareDate(String left, String right) {
    if (left == null || left.isBlank()) {
      return -1;
    }
    return left.compareTo(right);
  }

  private static String nullToEmpty(String value) {
    return value == null ? "" : value;
  }
}
