package om.gov.moh.minutes.service;

import java.util.List;
import om.gov.moh.minutes.dto.MinuteDto;

public interface MinuteService {

  List<MinuteDto> findAll();

  MinuteDto save(MinuteDto dto);

  MinuteDto update(String id, MinuteDto dto);

  void delete(String id);
}
