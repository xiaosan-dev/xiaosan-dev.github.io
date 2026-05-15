import rss from '@astrojs/rss'
import { siteConfig } from '@/site.config'
import { getAllPosts } from '@/utils'

export async function GET() {
	const posts = await getAllPosts()

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `${import.meta.env.BASE_URL}post/${post.id}/`
		}))
	})
}
