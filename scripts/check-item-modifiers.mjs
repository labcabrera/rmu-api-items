#!/usr/bin/env node
// Spec 044, decision 10 (F-items-23): the creation and the PATCH of an item check its modifiers with the rules of
// GET /v1/item-modifiers/options (checkItemModifier). Before, only POST .../modifiers checked them, so stored items may
// break the rules, and a PATCH that sends their modifiers back would answer 400.
//
// The script is read-only: it lists the stored items whose modifiers checkItemModifier rejects, and changes nothing.
// Fix those items (by hand or through the API) before deploying the API that checks them.
//
// Usage, with the connection string of the items database in the environment (the script never reads .env):
//
//   RMU_MONGO_ITEMS_URI='mongodb://<user>:<password>@<host>:27017/rmu-items?authSource=admin' DRY_RUN=1 \
//     node scripts/check-item-modifiers.mjs
//
// It exits with 1 when an item breaks the rules. DRY_RUN is accepted for symmetry with the other scripts: there is no
// write mode.
import mongoose from 'mongoose';

const COLLECTION = 'items';

// Same rules as ITEM_MODIFIER_OPTIONS in src/modules/items/domain/value-objects/item-modifier-option.vo.ts: keep both
// in step.
const OPTIONS = {
  bonus: { value: 'required', modifier: 'forbidden' },
  'item-damage': { value: 'required', modifier: 'forbidden' },
  'skill-bonus': { value: 'required', modifier: 'required' },
  material: { value: 'forbidden', modifier: 'required' },
  slayer: { value: 'forbidden', modifier: 'required' },
};

/** The reason checkItemModifier would reject the modifier, or null. */
function problem({ type, modifier, value }) {
  const option = OPTIONS[type];
  if (!option) return `invalid modifier type ${type}`;
  for (const [field, current] of [
    ['value', value],
    ['modifier', modifier],
  ]) {
    const present = current !== null && current !== undefined && current !== '';
    if (option[field] === 'required' && !present) return `a ${type} modifier requires a ${field}`;
    if (option[field] === 'forbidden' && present) return `a ${type} modifier does not allow a ${field}`;
  }
  return null;
}

const uri = process.env.RMU_MONGO_ITEMS_URI;
if (!uri) {
  console.error('RMU_MONGO_ITEMS_URI is not set: export the connection string of the items database first.');
  process.exit(2);
}

await mongoose.connect(uri, { autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 10_000 });
let exitCode = 0;
try {
  const db = mongoose.connection.db;
  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  console.log(`Database ${db.databaseName}, collection ${COLLECTION}${exists ? '' : ' (missing)'} (read-only)`);
  if (exists) {
    const collection = db.collection(COLLECTION);
    const cursor = collection.find(
      { 'modifiers.0': { $exists: true } },
      { projection: { _id: 1, name: 1, realmId: 1, owner: 1, modifiers: 1 } },
    );
    const total = await collection.countDocuments();
    let withModifiers = 0;
    let modifiers = 0;
    const invalid = [];
    for await (const item of cursor) {
      withModifiers++;
      for (const modifier of item.modifiers) {
        modifiers++;
        const reason = problem(modifier);
        if (reason) invalid.push({ item, modifier, reason });
      }
    }
    const items = new Set(invalid.map(i => i.item._id));
    console.log(`Items: ${total}, with modifiers: ${withModifiers}, modifiers: ${modifiers}`);
    console.log(`Invalid modifiers: ${invalid.length}, in ${items.size} item(s)`);
    for (const { item, modifier, reason } of invalid) {
      const shown = JSON.stringify({ type: modifier.type, modifier: modifier.modifier ?? null, value: modifier.value ?? null });
      console.log(`  ${item._id} (realm ${item.realmId ?? '-'}, owner ${item.owner}): ${shown}: ${reason}`);
    }
    if (invalid.length > 0) exitCode = 1;
  }
} finally {
  await mongoose.disconnect();
}
process.exit(exitCode);
