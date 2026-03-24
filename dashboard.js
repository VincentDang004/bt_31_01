// Global variables
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let currentSort = {
    field: null,
    direction: 'asc'
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    getAll();

    // Event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('pageSize').addEventListener('change', handlePageSizeChange);
});

/**
 * Fetch all products from API
 */
async function getAll() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allProducts = await response.json();

        if (!Array.isArray(allProducts)) {
            allProducts = [];
        }

        console.log(`✓ Loaded ${allProducts.length} products`);
        filteredProducts = [...allProducts];
        currentPage = 1;

        renderTable();

    } catch (error) {
        console.error('Error fetching products:', error);
        showMessage(`❌ Failed to load products: ${error.message}`, 'error');
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #c0392b;">
                    Error loading products. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

/**
 * Handle search functionality
 */
function handleSearch(e) {
    const searchText = e.target.value.toLowerCase().trim();
    currentPage = 1;

    if (searchText === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => {
            const title = (product.title || '').toLowerCase();
            return title.includes(searchText);
        });
    }

    renderTable();
}

/**
 * Handle page size change
 */
function handlePageSizeChange(e) {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
}

/**
 * Sort table data
 */
function sortTable(field) {
    // Toggle direction if same field
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }

    // Sort filtered data
    filteredProducts.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        // Handle numeric values
        if (field === 'price') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
            return currentSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Handle string values
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (currentSort.direction === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });

    currentPage = 1;
    updateSortButtonState();
    renderTable();
}

/**
 * Render table rows
 */
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredProducts.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #95a5a6;">
                    📭 No products found
                </td>
            </tr>
        `;
        updatePagination();
        updateInfo();
        return;
    }

    tableBody.innerHTML = pageData.map(product => {
        const image = product.images && product.images.length > 0
            ? product.images[0]
            : 'https://via.placeholder.com/70x55?text=No+Image';
        const title = product.title || 'N/A';
        const price = product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A';
        const category = product.category ? (product.category.name || 'N/A') : 'N/A';
        const description = product.description || 'No description';

        return `
            <tr>
                <td>
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" 
                         class="product-img" 
                         onclick="window.open('${escapeHtml(image)}', '_blank')"
                         onerror="this.src='https://via.placeholder.com/70x55?text=Error'">
                </td>
                <td class="product-name">${escapeHtml(title)}</td>
                <td class="product-price">${escapeHtml(price)}</td>
                <td><span class="category-tag">${escapeHtml(category)}</span></td>
                <td>
                    <div class="desc-cell">
                        ${escapeHtml(description.substring(0, 50))}...
                        <div class="desc-tooltip">${escapeHtml(description)}</div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updatePagination();
    updateInfo();
    updateSortIndicators();
}

/**
 * Update pagination buttons
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginationDiv = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>← Previous</button>`;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span>...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span>...</span>`;
        }
        html += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    html += `<button onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;

    paginationDiv.innerHTML = html;
}

/**
 * Navigate to specific page
 */
function goToPage(page) {
    currentPage = page;
    renderTable();
    window.scrollTo(0, 0);
}

/**
 * Go to previous page
 */
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        window.scrollTo(0, 0);
    }
}

/**
 * Go to next page
 */
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        window.scrollTo(0, 0);
    }
}

/**
 * Update info text
 */
function updateInfo() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredProducts.length);
    const total = filteredProducts.length;

    const infoText = `Showing ${startItem}–${endItem} of ${total} products (Page ${currentPage}/${totalPages})`;
    document.getElementById('infoText').textContent = infoText;
}

/**
 * Update sort indicators in table headers
 */
function updateSortIndicators() {
    const headers = document.querySelectorAll('th.sortable');
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        const field = header.textContent.toLowerCase();
        if (currentSort.field === 'title' && field.includes('name')) {
            header.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        } else if (currentSort.field === 'price' && field.includes('price')) {
            header.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

/**
 * Update sort button states
 */
function updateSortButtonState() {
    const buttons = document.querySelectorAll('.sort-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Name') && currentSort.field === 'title') {
            btn.classList.add('active');
        }
        if (btn.textContent.includes('Price') && currentSort.field === 'price') {
            btn.classList.add('active');
        }
    });
}

/**
 * Show message
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    let className = 'alert';

    if (type === 'error') {
        className += ' error';
    } else if (type === 'success') {
        className += ' success';
    }

    messageDiv.innerHTML = `<div class="${className}">${escapeHtml(text)}</div>`;

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
