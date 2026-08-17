package om.gov.moh.minutes.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Run once to generate a BCrypt hash for the first admin password:
 *
 * <pre>
 * .\mvnw.cmd -q exec:java -Dexec.mainClass=om.gov.moh.minutes.util.PasswordHashGenerator -Dexec.args="YourPassword"
 * </pre>
 */
public final class PasswordHashGenerator {

  private PasswordHashGenerator() {}

  public static void main(String[] args) {
    String password = args.length > 0 ? args[0] : "Admin@123";
    String hash = new BCryptPasswordEncoder().encode(password);
    System.out.println("password=" + password);
    System.out.println("passwordHash=" + hash);
  }
}
