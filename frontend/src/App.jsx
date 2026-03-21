import Home from "./Home/HomePage"
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from "./auth/Register"
import About from "./Home/About"
import Contact from "./Home/Contact"
import FAQ from "./Home/FAQ"
import DashPage from "./AdminDash/DashPage"
import DoP from "./AdminDash/Dashover/DashOverPage"

function App() {

  return (
    <Routes>
    <Route path="/"element={<Home/>}/>
     <Route path="Register" element={<Register/>}/>
     <Route path="about" element={<About/>}/>
     <Route path="contact" element={<Contact/>}/>
     <Route path="dashboard" element={<DashPage/>}>
     <Route index element={<DoP/>}/>
     </Route>
    </Routes>
  )
}

export default App
