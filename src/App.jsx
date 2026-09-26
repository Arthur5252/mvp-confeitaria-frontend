import { Navigate, Route, Routes } from 'react-router-dom'
import { ProvedorAutenticacao } from './contexto/ContextoAutenticacao'
import RotaProtegida from './componentes/RotaProtegida'
import Estrutura from './componentes/Estrutura'
import Login from './paginas/Login'
import ListasCompras from './paginas/ListasCompras'
import DetalheListaCompras from './paginas/DetalheListaCompras'
import EscanearEtiqueta from './paginas/EscanearEtiqueta'
import Fornecedores from './paginas/Fornecedores'
import Painel from './paginas/Painel'

export default function App() {
  return (
    <ProvedorAutenticacao>
      <Routes>
        <Route path="/entrar" element={<Login />} />
        <Route
          element={
            <RotaProtegida>
              <Estrutura />
            </RotaProtegida>
          }
        >
          <Route path="/listas" element={<ListasCompras />} />
          <Route path="/listas/:id" element={<DetalheListaCompras />} />
          <Route path="/escanear" element={<EscanearEtiqueta />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/painel" element={<Painel />} />
        </Route>
        <Route path="*" element={<Navigate to="/listas" replace />} />
      </Routes>
    </ProvedorAutenticacao>
  )
}
