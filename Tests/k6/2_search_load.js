import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 100, //100 korisnika pretrazuje objekte i termine istovremeno
    duration: '30s'
};

// Login i uzmi token pre testa
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

    //pretraga objekata
    const objektiResponse = http.get(
        'http://localhost:5001/api/objekti?page=1&perPage=10',
        { headers }
    );

    check(objektiResponse, {
        'objekti status 200': (r) => r.status === 200,
        'objekti response ispod 5000ms': (r) => r.timings.duration < 5000
    });

    sleep(0.5);

    //pretraga termina
    const terminiResponse = http.get(
        'http://localhost:5001/api/termini?page=1&perPage=10',
        { headers }
    );

    check(terminiResponse, {
        'termini status 200': (r) => r.status === 200,
        'termini response ispod 5000ms': (r) => r.timings.duration < 5000
    });

    sleep(1);
}