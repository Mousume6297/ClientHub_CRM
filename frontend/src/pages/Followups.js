import React, {

  useEffect,
  useState

} from "react";

import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

function Followups() {

  const [followups, setFollowups] =
    useState([]);

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

        setFollowups(data);

      })

      .catch((err) => console.log(err));

  }, []);

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <h2 className="page-title">
          Upcoming Follow-ups
        </h2>

        <div className="dashboard-card">

          {

            followups.length === 0

            ?

            <p>No upcoming follow-ups found</p>

            :

            followups.map((item) => (

              <div
                key={item.id}
                className="followup-widget-item"
              >

                {/* DATE */}
                <p>

                  <b>Date:</b>
                  {" "}

                  {

                    new Date(item.followup_date)

                    .toLocaleDateString()

                  }

                </p>

                {/* TIME */}
                <p>

                  <b>Time:</b>
                  {" "}

                  {

                    item.followup_time
                    ?.slice(0,5)

                  }

                </p>

                {/* TYPE */}
                <p>

                  <b>Type:</b>
                  {" "}

                  {item.meeting_type}

                </p>

                {/* NOTE */}
                <p>

                  <b>Note:</b>
                  {" "}

                  {item.note}

                </p>

                {/* CREATED BY */}
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

      </div>

    </div>

  );

}

export default Followups;