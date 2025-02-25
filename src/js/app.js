/**
 * @typedef {Object} Paper
 * @property {number} id - Unique identifier
 * @property {string} title - Paper title
 * @property {string} author - Paper author(s)
 * @property {string} category - Paper category
 * @property {string} description - Paper description or abstract
 * @property {string} dateAdded - ISO date string
 * @property {string} fileName - Name of the file
 * @property {string} [template] - Template type if generated
 * @property {string[]} [sections] - Template sections if generated
 * @property {string} [format] - Template format if generated
 * @property {Object} [content] - Template content if generated
 */

/**
 * @typedef {Object} Template
 * @property {string[]} sections - Template sections
 * @property {string} format - Template format (e.g., 'APA', 'IEEE')
 */

// Paper templates configuration
const paperTemplates = {
    research: {
        sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
        format: 'APA 7th Edition'
    },
    review: {
        sections: ['Abstract', 'Introduction', 'Literature Review', 'Analysis', 'Discussion', 'Conclusion', 'References'],
        format: 'IEEE'
    },
    technical: {
        sections: ['Abstract', 'Introduction', 'System Overview', 'Implementation', 'Evaluation', 'Conclusion', 'References'],
        format: 'ACM'
    }
};

/** @type {Paper[]} */
let papers = [
    {
        id: 1,
        title: "Introduction to Machine Learning",
        author: "John Doe",
        category: "Computer Science",
        description: "A comprehensive overview of machine learning fundamentals",
        dateAdded: "2024-02-25",
        fileName: "intro_to_ml.pdf"
    }
];

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    generateBtn: document.getElementById('generateBtn'),
    uploadModal: document.getElementById('uploadModal'),
    editModal: document.getElementById('editModal'),
    generateModal: document.getElementById('generateModal'),
    uploadForm: document.getElementById('uploadForm'),
    editForm: document.getElementById('editForm'),
    generateForm: document.getElementById('generateForm'),
    papersGrid: document.getElementById('papers'),
    sortSelect: document.getElementById('sortBy')
};

// Toast notification system
const toast = {
    container: null,
    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {'success'|'error'|'warning'} type - Toast type
     * @param {number} [duration=3000] - Duration in milliseconds
     */
    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Loading state management
const loading = {
    /**
     * Add loading state to an element
     * @param {HTMLElement} element - Element to add loading state to
     */
    start(element) {
        element.classList.add('loading');
        if (element.tagName === 'BUTTON') {
            element.disabled = true;
        }
    },
    /**
     * Remove loading state from an element
     * @param {HTMLElement} element - Element to remove loading state from
     */
    stop(element) {
        element.classList.remove('loading');
        if (element.tagName === 'BUTTON') {
            element.disabled = false;
        }
    }
};

// Error handling utility
const errorHandler = {
    /**
     * Handle an error and show appropriate notification
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     */
    handle(error, context) {
        console.error(`Error in ${context}:`, error);
        toast.show(
            error.message || `An error occurred while ${context}`,
            'error'
        );
    }
};

// Initialize toast system
document.addEventListener('DOMContentLoaded', () => toast.init());

// Event Listeners
elements.searchBtn.addEventListener('click', handleSearch);
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

elements.uploadBtn.addEventListener('click', () => {
    elements.uploadModal.classList.add('active');
    elements.uploadModal.style.display = 'block';
});

elements.generateBtn.addEventListener('click', () => {
    elements.generateModal.classList.add('active');
    elements.generateModal.style.display = 'block';
});

elements.uploadForm.addEventListener('submit', handleUpload);
elements.editForm.addEventListener('submit', handleEdit);
elements.generateForm.addEventListener('submit', handleGenerate);

document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => closeModals());
});

elements.sortSelect.addEventListener('change', handleSort);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});

/**
 * Close all modal dialogs
 */
