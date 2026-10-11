import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50, //50 korisnika istovremeno vrsi rezervaciju
    duration: '30s'
};

export function setup() {
    const response = http.post(
        'http://localhost:5001/api/auth',
        JSON.stringify({
            email: 'igrac@test.com',
            password: 'igrac123'
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

    const response = http.post(
        'http://localhost:5001/api/rezervacije',
        JSON.stringify({
                terminId: 236,  // neki slobodan termin koji postoji
                glavniIgracId: 2,
                sportId: 1,
                minIgraca: 2,
                maxIgraca: 10
            }),
        { headers }
    );

    //201 je uspeh, 409 je ocekivano kada je termin vec rezervisan
    check(response, {
        'rezervacija uspesna ili vec postoji': (r) => r.status === 201 || r.status === 409,
        'response ispod 5000ms': (r) => r.timings.duration < 5000
    });
    if (response.status !== 201 && response.status !== 409) {
    console.log(`Neočekivani status: ${response.status} — ${response.body}`);
}
    sleep(1);
}