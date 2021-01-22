import { DateTime } from 'luxon';

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


/**
 * 
 * @param {Date} date 
 * @returns {string}
 */
function formatJSDate(date) {
    return DateTime.fromJSDate(date).toFormat('ffff');
}

export { mapToDisplayStr, formatJSDate };