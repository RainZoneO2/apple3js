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

export const openMemory = ({ url }) => {
    const caption = lookupCaption(url)

    modalImg().src = url
    modalTitle().textContent = caption.title || prettifyFileName(url)
    modalDate().textContent = caption.date || ''
    modalRoot().classList.remove('hidden')
}

const prettifyFileName = (url) => {
    const base = url.split('/').pop().replace(/\.[^.]+$/, '')
    return base.replace(/[-_]+/g, ' ').trim()
}

export const closeModal = () => {
    modalRoot().classList.add('hidden')
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
