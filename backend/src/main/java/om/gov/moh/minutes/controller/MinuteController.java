package om.gov.moh.minutes.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.service.MinuteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/minutes")
public class MinuteController {

  @Autowired
  private MinuteService minuteService;

  @GetMapping
  public ResponseEntity<?> list() {
    try {
      List<MinuteDto> minutes = minuteService.findAll();
      return ResponseEntity.ok(minutes);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Request interrupted"));
    } catch (ExecutionException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
    }
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody MinuteDto minuteDto) {
    try {
      MinuteDto saved = minuteService.save(minuteDto);
      return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    } catch (IllegalArgumentException e) {
      return badRequestOrNotFound(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Request interrupted"));
    } catch (ExecutionException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable String id, @RequestBody MinuteDto minuteDto) {
    try {
      MinuteDto updated = minuteService.update(id, minuteDto);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      return badRequestOrNotFound(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Request interrupted"));
    } catch (ExecutionException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable String id) {
    try {
      minuteService.delete(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Request interrupted"));
    } catch (ExecutionException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
    }
  }

  private ResponseEntity<?> badRequestOrNotFound(IllegalArgumentException e) {
    String message = e.getMessage();
    if ("Meeting minutes not found".equals(message)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", message));
    }
    return ResponseEntity.badRequest().body(Map.of("message", message));
  }
}
