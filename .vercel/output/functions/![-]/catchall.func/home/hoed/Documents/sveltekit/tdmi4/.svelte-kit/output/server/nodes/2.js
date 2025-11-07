import * as server from '../entries/pages/admin/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.DPD_HhQy.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DGvkJv8w.js","_app/immutable/chunks/CpwqxlZF.js","_app/immutable/chunks/k-Px6GBH.js","_app/immutable/chunks/CVjgVAnJ.js","_app/immutable/chunks/BGAGA27e.js","_app/immutable/chunks/Dv0Cmu5j.js","_app/immutable/chunks/B-e77DC6.js","_app/immutable/chunks/BSHWkoDU.js","_app/immutable/chunks/ssx8ipy_.js","_app/immutable/chunks/D9BZNdtH.js","_app/immutable/chunks/BQCytejG.js","_app/immutable/chunks/NNX8jiUB.js","_app/immutable/chunks/Bp1Syr3r.js","_app/immutable/chunks/BZAb9vEf.js"];
export const stylesheets = [];
export const fonts = [];
