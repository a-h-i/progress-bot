export { Config } from './config.js';
export { Help } from './help.js';
export { Register } from './register.js';
export { ListCharacters } from './list_characters.js';
export { SwitchCharacter } from './switch_character.js';
export { RetireCharacter } from './retire.js';
export { RewardCommand } from './reward.js';
export { SpendCommand } from './spend.js';
export { TransferCommand } from './transfer.js';

import { Config } from './config.js';
import { Help } from './help.js';
import { Register } from './register.js';
import { ListCharacters } from './list_characters.js';
import { SwitchCharacter } from './switch_character.js';
import { RetireCharacter } from './retire.js';
import { RewardCommand } from './reward.js';
import { SpendCommand } from './spend.js';
import { TransferCommand } from './transfer.js';

const commandClasses = [ Config, Help, Register, ListCharacters, SwitchCharacter,
    RetireCharacter, RewardCommand, SpendCommand, TransferCommand ];

export { commandClasses };
export { CommandHandler } from './handler.js';