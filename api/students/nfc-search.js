const { getJxtPool, getUcenterPool } = require('../_lib/db');
const { ensureGet, getQueryValue, handlePreflight, setCorsHeaders } = require('../_lib/http');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!ensureGet(req, res)) {
    return;
  }

  try {
    const nfcId = String(getQueryValue(req, 'nfc_id') || '').trim();

    if (!/^\d+_\d{7,15}$/.test(nfcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NFC ID format'
      });
    }

    const [studentId, cellphone] = nfcId.split('_');
    const jxtPool = getJxtPool();
    const ucenterPool = getUcenterPool();

    const [students] = await ucenterPool.execute(
      `
        SELECT id, student_name
        FROM tbl_ucenter_student
        WHERE id = ?
          AND student_status = 1
      `,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const [contacts] = await jxtPool.execute(
      `
        SELECT id, student_id, parent_name, cellphone, parent_role
        FROM tbl_jxt_student_contact
        WHERE student_id = ?
          AND valid_status = 1
          AND cellphone IS NOT NULL
          AND cellphone != ''
        ORDER BY parent_role ASC
      `,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: [
        {
          id: students[0].id,
          student_name: students[0].student_name,
          contacts: contacts.map((contact) => ({
            id: contact.id,
            parent_name: contact.parent_name || '',
            cellphone: contact.cellphone || '',
            parent_role: contact.parent_role,
            isMatch: contact.cellphone === cellphone
          }))
        }
      ]
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to search by NFC ID'
    });
  }
};
