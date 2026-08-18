import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class CheckHash {
  public static void main(String[] args) {
    BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    String hash = "/A8pLDnm3HCBFhnzoQWlc/do5sVxzQa";
    for (String pw : new String[]{"password123", "password", "admin123", "Admin@123", "admin", "Admin@123!"}) {
      System.out.println(pw + " => " + enc.matches(pw, hash));
    }
  }
}
