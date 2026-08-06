package om.gov.moh.minutes.exception;

import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
    String message = e.getMessage();
    if ("Meeting minutes not found".equals(message)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", message));
    }
    return ResponseEntity.badRequest().body(Map.of("message", message));
  }

  @ExceptionHandler(InterruptedException.class)
  public ResponseEntity<Map<String, String>> handleInterrupted(InterruptedException e) {
    Thread.currentThread().interrupt();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", "Request interrupted"));
  }

  @ExceptionHandler(ExecutionException.class)
  public ResponseEntity<Map<String, String>> handleExecution(ExecutionException e) {
    String message = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", message));
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
    Throwable cause = e.getCause();
    if (cause instanceof InterruptedException) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Request interrupted"));
    }
    if (cause instanceof ExecutionException executionException) {
      String message =
          executionException.getCause() != null
              ? executionException.getCause().getMessage()
              : executionException.getMessage();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", message));
    }
    String message = e.getMessage() != null ? e.getMessage() : "Unexpected error";
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", message));
  }
}
