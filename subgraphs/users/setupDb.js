const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// SQL statements to create tables
const createTables = `
  CREATE TABLE IF NOT EXISTS Teams (
    id INTEGER PRIMARY KEY,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    city TEXT,
    country TEXT,
    countryCode TEXT,
    timezone TEXT,
    teamId INTEGER,
    FOREIGN KEY (teamId) REFERENCES Teams(id)
  );
`;

// Sample data to seed the tables
const seedData = `
  INSERT INTO Teams (id, name) VALUES 
    (1, 'Engineering Eagles'),
    (2, 'Design Dolphins'),
    (3, 'Creative Cheetahs'),
    (4, 'Pixel Panthers'),
    (5, 'Data Ducks'),
    (6, 'Frontend Falcons'),
    (7, 'Backend Bears'),
    (8, 'API Antelopes'),
    (9, 'Bug Bison'),
    (10, 'Code Cougars'),
    (11, 'Tech Tigers'),
    (12, 'Cloud Crows'),
    (13, 'Feature Foxes'),
    (14, 'Merge Moles'),
    (15, 'Script Snakes'),
    (16, 'Deploying Deer'),
    (17, 'App Alligators'),
    (18, 'Pixel Penguins'),
    (19, 'Database Dogs'),
    (20, 'System Squirrels'),
    (21, 'User Unicorns'),
    (22, 'Backend Bats'),
    (23, 'Design Deer'),
    (24, 'Component Coyotes'),
    (25, 'Function Falcons'),
    (26, 'App Armadillos'),
    (27, 'Push Pandas'),
    (28, 'Git Gorillas'),
    (29, 'Database Doves'),
    (30, 'Frontend Frogs'),
    (31, 'App Aardvarks'),
    (32, 'Code Crabs'),
    (33, 'Team Turtles'),
    (34, 'Query Quokkas'),
    (35, 'Data Dragons'),
    (36, 'Deploying Ducks'),
    (37, 'Feature Ferrets'),
    (38, 'Tech Tarantulas'),
    (39, 'Pixel Parrots'),
    (40, 'Frontend Falcons'),
    (41, 'Backend Buffaloes'),
    (42, 'UI Urchins'),
    (43, 'UX Urials'),
    (44, 'Deployment Dodos'),
    (45, 'Function Fennecs'),
    (46, 'System Sea Lions'),
    (47, 'Code Crocodiles'),
    (48, 'Debugging Dolphins'),
    (49, 'Merge Manatees'),
    (50, 'Script Sparrows'),
    (51, 'API Aardvarks'),
    (52, 'Tech Tortoises'),
    (53, 'Pixel Pigs'),
    (54, 'Feature Flamingos'),
    (55, 'Code Coyotes'),
    (56, 'App Alpacas'),
    (57, 'Query Kangaroos'),
    (58, 'Backend Beetles'),
    (59, 'Frontend Foxes'),
    (60, 'System Starlings'),
    (61, 'Script Sharks'),
    (62, 'Data Dalmatians'),
    (63, 'Function Falcons'),
    (64, 'App Ants'),
    (65, 'Database Dolphins'),
    (66, 'Tech Tigersharks'),
    (67, 'UI Ibexes'),
    (68, 'Component Crows'),
    (69, 'API Otters'),
    (70, 'Push Puffins'),
    (71, 'Deploying Donkeys'),
    (72, 'Frontend Ferrets'),
    (73, 'Backend Badgers'),
    (74, 'Pixel Pumas'),
    (75, 'Script Swans'),
    (76, 'Feature Flamingos'),
    (77, 'Function Falcons'),
    (78, 'Backend Beagles'),
    (79, 'System Seals'),
    (80, 'API Armadillos'),
    (81, 'Tech Tarsiers'),
    (82, 'UI Uakaris'),
    (83, 'Database Dodos'),
    (84, 'Code Cuckoos'),
    (85, 'App Anacondas'),
    (86, 'Data Dingoes'),
    (87, 'Feature Felines'),
    (88, 'Deploying Deer'),
    (89, 'System Snakes'),
    (90, 'Backend Bears'),
    (91, 'Frontend Fireflies'),
    (92, 'Pixel Pygmies'),
    (93, 'App Alligators'),
    (94, 'Database Ducklings'),
    (95, 'Tech Tigers'),
    (96, 'Function Fawns'),
    (97, 'API Auks'),
    (98, 'Code Camels'),
    (99, 'Push Platypuses'),
    (100, 'UI Urchins')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO Users (id, name, city, country, countryCode, timezone, teamId) VALUES 
    (1, 'Alyssa', 'Portland', 'USA', 'US', 'CST', 1),
    (2, 'Elliot', 'San Francisco', 'USA', 'US', 'PST', 1),
    (3, 'Katie', 'London', 'UK', 'GB', 'GMT', 2)
  ON CONFLICT (id) DO NOTHING;
`;

// Run the SQL statements
db.exec(createTables, (err) => {
  if (err) {
    console.error('Error creating tables:', err.message);
  } else {
    console.log('Tables created successfully.');

    db.exec(seedData, (err) => {
      if (err) {
        console.error('Error seeding data:', err.message);
      } else {
        console.log('Data seeded successfully.');
      }
      // db.close();
    });
  }
});

module.exports = db;
