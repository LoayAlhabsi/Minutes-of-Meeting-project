package om.gov.moh.minutes.service.implementation;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import om.gov.moh.minutes.dto.AttendeeDto;
import om.gov.moh.minutes.dto.DecisionDto;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.dto.PageResponse;
import om.gov.moh.minutes.entity.Attendee;
import om.gov.moh.minutes.entity.Decision;
import om.gov.moh.minutes.entity.Minute;
import om.gov.moh.minutes.repository.MinuteRepository;
import om.gov.moh.minutes.security.AuthUser;
import om.gov.moh.minutes.security.SecurityUtils;
import om.gov.moh.minutes.service.MinuteSearchSupport;
import om.gov.moh.minutes.service.MinuteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class MinuteServiceImplementation implements MinuteService {

  @Autowired
  private MinuteRepository minuteRepository;

  @Override
  public List<MinuteDto> findAll() {
    AuthUser current = SecurityUtils.requireCurrentUser();
    try {
      List<Minute> minutes =
          current.isAdmin()
              ? minuteRepository.findAll()
              : minuteRepository.findByCreatedByUserId(current.id());
      return minutes.stream().map(this::toDto).collect(Collectors.toList());
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public PageResponse<MinuteDto> search(MinuteSearchRequest request) {
    AuthUser current = SecurityUtils.requireCurrentUser();
    MinuteSearchRequest safe = request == null ? new MinuteSearchRequest() : request;
    try {
      List<Minute> scoped =
          current.isAdmin()
              ? minuteRepository.findAll()
              : minuteRepository.findByCreatedByUserId(current.id());
      List<Minute> filtered = MinuteSearchSupport.filterBasic(scoped, safe);
      MinuteSearchSupport.sort(filtered, safe);
      List<MinuteDto> dtos = filtered.stream().map(this::toDto).collect(Collectors.toList());
      return PageResponse.of(
          dtos, MinuteSearchSupport.page(safe), MinuteSearchSupport.size(safe));
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public MinuteDto save(MinuteDto dto) {
    AuthUser current = SecurityUtils.requireCurrentUser();
    try {
      validateMeetingDate(dto.getDate());
      Minute entity = toEntity(dto);
      entity.setCreatedByUserId(current.id());
      entity.setCreatedByName(current.name());
      entity.setCreatedByEmail(current.email());
      entity.setPreparedBy(current.name());
      Minute saved = minuteRepository.save(entity);
      return toDto(saved);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public MinuteDto update(String id, MinuteDto dto) {
    AuthUser current = SecurityUtils.requireCurrentUser();
    try {
      Minute existing = minuteRepository.findById(id);
      assertCanModify(current, existing);
      validateMeetingDate(dto.getDate());
      Minute entity = toEntity(dto);
      entity.setCreatedByUserId(existing.getCreatedByUserId());
      entity.setCreatedByName(existing.getCreatedByName());
      entity.setCreatedByEmail(existing.getCreatedByEmail());
      entity.setPreparedBy(existing.getPreparedBy());
      Minute updated = minuteRepository.update(id, entity);
      return toDto(updated);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public void delete(String id) {
    AuthUser current = SecurityUtils.requireCurrentUser();
    try {
      Minute existing = minuteRepository.findById(id);
      assertCanModify(current, existing);
      minuteRepository.deleteById(id);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  private void assertCanModify(AuthUser current, Minute minute) {
    if (minute.getCreatedByUserId() == null
        || !minute.getCreatedByUserId().equals(current.id())) {
      throw new AccessDeniedException("You can only modify your own minutes");
    }
  }

  private RuntimeException wrap(Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    }
    return new RuntimeException(e);
  }

  private void validateMeetingDate(String date) {
    if (date == null || date.isBlank()) {
      return;
    }
    try {
      LocalDate meetingDate = LocalDate.parse(date);
      if (meetingDate.isAfter(LocalDate.now())) {
        throw new IllegalArgumentException("Meeting date cannot be in the future");
      }
    } catch (DateTimeParseException e) {
      throw new IllegalArgumentException("Invalid meeting date");
    }
  }

  private Minute toEntity(MinuteDto dto) {
    Minute minute = new Minute();
    minute.setId(dto.getId());
    minute.setTitle(dto.getTitle());
    minute.setLocation(dto.getLocation());
    minute.setDate(dto.getDate());
    minute.setDiscussion(dto.getDiscussion());
    minute.setPreparedBy(dto.getPreparedBy());
    minute.setApprovedBy(dto.getApprovedBy());
    minute.setCreatedByUserId(dto.getCreatedByUserId());
    minute.setCreatedByName(dto.getCreatedByName());
    minute.setCreatedByEmail(dto.getCreatedByEmail());
    minute.setLanguage(normalizeLanguage(dto.getLanguage()));
    minute.setAttendees(toAttendeeEntities(dto.getAttendees()));
    minute.setDecisions(toDecisionEntities(dto.getDecisions()));
    return minute;
  }

  private MinuteDto toDto(Minute minute) {
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
    dto.setLanguage(normalizeLanguage(minute.getLanguage()));
    dto.setAttendees(toAttendeeDtos(minute.getAttendees()));
    dto.setDecisions(toDecisionDtos(minute.getDecisions()));
    return dto;
  }

  private String normalizeLanguage(String language) {
    if (language == null || language.isBlank()) {
      return "en";
    }
    return "ar".equalsIgnoreCase(language.trim()) ? "ar" : "en";
  }

  private List<Attendee> toAttendeeEntities(List<AttendeeDto> attendees) {
    List<Attendee> list = new ArrayList<>();
    if (attendees == null) {
      return list;
    }
    for (AttendeeDto dto : attendees) {
      list.add(new Attendee(dto.getId(), dto.getName(), dto.getDesignation()));
    }
    return list;
  }

  private List<Decision> toDecisionEntities(List<DecisionDto> decisions) {
    List<Decision> list = new ArrayList<>();
    if (decisions == null) {
      return list;
    }
    for (DecisionDto dto : decisions) {
      list.add(new Decision(dto.getId(), dto.getText()));
    }
    return list;
  }

  private List<AttendeeDto> toAttendeeDtos(List<Attendee> attendees) {
    List<AttendeeDto> list = new ArrayList<>();
    if (attendees == null) {
      return list;
    }
    for (Attendee attendee : attendees) {
      list.add(new AttendeeDto(attendee.getId(), attendee.getName(), attendee.getDesignation()));
    }
    return list;
  }

  private List<DecisionDto> toDecisionDtos(List<Decision> decisions) {
    List<DecisionDto> list = new ArrayList<>();
    if (decisions == null) {
      return list;
    }
    for (Decision decision : decisions) {
      list.add(new DecisionDto(decision.getId(), decision.getText()));
    }
    return list;
  }
}
