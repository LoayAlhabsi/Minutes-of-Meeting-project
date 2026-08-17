package om.gov.moh.minutes.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import om.gov.moh.minutes.entity.User;
import om.gov.moh.minutes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  @Autowired
  private JwtService jwtService;

  @Autowired
  private UserRepository userRepository;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header == null || !header.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = header.substring(7);
    try {
      AuthUser fromToken = jwtService.parseUser(token);
      Optional<User> stored = userRepository.findById(fromToken.id());
      if (stored.isEmpty() || !stored.get().isEnabled()) {
        filterChain.doFilter(request, response);
        return;
      }
      User user = stored.get();
      AuthUser principal =
          new AuthUser(
              user.getId(), user.getEmail(), user.getName(), user.getRole(), user.isEnabled());
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (Exception ignored) {
      SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
  }
}
