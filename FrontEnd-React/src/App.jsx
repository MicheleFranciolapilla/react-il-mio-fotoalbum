import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ContextOverlayProvider } from "./contexts/ContextOverlay";
import { ContextDialogProvider } from "./contexts/ContextDialog";
import { ContextApiProvider } from "./contexts/ContextApi";
import { ContextUserAuthenticationProvider } from "./contexts/ContextUserAuthentication";
import ProtectAdminRoutes from "./middlewares/ProtectAdminRoutes";
import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./layouts/AdminLayout";
import PageLogInSignUp from "./pages/guest/PageLogInSignUp";
import PageCollectionGuest from "./pages/guest/PageCollectionGuest";
import PageDashboard from "./pages/admin/PageDashboard";

function App() 
{
  // Per come è configurato il programma (rotte private accessibili soltanto a seguito di login/registrazione o mediante ricaricamento pagina, comunque gestito da apposita "useEffect") il middleware "ProtectAdminRoutes" si rivela assolutamente inutile ma non dannoso, quindi, per il momento, lo si lascia lì dov'è
  return (
    <ContextOverlayProvider>
      <BrowserRouter>
        <ContextDialogProvider>
          <ContextApiProvider>
            <ContextUserAuthenticationProvider>
              <Routes>
                <Route element={<GuestLayout/>}>
                  <Route path="/">Home</Route>
                  <Route path="/access" element={<PageLogInSignUp/>}>Access</Route>
                  <Route path="/collection" element={<PageCollectionGuest/>}>Collection</Route>
                </Route>
                <Route element={<ProtectAdminRoutes><AdminLayout/></ProtectAdminRoutes>}>
                  <Route path="/dashboard" element={<PageDashboard/>}>Dashboard</Route>
                </Route>
              </Routes>
            </ContextUserAuthenticationProvider>
          </ContextApiProvider>
        </ContextDialogProvider>
      </BrowserRouter>
    </ContextOverlayProvider>
  )
}

export default App
