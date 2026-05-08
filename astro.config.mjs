import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import { remarkReadingTime } from './src/utils/remarkReadingTime.ts'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeExternalLinks from 'rehype-external-links'
import expressiveCode from 'astro-expressive-code'
import { expressiveCodeOptions } from './src/site.config'
import icon from 'astro-icon'
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: 'https://xiaosan-dev.github.io',
  integrations: [
    expressiveCode(expressiveCodeOptions),
    tailwind({
			applyBaseStyles: false
		}),
		sitemap(),
		mdx(),
		icon(),
		pagefind(),
  ],
  base: '/blog/',
  output: 'static',
  markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
			wrap: true,
			langs: ['java', 'html', 'javascript', 'swift', 'typescript', 'shell', 'kotlin', 'groovy'],
		},
		remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{
					target: '_blank',
					rel: ['nofollow', 'noopener', 'noreferrer']
				}
			]
		],
		remarkRehype: {
			footnoteLabelProperties: {
				className: ['']
			}
		}
	},
	prefetch: true,
});