import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { ProductDetail } from "./pages/ProductDetail";
import { Donations } from "./pages/Donations";
import { Login } from "./pages/Login";
import { MyProducts } from "./pages/MyProducts";
import { CreateProduct } from "./pages/CreateProduct";
import { AuthProvider } from "./contexts/AuthContext";
import { BecomeDonor } from "./pages/BecomeDonor";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="loja" element={<Store />} />
              <Route path="produto/:id" element={<ProductDetail />} />
              <Route path="donations" element={<Donations />} />
              <Route path="my-products" element={<MyProducts />} />
              <Route path="create-product" element={<CreateProduct />} />
              <Route path="become-donor" element={<BecomeDonor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-product" element={<CreateProduct />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
