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
    (3, 'Katie', 'London', 'UK', 'GB', 'GMT', 2),
    (4, 'Max', 'Berlin', 'Germany', 'DE', 'CET', 5),
    (5, 'Sophia', 'Paris', 'France', 'FR', 'CET', 12),
    (6, 'Liam', 'New York', 'USA', 'US', 'EST', 8),
    (7, 'Mia', 'Tokyo', 'Japan', 'JP', 'JST', 9),
    (8, 'Lucas', 'Chicago', 'USA', 'US', 'CST', 15),
    (9, 'Emma', 'Sydney', 'Australia', 'AU', 'AEST', 20),
    (10, 'Noah', 'Toronto', 'Canada', 'CA', 'EST', 25),
    (11, 'Olivia', 'Mexico City', 'Mexico', 'MX', 'CST', 30),
    (12, 'James', 'Madrid', 'Spain', 'ES', 'CET', 33),
    (13, 'Charlotte', 'Dublin', 'Ireland', 'IE', 'GMT', 35),
    (14, 'Benjamin', 'Seoul', 'South Korea', 'KR', 'KST', 40),
    (15, 'Amelia', 'Moscow', 'Russia', 'RU', 'MSK', 45),
    (16, 'Elijah', 'Rio de Janeiro', 'Brazil', 'BR', 'BRT', 50),
    (17, 'Harper', 'Cape Town', 'South Africa', 'ZA', 'SAST', 55),
    (18, 'William', 'Bangkok', 'Thailand', 'TH', 'ICT', 60),
    (19, 'Evelyn', 'Singapore', 'Singapore', 'SG', 'SGT', 65),
    (20, 'Henry', 'Helsinki', 'Finland', 'FI', 'EET', 70),
    (21, 'Ava', 'Oslo', 'Norway', 'NO', 'CET', 75),
    (22, 'Jack', 'Lisbon', 'Portugal', 'PT', 'WET', 80),
    (23, 'Isabella', 'Cairo', 'Egypt', 'EG', 'EET', 85),
    (24, 'Logan', 'New Delhi', 'India', 'IN', 'IST', 90),
    (25, 'Scarlett', 'Hong Kong', 'China', 'HK', 'HKT', 95),
    (26, 'Alexander', 'Dubai', 'UAE', 'AE', 'GST', 88),
    (27, 'Sophie', 'Buenos Aires', 'Argentina', 'AR', 'ART', 3),
    (28, 'Matthew', 'Istanbul', 'Turkey', 'TR', 'TRT', 10),
    (29, 'Victoria', 'Athens', 'Greece', 'GR', 'EET', 2),
    (30, 'Jackson', 'Warsaw', 'Poland', 'PL', 'CET', 13),
    (31, 'Aria', 'Kuala Lumpur', 'Malaysia', 'MY', 'MYT', 22),
    (32, 'David', 'Jakarta', 'Indonesia', 'ID', 'WIB', 37),
    (33, 'Ella', 'Manila', 'Philippines', 'PH', 'PST', 19),
    (34, 'Joseph', 'Santiago', 'Chile', 'CL', 'CLT', 6),
    (35, 'Grace', 'Auckland', 'New Zealand', 'NZ', 'NZST', 50),
    (36, 'Daniel', 'Lagos', 'Nigeria', 'NG', 'WAT', 41),
    (37, 'Chloe', 'Lima', 'Peru', 'PE', 'PET', 14),
    (38, 'Oliver', 'Bogota', 'Colombia', 'CO', 'COT', 7),
    (39, 'Madison', 'Tel Aviv', 'Israel', 'IL', 'IST', 31),
    (40, 'Samuel', 'Doha', 'Qatar', 'QA', 'AST', 29),
    (41, 'Layla', 'Kiev', 'Ukraine', 'UA', 'EET', 54),
    (42, 'Nathan', 'Riyadh', 'Saudi Arabia', 'SA', 'AST', 18),
    (43, 'Hannah', 'Vienna', 'Austria', 'AT', 'CET', 23),
    (44, 'Levi', 'Hanoi', 'Vietnam', 'VN', 'ICT', 32),
    (45, 'Zoey', 'Casablanca', 'Morocco', 'MA', 'WET', 4),
    (46, 'Sebastian', 'Montreal', 'Canada', 'CA', 'EST', 9),
    (47, 'Lillian', 'Edinburgh', 'UK', 'GB', 'GMT', 11),
    (48, 'Mason', 'Brussels', 'Belgium', 'BE', 'CET', 24),
    (49, 'Maya', 'Stockholm', 'Sweden', 'SE', 'CET', 44),
    (50, 'Carter', 'Reykjavik', 'Iceland', 'IS', 'GMT', 17),
    (51, 'Zoe', 'Canberra', 'Australia', 'AU', 'AEST', 36),
    (52, 'Isaac', 'Karachi', 'Pakistan', 'PK', 'PKT', 56),
    (53, 'Samantha', 'Nairobi', 'Kenya', 'KE', 'EAT', 39),
    (54, 'Owen', 'Munich', 'Germany', 'DE', 'CET', 62),
    (55, 'Emily', 'Osaka', 'Japan', 'JP', 'JST', 16),
    (56, 'Wyatt', 'Barcelona', 'Spain', 'ES', 'CET', 49),
    (57, 'Luna', 'Havana', 'Cuba', 'CU', 'CST', 26),
    (58, 'Dylan', 'Tehran', 'Iran', 'IR', 'IRST', 48),
    (59, 'Audrey', 'Beijing', 'China', 'CN', 'CST', 66),
    (60, 'Andrew', 'Brasilia', 'Brazil', 'BR', 'BRT', 99),
    (61, 'Bella', 'Pretoria', 'South Africa', 'ZA', 'SAST', 47),
    (62, 'Gabriel', 'Sofia', 'Bulgaria', 'BG', 'EET', 21),
    (63, 'Mila', 'Zagreb', 'Croatia', 'HR', 'CET', 12),
    (64, 'Christopher', 'Bangkok', 'Thailand', 'TH', 'ICT', 61),
    (65, 'Sadie', 'Oslo', 'Norway', 'NO', 'CET', 67),
    (66, 'Grayson', 'Accra', 'Ghana', 'GH', 'GMT', 43),
    (67, 'Leah', 'Copenhagen', 'Denmark', 'DK', 'CET', 28),
    (68, 'Ethan', 'Tunis', 'Tunisia', 'TN', 'CET', 42),
    (69, 'Abigail', 'Helsinki', 'Finland', 'FI', 'EET', 51),
    (70, 'Hudson', 'Paris', 'France', 'FR', 'CET', 53),
    (71, 'Ellie', 'Madrid', 'Spain', 'ES', 'CET', 38),
    (72, 'Leo', 'Los Angeles', 'USA', 'US', 'PST', 34),
    (73, 'Savannah', 'Rome', 'Italy', 'IT', 'CET', 63),
    (74, 'Isaiah', 'Athens', 'Greece', 'GR', 'EET', 74),
    (75, 'Aubrey', 'Jakarta', 'Indonesia', 'ID', 'WIB', 46),
    (76, 'Luke', 'Lima', 'Peru', 'PE', 'PET', 27),
    (77, 'Stella', 'Warsaw', 'Poland', 'PL', 'CET', 77),
    (78, 'Jacob', 'Seoul', 'South Korea', 'KR', 'KST', 76),
    (79, 'Avery', 'Bogota', 'Colombia', 'CO', 'COT', 70),
    (80, 'Nathaniel', 'Casablanca', 'Morocco', 'MA', 'WET', 90),
    (81, 'Penelope', 'Singapore', 'Singapore', 'SG', 'SGT', 82),
    (82, 'Aaron', 'Buenos Aires', 'Argentina', 'AR', 'ART', 98),
    (83, 'Hazel', 'Canberra', 'Australia', 'AU', 'AEST', 68),
    (84, 'Thomas', 'Stockholm', 'Sweden', 'SE', 'CET', 72),
    (85, 'Riley', 'London', 'UK', 'GB', 'GMT', 78),
    (86, 'Nathan', 'San Francisco', 'USA', 'US', 'PST', 91),
    (87, 'Lucy', 'Sydney', 'Australia', 'AU', 'AEST', 87),
    (88, 'Christian', 'Tokyo', 'Japan', 'JP', 'JST', 64),
    (89, 'Nora', 'Vienna', 'Austria', 'AT', 'CET', 84),
    (90, 'Eleanor', 'Mexico City', 'Mexico', 'MX', 'CST', 93),
    (91, 'Easton', 'Hong Kong', 'China', 'HK', 'HKT', 92),
    (92, 'Paisley', 'Dubai', 'UAE', 'AE', 'GST', 86),
    (93, 'Charles', 'Havana', 'Cuba', 'CU', 'CST', 79),
    (94, 'Lily', 'New Delhi', 'India', 'IN', 'IST', 89),
    (95, 'Hunter', 'Beijing', 'China', 'CN', 'CST', 81),
    (96, 'Mackenzie', 'Rio de Janeiro', 'Brazil', 'BR', 'BRT', 83),
    (97, 'Jaxon', 'Montreal', 'Canada', 'CA', 'EST', 59),
    (98, 'Grace', 'Toronto', 'Canada', 'CA', 'EST', 58),
    (99, 'Lincoln', 'Kiev', 'Ukraine', 'UA', 'EET', 57),
    (100, 'Violet', 'Cairo', 'Egypt', 'EG', 'EET', 96)
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
