import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ShoppingLists from './pages/ShoppingLists'
import ShoppingListDetail from './pages/ShoppingListDetail'
import ScanLabel from './pages/ScanLabel'
import Suppliers from './pages/Suppliers'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/lists" element={<ShoppingLists />} />
          <Route path="/lists/:id" element={<ShoppingListDetail />} />
          <Route path="/scan" element={<ScanLabel />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/lists" replace />} />
      </Routes>
    </AuthProvider>
  )
}
