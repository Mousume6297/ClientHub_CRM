const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));

// ================= DATABASE =================

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "W7301@jqir#",
  database: "mini_crm"
});

// ================= ROUTES =================

const leadRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");

app.use("/api", leadRoutes);
app.use("/api/auth", authRoutes);

// ================= STAFF APIs =================

// ✅ CREATE STAFF

app.post("/api/staff/create", (req, res) => {

  const {
    name,
    email,
    password,
    role,
    currentUserRole
  } = req.body;

  const roleCheck =
    currentUserRole?.toLowerCase();

  // ✅ ONLY ADMIN / MANAGER / HR
  if (
    !["admin", "manager", "hr"]
      .includes(roleCheck)
  ) {

    return res.json({
      success: false,
      message: "Access denied (create not allowed)"
    });

  }

  const sql = `
    INSERT INTO users
    (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(

    sql,

    [name, email, password, role],

    (err) => {

      if (err) {

        console.log("CREATE ERROR:", err);

        return res.json({
          success: false,
          message: "Database error"
        });

      }

      res.json({
        success: true,
        message: "Staff created"
      });

    }

  );

});

// ✅ GET STAFF

app.get("/api/staff", (req, res) => {

  const sql =
    "SELECT id, name, email, role FROM users";

  db.query(sql, (err, result) => {

    if (err) {

      console.log("FETCH ERROR:", err);

      return res.json({
        success: false,
        message: "Fetch failed"
      });

    }

    res.json({
      success: true,
      data: result
    });

  });

});

// ✅ UPDATE STAFF

app.put("/api/staff/update/:id", (req, res) => {

  const id = req.params.id;

  const {
    name,
    email,
    role,
    currentUserRole
  } = req.body;

  const roleCheck =
    currentUserRole?.toLowerCase();

  // ✅ ONLY ADMIN / MANAGER / HR
  if (
    !["admin", "manager", "hr"]
      .includes(roleCheck)
  ) {

    return res.json({
      success: false,
      message: "Access denied (update not allowed)"
    });

  }

  const sql = `
    UPDATE users
    SET name=?, email=?, role=?
    WHERE id=?
  `;

  db.query(

    sql,

    [name, email, role, id],

    (err) => {

      if (err) {

        console.log("UPDATE ERROR:", err);

        return res.json({
          success: false,
          message: "Update failed"
        });

      }

      res.json({
        success: true,
        message: "Updated successfully"
      });

    }

  );

});

// ✅ DELETE STAFF + FOLLOWUPS

app.delete("/api/staff/:id", (req, res) => {

  const id = req.params.id;

  const { currentUserRole } = req.body;

  // ✅ ONLY ADMIN
  if (
    currentUserRole?.toLowerCase() !== "admin"
  ) {

    return res.status(403).json({
      success: false,
      message: "Only Admin can delete staff"
    });

  }

  // ✅ GET USER NAME
  const getUserSql =
    "SELECT name FROM users WHERE id=?";

  db.query(

    getUserSql,

    [id],

    (err, userResult) => {

      if (err) {

        console.log("GET USER ERROR:", err);

        return res.status(500).json({
          success: false
        });

      }

      // ✅ USER NOT FOUND
      if (userResult.length === 0) {

        return res.status(404).json({
          success: false,
          message: "User not found"
        });

      }

      const employeeName =
        userResult[0].name;

      // ✅ DELETE FOLLOWUPS
      const deleteFollowupsSql = `
  DELETE FROM followups
  WHERE LOWER(TRIM(created_by))
  LIKE LOWER(TRIM(?))
`;

      db.query(

        deleteFollowupsSql,

        [`%${employeeName}%`],

        (err2) => {

          if (err2) {

            console.log(
              "FOLLOWUP DELETE ERROR:",
              err2
            );

            return res.status(500).json({
              success: false
            });

          }

          // ✅ DELETE USER
          const deleteUserSql =
            "DELETE FROM users WHERE id=?";

          db.query(

            deleteUserSql,

            [id],

            (err3) => {

              if (err3) {

                console.log(
                  "USER DELETE ERROR:",
                  err3
                );

                return res.status(500).json({
                  success: false
                });

              }

              res.status(200).json({
                success: true,
                message:
                  "Staff and followups deleted successfully"
              });

            }

          );

        }

      );

    }

  );

});

// ================= PASSWORD =================

app.post("/api/auth/change-password", (req, res) => {

  const {
    email,
    oldPassword,
    newPassword
  } = req.body;

  const checkSql =
    "SELECT * FROM users WHERE email=?";

  db.query(

    checkSql,

    [email],

    (err, result) => {

      if (err) {

        console.log("CHECK ERROR:", err);

        return res.json({
          success: false
        });

      }

      if (result.length === 0) {

        return res.json({
          success: false,
          message: "User not found"
        });

      }

      const user = result[0];

      if (user.password !== oldPassword) {

        return res.json({
          success: false,
          message: "Wrong old password"
        });

      }

      const updateSql =
        "UPDATE users SET password=? WHERE email=?";

      db.query(

        updateSql,

        [newPassword, email],

        (err2) => {

          if (err2) {

            console.log(
              "PASSWORD ERROR:",
              err2
            );

            return res.json({
              success: false
            });

          }

          res.json({
            success: true,
            message: "Password updated"
          });

        }

      );

    }

  );

});

// ================= PROFILE UPDATE =================

app.put("/api/profile/update", (req, res) => {

  const {
    email,
    department,
    branch,
    phone,
    profile_image
  } = req.body;

  // ✅ EMAIL REQUIRED
  if (!email) {

    return res.status(400).json({
      success: false,
      message: "Email required"
    });

  }

  const sql = `

    UPDATE users

    SET
      department = ?,
      branch = ?,
      phone = ?,
      profile_image = ?

    WHERE email = ?

  `;

  db.query(

    sql,

    [
      department || "",
      branch || "",
      phone || "",
      profile_image || "",
      email
    ],

    (err) => {

      if (err) {

        console.log(
          "PROFILE UPDATE ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Database update failed"
        });

      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully"
      });

    }

  );

});

// ================= GET PROFILE =================

app.get("/api/profile/:email", (req, res) => {

  const email =
    req.params.email;

  const sql = `

    SELECT
      email,
      department,
      branch,
      phone,
      profile_image

    FROM users

    WHERE email = ?

  `;

  db.query(

    sql,

    [email],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false
        });

      }

      if (result.length === 0) {

        return res.status(404).json({
          success: false
        });

      }

      res.status(200).json(result[0]);

    }

  );

});

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("CRM Server Running");
});

// ================= SERVER =================

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});