

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.BO3_W6NG.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/Dv0Cmu5j.js","_app/immutable/chunks/DGvkJv8w.js"];
export const stylesheets = [];
export const fonts = [];
