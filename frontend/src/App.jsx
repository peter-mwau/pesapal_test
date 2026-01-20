import { Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/sign-in"
          element={<SignIn routing="path" path="/sign-in" />}
        />
        <Route
          path="/sign-up"
          element={<SignUp routing="path" path="/sign-up" />}
        />
      </Routes>
    </>
  );
}

export default App;
