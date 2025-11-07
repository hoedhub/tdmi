import * as server from '../entries/pages/admin/backup/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/backup/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/backup/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.eCuaj-5c.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DGvkJv8w.js","_app/immutable/chunks/k-Px6GBH.js","_app/immutable/chunks/B-e77DC6.js","_app/immutable/chunks/CVjgVAnJ.js","_app/immutable/chunks/BZAb9vEf.js","_app/immutable/chunks/NNX8jiUB.js","_app/immutable/chunks/DdYs4YV0.js","_app/immutable/chunks/BQCytejG.js","_app/immutable/chunks/CpwqxlZF.js","_app/immutable/chunks/BgMYObx_.js","_app/immutable/chunks/Bp1Syr3r.js","_app/immutable/chunks/Dv0Cmu5j.js","_app/immutable/chunks/BSHWkoDU.js","_app/immutable/chunks/ssx8ipy_.js","_app/immutable/chunks/C1VdhE22.js","_app/immutable/chunks/DOTQWmuI.js","_app/immutable/chunks/C_84GNR8.js"];
export const stylesheets = ["_app/immutable/assets/ToastContainer.CYpD-bzK.css"];
export const fonts = [];
