const items = [
    {
        id: 'dager',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'dagger',
            skillId: 'melee-weapon:blade',
            fumble: 3,
            sizeAjustement: 0
        },
        weaponRange: [
            {
                from: 0,
                to: 0.1,
                bonus: 20
            },
            {
                from: 0.2,
                to: 10,
                bonus: 0
            },
            {

                from: 10.1,
                to: 20,
                bonus: -10
            },
            {
                from: 20.1,
                to: 30,
                bonus: -25
            },
            {
                from: 30.1,
                to: 40,
                bonus: -50
            },
            {
                from: 40.1,
                to: 50,
                bonus: -100
            }
        ],
        info: {
            cost: {
                value: 3,
                type: 'sp'
            },
            length: 1,
            strength: 80,
            weight: 1,
            productionTime: 1
        }
    },
    {
        id: 'short-sword',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:small',
            skillId: 'melee-weapon:blade',
            fumble: 3,
            sizeAjustement: -1
        },
        info: {
            cost: {
                value: 18,
                type: 'sp'
            },
            length: 2,
            strength: 80,
            weight: 3,
            productionTime: 2
        }
    },
    {
        id: 'arming-sword',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:medium',
            skillId: 'melee-weapon:blade',
            fumble: 4,
            sizeAjustement: 0
        },
        info: {
            cost: {
                value: 18,
                type: 'sp'
            },
            length: 4,
            strength: 70,
            weight: 2.5,
            productionTime: 4
        }
    },
    {
        id: 'epee',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'rapier:small',
            skillId: 'melee-weapon:blade',
            fumble: 3,
            sizeAjustement: -1
        },
        info: {
            cost: {
                value: 16,
                type: 'sp'
            },
            length: 3,
            strength: 80,
            weight: 1.5,
            productionTime: 5
        }
    },
    {
        id: 'rapier',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'rapier:medium',
            skillId: 'melee-weapon:blade',
            fumble: 4,
            sizeAjustement: 0
        },
        info: {
            cost: {
                value: 22,
                type: 'sp'
            },
            length: 4,
            strength: 85,
            weight: 4,
            productionTime: 7
        }
    },
    {
        id: 'broadsword',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'broadsword:medium',
            skillId: 'melee-weapon:blade',
            fumble: 4,
            sizeAjustement: 0
        },
        info: {
            cost: {
                value: 10,
                type: 'sp'
            },
            length: 3,
            strength: 80,
            weight: 4,
            productionTime: 3
        }
    },
    {
        id: 'scimitar',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'scimitar:medium',
            skillId: 'melee-weapon:blade',
            fumble: 4,
            sizeAjustement: 0
        },
        info: {
            cost: {
                value: 10,
                type: 'sp'
            },
            length: 3.5,
            strength: 60,
            weight: 3,
            productionTime: 3
        }
    },
    {
        id: 'machete',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'falchion:small',
            skillId: 'melee-weapon:blade',
            fumble: 3,
            sizeAjustement: -1
        },
        info: {
            cost: {
                value: 2,
                type: 'sp'
            },
            length: 1,
            strength: 70,
            weight: 1.5,
            productionTime: 1
        }
    },
    {
        id: 'falchion',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'falchion:medium',
            skillId: 'melee-weapon:blade',
            fumble: 5,
            sizeAjustement: 0
        },
        info: {
            cost: {
                value: 10,
                type: 'sp'
            },
            length: 3.5,
            strength: 60,
            weight: 3,
            productionTime: 3
        }
    },

    { id: 'claymore', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },
    { id: 'long-scimitar', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:greater-blade' },
    {
        id: 'longsword',
        category: 'weapon',
        weapon: {
            type: 'twoHands',
            attackTable: 'arming-sword:big',
            skillId: 'melee-weapon:blade',
            fumble: 5,
            sizeAjustement: 1
        },
        info: {
            cost: {
                value: 22,
                type: 'sp'
            },
            length: 5,
            strength: 75,
            weight: 6,
            productionTime: 5
        }
    },
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

module.exports = items;