import java.sql.*;
public class tmp_login_check {
  public static void main(String[] args) throws Exception {
    Class.forName("org.postgresql.Driver");
    Connection c = DriverManager.getConnection("jdbc:postgresql://localhost:5432/shiptrack_db", "postgres", "@Theerthana8125");
    Statement s = c.createStatement();
    ResultSet rs = s.executeQuery("select id, username, email, role from users");
    while (rs.next()) {
      System.out.println(rs.getLong(1)+","+rs.getString(2)+","+rs.getString(3)+","+rs.getString(4));
    }
    c.close();
  }
}
