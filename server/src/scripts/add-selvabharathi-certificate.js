/**
 * One-off script: adds Selvabharathi D's real TN Skill Corporation
 * certificate (Certificate No. TNSC-NMFS-AGR-POL-1025-0045) into the
 * `external_certificates` table, with the actual issued PDF uploaded as
 * proof — the same record the Admin → Certificates → External/Government
 * Certificates form would create, done here as a script because this
 * environment has no way to log into the admin UI itself.
 *
 * Requires the `external_certificates` migration to have already been run
 * (`npm run migrate` from the `server` folder) — this will fail with a
 * clear "relation does not exist" error if it hasn't.
 *
 * Safe to re-run: it checks for the certificate number first and skips
 * if the record already exists, instead of erroring or duplicating it.
 *
 * Run from the `server` folder:
 *   node src/scripts/add-selvabharathi-certificate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { db } = require('../config/db');
const StorageService = require('../services/storage.service');

const CERT = {
  certificate_no: 'TNSC-NMFS-AGR-POL-1025-0045',
  enrollment_no: 'CG2025-F152973',
  student_name: 'Selvabharathi D',
  course_name: 'Polyhouse Farming',
  sector: 'Agriculture',
  training_centre: 'IGO GROUP OF COMPANIES',
  duration: '75 hours',
  issuing_body: 'TN Skill Corporation',
  issued_at: '2025-10-28 18:09:48',
};

async function run() {
  const existing = await db('external_certificates').where({ certificate_no: CERT.certificate_no }).first();
  if (existing) {
    console.log(`Already added — ${CERT.certificate_no} exists (id ${existing.id}). Nothing to do.`);
    await db.destroy();
    return;
  }

  const pdfPath = path.join(__dirname, 'reference-certificates', 'CG2025F152973.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const storagePath = `external/${CERT.certificate_no}.pdf`;
  await StorageService.uploadBuffer(storagePath, buffer, 'application/pdf', StorageService.BUCKET_CERTS);

  const [row] = await db('external_certificates').insert({
    ...CERT,
    pdf_path: storagePath,
    added_by: null,
  }).returning('*');

  console.log('Certificate added:', row.certificate_no, '(id', row.id + ')');
  console.log('Verify at: /verify/' + row.certificate_no);
  await db.destroy();
}

run().catch(e => { console.error(e); process.exit(1); });
