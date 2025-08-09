import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { Layout } from "./components/Layout"
import { Home } from "./pages/Home"
import { Marketplace } from "./pages/Marketplace"
import { Login } from "./pages/Login"
import { CreateListing } from "./pages/CreateListing"
import { ProductDetail } from "./pages/ProductDetail"
import { Donations } from "./pages/Donations"
import { BecomeDonor } from "./pages/BecomeDonor"
import { DonorDashboard } from "./pages/DonorDashboard"
import { BlankPage } from "./pages/BlankPage"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="login" element={<Login />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="donations" element={<Donations />} />
            <Route path="become-donor" element={<BecomeDonor />} />
            <Route path="donor-dashboard" element={<DonorDashboard />} />
          </Route>
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App