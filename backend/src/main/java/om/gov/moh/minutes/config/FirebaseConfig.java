package om.gov.moh.minutes.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FirebaseConfig {

  @Value("${firebase.credentials:classpath:serviceAccountKey.json}")
  private Resource credentials;

  @Value("${firebase.project-id:minutes-of-meeting-df929}")
  private String projectId;

  @PostConstruct
  public void init() throws IOException {
    if (!FirebaseApp.getApps().isEmpty()) {
      return;
    }
    if (!credentials.exists()) {
      throw new IllegalStateException(
          "Missing Firebase service account file. Download it from Firebase Console → Project settings → Service accounts → Generate new private key, then save as backend/src/main/resources/serviceAccountKey.json");
    }
    try (InputStream stream = credentials.getInputStream()) {
      FirebaseOptions options =
          FirebaseOptions.builder()
              .setCredentials(GoogleCredentials.fromStream(stream))
              .setProjectId(projectId)
              .build();
      FirebaseApp.initializeApp(options);
    }
  }

  @Bean
  public com.google.cloud.firestore.Firestore firestore() {
    return FirestoreClient.getFirestore();
  }

  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
      }
    };
  }
}
