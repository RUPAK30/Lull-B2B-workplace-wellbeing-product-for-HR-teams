/** Whether a materialized value is a node rather than a plain string, number,
 *  list or object literal — the one check every reader of a resolved tree
 *  needs before it can look at `.name`/`.props`/`.key`. */
export function isStatementNode(value) {
    return (!!value &&
        typeof value === "object" &&
        value.type === "node");
}
