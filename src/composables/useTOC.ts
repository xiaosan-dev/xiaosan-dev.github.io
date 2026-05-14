type TOCItem = {
	heading: HTMLElement
	link: HTMLAnchorElement
}

export function useTOC() {
	let observer: IntersectionObserver | null = null

	// ======================
	// utils
	// ======================
	const getTOCItems = (): TOCItem[] => {
		const links = document.querySelectorAll<HTMLAnchorElement>('.toc-link')

		const items: TOCItem[] = []

		links.forEach((link) => {
			const id = link.getAttribute('href')?.slice(1)
			if (!id) return

			const heading = document.getElementById(id)
			if (!heading) return

			items.push({ heading, link })
		})

		return items
	}

	// ======================
	// TOC observer
	// ======================
	const createTOCObserver = (items: TOCItem[]) => {
		const links = items.map((i) => i.link)
		const visible = new Set<HTMLElement>()

		const setActive = (link: HTMLAnchorElement | null) => {
			links.forEach((l) => (l.dataset.active = 'false'))
			if (link) link.dataset.active = 'true'
		}

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLElement

					if (entry.isIntersecting) visible.add(el)
					else visible.delete(el)
				}

				if (!visible.size) return

				const active = [...visible].sort(
					(a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
				)[0]

				const match = items.find((i) => i.heading === active)

				setActive(match?.link ?? null)
			},
			{
				rootMargin: '-15% 0px -70% 0px',
				threshold: 0
			}
		)

		items.forEach((i) => observer!.observe(i.heading))

		// initial state
		requestAnimationFrame(() => {
			const first = items.find((i) => i.heading.getBoundingClientRect().top >= 0) ?? items[0]

			setActive(first?.link ?? null)
		})
	}

	// ======================
	// progress bar
	// ======================
	const createProgress = () => {
		const bar = document.querySelector<HTMLDivElement>('.toc-progress-bar')
		if (!bar) return

		const update = () => {
			const scrollTop = window.scrollY
			const docHeight = document.documentElement.scrollHeight - window.innerHeight

			const progress = docHeight > 0 ? scrollTop / docHeight : 0

			const parent = bar.parentElement
			if (!parent) return

			const movable = parent.clientHeight - bar.clientHeight

			bar.style.transform = `translateY(${movable * progress}px)`
		}

		window.addEventListener('scroll', update, {
			passive: true
		})

		update()
	}

	// ======================
	// mount
	// ======================
	const mount = () => {
		const items = getTOCItems()
		if (!items.length) return

		createTOCObserver(items)
		createProgress()
	}

	const destroy = () => {
		observer?.disconnect()
		observer = null
	}

	return {
		mount,
		destroy
	}
}
