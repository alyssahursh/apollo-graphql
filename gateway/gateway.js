// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'router',
    name: 'router',
    exporter: {
      type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
      host: process.env.APOLLO_OTEL_EXPORTER_HOST,
      port: process.env.APOLLO_OTEL_EXPORTER_PORT,
    }
  }).setupInstrumentation();
}

// Main
const { ApolloServer } = require('apollo-server');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { readFileSync } = require('fs');

const port = process.env.APOLLO_PORT || 4000;
const embeddedSchema = process.env.APOLLO_SCHEMA_CONFIG_EMBEDDED == "true" ? true : false;

const config = {};

if (embeddedSchema){
  const supergraph = "/etc/config/supergraph.graphql"
  config['supergraphSdl'] = readFileSync(supergraph).toString();
  console.log('Starting Apollo Gateway in local mode ...');
  console.log(`Using local: ${supergraph}`)
} else {
  console.log('Starting Apollo Gateway in managed mode ...');
}

const gateway = new ApolloGateway({
  ...config,
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // Forward the Authorization header if it exists
        if (context.authorization) {
          request.http.headers.set('Authorization', context.authorization);
        }
      }
    });
  }
});

const server = new ApolloServer({
  gateway,
  debug: true,
  // Subscriptions are unsupported but planned for a future Gateway version.
  subscriptions: false,
  context: ({ req }) => {
    const authorization = req.headers['authorization'];
    console.log(`Auth header received in gateway: ${authorization}`);
    
    return { authorization }; // Pass auth information to subgraphs
  }
});

server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Graph Router ready at ${url}`);
}).catch(err => {console.error(err)});
