import { list, obj, str, valid } from './schema.js?v=mvvak7t3';
export const APP_VERSION = '3.0.0';
export const SCHEMA_VERSION = '3';
export const providers = ['mock', 'claude-guided', 'openai-api', 'claude-cli', 'codex-cli'];
export const turnSchema = obj({ reply: str(24000) });
export function isTurn(value) { return valid(turnSchema, value); }
export const requestSchema = obj({
    provider: { type: 'string', enum: [...providers] }, consent: { type: 'boolean' },
    messages: list({ anyOf: [obj({ role: { type: 'string', enum: ['user'] }, content: str(2000) }), obj({ role: { type: 'string', enum: ['assistant'] }, content: str(24000) })] }, 60),
    state: obj({ ui_state: { type: 'string', maxLength: 40000 }, client_events: list(str(1000), 120) }),
    fault: { type: 'string', enum: ['none', 'schema', 'request', 'slow'] },
});
export function isRequest(value) { return valid(requestSchema, value) && value.messages.at(-1)?.role === 'user'; }
