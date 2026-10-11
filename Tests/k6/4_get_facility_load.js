import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50, //50 korisnika istovremeno pristupa objektu
    duration: '30s'
};

export function setup() {
    const response = http.post(
        'http://localhost:5001/api/auth',
        JSON.stringify({
            email: 'admin@test.com',
            password: 'admin123'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    return { token: JSON.parse(response.body).token };
}

export default function(data) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
    };

    const response = http.get(
        'http://localhost:5001/api/objekti/17',
        { headers }
    );

    check(response, {
        'status je 200': (r) => r.status === 200,
        'response ispod 5000ms': (r) => r.timings.duration < 5000
    });

    sleep(1);
}