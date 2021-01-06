import { RewardCommand, BaseCommand } from '../../commands/index.js';

describe('RewardCommand', function() {

    describe('parseArguments()', function() {

        it('should parse and retrieve values', function() {
            const userIdNameTuples = [
                [ '1', 'Char 1' ],
                [ '2', 'char o 2 a' ],
                [ '4523', 'Char O\'Ma' ],
                [ '1', 'Char 2' ]
            ];
            const goldReward = 300.5;
            const xpReward = 140;
            const extraValue = 1;

            const inputStr = `$reward <@1> Char 1 <@!2> char o 2 a <@4523> "Char O'Ma <@!1> Char 2" --gold ${goldReward} --xp ${xpReward} --extra-value ${extraValue}`;
            const inputTokens = BaseCommand.argsArray({ content: inputStr }, '$');
            //Remove command name
            inputTokens.shift();
            const parseResult = RewardCommand.parseArguments(inputTokens);
            parseResult.should.not.be.null;
            parseResult.ok.should.be.true;

            parseResult.rewardedGold.should.equal(goldReward);
            parseResult.rewardedXp.should.equal(xpReward);
            parseResult.extraValue.should.equal(extraValue);

            for (let tuple of userIdNameTuples ) {
                parseResult.userIdCharacterNameTuples.should.deep.include(tuple);
            }
        });

        it('should handle intermixed argument order', function() {
            const userIdNameTuples = [
                [ '1', 'Char 1' ],
                [ '2', 'char o 2 a' ],
                [ '4523', 'Char O\'Ma' ],
                [ '1', 'Char 2' ]
            ];
            const goldReward = 300.5;
            const xpReward = 140;
            const extraValue = 1;

            const inputStr = `$reward --gold ${goldReward} <@1> Char 1 --xp ${xpReward} <@!2> char o 2 a    --extra-value ${extraValue}    <@4523> "Char O'Ma <@!1> Char 2" `;
            const inputTokens = BaseCommand.argsArray({ content: inputStr }, '$');
            //Remove command name
            inputTokens.shift();
            const parseResult = RewardCommand.parseArguments(inputTokens);
            parseResult.should.not.be.null;
            parseResult.ok.should.be.true;

            parseResult.rewardedGold.should.equal(goldReward);
            parseResult.rewardedXp.should.equal(xpReward);
            parseResult.extraValue.should.equal(extraValue);

            for (let tuple of userIdNameTuples ) {
                parseResult.userIdCharacterNameTuples.should.deep.include(tuple);
            }
        });

        it('Should handle incorrect arguments', function() {
            // Based on bug detected on Dec 30th 2020
            const inputStr = '$reward xp 100xp Character Not Exist';
            const inputTokens = BaseCommand.argsArray({ content: inputStr }, '$');
            // remove command name
            inputTokens.shift();
            const parseResult = RewardCommand.parseArguments(inputTokens);
            parseResult.should.not.be.null;
            parseResult.ok.should.be.false;
        });

        it('Should not require gold and xp values', function () {
            const userIdNameTuples = [
                [ '1', 'Char 1' ],
                [ '2', 'char o 2 a' ],
                [ '4523', 'Char O\'Ma' ],
                [ '1', 'Char 2' ]
            ];
            const goldReward = 0;
            const xpReward = 0;
            const extraValue = 0;

            const inputStr = `$reward  <@1> Char 1  <@!2> char o 2 a   <@4523> "Char O'Ma <@!1> Char 2" `;
            const inputTokens = BaseCommand.argsArray({ content: inputStr }, '$');
            //Remove command name
            inputTokens.shift();
            const parseResult = RewardCommand.parseArguments(inputTokens);
            parseResult.should.not.be.null;
            parseResult.ok.should.be.true;

            parseResult.rewardedGold.should.equal(goldReward);
            parseResult.rewardedXp.should.equal(xpReward);
            parseResult.extraValue.should.equal(extraValue);

            for (let tuple of userIdNameTuples ) {
                parseResult.userIdCharacterNameTuples.should.deep.include(tuple);
            }
        });

    });
});