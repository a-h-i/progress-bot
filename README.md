Statera
=======
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
![GitHub package.json version](https://img.shields.io/github/package-json/v/a-h-i/progress-bot?style=flat)
[![buddy pipeline](https://app.buddy.works/ahi-ci/progress-bot/pipelines/pipeline/298937/badge.svg?token=dadcd2a6ab0b5e00f214201cc11d9d64842b85d87772a5b88837873741c199cd "buddy pipeline")](https://app.buddy.works/ahi-ci/progress-bot/pipelines/pipeline/298937)

A simple bot for managing and tracking D&D character progression in westmarch servers.

To invite statera bot to your server [Click Here](https://discord.com/oauth2/authorize?client_id=787463819278549053&scope=bot&permissions=256064)

For help setting up and using the bot on your server check out [Our wiki](../../wiki)

If you are interested on running statera-bot on your machine, or contributing to the project keep reading.

Node version `v15.3.0`


## Dependencies

PostgreSQL v12.4 or later

To install node dependencies run `npm install` in root directory.

## Database

To create the database, if it hasn't been created before. Run `npx sequelize-cli db:create` to create a production environment DB set the env variable `NODE_ENV=production`.


To run the database migration in the root folder of the project run `npx sequelize-cli db:migrate`. To migrate in production also set `NODE_ENV=production`


## Runing the project
To run in production env use `npm run start` to run in development mode use `npm run dev`.
To run specs use `npm run test`


## Environment Variables
The following environment variables are used by the application.

|Key|Description|
|:---:|:---:|
|STATERA_BOT_TOKEN | Bot token from discord developer portal|
|STATERA_DEFAULT_PREFIX| Default bot prefix|
|STATERA_EMBED_COLOR| Defaults to LUMINOUS_VIVID_PINK|
|STATERA_BOT_ICON_URL| URL to statera bot Icon used in some messages|
|STATERA_DB_HOST | Database host defaults to localhost|
|STATERA_DB_PORT | Database port defaults to 5432|
|STATERA_DB_PASSWORD| Database user password|
|STATERA_DB_USERNAME| Database user defaults to statera_dev unless in production env|
|STATERA_DB_NAME| Database name|

The program will autoload a .env file in the working directory at startup.