/**
 * @type {import("cfw").Config}
 */
module.exports = {
	name: "web-vitals-api",
	zoneid: "2b88e3a435ca067ea04e8acd42fc08b4",
	accountid: "85a31fecb794eb22c6b5cd6f2ee073b8",
	entry: "./src/index.ts",
	routes: ["https://vitals.htm.io/*"],
	globals: {
		"METRICS": "KV:b23b569d751a4096bd1ab5bb625a3727",
	},
};
