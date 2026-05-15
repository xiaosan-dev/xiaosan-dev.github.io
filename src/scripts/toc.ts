import { useTOC } from '@/composables'

const toc = useTOC()

function init() {
	requestAnimationFrame(() => {
		toc.mount()
	})
}

if (document.readyState !== 'loading') {
	init()
} else {
	document.addEventListener('DOMContentLoaded', init, {
		once: true
	})
}

document.addEventListener('astro:after-swap', init)
