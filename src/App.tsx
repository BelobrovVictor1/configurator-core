import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import PublicConfiguratorPage from "./pages/PublicConfiguratorPage";
import EmbedConfiguratorPage from "./pages/EmbedConfiguratorPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/c/ferestre-max"
              replace
            />
          }
        />

        <Route
          path="/c/:clientSlug"
          element={
            <PublicConfiguratorPage />
          }
        />

        <Route
          path="/embed/:clientSlug"
          element={
            <EmbedConfiguratorPage />
          }
        />

        <Route
          path="/admin/login"
          element={
            <AdminLoginPage />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminDashboardPage />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;