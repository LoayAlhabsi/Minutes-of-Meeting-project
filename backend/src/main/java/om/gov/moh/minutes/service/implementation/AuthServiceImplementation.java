package om.gov.moh.minutes.service.implementation;

import java.time.Instant;
import java.util.concurrent.ExecutionException;
import om.gov.moh.minutes.dto.AuthResponse;
import om.gov.moh.minutes.dto.LoginRequest;
import om.gov.moh.minutes.dto.RegisterRequest;
import om.gov.moh.minutes.dto.SetupPasswordRequest;
import om.gov.moh.minutes.dto.UserDto;
import om.gov.moh.minutes.entity.User;
import om.gov.moh.minutes.repository.UserRepository;
import om.gov.moh.minutes.security.JwtService;
import om.gov.moh.minutes.security.SecurityUtils;
import om.gov.moh.minutes.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImplementation implements AuthService {

  public static final String PASSWORD_SETUP_REQUIRED = "PASSWORD_SETUP_REQUIRED";

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JwtService jwtService;

  @Override
  public AuthResponse register(RegisterRequest request) {
    validateRegister(request);
    try {
      String email = request.getEmail().trim().toLowerCase();
      if (userRepository.findByEmail(email).isPresent()) {
        throw new IllegalArgumentException("Email is already registered");
      }
      User user = new User();
      user.setName(request.getName().trim());
      user.setEmail(email);
      user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
      user.setRole("U");
      user.setEnabled(true);
      user.setMustSetPassword(false);
      user.setCreatedAt(Instant.now().toString());
      User saved = userRepository.save(user);
      return toAuthResponse(saved);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public UserDto me() {
    try {
      User user =
          userRepository
              .findById(SecurityUtils.requireCurrentUser().id())
              .orElseThrow(() -> new IllegalArgumentException("User not found"));
      if (!user.isEnabled()) {
        throw new IllegalArgumentException("Account is disabled");
      }
      return toDto(user);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public AuthResponse login(LoginRequest request) {
    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }
    try {
      User user =
          userRepository
              .findByEmail(request.getEmail().trim().toLowerCase())
              .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
      if (!user.isEnabled()) {
        throw new IllegalArgumentException("Account is disabled");
      }
      if (user.isMustSetPassword()
          || user.getPasswordHash() == null
          || user.getPasswordHash().isBlank()) {
        throw new IllegalArgumentException(PASSWORD_SETUP_REQUIRED);
      }
      if (request.getPassword() == null || request.getPassword().isBlank()) {
        throw new IllegalArgumentException("Password is required");
      }
      if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        throw new BadCredentialsException("Invalid email or password");
      }
      return toAuthResponse(user);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  @Override
  public AuthResponse setupPassword(SetupPasswordRequest request) {
    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }
    if (request.getPassword() == null || request.getPassword().length() < 6) {
      throw new IllegalArgumentException("Password must be at least 6 characters");
    }
    try {
      User user =
          userRepository
              .findByEmail(request.getEmail().trim().toLowerCase())
              .orElseThrow(() -> new IllegalArgumentException("User not found"));
      if (!user.isEnabled()) {
        throw new IllegalArgumentException("Account is disabled");
      }
      if (!user.isMustSetPassword()
          && user.getPasswordHash() != null
          && !user.getPasswordHash().isBlank()) {
        throw new IllegalArgumentException("Password is already set. Please login.");
      }
      user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
      user.setMustSetPassword(false);
      User saved = userRepository.update(user);
      return toAuthResponse(saved);
    } catch (ExecutionException | InterruptedException e) {
      throw wrap(e);
    }
  }

  private void validateRegister(RegisterRequest request) {
    if (request.getName() == null || request.getName().isBlank()) {
      throw new IllegalArgumentException("Name is required");
    }
    String name = request.getName().trim();
    if (!name.matches("^[\\p{L} ]+$")) {
      throw new IllegalArgumentException("Name must contain letters only");
    }
    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }
    if (request.getPassword() == null || request.getPassword().length() < 6) {
      throw new IllegalArgumentException("Password must be at least 6 characters");
    }
  }

  private AuthResponse toAuthResponse(User user) {
    return new AuthResponse(jwtService.generateToken(user), toDto(user));
  }

  private UserDto toDto(User user) {
    return new UserDto(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.isEnabled(),
        user.isMustSetPassword(),
        user.getCreatedAt());
  }

  private RuntimeException wrap(Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    }
    return new RuntimeException(e);
  }
}
