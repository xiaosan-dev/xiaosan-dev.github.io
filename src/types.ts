export interface SiteConfig {
	author: string
	title: string
	description: string
	lang: string
	ogLocale: string
	date: {
		locale: string | string[] | undefined
		options: Intl.DateTimeFormatOptions
	}
}

export interface PaginationLink {
	url: string
	text?: string
	srLabel?: string
}

export interface SiteMeta {
	title?: string
	description?: string
	ogImage?: string | undefined
	articleDate?: string | undefined
}
