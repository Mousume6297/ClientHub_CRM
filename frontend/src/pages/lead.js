import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

function Leads() {

  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  // ✅ STATUS FILTER
  const [statusFilter, setStatusFilter] =
    useState("All");

  // ✅ CURRENT USER
  const currentUser =
    JSON.parse(localStorage.getItem("crmUser")) || {};

  const currentRole =
    currentUser.role?.toLowerCase();

  const isViewer =
    currentRole === "viewer";

  // ================= FETCH LEADS =================
  const fetchLeads = async () => {

    try {

      const role =
        currentUser.role?.toLowerCase();

      const userName =
        currentUser.name;

      const res = await fetch(

`http://localhost:5000/api/leads?role=${role}&userName=${userName}`

      );

      if (!res.ok) {

        console.log("Fetch failed");

        return;

      }

      const data = await res.json();

      setLeads(data);

    } catch (err) {

      console.log(err);

    }

  };

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


useEffect(() => {

    fetchLeads();

    fetchUsers();
 // eslint-disable-next-line react-hooks/exhaustive-deps
}, [fetchLeads, fetchUsers]);

  // ================= DELETE LEAD =================
  const deleteLead = async (id) => {

    if (isViewer) {

      alert("View only access");

      return;

    }

    const confirmDelete =
      window.confirm("Delete this lead?");

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        `http://localhost:5000/api/leads/${id}`,
        {

          method: "DELETE",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            currentUserRole:
              currentUser.role?.toLowerCase()
          })

        }
      );

      const data = await res.json();

      if (data.success) {

        alert("Lead deleted successfully ✅");

        fetchLeads();

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.log(err);

      alert("Delete failed ❌");

    }

  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, newStatus) => {

    if (isViewer) {

      alert("View only access");

      return;

    }

    try {

      await fetch(
        `http://localhost:5000/api/leads/${id}/status`,
        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status: newStatus
          })

        }
      );

      fetchLeads();

    } catch (err) {

      console.log(err);

    }

  };

  // ================= ASSIGN LEAD =================
  const assignLead = async (id, employee) => {

    if (isViewer) {

      alert("View only access");

      return;

    }

    try {

      await fetch(
        `http://localhost:5000/api/leads/${id}/assign`,
        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            assignedTo: employee
          })

        }
      );

      fetchLeads();

    } catch (err) {

      console.log(err);

    }

  };

  // ================= REJECT LEAD =================
  const rejectLead = async (id, reason) => {

    try {

      await fetch(

        `http://localhost:5000/api/leads/${id}/reject`,

        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            reason
          })

        }

      );

      alert("Lead rejected");

      fetchLeads();

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        {/* HEADER */}
<div className="leads-header">

  <h2 className="page-title">
    Leads
  </h2>

  {/* RIGHT SIDE */}
  <div className="leads-header-right">

    {/* SEARCH */}
    <input
      type="text"
      placeholder="Search leads..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="search-box"
    />

    {/* STATUS FILTER */}
    <select

      value={statusFilter}

      onChange={(e) =>
        setStatusFilter(e.target.value)
      }

      className="filter-select"

    >

      <option value="All">
        All Status
      </option>

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

</div>

{/* TABLE */}
<div className="leads-container">

  <table className="leads-table">

    <thead>

      <tr>

        <th>Name</th>

        <th>Email</th>

        <th>Phone</th>

        <th>Source</th>

        <th>Status</th>

        <th>Assigned To</th>

        <th>Action</th>

      </tr>

    </thead>

    <tbody>

      {

        leads

        .filter((lead) => {

          // ✅ SEARCH
          const matchesSearch =

            (lead.name || "")
              .toLowerCase()
              .includes(search.toLowerCase())

            ||

            (lead.email || "")
              .toLowerCase()
              .includes(search.toLowerCase())

            ||

            (lead.source || "")
              .toLowerCase()
              .includes(search.toLowerCase());

          // ✅ STATUS FILTER
          const matchesStatus =

            statusFilter === "All"

            ||

            lead.status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );

        })

        .map((lead) => (

          <tr key={lead.id}>

            {/* NAME */}
            <td>
              {lead.name || "-"}
            </td>

            {/* EMAIL */}
            <td>
              {lead.email || "-"}
            </td>

            {/* PHONE */}
            <td>

              {

                lead.phone &&
                lead.phone !== "null"

                ?

                lead.phone

                :

                "N/A"

              }

            </td>

            {/* SOURCE */}
            <td>
              {lead.source || "-"}
            </td>

            {/* STATUS */}
            <td>

              <div className="status-wrapper">

                <span
                  className={`status-badge ${(lead.status || "new").toLowerCase()}`}
                >

                  {lead.status || "New"}

                </span>

                <select

                  value={lead.status || "New"}

                  disabled={isViewer}

                  onChange={(e) =>
                    updateStatus(
                      lead.id,
                      e.target.value
                    )
                  }

                  className="status-select"

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

                    </td>

                    {/* ASSIGNED TO */}
                    <td>

                      {

                        currentRole === "admin" ||

                        currentRole === "manager"

                        ?

                        (

                          <select

                            value={lead.assigned_to || ""}

                            disabled={isViewer}

                            onChange={(e) =>
                              assignLead(
                                lead.id,
                                e.target.value
                              )
                            }

                          >

                            <option value="">
                              Select
                            </option>

                            {

                              users

                              .filter(

                                (user) =>

                                  user.role?.toLowerCase() !== "admin"

                                  &&

                                  user.role?.toLowerCase() !== "manager"

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

                        )

                        :

                        (

                          lead.assigned_to || "Not Assigned"

                        )

                      }

                    </td>

                    {/* ACTIONS */}
                    <td>

                      <div className="action-buttons">

                        {/* VIEW */}
                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(`/lead/${lead.id}`)
                          }
                        >
                          View
                        </button>

                        {/* EDIT */}
<button

  className="edit-btn"

  disabled={isViewer}

  onClick={() =>
    navigate(`/lead/${lead.id}`)
  }

>

  Edit

</button>
                        {/* REJECT */}
                        <button

                          className="reject-btn"

                          disabled={isViewer}

                          onClick={() => {

                            const reason =
                              prompt(
                                "Enter rejection reason"
                              );

                            if (!reason) return;

                            rejectLead(
                              lead.id,
                              reason
                            );

                          }}

                        >

                          Reject

                        </button>

                        {/* DELETE */}
                        <button

                          className="delete-btn"

                          disabled={

                            isViewer ||

                            !["admin", "manager"].includes(
                              currentRole
                            )

                          }

                          onClick={() =>
                            deleteLead(lead.id)
                          }

                        >

                          Delete

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default Leads;