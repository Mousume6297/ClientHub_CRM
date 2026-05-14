import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import axios from "axios";
import "../styles/profile.css";

function Profile() {

  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("view");

  const [editMode, setEditMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    department: "",
    branch: "",
    phone: "",
    avatar: ""
  });

  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: ""
  });

  // ================= LOAD PROFILE =================

  useEffect(() => {

    const storedUser =
      JSON.parse(localStorage.getItem("crmUser"));

    if (storedUser) {

      setUser(storedUser);

      axios
        .get(`http://localhost:5000/api/profile/${storedUser.email}`)

        .then((res) => {

          const data = res.data;

          setFormData({

            email: data.email || "",
            department: data.department || "",
            branch: data.branch || "",
            phone: data.phone || "",
            avatar: data.profile_image || ""

          });

        })

        .catch((err) => {

          console.log(err);

        });

    }

  }, []);

  // ================= IMAGE =================

  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setFormData({

        ...formData,
        avatar: reader.result

      });

    };

    reader.readAsDataURL(file);

  };

  // ================= UPDATE PROFILE =================

  const handleUpdate = async () => {

    try {

      const res = await axios.put(

        "http://localhost:5000/api/profile/update",

        {
          email: user.email,
          department: formData.department,
          branch: formData.branch,
          phone: formData.phone,
          profile_image: formData.avatar
        }

      );

      if (res.data.success) {

        alert("Profile updated successfully ✅");

        setEditMode(false);

      } else {

        alert("Update failed");

      }

    } catch (err) {

      console.log(err);

      alert("Server error");

    }

  };

  // ================= PASSWORD =================

  const getPasswordStrength = () => {

    const pass = passwordData.newPass;

    if (pass.length < 6) return "weak";

    if (pass.length < 10) return "medium";

    return "strong";

  };

  // ================= CHANGE PASSWORD =================

  const handlePassword = async () => {

    if (
      !passwordData.oldPass ||
      !passwordData.newPass ||
      !passwordData.confirmPass
    ) {

      alert("Fill all fields");

      return;

    }

    if (
      passwordData.newPass !==
      passwordData.confirmPass
    ) {

      alert("Passwords do not match");

      return;

    }

    try {

      const res = await axios.post(

        "http://localhost:5000/api/auth/change-password",

        {
          email: user.email,
          oldPassword: passwordData.oldPass,
          newPassword: passwordData.newPass
        }

      );

      if (res.data.success) {

        alert("Password updated successfully");

        setPasswordData({
          oldPass: "",
          newPass: "",
          confirmPass: ""
        });

      } else {

        alert(res.data.message);

      }

    } catch {

      alert("Server error");

    }

  };

  if (!user) return <h2>Loading...</h2>;

  return (

    <div className="main-layout">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="page-content">

          <h2 className="page-title">
            My Profile
          </h2>

          {/* TABS */}

          <div className="tabs">

            <button
              className={
                activeTab === "view"
                  ? "active-tab"
                  : ""
              }
              onClick={() => setActiveTab("view")}
            >
              View Profile
            </button>

            <button
              className={
                activeTab === "password"
                  ? "active-tab"
                  : ""
              }
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>

          </div>

          {/* PROFILE */}

          {activeTab === "view" && (

            <div className="profile-card">

              {/* LEFT */}

              <div className="profile-left">

                <div className="profile-avatar">

                  {formData.avatar ? (

                    <img
                      src={formData.avatar}
                      alt="profile"
                      className="avatar-img"
                    />

                  ) : (

                    user.name?.charAt(0)

                  )}

                </div>

                {editMode && (

                  <input
                    type="file"
                    className="file-input"
                    onChange={handleImageUpload}
                  />

                )}

              </div>

              {/* RIGHT */}

              <div className="profile-right">

                {!editMode ? (

                  <>

                    <h3>{user.name}</h3>

                    <p>
                      <strong>Email:</strong>
                      {" "}
                      {user.email}
                    </p>

                    <p>
                      <strong>Role:</strong>
                      {" "}
                      {user.role}
                    </p>

                    <p>
                      <strong>Department:</strong>
                      {" "}
                      {formData.department || "-"}
                    </p>

                    <p>
                      <strong>Branch:</strong>
                      {" "}
                      {formData.branch || "-"}
                    </p>

                    <p>
                      <strong>Phone:</strong>
                      {" "}
                      {formData.phone || "-"}
                    </p>

                    <button
                      className="primary-btn edit-btn"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </button>

                  </>

                ) : (

                  <>

                    <div className="form-group">

                      <label>Email</label>

                      <input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>Department</label>

                      <input
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>Branch</label>

                      <input
                        value={formData.branch}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branch: e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>Phone</label>

                      <input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value
                          })
                        }
                      />

                    </div>

                    <button
                      className="success-btn"
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>

                  </>

                )}

              </div>

            </div>

          )}

          {/* PASSWORD */}

          {activeTab === "password" && (

            <div className="password-wrapper">

              <div className="password-card">

                <h3 className="section-title">
                  Change Password
                </h3>

                <div className="form-group">

                  <label>Old Password</label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordData.oldPass}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPass: e.target.value
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>New Password</label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordData.newPass}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPass: e.target.value
                      })
                    }
                  />

                  <small className={`hint ${getPasswordStrength()}`}>

                    Strength:
                    {" "}
                    {getPasswordStrength()}

                  </small>

                </div>

                <div className="form-group">

                  <label>Confirm Password</label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordData.confirmPass}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPass: e.target.value
                      })
                    }
                  />

                </div>

                <div className="password-actions">

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    className="primary-btn"
                    onClick={handlePassword}
                  >
                    Update Password
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default Profile;