import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./components/pages/Auth/Register";
import Login from "./components/pages/Auth/Login";
import Home from "./components/pages/Home";
import Blogs from "./components/pages/Blogs";
import Problems from "./components/pages/problems/Problems";
import ProblemPage from "./components/pages/problems/ProblemPage";
import NotFound from "./components/pages/NotFound";
import MyCodePage from "./components/pages/MyCode/MyCodePage";
import Submissions from "./components/pages/Submissions/SubmissionsPage";
import Profile from "./components/pages/Profile";
import { UserProvider } from "./context/UserContext";
import SavedSnippets from "./components/pages/SavedSnippets";

import AdminRoute from "./components/pages/Auth/AdminRoute";
import AdminDashboard from "./components/pages/Admin/AdminDashboard";
import CreateProblem from "./components/pages/Admin/CreateProblem";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/problemset" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="/compiler" element={<MyCodePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/savedsnippets" element={<SavedSnippets />} />
          {/* Admin-only Route */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/newproblem" element={<CreateProblem />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
