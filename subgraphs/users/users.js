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
      teams: (_, {limit = 100000, after = 0}) => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * From Teams WHERE id > ? ORDER BY id LIMIT ?', [after, limit], (err, teams) => {
            if (err) {
              reject(err)
            } else {
              resolve(teams);
            }
          })
        });
      },
      me: (parent, args, contextValue, info) => {
        return new Promise((resolve, reject) => {
          const randomUserId = Math.floor(Math.random() * 100) + 1;
          console.log(`Attempting to select data for user ID ${randomUserId} from database`);
          db.get('SELECT * FROM Users WHERE id = ?', [randomUserId], (err, userRow) => {
            if (err) {
              reject(err);
            } else if (!userRow) {
              reject(new Error('User not found'));
            } else {
              const teamRequested = info.fieldNodes.some((field) => 
                field.selectionSet.selections.some((sel) => sel.name.value === 'team')
              );
              const teamsRequested = info.fieldNodes.some((field) => 
                field.selectionSet.selections.some((sel) => sel.name.value === 'teams')
              );
              if (!teamRequested && !teamsRequested) {
                resolve(userRow);
              }
              db.get('SELECT * FROM Teams WHERE id = ?', [userRow.teamId], (err, teamRow) => {
                if (err) {
                  reject(err);
                } else if (!teamRow) {
                  reject(new Error('Team not found'));
                } else {
                  resolve({
                    ...userRow,
                    team: teamRow,
                    teams: [teamRow]
                  });
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
