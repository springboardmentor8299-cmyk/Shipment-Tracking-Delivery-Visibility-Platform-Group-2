const http = require('http');

const request = (method, path, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    let body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Origin: 'http://localhost:5173',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseBody,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

(async () => {
  try {
    const health = await request('GET', '/api/auth/health');
    console.log('HEALTH', health);

    const email = `prod-user-${Date.now()}@example.com`;
    const phone = '9' + String(Date.now()).slice(-9);
    const register = await request('POST', '/api/auth/register', {
      firstName: 'Test',
      lastName: 'Sample',
      email: email,
      password: 'Test1234!',
      phone: phone,
    });
    console.log('REGISTER', register);

    if (register.status === 201) {
      const login = await request('POST', '/api/auth/login', {
        email: email,
        password: 'Test1234!',
      });
      console.log('LOGIN', login);

      if (login.status === 200) {
        const loginData = JSON.parse(login.body);
        const token = loginData.data.token;
        const shipments = await request('GET', '/api/shipments', null, {
          'Authorization': `Bearer ${token}`
        });
        console.log('GET SHIPMENTS (Authenticated)', shipments);
      }
    }
  } catch (error) {
    console.error('ERROR', error);
  }
})();
