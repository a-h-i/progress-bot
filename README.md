Statera
=======
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A simple bot for managing and tracking D&D character progression in westmarch servers.

Node version `v15.3.0`


## Dependencies

PostgreSQL v12.4 or later

To install node dependencies run `npm install` in root directory.


## Runing the project
To run in production env use `npm run start` to run in development mode use `npm run dev`.
To run specs use `npm run test`


## Environment Variables
The following environment variables are used by the application.

|Key|Description|
|:---:|:---:|
|BOT_TOKEN | Bot token from discord developer portal|
|DEFAULT_PREFIX| Default bot prefix|
|EMBED_COLOR| Defaults to LUMINOUS_VIVID_PINK| 

The program will autoload a .env file in the working directory at startup.