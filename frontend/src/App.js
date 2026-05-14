import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Leads from "./pages/lead";
import AddLead from "./pages/addlead";
import CreateStaff from "./pages/createstaff";
import Profile from "./pages/profile";
import LeadDetails from "./pages/leaddetails";
import Followups from "./pages/Followups";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/add-lead" element={<AddLead />} />
        <Route path="/create-staff" element={<CreateStaff />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lead/:id" element={<LeadDetails />} />
        <Route path="/followups" element={<Followups />} />
      </Routes>
    </Router>
  );
}

export default App;