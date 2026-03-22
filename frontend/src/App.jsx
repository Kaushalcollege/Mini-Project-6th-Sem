import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./pages/Landing";
// We will create these next!
import StudentConsole from "./pages/StudentConsole";
import StudentProfile from "./pages/StudentProfile";
import AdminConsole from "./pages/AdminConsole";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student" element={<StudentConsole />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/admin" element={<AdminConsole />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
