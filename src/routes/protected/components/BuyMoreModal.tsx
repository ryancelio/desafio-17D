const BuyMoreModal = ({ isOpen }: { isOpen: boolean }) => {
  // Use o Payment Brick do Mercado Pago aqui para pagamento único
  // Ao sucesso, chame /api/buy_extra_slot.php
  return (
    <dialog open={isOpen}>
      <div className="bg-white p-6 rounded-xl">
        <h2 className="font-bold text-lg">Limite Atingido 🔒</h2>
        <p className="text-gray-500 mt-2">
          Seu plano permite 1 solicitação por mês. Você já utilizou a deste mês.
        </p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-bold text-green-800">Solicitação Avulsa</p>
          <p className="text-sm text-green-600">
            Compre 1 crédito extra que não expira.
          </p>
          <div className="mt-2 text-xl font-bold">R$ 19,90</div>
        </div>
        {/* Componente de Pagamento Aqui */}
        <div>COMPRA</div>
      </div>
    </dialog>
  );
};

export default BuyMoreModal;
