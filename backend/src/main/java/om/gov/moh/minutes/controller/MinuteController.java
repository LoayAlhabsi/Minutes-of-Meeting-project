package om.gov.moh.minutes.controller;

import java.util.List;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.service.MinuteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/minutes")
public class MinuteController {

  @Autowired
  private MinuteService minuteService;

  @GetMapping
  public List<MinuteDto> get() {
    return minuteService.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public MinuteDto post(@RequestBody MinuteDto minuteDto) {
    return minuteService.save(minuteDto);
  }

  @PutMapping("/{id}")
  public MinuteDto put(@PathVariable String id, @RequestBody MinuteDto minuteDto) {
    return minuteService.update(id, minuteDto);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String id) {
    minuteService.delete(id);
  }
}
