import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { ProductDetail } from "./pages/ProductDetail";
import { Donations } from "./pages/Donations";
import { Login } from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { BecomeDonor } from "./pages/BecomeDonor";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import { Sobre } from "./pages/Sobre";
import { CreateProduct } from "./pages/CreateProduct";
import { EditProduct } from "./pages/EditProduct";
import { MyProducts } from "./pages/MyProducts";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="loja" element={<Store />} />
              <Route path="produto/:id" element={<ProductDetail />} />
              <Route path="donations" element={<Donations />} />
              <Route path="become-donor" element={<BecomeDonor />} />
              <Route path="login" element={<Login />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="admin/faqs" element={<Navigate to="/admin?tab=faqs" replace />} />
              <Route path="admin/testimonials" element={<Navigate to="/admin?tab=depoimentos" replace />} />
              <Route path="create-product" element={<CreateProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
              <Route path="my-products" element={<MyProducts />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
