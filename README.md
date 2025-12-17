# Project Title

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ USER_IDENTIFIERS : "has many"
    USERS ||--o{ USER_ORGANIZATIONS : "belongs to many"
    USERS ||--o{ USER_ORGANIZATION_UNITS : "belongs to many"
    USERS ||--o{ SESSIONS : "has many"
    ORGANIZATIONS ||--o{ ORGANIZATION_UNITS : "has many"
    ORGANIZATIONS ||--o{ USER_ORGANIZATIONS : "has many"
    ORGANIZATIONS ||--o{ ROLES : "has many"
    ORGANIZATIONS ||--o{ SUBSCRIPTIONS : "has many"
    ORGANIZATIONS }o--|| USERS : "owned by"
    ORGANIZATION_UNITS }o--|| ORGANIZATIONS : "belongs to"
    ORGANIZATION_UNITS ||--o{ USER_ORGANIZATION_UNITS : "has many"
    ROLES }o--|| ORGANIZATIONS : "belongs to"
    ROLES ||--o{ ROLE_PERMISSIONS : "has many"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "has many"
    USER_ORGANIZATIONS }o--|| USERS : "belongs to"
    USER_ORGANIZATIONS }o--|| ORGANIZATIONS : "belongs to"
    USER_ORGANIZATIONS }o--|| ROLES : "belongs to"
    USER_ORGANIZATION_UNITS }o--|| USERS : "belongs to"
    USER_ORGANIZATION_UNITS }o--|| ORGANIZATION_UNITS : "belongs to"
    ROLE_PERMISSIONS }o--|| ROLES : "belongs to"
    ROLE_PERMISSIONS }o--|| PERMISSIONS : "belongs to"
    SUBSCRIPTIONS }o--|| ORGANIZATIONS : "belongs to"
    SESSIONS }o--|| USERS : "belongs to"
    USER_IDENTIFIERS }o--|| USERS : "belongs to"

    USERS {
        uuid id
        text status
        timestamp createdAt
    }

    USER_IDENTIFIERS {
        uuid id
        uuid userId
        text type
        text value
        boolean verified
    }

    ORGANIZATIONS {
        uuid id
        text name
        uuid ownerId
        boolean isActive
        timestamp createdAt
    }

    ORGANIZATION_UNITS {
        uuid id
        uuid organizationId
        text name
        boolean isActive
    }

    ROLES {
        uuid id
        uuid organizationId
        text name
        boolean isOwner
        boolean isActive
    }

    USER_ORGANIZATIONS {
        uuid userId
        uuid organizationId
        uuid roleId
    }

    USER_ORGANIZATION_UNITS {
        uuid userId
        uuid organizationUnitId
    }

    PERMISSIONS {
        uuid id
        text code
    }

    ROLE_PERMISSIONS {
        uuid roleId
        uuid permissionId
    }

    SUBSCRIPTIONS {
        uuid id
        uuid organizationId
        text plan
        timestamp expiresAt
    }

    SESSIONS {
        uuid id
        uuid userId
        text tokenHash
        text refreshTokenHash
        timestamp expiresAt
        timestamp refreshExpiresAt
        timestamp revokedAt
        timestamp createdAt
    }
```

## Scripts

- `npm run dev`: Start the development server (Next.js dev mode)
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint for code linting
- `npm run test`: Run all tests using Jest
- `npm run test:watch`: Run tests in watch mode
- `npm run test:client`: Run tests for client-side code
- `npm run test:server`: Run tests for server-side code
- `npm run test:shared`: Run tests for shared code
- `npm run test:coverage`: Run tests with coverage report
- `npm run db:generate`: Generate database migration files using Drizzle
- `npm run db:migrate`: Apply database migrations
- `npm run db:studio`: Open Drizzle Studio for database management
- `npm run db:seed`: Seed the database with initial data
- `npm run db:reset`: Reset the database and apply migrations