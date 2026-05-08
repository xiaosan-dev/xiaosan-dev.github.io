import { siteConfig } from '@/site.config'

const dateFormat = new Intl.DateTimeFormat(siteConfig.date.locale, siteConfig.date.options)

export function getFormattedDate(
	date: string | number | Date,
	options?: Intl.DateTimeFormatOptions
) {
	if (typeof options !== 'undefined') {
		return new Date(date).toLocaleDateString(siteConfig.date.locale, {
			...(siteConfig.date.options as Intl.DateTimeFormatOptions),
			...options
		})
	}

	return dateFormat.format(new Date(date))
}

export function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${month}-${day}`
}
