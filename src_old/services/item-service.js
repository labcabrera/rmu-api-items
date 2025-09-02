const items = require('../constants/items');

const findById = (id) => {
    const item = items.find(item => item.id === id);
    if (!item) {
        throw { status: 404, message: 'Item not found' }
    }
    return item;
}

const findAll = (category, page, size) => {
    const filtered = items.filter(e => {
        if(category && e.category != category) {
            return false;
        }
        return true;
    });
    const content = filtered.slice(page * size, (page + 1) * size);
    return { content: content, pagination: { page: page, size: size, totalElements: filtered.length } };
};

module.exports = {
    findById,
    findAll,
};