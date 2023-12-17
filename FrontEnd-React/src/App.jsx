import { BrowserRouter, Routes, Route } from "react-router-dom";

import GuestLayout from "./layouts/GuestLayout";

function App() 
{
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestLayout/>}>
          <Route path="/"></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
