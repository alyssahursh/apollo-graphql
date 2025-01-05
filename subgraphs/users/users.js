const db = require('./setupDb.js');

// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'users',
    exporter: {
      type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
      host: process.env.APOLLO_OTEL_EXPORTER_HOST,
      port: process.env.APOLLO_OTEL_EXPORTER_PORT,
    }
  }).setupInstrumentation();
}

const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');

const port = process.env.APOLLO_PORT || 4000;

const typeDefs = gql(readFileSync('./users.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
      teams: () => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * From Teams', (err, teams) => {
            if (err) {
              reject(err)
            } else {
              resolve(teams);
            }
          })
        });
      },
      me: () => {
        return new Promise((resolve, reject) => {
          console.log('Attempting to select data from database');
          db.get('SELECT * FROM Users WHERE id = ?', [1], (err, userRow) => {
            if (err) {
              reject(err);
            } else if (!userRow) {
              reject(new Error('User not found'));
            } else {
              console.log(userRow);
              db.get('SELECT * FROM Teams WHERE id = ?', [userRow.teamId], (err, teamRow) => {
                if (err) {
                  reject(err);
                } else if (!teamRow) {
                  reject(new Error('Team not found'));
                } else {
                  // Transform the raw row into the expected User structure
                  const user = {
                    id: userRow.id,
                    name: userRow.name,
                    city: userRow.city,
                    country: userRow.country,
                    countryCode: userRow.countryCode,
                    timezone: userRow.timezone,
                    team: teamRow, // Attach the team object
                  };
                  console.log(user);
                  resolve(user);
                }
              });
            }
          });
        });
      }      
    }
}
const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Users subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
