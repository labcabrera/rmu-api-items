const items = [
    {
        id: 'dager',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'dagger',
            skillId: 'melee-weapon:blade',
            fumble: 3,
            sizeAdjustment: 0
        },
        weaponRange: [
            {
                from: 0,
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
            sizeAdjustment: -1
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
            sizeAdjustment: 0
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
            sizeAdjustment: -1
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
            sizeAdjustment: 0
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
            sizeAdjustment: 0
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
            sizeAdjustment: 0
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
            sizeAdjustment: -1
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
            sizeAdjustment: 0
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
        id: 'claymore',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'broadword:big',
            skillId: 'melee-weapon:greather-blade',
            fumble: 5,
            sizeAdjustment: 1
        },
        info: {
            cost: {
                value: 21,
                type: 'sp'
            },
            length: 5,
            strength: 80,
            weight: 7,
            productionTime: 5
        }
    },
    {
        id: 'long-scimitar',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'scimitar:big',
            skillId: 'melee-weapon:greather-blade',
            fumble: 5,
            sizeAdjustment: 1
        },
        info: {
            cost: {
                value: 19,
                type: 'sp'
            },
            length: 5,
            strength: 80,
            weight: 6,
            productionTime: 5
        }
    },
    {
        id: 'longsword',
        category: 'weapon',
        weapon: {
            type: 'twoHands',
            attackTable: 'arming-sword:big',
            skillId: 'melee-weapon:greather-blade',
            fumble: 5,
            sizeAdjustment: 1
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
    {
        id: 'great-falchion',
        category: 'weapon',
        weapon: {
            type: 'twoHands',
            attackTable: 'falchion:big',
            skillId: 'melee-weapon:greather-blade',
            fumble: 6,
            sizeAdjustment: 1
        },
        info: {
            cost: {
                value: 25,
                type: 'sp'
            },
            length: 4.5,
            strength: 80,
            weight: 7,
            productionTime: 5
        }
    },
    {
        id: 'light-flail',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'flail:small',
            skillId: 'melee-weapon:chain',
            fumble: 9,
            sizeAdjustment: 1
        },
        info: {
            cost: {
                value: 7,
                type: 'sp'
            },
            length: 3,
            strength: 55,
            weight: 3,
            productionTime: 1
        }
    },
    {
        id: 'flail',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'flail:medium',
            skillId: 'melee-weapon:chain',
            fumble: 10,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 16,
                type: 'sp'
            },
            length: 3.5,
            strength: 65,
            weight: 6,
            productionTime: 2
        }
    },
    {
        id: 'heavy-flail',
        category: 'weapon',
        weapon: {
            type: 'twoHands',
            attackTable: 'flail:big',
            skillId: 'melee-weapon:greater-chain',
            fumble: 10,
            sizeAdjustment: 1
        },
        info: {
            cost: {
                value: 19,
                type: 'sp'
            },
            length: 4,
            strength: 60,
            weight: 6,
            productionTime: 5
        }
    },
    {
        id: 'hand-axe',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'battle-axe:small',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: -1
        },
        weaponRange: [
            {
                from: 0,
                to: 15,
                bonus: 0
            },
            {
                from: 15.1,
                to: 30,
                bonus: -10
            },
            {
                from: 30.1,
                to: 45,
                bonus: -25
            },
            {
                from: 45.1,
                to: 60,
                bonus: -50
            },
            {
                from: 60.1,
                to: 75,
                bonus: -100
            }
        ],
        info: {
            cost: {
                value: 5,
                type: 'sp'
            },
            length: 2,
            strength: 55,
            weight: 1.5,
            productionTime: 5
        }
    },
    {
        id: 'battle-axe',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'battle-axe:medium',
            skillId: 'melee-weapon:hafted',
            fumble: 5,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 13,
                type: 'sp'
            },
            length: 3,
            strength: 55,
            weight: 3,
            productionTime: 3
        }
    },
    {
        id: 'blackjack',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'club:small',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: -1
        },
        info: {
            cost: {
                value: 1,
                type: 'cp'
            },
            length: 2,
            strength: 30,
            weight: 2,
            productionTime: 0.5
        }
    },
    {
        id: 'club',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'club:medium',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 1,
                type: 'cp'
            },
            length: 3,
            strength: 35,
            weight: 3.5,
            productionTime: 0.5
        }
    },
    {
        id: 'light-mace',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'mace:small',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 4,
                type: 'sp'
            },
            length: 3.5,
            strength: 55,
            weight: 4,
            productionTime: 2
        }
    },
    {
        id: 'mace',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'mace:medium',
            skillId: 'melee-weapon:hafted',
            fumble: 4,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 6,
                type: 'sp'
            },
            length: 1.5,
            strength: 80,
            weight: 6,
            productionTime: 2
        }
    },
    {
        id: 'ligth-stick',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'figthing-stick:small',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 1,
                type: 'cp'
            },
            length: 2,
            strength: 40,
            weight: 1.5,
            productionTime: 1/24
        }
    },
    {
        id: 'figthing-stick',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'figthing-stick:medium',
            skillId: 'melee-weapon:hafted',
            fumble: 3,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 3,
                type: 'cp'
            },
            length: 3,
            strength: 45,
            weight: 3,
            productionTime: 0.5
        }
    },
    {
        id: 'war-hammer',
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: 'war-hammer:medium',
            skillId: 'melee-weapon:hafted',
            fumble: 4,
            sizeAdjustment: 0
        },
        info: {
            cost: {
                value: 15,
                type: 'sp'
            },
            length: 3,
            strength: 65,
            weight: 3.5,
            productionTime: 2
        }
    },

    { id: 'glaive', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'halberd', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'poleaxe', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'spear', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },
    { id: 'long-spear', category: 'weapon', weaponRange: 'melee', weaponType: 'twoHands', attackTable: 'scimitar-medium', skillId: 'melee-weapon:pole-arm' },

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

    // Shields
    {
        id: 'target-shield',
        category: 'shield',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:medium',
            skillId: 'melee-weapon:shield-bash',
            fumble: 0,
            sizeAdjustment: 0
        },
        shield: {
            defensiveBonus: 15,
            maxAttacksBlocked: 1
        },
        info: {
            cost: {
                value: 35,
                type: 'bp'
            },
            strength: 50,
            productionTime: 3
        }
    },
    {
        id: 'normal-shield',
        category: 'shield',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:medium',
            skillId: 'melee-weapon:shield-bash',
            fumble: 0,
            sizeAdjustment: 0
        },
        shield: {
            defensiveBonus: 20,
            maxAttacksBlocked: 2
        },
        info: {
            cost: {
                value: 55,
                type: 'bp'
            },
            strength: 55,
            productionTime: 5
        }
    },
    {
        id: 'full-shield',
        category: 'shield',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:medium',
            skillId: 'melee-weapon:shield-bash',
            fumble: 0,
            sizeAdjustment: 0
        },
        shield: {
            defensiveBonus: 25,
            maxAttacksBlocked: 3
        },
        info: {
            cost: {
                value: 7,
                type: 'sp'
            },
            strength: 60,
            productionTime: 6
        }
    },
    {
        id: 'wall-shield',
        category: 'shield',
        weapon: {
            type: 'oneHand',
            attackTable: 'arming-sword:medium',
            skillId: 'melee-weapon:shield-bash',
            fumble: 0,
            sizeAdjustment: 0
        },
        shield: {
            defensiveBonus: 30,
            maxAttacksBlocked: 4
        },
        info: {
            cost: {
                value: 9,
                type: 'sp'
            },
            strength: 66,
            productionTime: 7
        }
    },

    // Armor
    {
        id: 'heavy-cloth-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 2,
            enc: 6,
            maneuver: -10,
            rangedPenalty: -5,
            perception: -5
        }, info: {
            cost: {
                value: 95,
                type: 'bp'
            },
            strength: 30,
            weight: 11,
            productionTime: 10
        }
    },
    {
        id: 'soft-leather-full-suit',
        category: 'fullSuit',
        armor: {
            slot: 'body',
            armorType: 3,
            enc: 7,
            maneuver: -15,
            rangedPenalty: -5,
            perception: -5
        }, info: {
            cost: {
                value: 10,
                type: 'sp'
            },
            strength: 30,
            weight: 13,
            productionTime: 10
        }
    },
    {
        id: 'hide-scale-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 4,
            enc: 11,
            maneuver: -35,
            rangedPenalty: -20,
            perception: -10
        }, info: {
            cost: {
                value: 14,
                type: 'sp'
            },
            strength: 35,
            weight: 20,
            productionTime: 15
        }
    },
    {
        id: 'laminar-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 5,
            enc: 12,
            maneuver: -45,
            rangedPenalty: -20,
            perception: -10
        }, info: {
            cost: {
                value: 36,
                type: 'sp'
            },
            strength: 40,
            weight: 22,
            productionTime: 25
        }
    },
    {
        id: 'rigid-leather-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 6,
            enc: 14,
            maneuver: -50,
            rangedPenalty: -20,
            perception: -10
        }, info: {
            cost: {
                value: 34,
                type: 'sp'
            },
            strength: 45,
            weight: 26,
            productionTime: 19
        }
    },
    {
        id: 'metal-scale-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 7,
            enc: 19,
            maneuver: -70,
            rangedPenalty: -30,
            perception: -15
        }, info: {
            cost: {
                value: 39,
                type: 'sp'
            },
            strength: 50,
            weight: 35,
            productionTime: 29
        }
    },
    {
        id: 'mail-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 8,
            enc: 21,
            maneuver: -80,
            rangedPenalty: -30,
            perception: -15
        }, info: {
            cost: {
                value: 60,
                type: 'sp'
            },
            strength: 55,
            weight: 39,
            productionTime: 58
        }
    },
    {
        id: 'brigandine-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 9,
            enc: 23,
            maneuver: -90,
            rangedPenalty: -30,
            perception: -15
        }, info: {
            cost: {
                value: 55,
                type: 'sp'
            },
            strength: 70,
            weight: 43,
            productionTime: 37
        }
    },
    {
        id: 'plate-full-suit',
        category: 'armor',
        armor: {
            slot: 'fullSuit',
            armorType: 10,
            enc: 25,
            maneuver: -100,
            rangedPenalty: -30,
            perception: -15
        }, info: {
            cost: {
                value: 65,
                type: 'sp'
            },
            strength: 75,
            weight: 46,
            productionTime: 44
        }
    }

];

module.exports = items;