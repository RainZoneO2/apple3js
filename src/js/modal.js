/**
 * Fullscreen viewer shown when a memory panel is clicked.
 */
const modalRoot = () => document.querySelector('#memory-modal')
const modalImg = () => document.querySelector('#modal-img')
const modalTitle = () => document.querySelector('#modal-title')
const modalDate = () => document.querySelector('#modal-date')

// Optional captions: { "<filename>": { "title": "...", "date": "..." } }
let metadata = null

export const initMetadata = async () => {
    try {
        const response = await fetch('/memories/metadata.json')
        if (!response.ok) return
        metadata = await response.json()
    } catch {
        // Captions are optional
    }
}

const lookupCaption = (url) => {
    if (!metadata) return {}
    const fileName = url.split('/').pop()
    return metadata[fileName] ?? {}
}

export const openMemory = ({ url, index }) => {
    const caption = lookupCaption(url)

    modalImg().src = url
    modalTitle().textContent = caption.title || prettifyFileName(url)
    modalDate().textContent = caption.date || ''
    modalRoot().classList.remove('hidden')

    if (typeof index === 'number') {
        history.replaceState(null, '', `#memory-${index}`)
    }
}

export const currentHashMemory = () => {
    const match = window.location.hash.match(/^#memory-(\d+)$/)
    return match ? Number(match[1]) : null
}

const prettifyFileName = (url) => {
    const base = url.split('/').pop().replace(/\.[^.]+$/, '')
    return base.replace(/[-_]+/g, ' ').trim()
}

export const closeModal = () => {
    modalRoot().classList.add('hidden')

    if (window.location.hash.startsWith('#memory-')) {
        history.replaceState(null, '', window.location.pathname)
    }
}

export const isModalOpen = () => !modalRoot().classList.contains('hidden')

export const initModal = () => {
    initMetadata()

    document.querySelector('#modal-close').addEventListener('click', closeModal)
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal)

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal()
    })
}
