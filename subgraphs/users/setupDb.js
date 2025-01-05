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
    (1, 'Engineering'),
    (2, 'Design')
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
