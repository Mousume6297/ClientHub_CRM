const express = require("express");
const router = express.Router();
const db = require("../db");


// ================= ADD LEAD =================
router.post("/leads", (req, res) => {

  const {
    name,
    email,
    source,
    phone,
    status,
    assignedTo
  } = req.body;

  if (!name || !email || !source) {

    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });

  }

  // ✅ ACTIVITY HISTORY
  const time =
    new Date().toLocaleString();

  const history =
    `${time} - Lead created`;

  const sql = `
    INSERT INTO leads
    (
      name,
      email,
      source,
      phone,
      status,
      assigned_to,
      history
    )

    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      email,
      source,
      phone || null,
      status || "New",
      assignedTo || null,
      history
    ],

    (err, result) => {

      if (err) {

        console.log("DB INSERT ERROR:", err);

        return res.status(500).json({
          success: false,
          error: "Error adding lead"
        });

      }

      return res.status(200).json({

        success: true,

        data: {
          id: result.insertId,
          name,
          email,
          source,
          phone,
          status: status || "New",
          assignedTo
        }

      });

    }
  );

});


// ================= GET ALL LEADS =================
router.get("/leads", (req, res) => {

  const { role, userName } = req.query;

  let sql = "";
  let values = [];

  // ================= ADMIN =================
  if (role === "admin") {

    sql = `
      SELECT * FROM leads
      ORDER BY id DESC
    `;

  }

  // ================= MANAGER =================
  else if (role === "manager") {

    sql = `
      SELECT * FROM leads
      ORDER BY id DESC
    `;

  }

  // ================= HR =================
  else if (role === "hr") {

    sql = `
      SELECT * FROM leads
      ORDER BY id DESC
    `;

  }

  // ================= VIEWER =================
  else if (role === "viewer") {

    sql = `
      SELECT * FROM leads
      ORDER BY id DESC
    `;

  }

  // ================= EMPLOYEE / INTERN / SUPPORT / SALES =================
  else {

    sql = `
      SELECT * FROM leads
      WHERE assigned_to = ?
      ORDER BY id DESC
    `;

    values = [userName];

  }

  db.query(sql, values, (err, result) => {

    if (err) {

      console.log("FETCH ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Error fetching leads"
      });

    }

    res.status(200).json(result);

  });

});


// ================= GET SINGLE LEAD =================
router.get("/leads/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "SELECT * FROM leads WHERE id=?",
    [id],

    (err, result) => {

      if (err) {

        console.log("FETCH ONE ERROR:", err);

        return res.status(500).json({
          error: "Error fetching lead"
        });

      }

      if (result.length === 0) {

        return res.status(404).json({
          message: "Lead not found"
        });

      }

      res.status(200).json(result[0]);

    }
  );

});


// ================= UPDATE STATUS =================
router.put("/leads/:id/status", (req, res) => {

  const { status } = req.body;

  const { id } = req.params;

  db.query(

    "SELECT history FROM leads WHERE id=?",

    [id],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: "Database error"
        });

      }

      const oldHistory =
        result[0]?.history || "";

      const time =
        new Date().toLocaleString();

      const newHistory =

        oldHistory +

        `\n${time} - Status changed to ${status}`;

      const sql =
        "UPDATE leads SET status=?, history=? WHERE id=?";

      db.query(

        sql,

        [status, newHistory, id],

        (err) => {

          if (err) {

            console.log("STATUS ERROR:", err);

            return res.status(500).json({
              error: "Error updating status"
            });

          }

          res.status(200).json({
            success: true,
            id,
            status
          });

        }

      );

    }

  );

});


// ================= ADD NOTE =================
router.put("/leads/:id/note", (req, res) => {

  const { notes } = req.body;

  const { id } = req.params;

  db.query(

    "SELECT history FROM leads WHERE id=?",

    [id],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: "Database error"
        });

      }

      const oldHistory =
        result[0]?.history || "";

      const time =
        new Date().toLocaleString();

      const newHistory =

        oldHistory +

        `\n${time} - Note added`;

      const sql =
        "UPDATE leads SET notes=?, history=? WHERE id=?";

      db.query(

        sql,

        [notes, newHistory, id],

        (err) => {

          if (err) {

            console.log("NOTE ERROR:", err);

            return res.status(500).json({
              error: "Error adding note"
            });

          }

          res.status(200).json({
            success: true,
            id,
            notes
          });

        }

      );

    }

  );

});


// ================= UPDATE LEAD =================
router.put("/leads/:id", (req, res) => {

  const {
    name,
    email,
    source,
    phone,
    assignedTo
  } = req.body;

  const { id } = req.params;

  const sql = `
    UPDATE leads

    SET
      name=?,
      email=?,
      source=?,
      phone=?,
      assigned_to=?

    WHERE id=?
  `;

  db.query(
    sql,
    [
      name,
      email,
      source,
      phone || null,
      assignedTo || null,
      id
    ],

    (err) => {

      if (err) {

        console.log("UPDATE ERROR:", err);

        return res.status(500).json({
          error: "Error updating lead"
        });

      }

      res.status(200).json({

        success: true,

        id,
        name,
        email,
        source,
        phone,
        assignedTo

      });

    }
  );

});


// ================= ASSIGN LEAD =================
router.put("/leads/:id/assign", (req, res) => {

  const { assignedTo } = req.body;

  const { id } = req.params;

  db.query(

    "SELECT history FROM leads WHERE id=?",

    [id],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: "Database error"
        });

      }

      const oldHistory =
        result[0]?.history || "";

      const time =
        new Date().toLocaleString();

      const newHistory =

        oldHistory +

        `\n${time} - Lead assigned to ${assignedTo}`;

      const sql =
        "UPDATE leads SET assigned_to=?, history=? WHERE id=?";

      db.query(

        sql,

        [assignedTo, newHistory, id],

        (err) => {

          if (err) {

            console.log("ASSIGN ERROR:", err);

            return res.status(500).json({
              success: false
            });

          }

          res.status(200).json({
            success: true
          });

        }

      );

    }

  );

});


// ================= DELETE LEAD =================
router.delete("/leads/:id", (req, res) => {

  const { id } = req.params;

  const { currentUserRole } = req.body;

  if (
    currentUserRole !== "admin" &&
    currentUserRole !== "manager"
  ) {

    return res.status(403).json({
      success: false,
      message: "Access denied"
    });

  }

  const sql =
    "DELETE FROM leads WHERE id=?";

  db.query(sql, [id], (err) => {

    if (err) {

      console.log("DELETE ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });

    }

    res.status(200).json({
      success: true,
      message: "Lead deleted"
    });

  });

});


// ================= REJECT LEAD =================
router.put("/leads/:id/reject", (req, res) => {

  const { reason } = req.body;

  const { id } = req.params;

  const sql = `
    UPDATE leads

    SET
      status = 'Rejected',
      rejection_reason = ?

    WHERE id = ?
  `;

  db.query(sql, [reason, id], (err) => {

    if (err) {

      console.log("REJECT ERROR:", err);

      return res.status(500).json({
        success: false
      });

    }

    res.status(200).json({
      success: true
    });

  });

});


// ================= ADD FOLLOWUP =================
router.post("/followups", (req, res) => {

  const {

    lead_id,
    followup_date,
    followup_time,
    meeting_type,
    note,
    created_by

  } = req.body;

  const sql = `

    INSERT INTO followups (

      lead_id,
      followup_date,
      followup_time,
      meeting_type,
      note,
      created_by

    )

    VALUES (?, ?, ?, ?, ?, ?)

  `;

  db.query(

    sql,

    [

      lead_id,
      followup_date,
      followup_time,
      meeting_type,
      note,
      created_by

    ],

    (err) => {

      if (err) {

        console.log("FOLLOWUP ERROR:", err);

        return res.status(500).json({
          success: false
        });

      }

      res.status(200).json({
        success: true
      });

    }

  );

});


// ================= GET FOLLOWUPS =================
router.get("/followups/:leadId", (req, res) => {

  const { leadId } = req.params;

  const sql = `
    SELECT *
    FROM followups
    WHERE lead_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [leadId], (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        success: false
      });

    }

    res.status(200).json(result);

  });

});
// ================= UPCOMING FOLLOWUPS =================