function closeModals() {
    [elements.uploadModal, elements.editModal, elements.generateModal].forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

/**
 * Handle file upload
 * @param {Event} e - Submit event
 */
async function handleUpload(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.submit-btn');
    
    try {
        loading.start(submitBtn);
        const formData = new FormData(elements.uploadForm);
        
        const paper = {
            id: papers.length + 1,
            title: formData.get('title'),
            author: formData.get('author'),
            category: formData.get('category'),
            description: formData.get('description'),
            dateAdded: new Date().toISOString().split('T')[0],
            fileName: formData.get('file').name
        };

        // Simulate file upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        papers.push(paper);
        closeModals();
        elements.uploadForm.reset();
        renderPapers(papers);
        toast.show('Paper uploaded successfully', 'success');
    } catch (error) {
        errorHandler.handle(error, 'uploading paper');
    } finally {
        loading.stop(submitBtn);
    }
}

/**
 * Handle paper edit
 * @param {Event} e - Submit event
 */
async function handleEdit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.submit-btn');
    
    try {
        loading.start(submitBtn);
        const formData = new FormData(elements.editForm);
        const paperId = parseInt(formData.get('paperId'));
        
        const paperIndex = papers.findIndex(p => p.id === paperId);
        if (paperIndex === -1) throw new Error('Paper not found');

        // Simulate edit delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        papers[paperIndex] = {
            ...papers[paperIndex],
            title: formData.get('title'),
            author: formData.get('author'),
            category: formData.get('category'),
            description: formData.get('description')
        };

        closeModals();
        elements.editForm.reset();
        renderPapers(papers);
        toast.show('Paper updated successfully', 'success');
    } catch (error) {
        errorHandler.handle(error, 'editing paper');
    } finally {
        loading.stop(submitBtn);
    }
}

/**
 * Open edit modal for a paper
 * @param {number} id - Paper ID
 */
function openEditModal(id) {
    try {
        const paper = papers.find(p => p.id === id);
        if (!paper) throw new Error('Paper not found');

        const form = elements.editForm;
        form.querySelector('[name="paperId"]').value = paper.id;
        form.querySelector('[name="title"]').value = paper.title;
        form.querySelector('[name="author"]').value = paper.author;
        form.querySelector('[name="category"]').value = paper.category;
        form.querySelector('[name="description"]').value = paper.description;

        elements.editModal.classList.add('active');
        elements.editModal.style.display = 'block';
    } catch (error) {
        errorHandler.handle(error, 'opening edit modal');
    }
}

/**
 * Delete a paper
 * @param {number} id - Paper ID
 */
async function deletePaper(id) {
    try {
        if (!confirm('Are you sure you want to delete this paper?')) return;
        
        const paperElement = document.querySelector(`[data-paper-id="${id}"]`);
        if (paperElement) {
            loading.start(paperElement);
        }

        // Simulate delete delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        papers = papers.filter(paper => paper.id !== id);
        renderPapers(papers);
        toast.show('Paper deleted successfully', 'success');
    } catch (error) {
        errorHandler.handle(error, 'deleting paper');
    }
}

/**
 * Handle paper generation
 * @param {Event} e - Submit event
 */
async function handleGenerate(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.submit-btn');
    
    try {
        loading.start(submitBtn);
        const formData = new FormData(elements.generateForm);
        
        const templateType = formData.get('template');
        const template = paperTemplates[templateType];
        if (!template) throw new Error('Invalid template type');
        
        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const paper = {
            id: papers.length + 1,
            title: formData.get('title'),
            author: formData.get('author'),
            category: formData.get('category'),
            description: formData.get('abstract'),
            dateAdded: new Date().toISOString().split('T')[0],
            fileName: `${formData.get('title').toLowerCase().replace(/\s+/g, '_')}.pdf`,
            template: templateType,
            sections: template.sections,
            format: template.format,
            content: generatePaperContent(formData, template)
        };

        papers.push(paper);
        closeModals();
        elements.generateForm.reset();
        renderPapers(papers);
        toast.show('Paper template generated successfully', 'success');
    } catch (error) {
        errorHandler.handle(error, 'generating paper');
    } finally {
        loading.stop(submitBtn);
    }
}

