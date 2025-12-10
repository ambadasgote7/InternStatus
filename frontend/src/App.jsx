import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";  
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import { Provider } from "react-redux";
import appStore from "./store/appStore";

function App() {
 

  return (
    <div>
      <Provider store={appStore}> 
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<MainLayout/>} />
            <Route path='/signup' element={<Signup/>} />
            <Route path='/login' element={<Login/>} />
          </Routes>
      </BrowserRouter>
      </Provider>
      
    </div>
  )
}

export default App
