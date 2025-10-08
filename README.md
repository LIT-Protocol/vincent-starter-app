# Vincent Starter App

A monorepo that powers the _Vincent DCA_ demo application.

This project demonstrates how to schedule and execute recurring DCA (Dollar-Cost Averaging) swaps on behalf of end-users using a Vincent App and delegated agent wallets.

## Prerequisites

- Node ^22.16.0
- pnpm ^10.7.0
- Docker or a local MongoDB instance
- A Vincent App with Uniswap swap ability

## Monorepo Structure

This codebase is composed of three main parts:

- Frontend: React app where users can create, edit, and delete DCA tasks.
- Database: MongoDB to persist DCA tasks.
- Backend (Node.js):
  - Express.js API server used by the frontend
  - Agenda-based job scheduler that runs DCA jobs
  - Integration with a Vincent App to execute swaps on behalf of users
    - Vincent Uniswap Swap ability: executes the actual token swaps

## Packages

| Package                                         | Purpose                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| [dca-frontend](packages/dca-frontend/README.md) | Frontend for end-users to define DCA tasks to be run on a schedule               |
| [dca-backend](packages/dca-backend/README.md)   | Backend REST API and worker instance using NodeJS; deployed to Heroku currently. |

## Vincent App

To execute operations on behalf of your users (delegators), you need a Vincent App to which they can delegate their agent wallet.

A demo Vincent App already exists: [wBTC DCA](https://dashboard.heyvincent.ai/explorer/appId/9796398001) in the [Vincent Dashboard](https://dashboard.heyvincent.ai/).

You can access the demo app frontend at: https://dca.heyvincent.ai/

### Create your own Vincent App

To run this code and sign on behalf of your delegators, create your own Vincent App:

1. Go to the [Vincent Dashboard](https://dashboard.heyvincent.ai/) and log in as a builder.
2. Create a new app similar to [wBTC DCA](https://dashboard.heyvincent.ai/user/appId/9796398001/connect).
3. Add the Uniswap Swap ability.
4. Publish the app.
5. Once users can connect to it, configure the backend with your App ID and the delegatee private key via environment variables. You can use the Deploy on Railway button below to deploy the entire app.
6. Once deployed, you'll need to update the `App User URL` and `Redirect URIs` to the URL deployed from Railway.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/UY2g5I?referralCode=iNEMKY&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Quick Start

Install dependencies and build the packages (works for both local and production setups):

```zsh
pnpm install && pnpm build
```

Note: remember to enable [Corepack](https://github.com/nodejs/corepack): `corepack enable`

## Local Development

Local development uses `dotenvx` to load environment variables from `.env` files. You should have a `.env` at the repository root and one for each package that needs it.

Each project includes a `.env.example` with placeholders and defaults you can copy and fill in.

### Start a local MongoDB

A Dockerfile is provided to run MongoDB locally:

```zsh
pnpm -r mongo:build
```

### Run all services

After setting environment variables and starting the database, run:

```zsh
pnpm dev
```

## Production

Production does not use `dotenvx`. Inject environment variables via your platform’s secret manager or environment configuration—do not write them to the runtime filesystem.

Then start the services with:

```zsh
pnpm start
```

## Notes and Gotchas

- You will most likely not run API and Worker instances on the same server.
- The abilities you execute MUST match the exact versions connected in each user’s agent wallet.
  - If you update an ability, users must reconnect; you cannot use a newer version they haven’t approved.
  - If you support multiple versions of the same Vincent App, your server may need to run multiple versions of abilities side-by-side.
  - Install specific versions of abilities in your app to avoid version conflicts.
- Users can revoke or update their connection at any time; handle revocations and version changes gracefully.
- Always call prepare and precheck functions for abilities to avoid preventable errors.
- Users’ agent wallets send their own transactions. Ensure they have sufficient funds for gas, unless you plan to sponsor it.

## Disclaimers

- This is a demo application and is not intended for production use without considerable modifications.
- The software is provided “as is”, without warranty of any kind, express or implied, including but
  not limited to the warranties of merchantability, fitness for a particular purpose and
  noninfringement. We make no guarantees about its stability or suitability for production use. It
  is provided for demo and educational purposes.
- It's your responsibility to comply with all applicable laws and regulations for your jurisdiction
  with respect to the use of this software.
