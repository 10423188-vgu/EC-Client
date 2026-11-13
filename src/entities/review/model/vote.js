export const getNextReviewVote = (currentVote, clickedVote) =>
  currentVote === clickedVote ? null : clickedVote
