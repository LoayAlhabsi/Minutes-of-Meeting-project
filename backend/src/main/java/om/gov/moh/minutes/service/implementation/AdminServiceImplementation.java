package om.gov.moh.minutes.service.implementation;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import om.gov.moh.minutes.dto.AdminStatsDto;
import om.gov.moh.minutes.dto.AttendeeDto;
import om.gov.moh.minutes.dto.CreateUserRequest;
import om.gov.moh.minutes.dto.DecisionDto;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.dto.PageResponse;
import om.gov.moh.minutes.dto.UserDto;
import om.gov.moh.minutes.dto.UserSearchRequest;
import om.gov.moh.minutes.entity.Minute;
import om.gov.moh.minutes.entity.User;
import om.gov.moh.minutes.repository.MinuteRepository;
import om.gov.moh.minutes.repository.UserRepository;
import om.gov.moh.minutes.security.AuthUser;
import om.gov.moh.minutes.security.SecurityUtils;
import om.gov.moh.minutes.service.AdminService;
import om.gov.moh.minutes.service.MinuteSearchSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImplementation implements AdminService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private MinuteRepository minuteRepository;

  @Override
  public List<UserDto> listUsers() {
    try {
      return userRepository.findAll().stream().map(this::toUserDto).collect(Collectors.toList());
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public PageResponse<UserDto> searchUsers(UserSearchRequest request) {
    UserSearchRequest safe = request == null ? new UserSearchRequest() : request;
    try {
      String query =
          safe.getQuery() == null ? "" : safe.getQuery().trim().toLowerCase(Locale.ROOT);
      String roleFilter =
          safe.getRole() == null ? "all" : safe.getRole().trim().toUpperCase(Locale.ROOT);
      String statusFilter =
          safe.getStatus() == null
              ? "all"
              : safe.getStatus().trim().toLowerCase(Locale.ROOT);

      List<User> filtered =
          userRepository.findAll().stream()
              .filter(
                  u ->
                      query.isEmpty()
                          || containsIgnoreCase(u.getName(), query)
                          || containsIgnoreCase(u.getEmail(), query))
              .filter(
                  u ->
                      "ALL".equals(roleFilter)
                          || roleFilter.isEmpty()
                          || roleFilter.equalsIgnoreCase(
                              u.getRole() == null ? "" : u.getRole()))
              .filter(u -> matchesUserStatus(u, statusFilter))
              .collect(Collectors.toCollection(ArrayList::new));

      sortUsers(filtered, safe);

      List<UserDto> dtos =
          filtered.stream().map(this::toUserDto).collect(Collectors.toList());
      int page = safe.getPage() == null ? 0 : safe.getPage();
      int size = safe.getSize() == null ? 10 : safe.getSize();
      return PageResponse.of(dtos, page, size);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  private boolean matchesUserStatus(User user, String statusFilter) {
    if (statusFilter == null || statusFilter.isBlank() || "all".equals(statusFilter)) {
      return true;
    }
    return switch (statusFilter) {
      case "active" -> user.isEnabled();
      case "disabled" -> !user.isEnabled();
      default -> true;
    };
  }

  private void sortUsers(List<User> users, UserSearchRequest request) {
    String sortKey =
        request.getSortKey() == null || request.getSortKey().isBlank()
            ? "createdAt"
            : request.getSortKey().trim();
    boolean asc =
        request.getSortDir() != null && "asc".equalsIgnoreCase(request.getSortDir().trim());

    Comparator<User> comparator =
        switch (sortKey) {
          case "name" -> Comparator.comparing(
              u -> nullToEmpty(u.getName()), String.CASE_INSENSITIVE_ORDER);
          case "email" -> Comparator.comparing(
              u -> nullToEmpty(u.getEmail()), String.CASE_INSENSITIVE_ORDER);
          case "role" -> Comparator.comparing(
              u -> nullToEmpty(u.getRole()), String.CASE_INSENSITIVE_ORDER);
          default -> Comparator.comparing(
              u -> nullToEmpty(u.getCreatedAt()), String.CASE_INSENSITIVE_ORDER);
        };
    if (!asc) {
      comparator = comparator.reversed();
    }
    users.sort(comparator);
  }

  private boolean containsIgnoreCase(String value, String query) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(query);
  }

  private String nullToEmpty(String value) {
    return value == null ? "" : value;
  }

  @Override
  public UserDto createUser(CreateUserRequest request) {
    if (request.getName() == null || request.getName().isBlank()) {
      throw new IllegalArgumentException("Name is required");
    }
    String name = request.getName().trim();
    if (!name.matches("^[\\p{L} ]+$")) {
      throw new IllegalArgumentException("Name must contain letters only");
    }
    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }
    String role =
        request.getRole() == null ? "U" : request.getRole().trim().toUpperCase(Locale.ROOT);
    if (!"U".equals(role) && !"A".equals(role)) {
      throw new IllegalArgumentException("Role must be U or A");
    }
    try {
      String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
      if (userRepository.findByEmail(email).isPresent()) {
        throw new IllegalArgumentException("Email is already registered");
      }
      User user = new User();
      user.setName(name);
      user.setEmail(email);
      user.setPasswordHash("");
      user.setRole(role);
      user.setEnabled(true);
      user.setMustSetPassword(true);
      user.setCreatedAt(Instant.now().toString());
      return toUserDto(userRepository.save(user));
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public UserDto updateRole(String userId, String role) {
    String normalized = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
    if (!"U".equals(normalized) && !"A".equals(normalized)) {
      throw new IllegalArgumentException("Role must be U or A");
    }
    try {
      AuthUser current = SecurityUtils.requireCurrentUser();
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found"));
      if (user.getId().equals(current.id()) && "U".equals(normalized)) {
        throw new IllegalArgumentException("You cannot demote your own admin account");
      }
      user.setRole(normalized);
      return toUserDto(userRepository.update(user));
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public UserDto updateEnabled(String userId, boolean enabled) {
    try {
      AuthUser current = SecurityUtils.requireCurrentUser();
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found"));
      if (user.getId().equals(current.id()) && !enabled) {
        throw new IllegalArgumentException("You cannot disable your own account");
      }
      user.setEnabled(enabled);
      return toUserDto(userRepository.update(user));
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public AdminStatsDto stats() {
    try {
      List<Minute> minutes = minuteRepository.findAll();
      long users = userRepository.count();
      YearMonth thisMonth = YearMonth.now();
      long meetingsThisMonth =
          minutes.stream()
              .filter(
                  m -> {
                    try {
                      return m.getDate() != null
                          && !m.getDate().isBlank()
                          && YearMonth.from(LocalDate.parse(m.getDate())).equals(thisMonth);
                    } catch (Exception e) {
                      return false;
                    }
                  })
              .count();
      return new AdminStatsDto(minutes.size(), users, meetingsThisMonth);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public List<MinuteDto> searchMinutes(
      String title, String user, String dateFrom, String dateTo) {
    MinuteSearchRequest request = new MinuteSearchRequest();
    request.setTitle(title);
    request.setPerson(user);
    request.setDateFrom(dateFrom);
    request.setDateTo(dateTo);
    request.setPage(0);
    request.setSize(10_000);
    return searchMinutes(request).getContent();
  }

  @Override
  public PageResponse<MinuteDto> searchMinutes(MinuteSearchRequest request) {
    AuthUser current = SecurityUtils.requireCurrentUser();
    MinuteSearchRequest safe = request == null ? new MinuteSearchRequest() : request;
    try {
      List<Minute> basicFiltered =
          MinuteSearchSupport.filterBasic(minuteRepository.findAll(), safe);
      Set<String> userCreatorIds =
          userRepository.findAll().stream()
              .filter(u -> "U".equalsIgnoreCase(u.getRole()))
              .map(User::getId)
              .collect(Collectors.toSet());

      long allCount = basicFiltered.size();
      long mineCount =
          basicFiltered.stream()
              .filter(m -> current.id().equals(m.getCreatedByUserId()))
              .count();
      long userCount =
          basicFiltered.stream()
              .filter(
                  m ->
                      m.getCreatedByUserId() != null
                          && userCreatorIds.contains(m.getCreatedByUserId()))
              .count();

      List<Minute> filtered =
          MinuteSearchSupport.applyCreatorFilter(
              basicFiltered, safe.getCreatorFilter(), current.id(), userCreatorIds);
      MinuteSearchSupport.sort(filtered, safe);

      List<MinuteDto> dtos =
          filtered.stream().map(this::toMinuteDto).collect(Collectors.toList());
      PageResponse<MinuteDto> page =
          PageResponse.of(
              dtos, MinuteSearchSupport.page(safe), MinuteSearchSupport.size(safe));
      page.setAllCount(allCount);
      page.setMineCount(mineCount);
      page.setUserCount(userCount);
      return page;
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  private UserDto toUserDto(User user) {
    return new UserDto(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.isEnabled(),
        user.isMustSetPassword(),
        user.getCreatedAt());
  }

  private MinuteDto toMinuteDto(Minute minute) {
    MinuteDto dto = new MinuteDto();
    dto.setId(minute.getId());
    dto.setTitle(minute.getTitle());
    dto.setLocation(minute.getLocation());
    dto.setDate(minute.getDate());
    dto.setDiscussion(minute.getDiscussion());
    dto.setPreparedBy(minute.getPreparedBy());
    dto.setApprovedBy(minute.getApprovedBy());
    dto.setCreatedByUserId(minute.getCreatedByUserId());
    dto.setCreatedByName(minute.getCreatedByName());
    dto.setCreatedByEmail(minute.getCreatedByEmail());
    String lang = minute.getLanguage();
    dto.setLanguage(
        lang != null && "ar".equalsIgnoreCase(lang.trim()) ? "ar" : "en");
    dto.setAttendees(
        minute.getAttendees() == null
            ? List.of()
            : minute.getAttendees().stream()
                .map(a -> new AttendeeDto(a.getId(), a.getName(), a.getDesignation()))
                .collect(Collectors.toList()));
    dto.setDecisions(
        minute.getDecisions() == null
            ? List.of()
            : minute.getDecisions().stream()
                .map(d -> new DecisionDto(d.getId(), d.getText()))
                .collect(Collectors.toList()));
    return dto;
  }

  private RuntimeException wrap(Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    }
    return new RuntimeException(e);
  }
}
