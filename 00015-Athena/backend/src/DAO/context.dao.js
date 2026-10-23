import Context from "../models/context.model.js"


/**
 * @function getUserPersonalContexts
 * @description Read User personal contexts (create one if not exists)
 * @param {String} userId - The ID of the user whose personal contexts are to be retrieved.
 */
export async function getUserPersonalContexts(userId) {
    let contexts = await Context.findOne({ user: userId, name: "personal" })
    if (!contexts) {
        contexts = await Context.create({ user: userId, name: "personal", content: "" })
    }
    return contexts
}


/**
 * @function upsertContext
 * @description upsert context about user things
 * @param {String} userId - The ID of the user for whom the context is to be created.
 * @param {String} name - The name of the context.
 * @param {String} content - The content of the context.
 */
export async function upsertContext(userId, name, content) {
    return await Context.findOneAndUpdate(
        { user: userId, name: name },
        { content: content },
        { upsert: true, new: true }
    )
}

/**
 * @function getContext
 * @description Read context about user things
 * @param {String} userId - The ID of the user whose context is to be retrieved.
 * @param {String} name - The name of the context.
 */
export async function getContext(userId, name) {
    return await Context.findOne({ user: userId, name: name })
}


/**
 * @function listUserContexts
 * @description List all contexts for a given user.
 * @param {String} userId - The ID of the user whose contexts are to be listed.
 */
export async function listUserContexts(userId) {
    return ((await Context.find({ user: userId })
        .select("name"))
        .map(context => context.name))
}
