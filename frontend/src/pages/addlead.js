import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { FaUserPlus } from "react-icons/fa";

function AddLead() {

  const navigate = useNavigate();

  // ================= STATES =================
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [source, setSource] = useState("");

  const [status, setStatus] = useState("New");

  const [phone, setPhone] = useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [users, setUsers] =
    useState([]);

  // ================= CURRENT USER =================
  const currentUser =
    JSON.parse(localStorage.getItem("crmUser")) || {};

  const role =
    currentUser.role?.toLowerCase();

  // ================= WHO CAN ADD LEADS =================
  const canAddLead =

    role === "admin" ||

    role === "manager" ||

    role === "sales";

  // ================= WHO CAN ASSIGN =================
  const canAssignLead =

    role === "admin" ||

    role === "manager";

  // ================= FETCH USERS =================
  const fetchUsers = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/staff"
      );

      const data = await res.json();

      setUsers(data.data || []);

    } catch (err) {

      console.log(err);

    }

  };

  // ================= LOAD USERS =================
  useEffect(() => {

    fetchUsers();

  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    // ❌ ACCESS DENIED
    if (!canAddLead) {

      alert("Access denied ❌");

      return;

    }

    // ✅ SALES AUTO ASSIGN
    let finalAssignedTo = assignedTo;

    if (role === "sales") {

      finalAssignedTo =
        currentUser.name;

    }

    // ✅ PAYLOAD
    const payload = {

      name: name.trim(),

      email: email.trim(),

      source: source.trim(),

      status: status || "New",

      assignedTo: finalAssignedTo,

      phone:

        phone.trim() === ""

        ?

        null

        :

        phone.trim()

    };

    // ✅ VALIDATION
    if (

      !payload.name ||

      !payload.email ||

      !payload.source

    ) {

      alert(
        "Please fill all required fields ❌"
      );

      return;

    }

    try {

      const res = await fetch(

        "http://localhost:5000/api/leads",

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),

        }

      );

      // ❌ SERVER ERROR
      if (!res.ok) {

        const text = await res.text();

        console.log("Server error:", text);

        alert("Server error ❌");

        return;

      }

      const data = await res.json();

      console.log("Response:", data);

      // ❌ FAILED
      if (!data.success) {

        alert(

          data.error ||

          "Failed to add lead ❌"

        );

        return;

      }

      // ✅ SUCCESS
      alert("Lead Added Successfully ✅");

      // ✅ RESET
      setName("");

      setEmail("");

      setSource("");

      setPhone("");

      setStatus("New");

      setAssignedTo("");

      navigate("/leads");

    } catch (err) {

      console.log("Network error:", err);

      alert("Network error ❌");

    }

  };

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="form-page">

          {/* HEADER */}
          <div className="form-header">

            <h2>

              <FaUserPlus />

              {" "}Add New Lead

            </h2>

            <p>
              Create and manage your client leads easily
            </p>

          </div>

          {/* FORM CARD */}
          <div className="form-card">

            <form
              className="lead-form"
              onSubmit={handleSubmit}
            >

              {/* ROW 1 */}
              <div className="form-row">

                {/* NAME */}
                <div className="form-group">

                  <label>Name</label>

                  <input
                    type="text"

                    value={name}

                    onChange={(e) =>
                      setName(e.target.value)
                    }

                    required
                  />

                </div>

                {/* EMAIL */}
                <div className="form-group">

                  <label>Email</label>

                  <input
                    type="email"

                    value={email}

                    onChange={(e) =>
                      setEmail(e.target.value)
                    }

                    required
                  />

                </div>

              </div>

              {/* ROW 2 */}
              <div className="form-row">

                {/* PHONE */}
                <div className="form-group">

                  <label>Phone</label>

                  <input
                    type="text"

                    value={phone}

                    onChange={(e) =>
                      setPhone(e.target.value)
                    }

                    placeholder="Enter phone number"
                  />

                </div>

                {/* SOURCE */}
                <div className="form-group">

                  <label>Source</label>

                  <select

                    value={source}

                    onChange={(e) =>
                      setSource(e.target.value)
                    }

                    required
                  >

                    <option value="">
                      Select Source
                    </option>

                    <option value="Website">
                      Website
                    </option>

                    <option value="LinkedIn">
                      LinkedIn
                    </option>

                    <option value="Referral">
                      Referral
                    </option>

                  </select>

                </div>

              </div>

              {/* ROW 3 */}
              <div className="form-row">

                {/* STATUS */}
                <div className="form-group">

                  <label>Status</label>

                  <select

                    value={status}

                    onChange={(e) =>
                      setStatus(e.target.value)
                    }

                  >

                    <option value="New">
                      New
                    </option>

                    <option value="Contacted">
                      Contacted
                    </option>

                    <option value="Converted">
                      Converted
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

                {/* ASSIGN */}
                {canAssignLead && (

                  <div className="form-group">

                    <label>
                      Assign Employee (Optional)
                    </label>

                    <select

                      value={assignedTo}

                      onChange={(e) =>
                        setAssignedTo(
                          e.target.value
                        )
                      }

                    >

                      <option value="">
                        Select Employee
                      </option>

                      {

                        users

                        .filter(

                          (user) =>

                            user.role?.toLowerCase() !== "admin"

                            &&

                            user.role?.toLowerCase() !== "manager"

                            &&

                            user.role?.toLowerCase() !== "viewer"

                            &&

                            user.role?.toLowerCase() !== "hr"

                        )

                        .map((user) => (

                          <option
                            key={user.id}
                            value={user.name}
                          >

                            {user.name} ({user.role})

                          </option>

                        ))

                      }

                    </select>

                  </div>

                )}

              </div>

              {/* BUTTON */}
              <div className="form-actions">

                <button

                  type="submit"

                  className="submit-btn"

                  disabled={!canAddLead}

                >

                  {

                    !canAddLead

                    ?

                    "Access Denied"

                    :

                    "Add Lead"

                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}

export default AddLead;