import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 200, //200 korisnika se loguje istovremeno
    duration: '30s'
};

export default function() {
    const response = http.post(
        'http://localhost:5001/api/auth',
        JSON.stringify({
            email: 'admin@test.com',
            password: 'admin123'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(response, {
        'status je 200': (r) => r.status === 200, 
        'token postoji': (r) => JSON.parse(r.body).token !== undefined,
        'response ispod 8000ms': (r) => r.timings.duration < 8000
    });

    sleep(1);
}