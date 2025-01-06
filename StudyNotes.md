# Study Notes
## Developer Notes
* `docker-compose down` to terminate existing containers
* `docker-compose build` to rebuild from source
* `docker-compuse up` to re-start containers
* If changing the graphql schema, rebuild the supergraph (`make demo` works for this purpose)

# Topics

## Nullability
* Apollo GraphQL blog on nullability: https://www.apollographql.com/blog/using-nullability-in-graphql
* Backwards incompatible changes:
    * Making fields nullable if they started as non-nullable (front-end code may not have proper null handling if fields started as non-nullable). The inverse (making a nullable field non-nullable) is backwards compatible.
    * Making input object fields non-nullable if they started as nullable (clients may not be passing a previously nullable argument). The inverse (making a non-nullable input field nullable) is backwards compatible.
* Backwards incompatible changes aren't so terrible if you have a limited number of clients and you control them all.
* Be careful about which fields you mark as non-nullable. If fields are resolved from multiple tables or multiple resolver services, a failure in a request for a non-nullable field will omit the entire result from the query response. It may be better to return partial data than to omit the result entirely.
* For the `teams` query, which returns `[Team]`, I would recommend making both the list and the contents of the list non-nullable, like so: `teams: [Team!]!`

## Pagination
* GraphQL documentation: https://graphql.org/learn/pagination/
* Apollo client documentation: https://www.apollographql.com/docs/react/pagination/overview
* Helpful blog post about pagination in MySQL: https://planetscale.com/blog/mysql-pagination
* Pagination only works when we have deterministic ordering!
* Implemented Teams pagination in this commit: https://github.com/alyssahursh/apollo-graphql/commit/2a63a547e95d04f4efd15289636a76b883152524
### Offset and Limit
* Apollo client documentation: https://www.apollographql.com/docs/react/pagination/offset-based
* Very straightforward to implement using `OFFSET` and `LIMIT`
* Queries become increasingly slow as `OFFSET` value increases, because more records have to be fetched and discarded (I really wish I had a better understanding of what SQL is doing under the hood when processing `OFFSET` queries!) This can be mitigated by "defered join," and is well-supported by many libraries.
* Better for use cases where users might expect or value the ability to index by page
* Subject to drift if rows are added or removed while users are paginating, which can lead to duplicate or omitted records being displayed to users. If data is volatile, consider cursor pagination instead.
* Sample query: 
    ```
    SELECT
        *
    FROM
        people
    ORDER BY
        first_name, id
    LIMIT
        10 -- Only return 10 rows
    OFFSET
        10 -- Skip the first 10 rows
    ```
* Sample schema:
    ```
    teams(limit: Int, offset: Int): [Team]
    ```
    * Limit and offset are nullable here. Set default values in the resolver.
    * Because defaulting behavior may obfuscate that the returned data has been truncated, consider adding a `count` field so that clients can know whether more records are available.
* Sample resolver implementation:
    ```
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
    ```

### Cursor
* Apollo client documentation: https://www.apollographql.com/docs/react/pagination/cursor-based
* Better for use cases where users don't expect to access results by page, like in the case of doom scrolling.
* Less subject to drift.
* Potentially very frustrating for users if they have scrolled far into the results and then lose their place and have to start over.
* Better performance for data further down in the set, because of performance differences between `OFFSET` and `WHERE`.
* Sample query:
    ```
    SELECT
        *
    FROM
        people
    WHERE
        id > 10 -- The last id that the user saw was 10, so we start at the next id after 10
    ORDER BY
        id
    LIMIT
        10
    ```
* Sample schema:
    ```
    teams(limit: Int, after: ID): [Team]
    ```
* Sample resolver implementation:
    ```
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
    ```

## Database Design
### One-to-many vs many-to-many
* Existing Teams table is one-to-many with Users table (presumably)
* What if a user could be part of many teams? We would need to create a many-to-many relationship.
* Many-to-many relationships require a join table that references the primary keys of each table
### Database migration and zero-downtime solutions
How would we move from a design where each user belongs to one team, to a design where users can be part of multiple teams? The challenges here depend on whether we've exposed the ability to mutate the user's team before undertaking this migration, so for now let's assume that we've only exposed read capability. Here are some thoughts:
1. Create a new field `teams: [Team!]!` on the `user` entity
1. Create a new join table for UserTeams. If minimal downtime is allowable, we could do this by pulling the data from the `Users` table, like this:
    ```
    INSERT INTO UserTeams (userId, teamId)
    SELECT id, teamId FROM Users;
    ```
1. Create a new resolver for `teams`
    1. If downtime was allowable, read only from `UserTeams`
    1. Otherwise, read from both the `Users` table and the `UserTeams` table and return the merge results
1. Mark the original `team` field `@deprecated`: https://www.apollographql.com/docs/graphos/schema-design/guides/deprecations
1. If downtime was not allowable for the creation of the join table, use some kind of script to populate the `UserTeams` table from the data in `Users` table, paying attention to the fact that new users could be added to the `Users` table as you go.

Okay, and what if we've exposed the ability to mutate a user's team?
1. The mutation resolver should set the `teamId` in the `Users` table to `null` and write a new record to `UserTeams`
1. Filter out `null` from the merged responses
1. Handle `null` correctly in the migration script

## Schema Changes
### Backwards compatibility
### Deprecation

## Authentication and Authorization