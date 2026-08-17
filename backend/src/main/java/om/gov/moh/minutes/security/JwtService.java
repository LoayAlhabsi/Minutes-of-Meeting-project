package om.gov.moh.minutes.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import om.gov.moh.minutes.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  public String generateToken(User user) {
    Date now = new Date();
    Date expiry = new Date(now.getTime() + expirationMs);
    return Jwts.builder()
        .subject(user.getId())
        .claim("email", user.getEmail())
        .claim("name", user.getName())
        .claim("role", user.getRole())
        .issuedAt(now)
        .expiration(expiry)
        .signWith(key)
        .compact();
  }

  public AuthUser parseUser(String token) {
    Claims claims =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    return new AuthUser(
        claims.getSubject(),
        stringClaim(claims, "email"),
        stringClaim(claims, "name"),
        stringClaim(claims, "role"),
        true);
  }

  private String stringClaim(Claims claims, String name) {
    Object value = claims.get(name);
    return value == null ? "" : String.valueOf(value);
  }
}
