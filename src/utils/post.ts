import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'
import { getReadingTime } from './readingTime'

/** Note: this function filters out draft post based on the environment */
export async function getAllPosts() {
	const posts = await getCollection('post', ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true
	})
	return posts.map((post) => {
		return {
			...post,
			data: {
				...post.data,
				minutesRead: getReadingTime(post.body ?? '')
			}
		}
	})
}

export function sortMDByDate(posts: Array<CollectionEntry<'post'>>) {
	return posts.sort((a, b) => {
		const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf()
		const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf()
		return bDate - aDate
	})
}

/** Note: This function doesn't filter draft post, pass it the result of getAllPosts above to do so. */
export function getAllTags(posts: Array<CollectionEntry<'post'>>) {
	return posts.flatMap((post) => [...post.data.tags])
}

/** Note: This function doesn't filter draft post, pass it the result of getAllPosts above to do so. */
export function getUniqueTags(posts: Array<CollectionEntry<'post'>>) {
	return [...new Set(getAllTags(posts))]
}

/** Note: This function doesn't filter draft post, pass it the result of getAllPosts above to do so. */
export function getUniqueTagsWithCount(
	posts: Array<CollectionEntry<'post'>>
): Array<[string, number]> {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
			new Map<string, number>()
		)
	].sort((a, b) => b[1] - a[1])
}

export function getPostUrlBySlug(slug: string): string {
	return url(`/post/${slug}/`)
}

export function url(path: string) {
	return joinUrl('', import.meta.env.BASE_URL, path)
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join('/')
	return joined.replace(/\/+/g, '/')
}
