package com.shiptrack;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "BACKEND_URL=http://localhost:8080",
        "FRONTEND_URL=http://localhost:5173"
})
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
