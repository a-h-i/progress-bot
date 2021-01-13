/**
 * Creates a function to check a message author's id vs an id.
 * @param {string} id - id to match against
 * @returns {function} 
 */
function authorIdFilterFactory(id) {
    return function (reply) {
        return reply.author.id == id;
    };
}

export { authorIdFilterFactory };