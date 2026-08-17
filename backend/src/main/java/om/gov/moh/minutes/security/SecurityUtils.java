package om.gov.moh.minutes.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

  private SecurityUtils() {}

  public static AuthUser requireCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser user)) {
      throw new AccessDeniedException("Authentication required");
    }
    return user;
  }
}
