import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ContextOverlayProvider } from "./contexts/ContextOverlay";
import { ContextApiProvider } from "./contexts/ContextApi";
import { ContextUserAuthenticationProvider } from "./contexts/ContextUserAuthentication";
import GuestLayout from "./layouts/GuestLayout";
import PageLogInSignUp from "./pages/PageLogInSignUp";

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
            </Routes>
          </ContextUserAuthenticationProvider>
        </ContextApiProvider>
      </BrowserRouter>
    </ContextOverlayProvider>
  )
}

export default App
