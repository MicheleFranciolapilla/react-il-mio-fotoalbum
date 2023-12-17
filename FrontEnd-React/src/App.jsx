import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ContextOverlayProvider } from "./contexts/ContextOverlay";
import { ContextDataFetchProvider } from "./contexts/ContextDataFetch";
import { ContextUserAuthenticationProvider } from "./contexts/ContextUserAuthentication";
import GuestLayout from "./layouts/GuestLayout";
import PageLogInSignUp from "./pages/PageLogInSignUp";

function App() 
{
  return (
    <ContextOverlayProvider>
      <BrowserRouter>
        <ContextDataFetchProvider>
          <ContextUserAuthenticationProvider>
            <Routes>
              <Route element={<GuestLayout/>}>
                <Route path="/">Home</Route>
                <Route path="/access" element={<PageLogInSignUp/>}>Access</Route>
              </Route>
            </Routes>
          </ContextUserAuthenticationProvider>
        </ContextDataFetchProvider>
      </BrowserRouter>
    </ContextOverlayProvider>
  )
}

export default App
