import readingTime from 'reading-time'

export function getReadingTime(text: string) {
	return readingTime(text).text
}
