import { NavLink } from 'react-router-dom'

const itens = [
  { para: '/listas', rotulo: 'Listas', icone: '📝' },
  { para: '/escanear', rotulo: 'Escanear', icone: '📷' },
  { para: '/painel', rotulo: 'Painel', icone: '📊' },
  { para: '/fornecedores', rotulo: 'Fornecedores', icone: '🏬' },
]

export default function NavegacaoInferior() {
  return (
    <nav className="navegacao-inferior">
      {itens.map((item) => (
        <NavLink
          key={item.para}
          to={item.para}
          className={({ isActive }) => `item-navegacao ${isActive ? 'ativo' : ''}`}
        >
          <span className="icone-navegacao" aria-hidden="true">
            {item.icone}
          </span>
          <span>{item.rotulo}</span>
        </NavLink>
      ))}
    </nav>
  )
}
