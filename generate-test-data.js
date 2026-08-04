const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const boyNames = [
  'Luca', 'Noah', 'Leon', 'Liam', 'Elias', 'David', 'Samuel', 'Nico', 'Finn',
  'Julian', 'Matteo', 'Lukas', 'Tim', 'Jan', 'Fabian', 'Nils', 'Moritz', 'Ben',
  'Rafael', 'Jonas', 'Marco', 'Cedric', 'Yannick', 'Dominik', 'Adrian', 'Sandro',
  'Patrick', 'Florian', 'Marc', 'Kevin', 'Robin', 'Tobias', 'Manuel', 'Simon',
  'Andrin', 'Levin', 'Silvan', 'Remo', 'Yannik', 'Dario'
];

const girlNames = [
  'Mia', 'Elena', 'Laura', 'Anna', 'Lena', 'Sara', 'Emma', 'Lea', 'Nina',
  'Sophie', 'Alina', 'Julia', 'Chiara', 'Jana', 'Lisa', 'Nora', 'Lara', 'Elin',
  'Amelie', 'Ronja', 'Fiona', 'Hannah', 'Celine', 'Leonie', 'Livia', 'Milena',
  'Seraina', 'Annika', 'Noemi', 'Selina', 'Nadja', 'Valentina', 'Miriam', 'Rahel',
  'Flurina', 'Tamara', 'Corinne', 'Aline', 'Jasmin', 'Sina'
];

const lastNames = [
  'Mueller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider',
  'Meyer', 'Steiner', 'Fischer', 'Gerber', 'Brunner', 'Baumann', 'Frei',
  'Zimmermann', 'Moser', 'Widmer', 'Wyss', 'Graf', 'Roth', 'Suter',
  'Baumgartner', 'Hofer', 'Berger', 'Koch', 'Kunz', 'Leuenberger',
  'Studer', 'Schweizer', 'Aebischer', 'Burri', 'Egger', 'Hess',
  'Kaufmann', 'Lehmann', 'Luethi', 'Nussbaumer', 'Ott', 'Pfister', 'Stalder'
];

const belts = [
  'White', 'White-Yellow', 'Yellow', 'Yellow-Green', 'Green',
  'Green-Blue', 'Blue', 'Blue-Red', 'Red', 'Red-Black', 'Black'
];

// Realistic weight ranges by age (approximate kg)
const weightByAge = {
  6:  { min: 18, max: 26 },
  7:  { min: 20, max: 29 },
  8:  { min: 22, max: 33 },
  9:  { min: 24, max: 37 },
  10: { min: 26, max: 42 },
  11: { min: 28, max: 47 },
  12: { min: 31, max: 52 },
  13: { min: 34, max: 56 },
  14: { min: 37, max: 60 },
  15: { min: 40, max: 63 },
  16: { min: 43, max: 65 },
};

// Belt distribution weighted by age (younger = lower belts more likely)
function pickBelt(age) {
  const maxIndex = Math.min(Math.floor((age - 5) * 1.1), belts.length - 1);
  const idx = Math.floor(Math.random() * (maxIndex + 1));
  return belts[idx];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateParticipant(usedNames) {
  const isBoy = Math.random() < 0.5;
  const firstNames = isBoy ? boyNames : girlNames;

  let name;
  let attempts = 0;
  do {
    const first = firstNames[randInt(0, firstNames.length - 1)];
    const last = lastNames[randInt(0, lastNames.length - 1)];
    name = `${first} ${last}`;
    attempts++;
  } while (usedNames.has(name) && attempts < 100);
  usedNames.add(name);

  const age = randInt(6, 16);
  const year = 2026 - age;
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const { min, max } = weightByAge[age];
  const weight = (min + Math.random() * (max - min)).toFixed(1);

  const belt = pickBelt(age);

  return { Name: name, DOB: dob, Weight: parseFloat(weight), Belt: belt };
}

function generateFile(count, filename) {
  const usedNames = new Set();
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(generateParticipant(usedNames));
  }

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 22 }, // Name
    { wch: 12 }, // DOB
    { wch: 8 },  // Weight
    { wch: 14 }, // Belt
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participants');

  const outPath = path.join(__dirname, 'test-data', filename);
  XLSX.writeFile(wb, outPath);
  console.log(`Created: ${outPath} (${count} participants)`);
}

// Ensure output directory exists
const outDir = path.join(__dirname, 'test-data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

generateFile(10, 'test-10-participants.xlsx');
generateFile(20, 'test-20-participants.xlsx');
generateFile(35, 'test-35-participants.xlsx');
generateFile(50, 'test-50-participants.xlsx');

console.log('\nDone! All test files generated.');
