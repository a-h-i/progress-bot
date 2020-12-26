export { Config } from './config.js';
export { Help } from './help.js';
export { Register } from './register.js';
export { ListCharacters } from './list_characters.js';

import { Config } from './config.js';
import { Help } from './help.js';
import { Register } from './register.js';
import { ListCharacters } from './list_characters.js';

const commandClasses = [ Config, Help, Register, ListCharacters ];
export { commandClasses };

export { CommandHandler } from './handler.js';