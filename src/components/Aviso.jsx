// Aviso no rodape ("salvo", "desfazer"). Fica dentro do detalhe quando ele esta aberto,
// porque a janela de detalhe cobre o resto da pagina.
export default function Aviso({ aviso, onFechar }) {
  if (!aviso) return null;
  return (
    <div id="toast" role="status">
      <span>{aviso.msg}</span>
      {aviso.desfazer && (
        <button type="button" onClick={() => { const f = aviso.desfazer; onFechar(); f(); }}>Desfazer</button>
      )}
    </div>
  );
}
