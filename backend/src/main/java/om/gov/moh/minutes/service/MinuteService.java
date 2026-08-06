package om.gov.moh.minutes.service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import om.gov.moh.minutes.dto.MinuteDto;

public interface MinuteService {

  List<MinuteDto> findAll() throws ExecutionException, InterruptedException;

  MinuteDto save(MinuteDto dto) throws ExecutionException, InterruptedException;

  MinuteDto update(String id, MinuteDto dto) throws ExecutionException, InterruptedException;

  void delete(String id) throws ExecutionException, InterruptedException;
}
