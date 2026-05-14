import React, { useEffect, useState } from "react";

import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import LeadsChart from "../components/LeadsChart";
import WeeklyChart from "../components/WeeklyChart";

import "../styles/dashboard.css";

import {
  FaUsers,
  FaPhone,
  FaCheckCircle,
  FaUserTie
} from "react-icons/fa";

function Dashboard() {

  const [leads, setLeads] = useState([]);

  const [staff, setStaff] = useState([]);

  const [totalLeads, setTotalLeads] =
    useState(0);

  const [contacted, setContacted] =
    useState(0);

  const [converted, setConverted] =
    useState(0);

  // ================= FETCH DATA =================
  useEffect(() => {

    // ===== CURRENT USER =====
    const currentUser =
      JSON.parse(
        localStorage.getItem("crmUser")
      ) || {};

    const role =
      currentUser.role?.toLowerCase();

    const userName =
      currentUser.name;

    // ===== FETCH LEADS =====
    fetch(

`http://localhost:5000/api/leads?role=${role}&userName=${userName}`

    )

      .then((res) => res.json())

      .then((data) => {

        console.log("Leads from DB:", data);

        setLeads(data);

        // ===== TOTAL =====
        setTotalLeads(data.length);

        // ===== CONTACTED =====
        setContacted(

          data.filter(
            (l) => l.status === "Contacted"
          ).length

        );

        // ===== CONVERTED =====
        setConverted(

          data.filter(
            (l) => l.status === "Converted"
          ).length

        );

      })

      .catch((err) => console.log(err));



    // ===== FETCH STAFF =====
    fetch("http://localhost:5000/api/staff")

      .then((res) => res.json())

      .then((data) => {

        if (data.success) {

          setStaff(data.data);

        }

      })

      .catch((err) => console.log(err));

  }, []);




  // ================= WEEKLY DATA =================
  const weeklyData =
    [0, 0, 0, 0, 0, 0, 0];

  leads.forEach((lead, index) => {

    if (lead.created_at) {

      const day =
        new Date(
          lead.created_at
        ).getDay();

      const idx =
        day === 0 ? 6 : day - 1;

      weeklyData[idx]++;

    }

    else {

      weeklyData[index % 7]++;

    }

  });




  // ================= CALCULATIONS =================
  const conversionRate =

    totalLeads

      ?

      (
        (converted / totalLeads) * 100
      ).toFixed(1)

      :

      0;



  const activeLeads =
    totalLeads - converted;



  const followUps =
    leads.filter(
      (l) => l.status === "Contacted"
    ).length;




  // ================= GROWTH =================
  const thisWeek =
    weeklyData.reduce(
      (a, b) => a + b,
      0
    );



  const lastWeek =
    Math.max(thisWeek - 2, 1);



  const growth =

    lastWeek

      ?

      (
        ((thisWeek - lastWeek) / lastWeek) * 100
      ).toFixed(1)

      :

      0;




  // ================= CHART DATA =================
  const leadsOverviewData = {

    labels: [
      "New",
      "Contacted",
      "Converted"
    ],

    values: [

      leads.filter(
        (l) => l.status === "New"
      ).length,

      contacted,

      converted

    ]

  };




  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <h2 className="page-title">
          Dashboard
        </h2>



        {/* ================= TOP CARDS ================= */}
        <div className="top-cards">

          {/* TOTAL LEADS */}
          <div className="top-card blue">

            <div className="card-top">

              <FaUsers className="card-icon" />

              <span>Total Leads</span>

            </div>

            <h2>{totalLeads}</h2>

            <p
              className={`growth ${
                growth >= 0
                  ? "positive"
                  : "negative"
              }`}
            >

              {growth >= 0 ? "+" : ""}

              {growth}%

            </p>

          </div>



          {/* CONTACTED */}
          <div className="top-card orange">

            <div className="card-top">

              <FaPhone className="card-icon" />

              <span>Contacted</span>

            </div>

            <h2>{contacted}</h2>

            <p className="growth positive">
              +5%
            </p>

          </div>



          {/* CONVERTED */}
          <div className="top-card pink">

            <div className="card-top">

              <FaCheckCircle className="card-icon" />

              <span>Converted</span>

            </div>

            <h2>{converted}</h2>

            <p className="growth positive">
              +3%
            </p>

          </div>



          {/* STAFF */}
          <div className="top-card purple">

            <div className="card-top">

              <FaUserTie className="card-icon" />

              <span>Staff</span>

            </div>

            <h2>{staff.length}</h2>

            <p className="growth positive">
              +2%
            </p>

          </div>

        </div>




        {/* ================= CHARTS ================= */}
        <div className="charts-container">

          {/* LEADS OVERVIEW */}
          <div className="chart-box large">

            <h3>Leads Overview</h3>

            <LeadsChart
              data={leadsOverviewData}
            />

          </div>



          {/* WEEKLY ACTIVITY */}
          <div className="chart-box small">

            <h3>Weekly Activity</h3>

            {

              weeklyData.every(
                (v) => v === 0
              )

              ?

              <p>No data available</p>

              :

              <WeeklyChart
                data={weeklyData}
              />

            }

          </div>

        </div>




        {/* ================= BOTTOM STATS ================= */}
        <div className="dashboard-bottom">

          <div className="dashboard-stats">

            {/* CONVERSION RATE */}
            <div className="stat-card">

              <h4>
                Conversion Rate
              </h4>

              <p>
                {conversionRate}%
              </p>

              <small>
                Based on total leads
              </small>

            </div>



            {/* ACTIVE LEADS */}
            <div className="stat-card">

              <h4>
                Active Leads
              </h4>

              <p>
                {activeLeads}
              </p>

              <small>
                Not converted yet
              </small>

            </div>



            {/* FOLLOW UPS */}
            <div className="stat-card">

              <h4>
                Follow Ups
              </h4>

              <p>
                {followUps}
              </p>

              <small>
                Need action
              </small>

            </div>



            {/* RESPONSE TIME */}
            <div className="stat-card">

              <h4>
                Response Time
              </h4>

              <p>
                2.4h
              </p>

              <small>
                Average
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;
