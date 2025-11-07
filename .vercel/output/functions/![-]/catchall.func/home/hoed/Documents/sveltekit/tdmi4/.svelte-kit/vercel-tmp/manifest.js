export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.jpg","favicon.png","fonts/NotoNaskhArabic-VariableFont_wght.ttf","fonts/NotoSansArabic-Regular.ttf"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".ttf":"font/ttf"},
	_: {
		client: {start:"_app/immutable/entry/start.BJqPS67j.js",app:"_app/immutable/entry/app.v5Hq4ZHY.js",imports:["_app/immutable/entry/start.BJqPS67j.js","_app/immutable/chunks/BQCytejG.js","_app/immutable/chunks/CpwqxlZF.js","_app/immutable/chunks/DGvkJv8w.js","_app/immutable/chunks/k-Px6GBH.js","_app/immutable/chunks/CVjgVAnJ.js","_app/immutable/chunks/NNX8jiUB.js","_app/immutable/entry/app.v5Hq4ZHY.js","_app/immutable/chunks/PPVm8Dsz.js","_app/immutable/chunks/DOTQWmuI.js","_app/immutable/chunks/DGvkJv8w.js","_app/immutable/chunks/k-Px6GBH.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CpwqxlZF.js","_app/immutable/chunks/CVjgVAnJ.js","_app/immutable/chunks/B-e77DC6.js","_app/immutable/chunks/C1VdhE22.js","_app/immutable/chunks/BGAGA27e.js","_app/immutable/chunks/BZAb9vEf.js","_app/immutable/chunks/NNX8jiUB.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/15.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/17.js')),
			__memo(() => import('../output/server/nodes/18.js')),
			__memo(() => import('../output/server/nodes/19.js')),
			__memo(() => import('../output/server/nodes/20.js')),
			__memo(() => import('../output/server/nodes/21.js')),
			__memo(() => import('../output/server/nodes/22.js')),
			__memo(() => import('../output/server/nodes/23.js')),
			__memo(() => import('../output/server/nodes/24.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/backup",
				pattern: /^\/admin\/backup\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/piket",
				pattern: /^\/admin\/piket\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/piket/susun",
				pattern: /^\/admin\/piket\/susun\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/rbac",
				pattern: /^\/admin\/rbac\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/users",
				pattern: /^\/admin\/users\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/users/new",
				pattern: /^\/admin\/users\/new\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/users/table",
				pattern: /^\/admin\/users\/table\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/admin/users/table/_server.ts.js'))
			},
			{
				id: "/admin/users/[userId]/delete",
				pattern: /^\/admin\/users\/([^/]+?)\/delete\/?$/,
				params: [{"name":"userId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/admin/users/_userId_/delete/_server.ts.js'))
			},
			{
				id: "/admin/users/[userId]/edit",
				pattern: /^\/admin\/users\/([^/]+?)\/edit\/?$/,
				params: [{"name":"userId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,3,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/api/backup",
				pattern: /^\/api\/backup\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/backup/_server.ts.js'))
			},
			{
				id: "/api/deskel",
				pattern: /^\/api\/deskel\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/deskel/_server.ts.js'))
			},
			{
				id: "/api/kecamatan",
				pattern: /^\/api\/kecamatan\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/kecamatan/_server.ts.js'))
			},
			{
				id: "/api/kokab",
				pattern: /^\/api\/kokab\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/kokab/_server.ts.js'))
			},
			{
				id: "/api/logout",
				pattern: /^\/api\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/logout/_server.ts.js'))
			},
			{
				id: "/api/murid",
				pattern: /^\/api\/murid\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/_server.ts.js'))
			},
			{
				id: "/api/murid/DELETE",
				pattern: /^\/api\/murid\/DELETE\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/DELETE/_server.ts.js'))
			},
			{
				id: "/api/murid/fotos",
				pattern: /^\/api\/murid\/fotos\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/fotos/_server.ts.js'))
			},
			{
				id: "/api/murid/search",
				pattern: /^\/api\/murid\/search\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/search/_server.ts.js'))
			},
			{
				id: "/api/murid/similar",
				pattern: /^\/api\/murid\/similar\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/similar/_server.ts.js'))
			},
			{
				id: "/api/murid/[id]",
				pattern: /^\/api\/murid\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/murid/_id_/_server.ts.js'))
			},
			{
				id: "/api/piket-schedule",
				pattern: /^\/api\/piket-schedule\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/piket-schedule/_server.ts.js'))
			},
			{
				id: "/api/piket-schedule/batch",
				pattern: /^\/api\/piket-schedule\/batch\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/piket-schedule/batch/_server.ts.js'))
			},
			{
				id: "/api/piket-schedule/[id]",
				pattern: /^\/api\/piket-schedule\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/piket-schedule/_id_/_server.ts.js'))
			},
			{
				id: "/api/propinsi",
				pattern: /^\/api\/propinsi\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/propinsi/_server.ts.js'))
			},
			{
				id: "/api/wilayah-by-deskel",
				pattern: /^\/api\/wilayah-by-deskel\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/wilayah-by-deskel/_server.ts.js'))
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/member",
				pattern: /^\/member\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/member/nasyath_mun",
				pattern: /^\/member\/nasyath_mun\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/member/nasyath_mun/export",
				pattern: /^\/member\/nasyath_mun\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/member/nasyath_mun/export/_server.ts.js'))
			},
			{
				id: "/member/nasyath_mun/new",
				pattern: /^\/member\/nasyath_mun\/new\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/member/nasyath_mun/table",
				pattern: /^\/member\/nasyath_mun\/table\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/member/nasyath_mun/table/_server.ts.js'))
			},
			{
				id: "/member/nasyath_mun/[nasyathId]/delete",
				pattern: /^\/member\/nasyath_mun\/([^/]+?)\/delete\/?$/,
				params: [{"name":"nasyathId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/member/nasyath_mun/_nasyathId_/delete/_server.ts.js'))
			},
			{
				id: "/member/nasyath_mun/[nasyathId]/edit",
				pattern: /^\/member\/nasyath_mun\/([^/]+?)\/edit\/?$/,
				params: [{"name":"nasyathId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/member/nasyath",
				pattern: /^\/member\/nasyath\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/member/pendataan",
				pattern: /^\/member\/pendataan\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/member/pendataan/new",
				pattern: /^\/member\/pendataan\/new\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/member/pendataan/table",
				pattern: /^\/member\/pendataan\/table\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/member/pendataan/table/_server.ts.js'))
			},
			{
				id: "/member/pendataan/[muridId]/delete",
				pattern: /^\/member\/pendataan\/([^/]+?)\/delete\/?$/,
				params: [{"name":"muridId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/member/pendataan/_muridId_/delete/_server.ts.js'))
			},
			{
				id: "/member/pendataan/[muridId]/edit",
				pattern: /^\/member\/pendataan\/([^/]+?)\/edit\/?$/,
				params: [{"name":"muridId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/member/profile",
				pattern: /^\/member\/profile\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/member/users",
				pattern: /^\/member\/users\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 24 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
