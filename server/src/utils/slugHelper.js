const generateSlug = (text) => {
  if (!text) return 'post-' + Date.now().toString().slice(-4);
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  generateSlug
};
