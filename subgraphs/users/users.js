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
      me: (_, args) => {
        console.log(`User query args: ${JSON.stringify(args)}`);
        return new Promise((resolve, reject) => {
          console.log(`Attempting to select data for userId: ${args.id} from user table`);
          db.get('SELECT * FROM Users WHERE id = ?', [args.id], (err, userRow) => {
            if (err) {
              reject(err);
            } else if (!userRow) {
              reject(new Error('User not found'));
            } else {
              console.log(`Retrieved data from user table: ${JSON.stringify(userRow)}`);
              resolve(userRow);
            }
          });
        });
      }      
    },
    User: {
      team: (parent) => {
        console.log(`Team field query parent: ${JSON.stringify(parent)}`);
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM Teams WHERE id = ?', [parent.teamId], (err, team) => {
              if (err) {
                reject(err);
              } else if (!team) {
                reject(new Error(`No team found in teams table for teamId: ${parent.teamId}`));
              } else {
                console.log(`Retrieved team: ${JSON.stringify(team)} from team table`);
                resolve(team);
              }
            });
          })
      },
      teams: (parent) => {
        console.log(`Teams field query parent: ${JSON.stringify(parent)}`);
        return new Promise((resolve, reject) => {
          db.get('SELECT * FROM Teams WHERE id = ?', [parent.teamId], (err, team) => {
            if (err) {
              reject(err);
            } else if (!team) {
              reject(new Error(`No team found in teams table for teamId: ${parent.teamId}`));
            } else {
              console.log(`Retrieved team: ${JSON.stringify(team)} from team table`);
              resolve([team]);
            }
          });
        })
      }
    }
}
const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Users subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