/**
 * Generate paper content based on template
 * @param {FormData} formData - Form data
 * @param {Template} template - Paper template
 * @returns {Object} Generated content
 */
function generatePaperContent(formData, template) {
    const content = {};
    template.sections.forEach(section => {
        content[section] = formData.get(section.toLowerCase()) || `[${section} content will be generated here]`;
    });
    return content;
}

/**
 * Handle search functionality
 */
function handleSearch() {
    try {
        loading.start(elements.searchBtn);
        const searchTerm = elements.searchInput.value.toLowerCase();
        const filteredPapers = papers.filter(paper => 
            paper.title.toLowerCase().includes(searchTerm) ||
            paper.author.toLowerCase().includes(searchTerm) ||
            paper.description.toLowerCase().includes(searchTerm)
        );
        renderPapers(filteredPapers);
    } catch (error) {
        errorHandler.handle(error, 'searching papers');
    } finally {
        loading.stop(elements.searchBtn);
    }
}

/**
 * Handle sort functionality
 */
function handleSort() {
    try {
        loading.start(elements.sortSelect);
        const sortValue = elements.sortSelect.value;
        const sortedPapers = [...papers].sort((a, b) => {
            switch (sortValue) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'date':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                default:
                    return 0;
            }
        });
        renderPapers(sortedPapers);
    } catch (error) {
        errorHandler.handle(error, 'sorting papers');
    } finally {
        loading.stop(elements.sortSelect);
    }
}

/**
 * Render papers to the grid
 * @param {Paper[]} papersList - List of papers to render
 */
function renderPapers(papersList) {
    elements.papersGrid.innerHTML = papersList.map(paper => `
        <div class="paper-card" data-paper-id="${paper.id}">
            <h3>${paper.title}</h3>
            <p><strong>Author:</strong> ${paper.author}</p>
            <p><strong>Category:</strong> ${paper.category}</p>
            <p>${paper.description}</p>
            ${paper.template ? `
                <p><strong>Template:</strong> ${paper.template} (${paper.format})</p>
                <p><strong>Sections:</strong> ${paper.sections.join(', ')}</p>
            ` : ''}
            <div class="paper-actions">
                <button onclick="downloadPaper(${paper.id})" class="download-btn">Download</button>
                <button onclick="sharePaper(${paper.id})" class="share-btn">Share</button>
                <button onclick="openEditModal(${paper.id})" class="edit-btn">Edit</button>
                <button onclick="deletePaper(${paper.id})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Download a paper
 * @param {number} id - Paper ID
 */
async function downloadPaper(id) {
    const button = document.querySelector(`[data-paper-id="${id}"] .download-btn`);
    try {
        loading.start(button);
        const paper = papers.find(p => p.id === id);
        if (!paper) throw new Error('Paper not found');

        // Simulate download delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.show(`Downloading ${paper.fileName}...`, 'success');
    } catch (error) {
        errorHandler.handle(error, 'downloading paper');
    } finally {
        loading.stop(button);
    }
}

/**
 * Share a paper
 * @param {number} id - Paper ID
 */
async function sharePaper(id) {
    const button = document.querySelector(`[data-paper-id="${id}"] .share-btn`);
    try {
        loading.start(button);
        const paper = papers.find(p => p.id === id);
        if (!paper) throw new Error('Paper not found');

        // Simulate share delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const shareUrl = `https://raddaran-paper.com/share/${paper.id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.show('Share link copied to clipboard', 'success');
    } catch (error) {
        errorHandler.handle(error, 'sharing paper');
    } finally {
        loading.stop(button);
    }
}

// Initial render
renderPapers(papers);
