import { GuildConfig } from '../../models/index.js';


describe('GuildConfig', function() {

    describe('isValidPrefixString()', function() {
        it('should not allow spaces', function() {

            GuildConfig.isValidPreixString('$ $').should.be.false;
            GuildConfig.isValidPreixString(' $').should.be.false;
            GuildConfig.isValidPreixString('$ ').should.be.false;
        });

        it('Should allow dashes', function() {
            GuildConfig.isValidPreixString('s-bot').should.be.true;
        });

        it('Should allow slashes', function() {
            GuildConfig.isValidPreixString('/s').should.be.true;
            GuildConfig.isValidPreixString('\\s').should.be.true;
        });
    });

    describe('isValidStartingLevel()', function() {
        it('Should allow levels 1 through 20', function() {
            const levels = new Array(20).fill().map((_, index) => index + 1);
            levels.every(GuildConfig.isValidStartingLevel).should.be.true;
        });

        it('Should not allow levels below 1', function() {
            const levels = new Array(20).fill().map((_, index) => index - 19 );
            levels.reduce((prev, curr) => prev && GuildConfig.isValidStartingLevel(curr), true).should.be.false;
        });
        
        it('Should not allow levels above 20', function() {
            const levels = new Array(20).fill().map((_, index) => index + 20);
            levels.every(GuildConfig.isValidStartingLevel).should.be.false;
        });
    });

    describe('isValidRetirementKeepLevel()', function() {
        it('Should allow levels 1 through 20', function() {
            const levels = new Array(20).fill().map((_, index) => index + 1);
            levels.every(GuildConfig.isValidRetirementKeepLevel).should.be.true;
        });

        it('Should not allow levels below 1', function() {
            const levels = new Array(20).fill().map((_, index) => index - 19 );
            levels.reduce((prev, curr) => prev && GuildConfig.isValidRetirementKeepLevel(curr), true).should.be.false;
        });
        
        it('Should not allow levels above 20', function() {
            const levels = new Array(20).fill().map((_, index) => index + 20);
            levels.every(GuildConfig.isValidRetirementKeepLevel).should.be.false;
        });
    });

    describe('reward roles', function() {
        it('Should add roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addRewardRole(id));
            guildConfig.getRewardRoles().should.have.members(rolesIds);
            guildConfig.getRewardRolesAsMap().should.have.all.keys(...rolesIds);
        });

        it('should remove roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addRewardRole(id));
            guildConfig.removeRewardRole('2');
            guildConfig.getRewardRoles().should.have.members([ '1', '14' ]);
            guildConfig.getRewardRolesAsMap().should.have.all.keys('1', '14');
        });
    });

    describe('config roles', function() {
        it('Should add roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addConfigRole(id));
            guildConfig.getConfigRoles().should.have.members(rolesIds);
            guildConfig.getConfigRolesAsMap().should.have.all.keys(...rolesIds);
        });
        it('should remove roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addConfigRole(id));
            guildConfig.removeConfigRole('2');
            guildConfig.getConfigRoles().should.have.members([ '1', '14' ]);
            guildConfig.getConfigRolesAsMap().should.have.all.keys('1', '14');
        });
    });

    describe('character creation roles', function() {
        it('Should add roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addCharCreationRole(id));
            guildConfig.getCharCreationRoles().should.have.members(rolesIds);
            guildConfig.getCharCreationRolesAsMap().should.have.all.keys(...rolesIds);
        });
        it('should remove roles', function() {
            const guildConfig = GuildConfig.build();
            let rolesIds = [ '1', '2', '14' ];
            rolesIds.forEach((id) => guildConfig.addCharCreationRole(id));
            guildConfig.removeCharCreationRole('2');
            guildConfig.getCharCreationRoles().should.have.members([ '1', '14' ]);
            guildConfig.getCharCreationRolesAsMap().should.have.all.keys('1', '14');
        });
    });

    describe('reward pools', function() {
        it('should add pool', function() {
            const guildConfig = GuildConfig.build();
            const pools = [
                [ 'xp', [ 'xp' ] ],
                [ 'gold', [ 'gold' ] ]
            ];
            pools.forEach(([ name, vars ]) => {
                guildConfig.addRewardPool(name, vars);
            });
            
            pools.forEach(([ name, vars ]) => {
                guildConfig.hasRewardPool(name).should.be.true;
                guildConfig.getRewardPoolVars(name).should.have.members(vars);
            });

        });

        it('should remove pool', function() {
            const guildConfig = GuildConfig.build();
            const pools = [
                [ 'xp', [ 'xp' ] ],
                [ 'gold', [ 'gold' ] ]
            ];
            pools.forEach(([ name, vars ]) => {
                guildConfig.addRewardPool(name, vars);
            });
            guildConfig.removeRewardPool('xp');
            guildConfig.hasRewardPool('xp').should.be.false;
            guildConfig.hasRewardPool('gold').should.be.true;
        });
    });
    
});