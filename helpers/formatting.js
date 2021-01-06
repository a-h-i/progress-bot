
/**
 * 
 * @param {Map} map
 * @returns {string} formatted in key - value lines 
 */
function mapToDisplayStr(map) {
    const lines = [];
    for (const [ key, value ] of map) {
        lines.push(`${key} - ${value}`);
    }
    return lines.join('\n');
}

export { mapToDisplayStr };