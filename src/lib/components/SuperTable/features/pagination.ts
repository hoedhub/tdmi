export function paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
): T[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
}

export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage);
}

export function generatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisiblePages: number = 5
): (number | '...')[] {
    const pages: (number | '...')[] = [];

    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible pages around current
    const sidePages = Math.floor((maxVisiblePages - 2) / 2);
    let startPage = Math.max(2, currentPage - sidePages);
    let endPage = Math.min(totalPages - 1, currentPage + sidePages);

    // Adjust if current page is near the start
    if (currentPage - sidePages <= 2) {
        endPage = maxVisiblePages - 1;
    }

    // Adjust if current page is near the end
    if (currentPage + sidePages >= totalPages - 1) {
        startPage = totalPages - maxVisiblePages + 2;
    }

    // Add ellipsis and pages
    if (startPage > 2) {
        pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (endPage < totalPages - 1) {
        pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return pages;
}
