/**
 * Category controller — admin CRUD over public.categories (Supabase).
 * Lives in the `public` schema, not `igo_lms` — the LMS itself has no
 * categories table of its own (courses just carry a plain-text `category`
 * string); this is the table the Flutter app actually reads for category
 * filtering, kept in sync with that string via course.controller.js's
 * syncCourseToPublic().
 * @module controllers/category
 */
const { supabase } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/** GET /api/categories — list all, newest first isn't meaningful here; alphabetical */
async function list(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data || [], error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/categories */
async function create(req, res, next) {
  try {
    const { name, description, icon_url, color_hex } = req.body;
    if (!name || !name.trim()) throw createError('INVALID_INPUT', 'Category name is required');

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ success: false, data: null, error: 'CONFLICT', message: 'A category with that name already exists' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description || null,
        icon_url: icon_url || null,
        color_hex: color_hex || null,
        course_count: 0,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    logger.info(`[Category] Admin ${req.user.id} created category "${data.name}"`);
    res.status(201).json({ success: true, data, error: null, message: 'Category created' });
  } catch (err) { next(err); }
}

/** PUT /api/categories/:id */
async function update(req, res, next) {
  try {
    const { name, description, icon_url, color_hex } = req.body;
    const update = {};
    if (name !== undefined) {
      if (!name.trim()) throw createError('INVALID_INPUT', 'Category name cannot be empty');
      update.name = name.trim();
    }
    if (description !== undefined) update.description = description || null;
    if (icon_url !== undefined) update.icon_url = icon_url || null;
    if (color_hex !== undefined) update.color_hex = color_hex || null;
    if (!Object.keys(update).length) throw createError('INVALID_INPUT', 'Nothing to update');

    const { data, error } = await supabase
      .from('categories')
      .update(update)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    if (!data) throw createError('NOT_FOUND', 'Category not found');

    res.json({ success: true, data, error: null, message: 'Category updated' });
  } catch (err) { next(err); }
}

/** DELETE /api/categories/:id — blocked while any course still references it */
async function remove(req, res, next) {
  try {
    const { data: cat, error: fetchErr } = await supabase
      .from('categories')
      .select('id, name, course_count')
      .eq('id', req.params.id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!cat) throw createError('NOT_FOUND', 'Category not found');

    // course_count is a denormalized cache refreshed on every course sync —
    // re-check live rather than trust it blindly before blocking a delete.
    const { count } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', cat.id);
    if (count > 0) {
      return res.status(409).json({
        success: false, data: null, error: 'CONFLICT',
        message: `"${cat.name}" is still used by ${count} course${count > 1 ? 's' : ''} — reassign or delete those first`,
      });
    }

    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) throw new Error(error.message);

    logger.info(`[Category] Admin ${req.user.id} deleted category "${cat.name}"`);
    res.json({ success: true, data: null, error: null, message: 'Category deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
