package om.gov.moh.minutes.controller;

import om.gov.moh.minutes.dto.AuthResponse;
import om.gov.moh.minutes.dto.LoginRequest;
import om.gov.moh.minutes.dto.RegisterRequest;
import om.gov.moh.minutes.dto.SetupPasswordRequest;
import om.gov.moh.minutes.dto.UserDto;
import om.gov.moh.minutes.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired
  private AuthService authService;

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/setup-password")
  public AuthResponse setupPassword(@RequestBody SetupPasswordRequest request) {
    return authService.setupPassword(request);
  }

  @GetMapping("/me")
  public UserDto me() {
    return authService.me();
  }
}
