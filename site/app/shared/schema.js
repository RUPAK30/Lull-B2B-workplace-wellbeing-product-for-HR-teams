export const str = (maxLength = 240) => ({ type: 'string', minLength: 1, maxLength });
export const list = (items, maxItems = 12) => ({ type: 'array', items, maxItems });
export const obj = (properties) => ({
    type: 'object', properties, required: Object.keys(properties), additionalProperties: false,
});
export function valid(schema, value) {
    if (schema.anyOf)
        return schema.anyOf.some(s => valid(s, value));
    if (schema.enum && !schema.enum.includes(value))
        return false;
    switch (schema.type) {
        case 'null': return value === null;
        case 'string': return typeof value === 'string' && value.length >= (schema.minLength ?? 0) && value.length <= (schema.maxLength ?? Infinity);
        case 'boolean': return typeof value === 'boolean';
        case 'integer': return typeof value === 'number' && Number.isInteger(value) && value >= (schema.minimum ?? -Infinity) && value <= (schema.maximum ?? Infinity);
        case 'array': return Array.isArray(value) && value.length <= (schema.maxItems ?? Infinity) && value.every(v => valid(schema.items, v));
        case 'object': {
            if (!value || typeof value !== 'object' || Array.isArray(value))
                return false;
            const record = value;
            return Object.keys(record).every(k => Object.hasOwn(schema.properties, k)) &&
                schema.required.every(k => Object.hasOwn(record, k) && valid(schema.properties[k], record[k]));
        }
        default: return false;
    }
}
