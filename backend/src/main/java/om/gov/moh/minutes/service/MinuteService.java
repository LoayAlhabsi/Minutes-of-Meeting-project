package om.gov.moh.minutes.service;

import java.util.List;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.dto.PageResponse;

public interface MinuteService {

  List<MinuteDto> findAll();

  PageResponse<MinuteDto> search(MinuteSearchRequest request);

  MinuteDto save(MinuteDto dto);

  MinuteDto update(String id, MinuteDto dto);

  void delete(String id);
}
