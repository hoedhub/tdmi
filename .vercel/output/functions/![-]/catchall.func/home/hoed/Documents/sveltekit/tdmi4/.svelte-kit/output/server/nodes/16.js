import * as server from '../entries/pages/member/nasyath/_page.server.ts.js';

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/member/nasyath/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/member/nasyath/+page.server.ts";
export const imports = ["_app/immutable/nodes/16.DY_O90lv.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DGvkJv8w.js","_app/immutable/chunks/k-Px6GBH.js"];
export const stylesheets = [];
export const fonts = [];