router.get(

  "/leads/dashboard/followups",

  (req, res) => {

    const role =
      req.query.role?.toLowerCase();

    const userName =
      req.query.userName;

    let sql = "";
    let values = [];

    // ===== ADMIN / MANAGER / HR / VIEWER =====
    if (

      role === "admin"

      ||

      role === "manager"

      ||

      role === "hr"

      ||

      role === "viewer"

    ) {

      sql = `

        SELECT *

        FROM followups
WHERE
(
  followup_date > CURDATE()
)
OR
(
  followup_date = CURDATE()
  AND followup_time >= CURTIME()
)
        

        ORDER BY
        followup_date ASC,
        followup_time ASC

      `;

    }

    // ===== EMPLOYEE =====
    else {

      sql = `

  SELECT *

  FROM followups

  WHERE created_by = ?

  AND
  (
    followup_date > CURDATE()
  )
  OR
  (
    followup_date = CURDATE()
    AND followup_time >= CURTIME()
  )

  ORDER BY
  followup_date ASC,
  followup_time ASC

`;

      values = [userName];

    }

    // ===== RUN QUERY =====
    db.query(

      sql,

      values,

      (err, result) => {

        if (err) {

          console.log("FOLLOWUP ERROR:", err);

          return res.status(500).json({
            success: false
          });

        }

        res.status(200).json(result);

      }

    );

  }

);

module.exports = router;