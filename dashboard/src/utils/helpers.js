export const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    default: return 'priority-low';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
