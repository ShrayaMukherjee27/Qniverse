
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import ConceptGraph from "./pages/ConceptGraph";
import Questions from "./pages/Questions";
import Planner from "./pages/Planner";
import Progress from "./pages/Progress";
import GameLab from "./pages/GameLab";

function AppLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const isOverview =
    location.pathname === "/" ||
    location.pathname === "/dashboard";

  return (
    <div className="app">
      {!isAuthPage && !isOverview && <Sidebar />}

      <main
        className={
          isAuthPage || isOverview
            ? "main-content full-content"
            : "main-content"
        }
      >
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/concept-graph"
            element={
              <ProtectedRoute>
                <ConceptGraph />
              </ProtectedRoute>
            }
          />

          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <Questions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameLab />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;