/**
 * fix-categories.js
 *
 * 1. Checks the schema of public.categories
 * 2. Extracts unique category names from igo_lms.courses
 * 3. Inserts them into public.categories (using gen_random_uuid())
 * 4. Updates public.courses.category_id to point to the right category row
 * 5. Verifies the result
 *
 * Run from the server directory:
 *   node src/scripts/fix-categories.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  FIX — public.categories');
  console.log('════════════════════════════════════════════════════════\n');

  // ── 1. Show public.categories schema ─────────────────────────────────────────
  const schema = await db.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories'
    ORDER BY ordinal_position
  `);

  if (schema.rows.length === 0) {
    console.error('  ERROR: public.categories table does not exist.');
    await db.destroy();
    process.exit(1);
  }

  console.log('── public.categories schema ─────────────────────────────');
  schema.rows.forEach(r =>
    console.log(`  ${r.column_name.padEnd(25)} ${r.data_type.padEnd(20)} nullable:${r.is_nullable}  default:${r.column_default || '(none)'}`)
  );

  const colNames = schema.rows.map(r => r.column_name);

  // ── 2. Before counts ─────────────────────────────────────────────────────────
  const [catBefore, pubCoursesBefore] = await Promise.all([
    db.raw('SELECT COUNT(*)::int AS cnt FROM public.categories'),
    db.raw('SELECT COUNT(*)::int AS cnt FROM public.courses WHERE category_id IS NOT NULL'),
  ]);

  console.log('\n── Before state ─────────────────────────────────────────');
  console.log(`  public.categories rows          : ${catBefore.rows[0].cnt}`);
  console.log(`  public.courses with category_id : ${pubCoursesBefore.rows[0].cnt}`);

  // ── 3. Extract unique categories from igo_lms.courses ────────────────────────
  const rawCats = await db.raw(`
    SELECT DISTINCT TRIM(category) AS category
    FROM igo_lms.courses
    WHERE category IS NOT NULL AND TRIM(category) <> ''
    ORDER BY 1
  `);

  const uniqueCategories = rawCats.rows.map(r => r.category);
  console.log(`\n── Unique categories found in igo_lms.courses (${uniqueCategories.length}) ──`);
  uniqueCategories.forEach(c => console.log(`  - "${c}"`));

  if (uniqueCategories.length === 0) {
    console.log('\n  No categories found in igo_lms.courses — nothing to insert.');
    await db.destroy();
    return;
  }

  // ── 4. Determine which columns exist so we build a compatible INSERT ──────────
  // Typical public.categories schema: id (uuid), name (text), description (text),
  // icon (text), color (text), created_at (timestamptz), updated_at (timestamptz)
  // We only insert what columns actually exist.
  const hasName        = colNames.includes('name');
  const hasSlug        = colNames.includes('slug');
  const hasDescription = colNames.includes('description');
  const hasCreatedAt   = colNames.includes('created_at');
  const hasUpdatedAt   = colNames.includes('updated_at');

  if (!hasName) {
    // Try to find the text column that stores the category name
    const textCols = schema.rows.filter(r => r.data_type === 'text' || r.data_type === 'character varying');
    console.log('\n  WARNING: no "name" column found in public.categories.');
    console.log(`  Text columns available: ${textCols.map(r => r.column_name).join(', ')}`);
    console.log('  Please inspect the schema above and update this script accordingly.');
    await db.destroy();
    process.exit(1);
  }

  // ── 5. Find which categories already exist (to avoid duplicates) ──────────────
  const existingCats = await db.raw('SELECT id, name FROM public.categories');
  const existingMap  = {};   // name (lower) → id
  existingCats.rows.forEach(r => { existingMap[r.name.toLowerCase()] = r.id; });

  const toInsert = uniqueCategories.filter(c => !existingMap[c.toLowerCase()]);
  const alreadyIn = uniqueCategories.filter(c => existingMap[c.toLowerCase()]);

  if (alreadyIn.length > 0) {
    console.log(`\n── Already in public.categories (${alreadyIn.length}) ─────────────`);
    alreadyIn.forEach(c => console.log(`  - "${c}"  id:${existingMap[c.toLowerCase()]}`));
  }

  // ── 6. Insert new categories ──────────────────────────────────────────────────
  console.log(`\n── Inserting ${toInsert.length} new categories ───────────────────`);

  const insertedRows = [];

  for (const cat of toInsert) {
    const row = { name: cat };
    if (hasSlug)        row.slug        = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (hasDescription) row.description = null;
    if (hasCreatedAt)   row.created_at  = db.raw('now()');
    if (hasUpdatedAt)   row.updated_at  = db.raw('now()');

    // Use gen_random_uuid() for the id if it's a uuid with no default set
    const idCol = schema.rows.find(r => r.column_name === 'id');
    if (idCol && idCol.data_type === 'uuid' && !idCol.column_default) {
      row.id = db.raw('gen_random_uuid()');
    }

    const [inserted] = await db('public.categories').insert(row).returning('*');
    insertedRows.push(inserted);
    console.log(`  Inserted: "${inserted.name}"  id:${inserted.id}`);
  }

  // ── 7. Build full name→id map (existing + newly inserted) ────────────────────
  const fullMap = { ...existingMap };
  insertedRows.forEach(r => { fullMap[r.name.toLowerCase()] = r.id; });
  // Also re-add existing ones with original casing
  alreadyIn.forEach(c => { fullMap[c.toLowerCase()] = existingMap[c.toLowerCase()]; });

  // ── 8. Update public.courses.category_id ─────────────────────────────────────
  console.log('\n── Updating public.courses.category_id ──────────────────');

  // First check if public.courses has category_id column
  const courseSchema = await db.raw(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'category_id'
  `);

  if (courseSchema.rows.length === 0) {
    console.log('  WARNING: public.courses does not have a category_id column — skipping update.');
  } else {
    // Get all public courses with their igo_lms category text
    const pubCourses = await db.raw(`
      SELECT pc.id AS pub_id, lc.category AS lms_category, pc.category_id AS current_cat_id
      FROM public.courses pc
      JOIN igo_lms.courses lc ON lc.id = pc.id
      WHERE lc.category IS NOT NULL AND TRIM(lc.category) <> ''
    `);

    let updated = 0;
    let alreadySet = 0;
    let notMapped = 0;

    for (const row of pubCourses.rows) {
      const catKey = row.lms_category ? row.lms_category.trim().toLowerCase() : null;
      if (!catKey) { notMapped++; continue; }

      const catId = fullMap[catKey];
      if (!catId) { console.log(`  WARN: no category ID found for "${row.lms_category}"`); notMapped++; continue; }

      if (row.current_cat_id === catId) { alreadySet++; continue; }

      await db('public.courses').where('id', row.pub_id).update({ category_id: catId });
      updated++;
    }

    console.log(`  Courses updated (category_id set) : ${updated}`);
    console.log(`  Courses already had correct id    : ${alreadySet}`);
    console.log(`  Courses not mappable              : ${notMapped}`);
  }

  // ── 9. Also update igo_lms.courses if it has a category_id column ────────────
  const lmsCatIdCol = await db.raw(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'igo_lms' AND table_name = 'courses' AND column_name = 'category_id'
  `);

  if (lmsCatIdCol.rows.length > 0) {
    console.log('\n── Updating igo_lms.courses.category_id ─────────────────');
    for (const [catName, catId] of Object.entries(fullMap)) {
      // Find matching original-casing name
      const origName = uniqueCategories.find(c => c.toLowerCase() === catName);
      if (!origName) continue;
      const res = await db.raw(
        `UPDATE igo_lms.courses SET category_id = ? WHERE LOWER(TRIM(category)) = ? AND (category_id IS NULL OR category_id <> ?)`,
        [catId, catName, catId]
      );
      if (res.rowCount > 0) {
        console.log(`  Updated ${res.rowCount} igo_lms.courses rows for category "${origName}"`);
      }
    }
  }

  // ── 10. Verification ──────────────────────────────────────────────────────────
  console.log('\n── Verification ─────────────────────────────────────────');

  const [catAfter, coursesLinked, coursesNull] = await Promise.all([
    db.raw('SELECT id, name FROM public.categories ORDER BY name'),
    db.raw('SELECT COUNT(*)::int AS cnt FROM public.courses WHERE category_id IS NOT NULL'),
    db.raw('SELECT COUNT(*)::int AS cnt FROM public.courses WHERE category_id IS NULL'),
  ]);

  console.log(`\n  public.categories (${catAfter.rows.length} rows):`);
  catAfter.rows.forEach(r => console.log(`    ${r.id}  "${r.name}"`));

  console.log(`\n  public.courses with category_id SET  : ${coursesLinked.rows[0].cnt}`);
  console.log(`  public.courses with category_id NULL : ${coursesNull.rows[0].cnt}`);

  // Show per-category course count
  const perCat = await db.raw(`
    SELECT c.name, COUNT(co.id)::int AS course_count
    FROM public.categories c
    LEFT JOIN public.courses co ON co.category_id = c.id
    GROUP BY c.name
    ORDER BY c.name
  `);

  console.log('\n  Courses per category:');
  perCat.rows.forEach(r => console.log(`    "${r.name}" → ${r.course_count} course(s)`));

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  fix-categories.js DONE');
  console.log('════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => {
  console.error('\nFATAL:', e.message);
  process.exit(1);
});
