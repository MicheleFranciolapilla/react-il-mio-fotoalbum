import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ContextOverlayProvider } from "./contexts/ContextOverlay";
import { ContextApiProvider } from "./contexts/ContextApi";
import { ContextUserAuthenticationProvider } from "./contexts/ContextUserAuthentication";
import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./layouts/AdminLayout";
import PageLogInSignUp from "./pages/guest/PageLogInSignUp";
import PageDashboard from "./pages/admin/PageDashboard";

function App() 
{
  return (
    <ContextOverlayProvider>
      <BrowserRouter>
        <ContextApiProvider>
          <ContextUserAuthenticationProvider>
            <Routes>
              <Route element={<GuestLayout/>}>
                <Route path="/">Home</Route>
                <Route path="/access" element={<PageLogInSignUp/>}>Access</Route>
              </Route>
              <Route element={<AdminLayout/>}>
                <Route path="/dashboard" element={<PageDashboard/>}>Dashboard</Route>
              </Route>
            </Routes>
          </ContextUserAuthenticationProvider>
        </ContextApiProvider>
      </BrowserRouter>
    </ContextOverlayProvider>
  )
}

export default App
