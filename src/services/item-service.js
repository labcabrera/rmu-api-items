const items = [
    { id: 'dager', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'short-sword', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'arming-sword', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'epee', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'rapier', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'broadsword', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'scimitar', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'machete', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },
    { id: 'falchion', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:blade' },

    { id: 'claymore', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },
    { id: 'long-scimitar', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },
    { id: 'longsword', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },
    { id: 'great-falchion', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },

    { id: 'light-flail', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:chain' },
    { id: 'flail', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:chain' },

    { id: 'heavy-flail', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-chain' },

    { id: 'hand-axe', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'battle-axe', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'blackjack', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'club', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'light-mace', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'figthing-stick', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },
    { id: 'war-hammer', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:hafted' },

    { id: 'glaive', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'halberd', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'poleaxe', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'spear', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'long-spear', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },

    { id: 'target-shield', category: 'shield', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:shield-bash' },
    { id: 'normal-shield', category: 'shield', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:shield-bash' },
    { id: 'full-shield', category: 'shield', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:shield-bash' },
    { id: 'wall-shield', category: 'shield', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'melee-weapon:shield-bash' },

    { id: 'whip', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'exotic-weapon' },
    { id: 'small-net', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'exotic-weapon' },
    { id: 'net', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'exotic-weapon' },
    { id: 'large-net', category: 'weapon', weaponRange: 'melee', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: 'exotic-weapon' },

    { id: 'short-bow', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':bow' },
    { id: 'composite-bow', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':bow' },
    { id: 'long-bow', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':bow' },

    { id: 'hand-crossbow', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':crossbow' },
    { id: 'crossbow', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':crossbow' },
    { id: 'heavy-crossbow', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':crossbow' },

    { id: 'slingshot', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':sling' },
    { id: 'sling', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':sling' },
    { id: 'staff-sling', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':sling' },

    { id: 'bola', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'throwing-club', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'javelin', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'dart', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'small-rock', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'rock', category: 'weapon', weaponRange: 'ranged', weaponType: 'oneHand', attackTable: 'scimitar-medium', skillId: ':thrown' },
    { id: 'heavy-rock', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':thrown' },

    { id: 'blowpipe', category: 'weapon', weaponRange: 'ranged', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: ':exotic-ranged' },

];


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