import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { ProductDetail } from "./pages/ProductDetail";
import { Donations } from "./pages/Donations";
import { Login } from "./pages/Login";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="loja" element={<Store />} />
            <Route path="produto/:id" element={<ProductDetail />} />
            <Route path="donations" element={<Donations />} />
          </Route>
          
          <Route path="/login" element={<Login />} />

        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;