import bcrypt
h = b'$2a$10$j2FvC232mgVpfrdw1eTqeu/A8pLDnm3HCBFhnzoQWlc/do5sVxzQa'
for pw in [b'password123', b'password', b'admin123', b'Admin@123', b'admin', b'Admin@123!']:
    print(pw.decode(), bcrypt.checkpw(pw, h))
