import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  FaChartLine,
  FaBell

} from "react-icons/fa";

function Navbar() {

  const navigate = useNavigate();

  // ✅ FOLLOWUPS COUNT
  const [followupCount, setFollowupCount] =
    useState(0);

  // ================= FETCH FOLLOWUPS =================
  useEffect(() => {

    const currentUser =
  JSON.parse(
    localStorage.getItem("crmUser")
  );

const role =
  currentUser.role;

const userName =
  currentUser.name;

fetch(

`http://localhost:5000/api/leads/dashboard/followups?role=${role}&userName=${userName}`

)

      .then((res) => res.json())

      .then((data) => {

        setFollowupCount(data.length);

      })

      .catch((err) => console.log(err));

  }, []);

  // ================= LOGOUT =================
  const handleLogout = () => {

    // ❌ REMOVE USER DATA
    localStorage.removeItem("crmUser");

    localStorage.removeItem("profile");

    // ✅ REDIRECT
    navigate("/login");

  };

  return (

    <div className="navbar">

      {/* LEFT */}
      <div className="navbar-left">

        <div className="brand">

          <FaChartLine className="brand-icon" />

          <div className="brand-text">

            <span className="brand-name">
              ClientHub
            </span>

            <span className="brand-sub">
              CRM
            </span>

          </div>

        </div>

      </div>


      {/* RIGHT */}
      <div className="navbar-right">

        {/* NOTIFICATION */}
        <div
  className="notification-wrapper"

  onClick={() =>
    navigate("/followups")
  }
>

          <FaBell className="bell-icon" />

          {

            followupCount > 0 && (

              <span className="notification-badge">

                {followupCount}

              </span>

            )

          }

        </div>

        {/* LOGOUT */}
        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          Logout

        </button>

      </div>

    </div>

  );

}

export default Navbar;