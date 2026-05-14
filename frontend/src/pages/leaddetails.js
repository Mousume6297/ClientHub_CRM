import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import "../styles/leadDetails.css";

function LeadDetails() {

  const { id } = useParams();

  // ✅ CURRENT USER
  const currentUser =
    JSON.parse(localStorage.getItem("crmUser")) || {};

  const role =
    currentUser.role?.toLowerCase();

  // ✅ VIEW ONLY ACCESS
  const canEdit =

    role !== "viewer" &&

    role !== "hr";

  const [lead, setLead] = useState(null);

  const [notes, setNotes] = useState([]);

  const [newNote, setNewNote] = useState("");

  const [history, setHistory] = useState([]);

  // ✅ FOLLOWUPS
  const [followups, setFollowups] =
    useState([]);

  const [followupDate, setFollowupDate] =
    useState("");

  const [followupTime, setFollowupTime] =
    useState("");

  const [meetingType, setMeetingType] =
    useState("");

  const [followupNote, setFollowupNote] =
    useState("");

  // ================= FETCH FOLLOWUPS =================
  const fetchFollowups = async () => {

    try {

      const res = await fetch(

        `http://localhost:5000/api/followups/${id}`

      );

      const data = await res.json();

      setFollowups(data);

    } catch (err) {

      console.log(err);

    }

  };

  // ================= FETCH LEAD =================
  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {

  fetch(`http://localhost:5000/api/leads/${id}`)

    .then((res) => res.json())

    .then((data) => {

      setLead(data);

      setNotes(
        data.notes
          ?
          data.notes.split(",")
          :
          []
      );

      setHistory(
        data.history
          ?
          data.history.split("\n")
          :
          []
      );

    })

    .catch((err) => console.log(err));

  fetchFollowups();


}, [id]);

  // ================= ADD NOTE =================
  const addNote = () => {

    if (!canEdit) {

      alert("View only access");

      return;

    }

    if (!newNote.trim()) return;

    const updatedNotes =
      [...notes, newNote];

    setNotes(updatedNotes);

    setNewNote("");

    fetch(`http://localhost:5000/api/leads/${id}/note`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        notes: updatedNotes.join(",")

      }),

    })

      .then((res) => res.json())

      .then(() => {

        // ✅ RELOAD LEAD
        return fetch(
          `http://localhost:5000/api/leads/${id}`
        );

      })

      .then((res) => res.json())

      .then((data) => {

        setHistory(

          data.history

            ?

            data.history.split("\n")

            :

            []

        );

      })

      .catch((err) => console.log(err));

  };

  // ================= ADD FOLLOWUP =================
  const addFollowup = async () => {

    if (!canEdit) {

      alert("View only access");

      return;

    }

    if (

      !followupDate ||

      !followupTime ||

      !meetingType

    ) {

      alert("Please fill all fields");

      return;

    }

    try {

      await fetch(

        "http://localhost:5000/api/followups",

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            lead_id: id,

            followup_date: followupDate,

            followup_time: followupTime,

            meeting_type: meetingType,

            note: followupNote,

            created_by: currentUser.name

          })

        }

      );

      alert("Follow-up added ✅");

      setFollowupDate("");

      setFollowupTime("");

      setMeetingType("");

      setFollowupNote("");

      fetchFollowups();

    } catch (err) {

      console.log(err);

    }

  };

  // ✅ LOADING
  if (!lead) return <h2>Loading...</h2>;

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="lead-details-container">

          {/* HEADER */}
          <div className="lead-header">

            <h2>Lead Details</h2>

            <span
              className={`status ${lead.status?.toLowerCase()}`}
            >

              {lead.status}

            </span>

          </div>

          {/* INFO */}
          <div className="lead-card">

            <div className="info-grid">

              <div>
                <b>Name:</b> {lead.name}
              </div>

              <div>
                <b>Email:</b> {lead.email}
              </div>

              <div>
                <b>Phone:</b> {lead.phone || "N/A"}
              </div>

              <div>
                <b>Source:</b> {lead.source}
              </div>

            </div>

          </div>

          {/* NOTES */}
          <div className="lead-card">

            <h3>Notes</h3>

            {canEdit && (

              <div className="note-input">

                <input
                  type="text"
                  placeholder="Write note..."
                  value={newNote}
                  onChange={(e) =>
                    setNewNote(e.target.value)
                  }
                />

                <button onClick={addNote}>
                  Add
                </button>

              </div>

            )}

            {!canEdit && (

              <p className="view-only-text">
                View only access
              </p>

            )}

            <ul className="notes-list">

              {

                notes.length > 0

                ?

                notes.map((note, index) => (

                  <li
                    key={index}
                    className="note-item"
                  >

                    {note}

                  </li>

                ))

                :

                <li>No notes yet</li>

              }

            </ul>

          </div>

          {/* FOLLOWUP SECTION */}
          <div className="lead-card">

            <h3>Schedule Follow-up</h3>

            {canEdit && (

              <div className="followup-form">

                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) =>
                    setFollowupDate(e.target.value)
                  }
                />

                <input
                  type="time"
                  value={followupTime}
                  onChange={(e) =>
                    setFollowupTime(e.target.value)
                  }
                />

                <select
                  value={meetingType}
                  onChange={(e) =>
                    setMeetingType(e.target.value)
                  }
                >

                  <option value="">
                    Meeting Type
                  </option>

                  <option value="Call">
                    Call
                  </option>

                  <option value="Zoom">
                    Zoom
                  </option>

                  <option value="Site Visit">
                    Site Visit
                  </option>

                </select>

                <textarea

                  placeholder="Write follow-up note..."

                  value={followupNote}

                  onChange={(e) =>
                    setFollowupNote(e.target.value)
                  }

                />

                <button onClick={addFollowup}>
                  Save Follow-up
                </button>

              </div>

            )}

            {!canEdit && (

              <p className="view-only-text">
                View only access
              </p>

            )}

          </div>

          {/* FOLLOWUP HISTORY */}
          <div className="lead-card">

            <h3>Follow-up History</h3>

            {

              followups.length === 0

              ?

              <p>No follow-ups yet</p>

              :

              followups.map((item) => (

                <div
                  key={item.id}
                  className="followup-item"
                >

                  <p>
                    <b>Date:</b>
                    {" "}
                    {
  new Date(item.followup_date)
  .toLocaleDateString()
}
                  </p>

                  <p>
  <b>Time:</b>
  {" "}
  {
    new Date(
      `1970-01-01T${item.followup_time}`
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  }
</p>

                  <p>
                    <b>Type:</b>
                    {" "}
                    {item.meeting_type}
                  </p>

                  <p>
                    <b>Note:</b>
                    {" "}
                    {item.note}
                  </p>

                  <p>
                    <b>Created By:</b>
                    {" "}
                    {item.created_by}
                  </p>

                  <hr />

                </div>

              ))

            }

          </div>

          {/* HISTORY */}
          <div className="lead-card">

            <h3>Activity History</h3>

            <ul className="history-list">

              {

                history.length > 0

                ?

                history.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))

                :

                <li>No activity yet</li>

              }

            </ul>

          </div>

        </div>

      </div>

    </div>

  );

}

export default LeadDetails;