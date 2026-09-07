import type { Court, DemoState, Player } from '../models/sportbuddy.model';
export const areas = [
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
  { name: 'Petaling Jaya', lat: 3.1073, lng: 101.6067 },
  { name: 'Subang Jaya', lat: 3.0738, lng: 101.5183 },
];
export const courts: Court[] = [
  { id: 'rally', name: 'Rally Sports Centre', area: 'Kuala Lumpur', address: 'Example venue · Bangsar, Kuala Lumpur', lat: 3.129, lng: 101.675, sport: 'Badminton', indoor: true, price: 25, facilities: ['Parking', 'Showers', 'Equipment rental', 'Changing rooms'], hours: '8:00 AM – 11:00 PM', image: 'badminton' },
  { id: 'baseline', name: 'Baseline Basketball Park', area: 'Kuala Lumpur', address: 'Example venue · Mont Kiara, Kuala Lumpur', lat: 3.169, lng: 101.652, sport: 'Basketball', indoor: false, price: 0, facilities: ['Parking', 'Floodlights', 'Water station'], hours: '7:00 AM – 10:00 PM', image: 'basketball' },
  { id: 'greenline', name: 'Greenline Tennis Club', area: 'Petaling Jaya', address: 'Example venue · Section 14, Petaling Jaya', lat: 3.109, lng: 101.635, sport: 'Tennis', indoor: false, price: 35, facilities: ['Parking', 'Showers', 'Floodlights', 'Equipment rental'], hours: '7:00 AM – 11:00 PM', image: 'tennis' },
  { id: 'five', name: 'The Five Futsal', area: 'Subang Jaya', address: 'Example venue · SS15, Subang Jaya', lat: 3.079, lng: 101.586, sport: 'Futsal', indoor: true, price: 100, facilities: ['Parking', 'Changing rooms', 'Cafe'], hours: '9:00 AM – 12:00 AM', image: 'futsal' },
  { id: 'pickle', name: 'Pickle Social Club', area: 'Petaling Jaya', address: 'Example venue · Damansara, Petaling Jaya', lat: 3.142, lng: 101.616, sport: 'Pickleball', indoor: false, price: 30, facilities: ['Parking', 'Equipment rental', 'Cafe'], hours: '8:00 AM – 10:00 PM', image: 'pickleball' },
  { id: 'shuttle', name: 'Shuttle House', area: 'Subang Jaya', address: 'Example venue · USJ, Subang Jaya', lat: 3.054, lng: 101.582, sport: 'Badminton', indoor: true, price: 22, facilities: ['Parking', 'Showers', 'Water station'], hours: '8:00 AM – 11:00 PM', image: 'badminton' },
];
export const players: Player[] = [
  { id: 'you', name: 'Alex Tan', initials: 'AT', area: 'Kuala Lumpur', bio: 'Always up for a friendly game and meeting new people. See you on the court!', sports: ['Badminton', 'Tennis'], level: 'Intermediate', color: '#dce7c2' },
  { id: 'maya', name: 'Maya Chen', initials: 'MC', area: 'Kuala Lumpur', bio: 'Good rallies, great company. Let’s make after-work badminton a habit.', sports: ['Badminton', 'Pickleball'], level: 'Intermediate', color: '#f0d5bf' },
  { id: 'daniel', name: 'Daniel Lim', initials: 'DL', area: 'Kuala Lumpur', bio: 'Weekend hoops and a coffee afterwards. All skill levels welcome.', sports: ['Basketball', 'Futsal'], level: 'All levels', color: '#d0ddea' },
  { id: 'aisha', name: 'Aisha Rahman', initials: 'AR', area: 'Petaling Jaya', bio: 'Learning tennis, one rally at a time. Looking for a regular doubles crew.', sports: ['Tennis', 'Pickleball'], level: 'Beginner', color: '#e6d7ee' },
  { id: 'ryan', name: 'Ryan Wong', initials: 'RW', area: 'Subang Jaya', bio: 'Futsal on Fridays. A little competition, a lot of laughs.', sports: ['Futsal', 'Badminton'], level: 'Intermediate', color: '#f1dfa9' },
];
export function seedState(): DemoState {
  const start = (days: number, hour: number) => {
    // Fixed venue time zone, independent of the browser's time zone.
    const now = new Date(Date.now() + days * 86400000);
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return new Date(`${date}T${String(hour).padStart(2, '0')}:00:00+08:00`).toISOString();
  };
  return { version: 1, viewerId: 'you', players, connections: [{ from: 'aisha', to: 'you', status: 'pending' }], saved: {}, games: [
    { id: 'after-work', title: 'After-work shuttle session', courtId: 'rally', hostId: 'maya', sport: 'Badminton', start: start(1, 19), duration: 90, capacity: 4, playerIds: ['maya', 'ryan'], level: 'Intermediate', cost: 15, description: 'Clock out, lace up, and come rally. Friendly doubles with a rotating partner. Bring your racket; we will bring the shuttlecocks. Please arrive ten minutes early.', status: 'open' },
    { id: 'sunset', title: 'Sunset hoops & good company', courtId: 'baseline', hostId: 'daniel', sport: 'Basketball', start: start(1, 18), duration: 120, capacity: 10, playerIds: ['daniel', 'ryan', 'maya'], level: 'All levels', cost: 0, description: 'A relaxed pickup game for anyone who loves basketball. No tryouts, no pressure. Bring water and a light and dark shirt so we can split teams.', status: 'open' },
    { id: 'first-serve', title: 'Your next doubles crew', courtId: 'greenline', hostId: 'aisha', sport: 'Tennis', start: start(2, 9), duration: 90, capacity: 4, playerIds: ['aisha', 'maya'], level: 'Beginner', cost: 20, description: 'A welcoming doubles session to practice the basics. Beginners encouraged. We will warm up together and keep the score casual.', status: 'open' },
    { id: 'friday-five', title: 'Friday five-a-side', courtId: 'five', hostId: 'ryan', sport: 'Futsal', start: start(3, 20), duration: 60, capacity: 10, playerIds: ['ryan', 'daniel'], level: 'Intermediate', cost: 12, description: 'End the week with a friendly five-a-side. Bring indoor shoes and plenty of energy.', status: 'open' },
    { id: 'pickle-morning', title: 'Pickleball & a little sunshine', courtId: 'pickle', hostId: 'maya', sport: 'Pickleball', start: start(4, 8), duration: 90, capacity: 4, playerIds: ['maya', 'aisha'], level: 'All levels', cost: 15, description: 'New to pickleball? Come along. We will explain the rules and rotate partners so everyone gets to play.', status: 'open' },
  ] };
}
