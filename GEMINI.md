# Project Overview: VPW Bot

The VPW Bot is a Discord bot designed to facilitate collaborative development for Virtual Pinball Workshop projects. It provides a version tracking and project locking mechanism, enabling users to manage shared pinball table development through Discord slash commands. The bot interacts with an external `vpw-data` API service for data persistence, which is backed by MongoDB. Each Discord channel is treated as a distinct project.

## Main Technologies

- **Node.js**: The primary runtime environment.
- **Discord.js v14**: Library for interacting with the Discord API.
- **pino**: For efficient and structured logging, with `pino-pretty` for human-readable output during development.
- **dotenv**: Manages environment variables for configuration.
- **Native Fetch API**: Used for making HTTP requests to the `vpw-data` API service.

## Architecture

The bot operates within a client-server model:
`Discord User ↔ VPW Bot ↔ VPW Data API ↔ MongoDB`

Discord users issue slash commands to the `vpw-bot`. The bot processes these commands, interacting with the `vpw-data` API service (an external component not part of this repository) to perform operations such as locking/unlocking projects, storing version information, and retrieving project history. The `vpw-data` API then persists this data in a MongoDB database.

## Building and Running

### Prerequisites

- Node.js (LTS recommended)
- npm (usually comes with Node.js)
- Discord Bot Token, Guild ID, and other environment variables as specified in the `README.md`.
- Access to a running `vpw-data` API service.

### Docker

1. **Build Docker Image:**

   ```bash
   docker build -t emb417/vpw-bot .
   ```

2. **Run with Docker Compose (example):**
   If part of a larger `docker-compose` setup (e.g., from a `vpc-compose/` directory):

   ```bash
   docker-compose -f docker-compose-local.yml up -d vpw-bot
   ```

## Development Conventions

- **Modular Command Structure**: Each Discord slash command (e.g., `/checkin`, `/checkout`, `/list-latest-versions`) is implemented as a separate module in the `commands/` directory. These modules export an object containing `commandName`, `description`, `options` (for Discord API registration), and an asynchronous `callback` function that encapsulates the command's logic.
- **Utility Functions**: Reusable logic for API interactions (`utils/vpw.js`), action object creation (`utils/action.js`), and logging (`utils/logger.js`) is organized within the `utils/` directory.
- **Structured Logging**: The `pino` logger is configured for `info` level logging, providing detailed and colorized output during development via `pino-pretty`.
- **Environment-based Configuration**: Critical settings and credentials (e.g., `BOT_TOKEN`, `GUILD_ID`, `VPW_DATA_SERVICE_API_URI`) are loaded from environment variables using `dotenv`.
- **ES Module Syntax**: The codebase consistently uses ES module `import`/`export` syntax.
- **Asynchronous Operations**: `async/await` is extensively used for handling non-blocking operations, particularly for Discord API calls and interactions with the `vpw-data` service.
- **Basic Error Handling**: Command callbacks include `try...catch` blocks to gracefully handle and log errors during execution, providing user feedback within Discord.
