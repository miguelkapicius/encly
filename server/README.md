# Encly URL Shortener

A URL shortening service built with Fastify, Drizzle ORM, and PostgreSQL.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development database:

```bash
docker compose up pg -d
```

4. Run the development server:

```bash
npm run dev
```

## Testing

This project uses Jest for testing and a separate PostgreSQL database for test data.

### Setting up the Test Database

1. Start the test database:

```bash
npm run db:test:start
```

2. Initialize the test database schema:

```bash
npm run db:test:init
```

### Running Tests

Run tests in watch mode:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:cov
```

Run tests in CI mode (no watch):

```bash
npm run test:ci
```

### Test Database Management

The test database is automatically set up before tests run and cleaned up after tests complete. The setup process includes:

1. Running migrations to create the schema
2. Seeding test data before each test
3. Clearing test data after each test

To stop the test database container:

```bash
npm run db:test:stop
```

## Database Schema

The application uses two main tables:

- `links`: Stores information about shortened URLs
- `clicks`: Tracks click events on shortened URLs

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: Production database connection string
- `DATABASE_URL_DEV`: Development database connection string
- `DATABASE_URL_TEST`: Test database connection string
- `BASE_URL`: Base URL for the shortened links
- `NODE_ENV`: Environment mode (development, test, production)
