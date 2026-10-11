import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    //100 korisnika na pocetnoj stranici + prvi put koriscenje
    stages: [
        { duration: '10s', target: 100 }, // ramp up do 100 korisnika
        { duration: '30s', target: 100 }, // drzi 100 korisnika
        { duration: '10s', target: 0 },   // ramp down
    ]
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

    // Simulacija pocetne stranice - pretraga objekata
    const response = http.get(
        'http://localhost:5001/api/objekti?page=1&perPage=10',
        { headers }
    );

    check(response, {
        'status je 200': (r) => r.status === 200,
        'response ispod 5000ms': (r) => r.timings.duration < 5000
    });

    sleep(1);
}