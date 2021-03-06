export { Config } from './config.js';
export { Help } from './help.js';
export { Register } from './register.js';
export { ListCharacters } from './list_characters.js';
export { SwitchCharacter } from './switch_character.js';
export { RetireCharacter } from './retire.js';
export { RewardCommand } from './reward.js';
export { SpendCommand } from './spend.js';
export { TransferCommand } from './transfer.js';
export { DMRewardCommand } from './dm_reward.js';
export { BaseCommand } from './base_command.js';

import { Config } from './config.js';
import { Help } from './help.js';
import { Register } from './register.js';
import { ListCharacters } from './list_characters.js';
import { SwitchCharacter } from './switch_character.js';
import { RetireCharacter } from './retire.js';
import { RewardCommand } from './reward.js';
import { SpendCommand } from './spend.js';
import { TransferCommand } from './transfer.js';
import { DMRewardCommand } from './dm_reward.js';

const commandClasses = [ Config, Help, Register, ListCharacters, SwitchCharacter,
    RetireCharacter, RewardCommand, SpendCommand, TransferCommand,
    DMRewardCommand ];

export { commandClasses };
export { CommandHandler } from './handler.js';