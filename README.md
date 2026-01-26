# VPW Bot

Discord bot for Virtual Pinball Workshop project version tracking. Provides check-in/check-out functionality for collaborative pinball table development.

## Features

- **Project Locking**: Prevent conflicts by checking out projects before editing
- **Version Tracking**: Track versions with links, comments, and timestamps
- **Action History**: View recent actions on a project
- **Revert Support**: Undo the last action if needed

## Commands

| Command                                | Description                                                         |
| -------------------------------------- | ------------------------------------------------------------------- |
| `/checkout`                            | Lock a project for editing. Shows current status if already locked. |
| `/checkin <link> <version> <comments>` | Unlock project and save new version with download link.             |
| `/latest`                              | Show the latest version link and lock status.                       |
| `/list`                                | Show the last 10 actions on the project.                            |
| `/revert`                              | Undo your last action.                                              |

## Project Structure

```bash
vpw-bot/
├── commands/        # Slash commands
├── helpers/         # Utility classes (logging, output formatting)
├── models/          # Data models (Action)
├── services/        # API service (vpwDataService)
├── data/            # Runtime data directory
├── index.js         # Bot entry point
├── Dockerfile       # Multi-stage Docker build
└── package.json
```

## Environment Variables

| Variable                      | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `BOT_TOKEN`                   | Discord bot token                                   |
| `GUILD_ID`                    | Discord server ID for slash commands                |
| `BOT_OWNER`                   | Discord user ID of bot owner                        |
| `COMMANDS_DIR`                | Directory containing commands (default: `commands`) |
| `SECONDS_TO_DELETE_MESSAGE`   | Auto-delete error messages after N seconds          |
| `VPW_DATA_SERVICE_API_URI`    | URL to vpw-data API service                         |
| `BOT_CONTEST_ADMIN_ROLE_NAME` | Role name for admin commands                        |
| `CONTEST_CHANNELS`            | Channel restrictions for commands                   |

## Development

```bash
# Install dependencies
npm install

# Run locally
npm start
```

## Docker

```bash
# Build image
docker build -t ericfaris/vpw-bot .

# Run with docker-compose (from vpc-compose/)
docker-compose -f docker-compose-local.yml up -d vpw-bot
```

## Dependencies

- **discord.js** v14 - Discord API wrapper
- **wokcommands** v2.1 - Command framework
- **pino** / **pino-pretty** - Logging
- **mongodb** v6 - Database driver (via vpw-data service)

## Architecture

The bot communicates with `vpw-data` service for persistence. Each Discord channel represents a project, with actions (checkin/checkout) tracked per channel.

```bash
Discord User → vpw-bot → vpw-data API → MongoDB
```
