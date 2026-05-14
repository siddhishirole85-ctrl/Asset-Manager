/**
 * Rule-based recommendations from category, borrows, and reading signals.
 * @param {object} params
 * @param {Array<{ id?: number, title: string, category: string, recommendationTags?: string[] }>} params.candidates
 * @param {string[]} params.borrowedCategories
 * @param {string[]} params.interests
 * @param {number[]} params.viewedBookIds
 * @param {number[]} params.borrowedBookIds
 * @param {string} [params.fallbackTrendingReason]
 * @returns {{ recommended: Array<{ title: string, reason: string }> }}
 */
function buildRecommendations(params) {
  const {
    candidates,
    borrowedCategories = [],
    interests = [],
    viewedBookIds = [],
    borrowedBookIds = [],
    fallbackTrendingReason = "Popular with readers right now.",
  } = params;

  const borrowedSet = new Set(borrowedCategories);
  const interestSet = new Set(interests);
  const viewedSet = new Set(viewedBookIds);
  const borrowedIdSet = new Set(borrowedBookIds);

  const recommended = (candidates ?? []).map((book) => {
    let reason = fallbackTrendingReason;
    if (borrowedSet.has(book.category)) {
      reason = `Recommended because you read ${book.category} books.`;
    } else if (interestSet.has(book.category)) {
      reason = `${book.category} matches topics you have shown interest in.`;
    } else if (book.id != null && viewedSet.has(book.id)) {
      reason = "You recently viewed this title — worth a deeper read.";
    } else if (Array.isArray(book.recommendationTags) && book.recommendationTags.length > 0) {
      reason = `Aligned with your profile: ${book.recommendationTags.slice(0, 2).join(", ")}.`;
    }
    if (book.id != null && borrowedIdSet.has(book.id)) {
      reason = "You borrowed this before — a good candidate to revisit.";
    }
    return { title: book.title, reason };
  });

  return { recommended };
}

/**
 * @param {{ recommended: { title: string, reason: string }[] }} compact
 * @param {Array<{ id: number, title: string, author: string, category: string }>} candidatesSameOrder
 */
function enrichRecommendationList(compact, candidatesSameOrder) {
  return {
    recommended: compact.recommended.map((r, i) => {
      const b = candidatesSameOrder[i];
      return {
        title: r.title,
        author: b?.author ?? "",
        category: b?.category ?? "",
        reason: r.reason,
        bookId: b?.id ?? null,
      };
    }),
  };
}

module.exports = { buildRecommendations, enrichRecommendationList };
