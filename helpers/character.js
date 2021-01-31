
/**
 * 
 * @param {Character} char 
 * @returns {string}
 */
export function displayCharDetails(char) {
    return `${char.name} Level: ${char.level} Experience: ${char.experience} Gold: ${char.gold} ${char.isActive? '- **Active**' : ''} ${char.isRetired? '- **Retired**' : ''}`;
}

/**
 * 
 * @param {Character[]} characters 
 * @param {string} [seperator] defaults to new line 
 * @returns {string}
 */
export function displayCharList(characters, seperator='\n') {
    return characters.map(displayCharDetails).join(seperator);
}