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
      me: (_, args, context) => {
        console.log(`User query args: ${JSON.stringify(args)}, context: ${JSON.stringify(context)}`);
        const userId = context.userId;
        return new Promise((resolve, reject) => {
          console.log(`Attempting to select data for userId: ${userId} from user table`);
          db.get('SELECT * FROM Users WHERE id = ?', [userId], (err, userRow) => {
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
          const teamPromise = new Promise((resolve, reject) => {
            db.get('SELECT * FROM Teams WHERE id = ?', [parent.teamId], (err, team) => {
              if (err) {
                reject(err);
              } else {
                console.log(`Retrieved team: ${JSON.stringify(team)} from team table`);
                resolve(team);
              }
            });
          })
          const teamsPromise = new Promise((resolve, reject) => {
            db.all('SELECT DISTINCT t.id, t.name FROM Teams as t RIGHT JOIN UserTeams as u ON t.id = u.teamId WHERE u.userId = ?', [parent.id], (err, teams) => {
              if (err) {
                reject(err);
              } else {
                console.log(`Retrieved teams: ${JSON.stringify(teams)} from userteams table`);
                resolve(teams);
              }
            });
          })

          resolve(Promise.all([teamPromise, teamsPromise])
            .then(([teamPromise, teamsPromise]) => {
              return Array.from(
                new Map([teamPromise, ...teamsPromise]
                  .filter((team => team !== null))
                  .map(team => [team.id, team]))
                  .values()
              );
            })
            .catch((err) => { throw new Error['Error retrieving teams'] })
          );
        })
      }
    }
}
const server = new ApolloServer({ 
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => {
    console.log(`Subschema request headers: ${JSON.stringify(req.headers)}`);
    const authHeader = req.headers['authorization'];
    console.log(`Auth header received in subgraph: ${authHeader}`);

    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    return { userId: authHeader.split(' ')[1] }; // Don't do this! This allows any user to send any userId in their headers.
  }
});
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Users subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
