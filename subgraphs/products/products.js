// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'products',
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

const products = [
    { id: 'apollo-federation', sku: 'federation', package: '@apollo/federation', variation: "OSS" },
    { id: 'apollo-studio', sku: 'studio', package: '', variation: "platform" },
]

const boards = {
    "a4a72132-5e9e-48fd-ade6-dc4707c19b41": [
        { id: "92fe69ee-f018-49e9-a603-3f414b41c4cb", body: "First board belonging to user a4a72132" },
        { id: "ddcc1d68-2a87-48bd-b824-5d6c702d6abf", body: "Second board belonging to user a4a72132" },
    ],
    "c6f2f5ac-49ad-479e-b601-1756b2fa8e35": [
        { id: "28035b84-2337-458d-8884-b3050eb6a7e6", body: "First board belonging to user c6f2f5ac" },
        { id: " 5e86bf6a-373c-4db4-b1ee-8a7cd3e9bf2d ", body: "Second board belonging to user c6f2f5ac" },
    ],
}
const typeDefs = gql(readFileSync('./products.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Mutation: {
        setBoardBody: (_, args, context) => {
            return { id: args.boardId, body: args.body }
        }
    },
    Query: {
        allProducts: (_, args, context) => {
            return products;
        },
        product: (_, args, context) => {
            return products.find(p => p.id == args.id);
        }
    },
    User: {
        boards: (reference) => {
            return boards[reference.id];
          },
    },
    Product: {
        variation: (reference) => {
            if (reference.variation) return { id: reference.variation };
            return { id: products.find(p => p.id == reference.id).variation }
        },
        dimensions: () => {
            return { size: "1", weight: 1 }
        },
        __resolveReference: (reference) => {
            if (reference.id) return products.find(p => p.id == reference.id);
            else if (reference.sku && reference.package) return products.find(p => p.sku == reference.sku && p.package == reference.package);
            else return { id: 'rover', package: '@apollo/rover', ...reference };
        }
    }
}
const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Products subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
