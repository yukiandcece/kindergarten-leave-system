const { getJxtPool, getUcenterPool } = require('../_lib/db');
const { ensureGet, getQueryValue, handlePreflight, setCorsHeaders } = require('../_lib/http');

function buildPlaceholders(values) {
  return values.map(() => '?').join(',');
}

function mapContactsByStudentId(students, contacts) {
  return students.map((student) => {
    const studentContacts = contacts.filter((contact) => contact.student_id === student.id);

    return {
      id: student.id,
      student_name: student.student_name,
      contacts: studentContacts.map((contact) => ({
        id: contact.id,
        parent_name: contact.parent_name || '',
        cellphone: contact.cellphone || '',
        relation: contact.parent_role
      }))
    };
  });
}

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!ensureGet(req, res)) {
    return;
  }

  try {
    const keyword = String(getQueryValue(req, 'name') || '').trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a student name or phone number'
      });
    }

    if (keyword.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is too long'
      });
    }

    const jxtPool = getJxtPool();
    const ucenterPool = getUcenterPool();
    const isPhoneNumber = /^\d{7,15}$/.test(keyword);

    if (isPhoneNumber) {
      const [contacts] = await jxtPool.execute(
        `
          SELECT id, student_id, parent_name, cellphone, parent_role
          FROM tbl_jxt_student_contact
          WHERE cellphone = ?
            AND valid_status = 1
            AND cellphone IS NOT NULL
            AND cellphone != ''
        `,
        [keyword]
      );

      if (contacts.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      const studentIds = [...new Set(contacts.map((contact) => contact.student_id))];
      const [students] = await ucenterPool.execute(
        `
          SELECT id, student_name
          FROM tbl_ucenter_student
          WHERE id IN (${buildPlaceholders(studentIds)})
            AND student_status = 1
          ORDER BY id ASC
        `,
        studentIds
      );

      return res.status(200).json({
        success: true,
        data: mapContactsByStudentId(students, contacts)
      });
    }

    const [students] = await ucenterPool.execute(
      `
        SELECT id, student_name
        FROM tbl_ucenter_student
        WHERE student_name LIKE ?
          AND student_status = 1
        ORDER BY id ASC
      `,
      [`%${keyword}%`]
    );

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const studentIds = students.map((student) => student.id);
    const [contacts] = await jxtPool.execute(
      `
        SELECT id, student_id, parent_name, cellphone, parent_role
        FROM tbl_jxt_student_contact
        WHERE student_id IN (${buildPlaceholders(studentIds)})
          AND valid_status = 1
          AND cellphone IS NOT NULL
          AND cellphone != ''
        ORDER BY student_id ASC, parent_role ASC
      `,
      studentIds
    );

    res.status(200).json({
      success: true,
      data: mapContactsByStudentId(students, contacts)
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to search students'
    });
  }
};
