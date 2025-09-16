export function Donations() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-2">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-8">
          {/* Image and Donation Sections */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Donation Content */}
            <div className="lg:w-2/3 w-full">
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

          {/* Donors Section - Full Width */}
          <div className="w-full">
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6 text-center">Principais Doadores</h4>
              <p className="text-sm text-gray-600 mb-8 text-center">Agradecemos aos maiores apoiadores que ajudaram a transformar vidas.</p>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Top Donors Podium */}
                <div className="lg:w-1/2 w-full">
                  <div className="flex justify-center items-end space-x-4 mb-8">
                    {/* 2º lugar - Prata */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-gray-300 mb-2">M</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">🥈</div>
                      </div>
                      <div className="bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg px-4 py-6 w-24 text-center shadow-md">
                        <p className="font-bold text-gray-800 text-sm">2º</p>
                      </div>
                      <div className="text-center mt-2">
                        <p className="font-semibold text-gray-900">Movimento Solidariedade</p>
                        <p className="text-xs text-gray-600">Doação única</p>
                      </div>
                    </div>

                    {/* 1º lugar - Ouro */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-yellow-400 mb-2">A</div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">🥇</div>
                      </div>
                      <div className="bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-lg px-6 py-8 w-28 text-center shadow-lg">
                        <p className="font-bold text-yellow-800 text-lg">1º</p>
                      </div>
                      <div className="text-center mt-2">
                        <p className="font-semibold text-gray-900">Ana Souza</p>
                        <p className="text-xs text-gray-600">Doações recorrentes — 12 meses</p>
                      </div>
                    </div>

                    {/* 3º lugar - Bronze */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-orange-400 mb-2">P</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">🥉</div>
                      </div>
                      <div className="bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg px-4 py-4 w-24 text-center shadow-md">
                        <p className="font-bold text-orange-800 text-sm">3º</p>
                      </div>
                      <div className="text-center mt-2">
                        <p className="font-semibold text-gray-900">Paulo Ribeiro</p>
                        <p className="text-xs text-gray-600">Doações recorrentes — 6 meses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Donors */}
                <div className="lg:w-1/2 w-full">
                  <h5 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4 text-center">Agradecemos a todos os doadores que apoiam nossa causa</h5>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-green-300 flex items-center justify-center mr-3 text-white font-bold">J</div>
                        <div>
                          <p className="font-semibold">João Silva</p>
                          <p className="text-sm text-gray-600">Doação única</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">4º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center mr-3 text-white font-bold">M</div>
                        <div>
                          <p className="font-semibold">Maria Oliveira</p>
                          <p className="text-sm text-gray-600">Doações recorrentes — 8 meses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">5º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center mr-3 text-white font-bold">C</div>
                        <div>
                          <p className="font-semibold">Carlos Mendes</p>
                          <p className="text-sm text-gray-600">Doação única</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">6º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-red-300 flex items-center justify-center mr-3 text-white font-bold">L</div>
                        <div>
                          <p className="font-semibold">Lucia Ferreira</p>
                          <p className="text-sm text-gray-600">Doações recorrentes — 10 meses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">7º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-teal-300 flex items-center justify-center mr-3 text-white font-bold">R</div>
                        <div>
                          <p className="font-semibold">Roberto Alves</p>
                          <p className="text-sm text-gray-600">Doação única</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">8º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center mr-3 text-white font-bold">S</div>
                        <div>
                          <p className="font-semibold">Sofia Costa</p>
                          <p className="text-sm text-gray-600">Doações recorrentes — 4 meses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">9º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-cyan-300 flex items-center justify-center mr-3 text-white font-bold">E</div>
                        <div>
                          <p className="font-semibold">Eduardo Lima</p>
                          <p className="text-sm text-gray-600">Doação única</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-700">10º</p>
                        <p className="text-xs text-gray-500">Posição</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}