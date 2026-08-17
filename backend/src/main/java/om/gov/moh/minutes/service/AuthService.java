package om.gov.moh.minutes.service;

import om.gov.moh.minutes.dto.AuthResponse;
import om.gov.moh.minutes.dto.LoginRequest;
import om.gov.moh.minutes.dto.RegisterRequest;
import om.gov.moh.minutes.dto.SetupPasswordRequest;
import om.gov.moh.minutes.dto.UserDto;

public interface AuthService {
  AuthResponse register(RegisterRequest request);

  AuthResponse login(LoginRequest request);

  AuthResponse setupPassword(SetupPasswordRequest request);

  UserDto me();
}
