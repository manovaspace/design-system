// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
	site: "https://manovaspace.github.io",
	base: "/design-system",
	integrations: [
		starlight({
			title: "manovaspace design system",
			tagline: "MIT tokens, UI, and devtools (@manovaspace/*)",
			editLink: {
				baseUrl:
					"https://github.com/manovaspace/design-system/edit/main/apps/docs/src/content/docs/",
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/manovaspace/design-system",
				},
				{
					icon: "external",
					label: "Utilities docs",
					href: "https://manovaspace.github.io/ts/",
				},
				{
					icon: "external",
					label: "npm",
					href: "https://www.npmjs.com/org/manovaspace",
				},
			],
			sidebar: [
				{ label: "Getting started", slug: "getting-started" },
				{
					label: "Packages",
					items: [
						{ label: "tokens", slug: "packages/tokens" },
						{ label: "ui", slug: "packages/ui" },
						{ label: "devtools", slug: "packages/devtools" },
					],
				},
				{ label: "Contributing", slug: "contributing" },
			],
		}),
	],
});
