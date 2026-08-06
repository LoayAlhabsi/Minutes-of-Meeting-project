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
import om.gov.moh.minutes.entity.Attendee;
import om.gov.moh.minutes.entity.Decision;
import om.gov.moh.minutes.entity.Minute;
import om.gov.moh.minutes.repository.MinuteRepository;
import om.gov.moh.minutes.service.MinuteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MinuteServiceImplementation implements MinuteService {

  @Autowired
  private MinuteRepository minuteRepository;

  @Override
  public List<MinuteDto> findAll() {
    try {
      return minuteRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public MinuteDto save(MinuteDto dto) {
    try {
      validateMeetingDate(dto.getDate(), true);
      Minute saved = minuteRepository.save(toEntity(dto));
      return toDto(saved);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public MinuteDto update(String id, MinuteDto dto) {
    try {
      validateMeetingDate(dto.getDate(), false);
      Minute updated = minuteRepository.update(id, toEntity(dto));
      return toDto(updated);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public void delete(String id) {
    try {
      minuteRepository.deleteById(id);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  private RuntimeException wrap(Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    }
    return new RuntimeException(e);
  }

  private void validateMeetingDate(String date, boolean create) {
    if (date == null || date.isBlank()) {
      return;
    }
    try {
      LocalDate meetingDate = LocalDate.parse(date);
      if (create && meetingDate.isBefore(LocalDate.now())) {
        throw new IllegalArgumentException("Meeting date cannot be in the past");
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
    dto.setAttendees(toAttendeeDtos(minute.getAttendees()));
    dto.setDecisions(toDecisionDtos(minute.getDecisions()));
    return dto;
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
