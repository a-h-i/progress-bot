import { sequelize } from '../models/index.js';

after(async () => {
    await sequelize.close();
});