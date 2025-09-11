export function Donations() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-2">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Image - Shows only on mobile */}
          <div className="lg:hidden w-full flex justify-center mb-6">
            <div className="w-full max-w-md">
              <img
                src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                alt="Força e Esperança"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-2/3 w-full">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6">Como Doar</h2>
              
              {/* Monthly Donation Section */}
              <div className="p-4 mb-4 bg-pink-50 border-2 border-pink-300 rounded-lg">
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">Doação Mensal</h3>
                <div className="flex flex-col md:flex-row items-center md:items-center mb-4">
                  <div className="mb-4 md:mb-0 text-center md:mr-4">
                    <img
                      src="/img/catarse.png"
                      alt="Catarse"
                      className="w-32 h-16 object-contain rounded"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="mb-0">
                      Acesse{" "}
                      <a href="https://www.catarse.me/" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-bold hover:underline">
                        https://www.catarse.me/
                      </a>
                      , selecione o valor desejado para doar mensalmente e ajude a semear sorrisos e fortalecer nossa rede de solidariedade.
                    </p>
                  </div>
                </div>
              </div>

              {/* One-time Donation Section */}
              <div className="mb-6">
                <h4 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">Doação Única</h4>
                <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <p className="text-lg font-semibold text-pink-700 mb-2">Rede Feminina de Combate ao Câncer</p>
                  <p className="text-base font-medium text-pink-600">CNPJ: 22.222.879/0001-59</p>
                </div>
                
                {/* PIX */}
                <div className="flex items-center mb-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded flex items-center justify-center mr-3">
                    <img src="/img/pix.png" alt="PIX" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-1">PIX</p>
                    <p className="text-gray-700">22.222.879/0001-59</p>
                  </div>
                </div>

                {/* Caixa Econômica */}
                <div className="flex items-center mb-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded flex items-center justify-center mr-3">
                    <img src="/img/caixa.svg" alt="Caixa Econômica" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-1">Caixa Econômica</p>
                    <p className="text-gray-700">Ag: 1010 | Op: 003 | C/C: 2222-7</p>
                  </div>
                </div>

                {/* Banco do Brasil */}
                <div className="flex items-center mb-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded flex items-center justify-center mr-3">
                    <img src="/img/bb.png" alt="Banco do Brasil" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-1">Banco do Brasil</p>
                    <p className="text-gray-700">Agência: 1234-3 | C/C: 150137-2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Image - Shows only on desktop */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="w-full">
              <img
                src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                alt="Força e Esperança"
                className="w-full h-auto object-contain max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
