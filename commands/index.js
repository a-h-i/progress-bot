export { Config } from './config.js';
export { Help } from './help.js';
export { Register } from './register.js';
export { ListCharacters } from './list_characters.js';
export { SwitchCharacter } from './switch_character.js';
export { RetireCharacter } from './retire.js';
export { RewardCommand } from './reward.js';

import { Config } from './config.js';
import { Help } from './help.js';
import { Register } from './register.js';
import { ListCharacters } from './list_characters.js';
import { SwitchCharacter } from './switch_character.js';
import { RetireCharacter } from './retire.js';
import { RewardCommand } from './reward.js';

const commandClasses = [ Config, Help, Register, ListCharacters, SwitchCharacter,
    RetireCharacter, RewardCommand ];

export { commandClasses };
export { CommandHandler } from './handler.js';