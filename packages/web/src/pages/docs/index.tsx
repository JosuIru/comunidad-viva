import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import Layout from '@/components/Layout';

type TabType = 'about' | 'features' | 'hybrid' | 'gamification' | 'governance' | 'guide' | 'tech' | 'deployment' | 'contribute' | 'downloads';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const tabs = [
    { id: 'about' as TabType, label: 'Sobre Comunidad Viva', icon: '🏘️' },
    { id: 'features' as TabType, label: 'Características', icon: '✨' },
    { id: 'hybrid' as TabType, label: 'Sistema Híbrido', icon: '🔄' },
    { id: 'gamification' as TabType, label: 'Gamificación', icon: '🎮' },
    { id: 'governance' as TabType, label: 'Gobernanza PoH', icon: '🏛️' },
    { id: 'downloads' as TabType, label: 'Documentos', icon: '📥' },
    { id: 'guide' as TabType, label: 'Guía de Uso', icon: '📖' },
    { id: 'tech' as TabType, label: 'Tecnología', icon: '⚙️' },
    { id: 'deployment' as TabType, label: 'Deployment', icon: '🚀' },
    { id: 'contribute' as TabType, label: 'Colaborar', icon: '🤝' },
  ];

  return (
    <Layout title="Documentación - Comunidad Viva">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold mb-4">📚 Documentación</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Todo lo que necesitas saber sobre Comunidad Viva: nuestra misión,
              características, cómo usar la plataforma y cómo colaborar.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* About Section */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-4xl">🌱</span>
                    ¿Qué es Comunidad Viva?
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    Comunidad Viva es una <strong>red social de economía colaborativa local</strong> que
                    conecta a personas de tu comunidad para compartir recursos, servicios, conocimientos y experiencias.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Nuestra plataforma facilita el intercambio sin necesidad de dinero tradicional,
                    promoviendo relaciones de confianza, solidaridad y apoyo mutuo entre vecinos.
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-4xl">🎯</span>
                    Nuestra Misión
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">💚</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Fortalecer la comunidad local
                        </h3>
                        <p className="text-gray-700">
                          Crear lazos fuertes entre vecinos, fomentando la cooperación y el conocimiento mutuo.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">♻️</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Promover la economía circular
                        </h3>
                        <p className="text-gray-700">
                          Reducir el desperdicio dando segunda vida a objetos y compartiendo recursos infrautilizados.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">⚖️</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Facilitar el acceso equitativo
                        </h3>
                        <p className="text-gray-700">
                          Hacer accesibles bienes y servicios sin barreras económicas mediante un sistema de créditos comunitarios.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">🌍</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Impulsar la sostenibilidad
                        </h3>
                        <p className="text-gray-700">
                          Reducir la huella ecológica favoreciendo el consumo local y el intercambio sobre la compra.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-4xl">💡</span>
                    Principios Fundamentales
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">🤝 Reciprocidad</h4>
                      <p className="text-sm text-blue-800">
                        Lo que das a la comunidad vuelve a ti de múltiples formas
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">⭐ Confianza</h4>
                      <p className="text-sm text-green-800">
                        Sistema de reputación basado en la generosidad y fiabilidad
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">🗳️ Democracia</h4>
                      <p className="text-sm text-purple-800">
                        Las decisiones importantes se toman mediante consenso comunitario
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
                      <h4 className="font-semibold text-pink-900 mb-2">🌐 Transparencia</h4>
                      <p className="text-sm text-pink-800">
                        Código abierto y gestión visible de la comunidad
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Features Section */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🛍️ Ofertas y Servicios
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Publica y descubre ofertas de bienes, servicios, préstamos de objetos o intercambios.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">
                        <strong>Banco de Tiempo:</strong> Ofrece tu tiempo y habilidades (clases, reparaciones, cuidados)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">
                        <strong>Mercado Local:</strong> Vende o intercambia objetos usando créditos o euros
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">
                        <strong>Préstamos:</strong> Comparte herramientas, libros o cualquier objeto de forma temporal
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">
                        <strong>Geolocalización:</strong> Encuentra ofertas cerca de ti en el mapa interactivo
                      </span>
                    </li>
                  </ul>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    💰 Sistema de Créditos Comunitarios
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Los créditos son nuestra moneda local virtual que facilita los intercambios sin dinero.
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      ¿Cómo funcionan los créditos?
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Empiezas con un saldo inicial de créditos al registrarte</li>
                      <li>• Ganas créditos ofreciendo servicios y ayudando a la comunidad</li>
                      <li>• Gastas créditos accediendo a servicios y bienes de otros miembros</li>
                      <li>• No se pueden convertir a dinero real - solo tienen valor dentro de la comunidad</li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📅 Eventos Comunitarios
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Organiza y participa en actividades que fortalecen los lazos de la comunidad.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                      <div className="text-2xl mb-2">🎨</div>
                      <h4 className="font-semibold mb-1">Talleres y Clases</h4>
                      <p className="text-sm text-gray-600">Aprende y enseña habilidades</p>
                    </div>
                    <div className="p-4 border-2 border-blue-200 rounded-lg">
                      <div className="text-2xl mb-2">🤝</div>
                      <h4 className="font-semibold mb-1">Encuentros Sociales</h4>
                      <p className="text-sm text-gray-600">Conoce a tus vecinos</p>
                    </div>
                    <div className="p-4 border-2 border-purple-200 rounded-lg">
                      <div className="text-2xl mb-2">🌳</div>
                      <h4 className="font-semibold mb-1">Voluntariado</h4>
                      <p className="text-sm text-gray-600">Mejora tu entorno local</p>
                    </div>
                    <div className="p-4 border-2 border-pink-200 rounded-lg">
                      <div className="text-2xl mb-2">🎉</div>
                      <h4 className="font-semibold mb-1">Fiestas</h4>
                      <p className="text-sm text-gray-600">Celebra con la comunidad</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    💜 Características Sociales
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">💬</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Mensajería Directa</h3>
                        <p className="text-gray-700">Comunícate de forma segura con otros miembros</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">❤️</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Swipe de Ofertas</h3>
                        <p className="text-gray-700">Descubre ofertas de forma intuitiva deslizando tarjetas</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">📖</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Historias 24h</h3>
                        <p className="text-gray-700">Comparte momentos efímeros con la comunidad</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">🎯</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Sistema de Matches</h3>
                        <p className="text-gray-700">Conecta con personas que comparten intereses similares</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🛒 Compras Grupales
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Únete a compras colectivas para obtener mejores precios y reducir costos.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      Organiza compras al por mayor con vecinos
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      Accede a productos sostenibles a mejor precio
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      Apoya a productores locales con pedidos agrupados
                    </li>
                  </ul>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🗳️ Gobernanza Comunitaria
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Participa en las decisiones importantes de la comunidad mediante un sistema democrático.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        🏛️ Propuestas
                      </h4>
                      <p className="text-sm text-purple-800">
                        Cualquier miembro puede crear propuestas de mejora
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        👥 Votación por Consenso
                      </h4>
                      <p className="text-sm text-blue-800">
                        Sistema de votación que busca el acuerdo colectivo
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">
                        📊 Transparencia Total
                      </h4>
                      <p className="text-sm text-green-800">
                        Todas las votaciones y decisiones son públicas
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    ⭐ Sistema de Reputación
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Tu puntuación de generosidad refleja tus contribuciones a la comunidad.
                  </p>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Gana puntos de generosidad:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Completando ofertas y servicios</li>
                      <li>• Participando en eventos comunitarios</li>
                      <li>• Recibiendo valoraciones positivas</li>
                      <li>• Contribuyendo regularmente a la comunidad</li>
                      <li>• Referir nuevos miembros</li>
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {/* Hybrid Layer Section */}
            {activeTab === 'hybrid' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    🔄 Sistema Híbrido de Capas Económicas
                  </h2>
                  <p className="text-xl opacity-90">
                    La primera plataforma que permite la coexistencia pacífica de 3 paradigmas económicos diferentes.
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    ¿Qué es el Sistema Híbrido?
                  </h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    Es un sistema revolucionario que te permite elegir cómo quieres participar en la economía:
                    capitalismo tradicional, economía de transición, o economía de regalo pura. ¡Tú decides!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-4 border-blue-200 rounded-lg p-6 bg-blue-50">
                      <div className="text-4xl mb-3">🏦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-3">TRADITIONAL</h3>
                      <p className="text-gray-700 mb-3">Sistema capitalista clásico</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ Precios en euros y créditos</li>
                        <li>✓ Transacciones tradicionales</li>
                        <li>✓ Reviews y reputación</li>
                        <li>✓ Ideal para comercio local</li>
                      </ul>
                    </div>

                    <div className="border-4 border-green-200 rounded-lg p-6 bg-green-50">
                      <div className="text-4xl mb-3">🔄</div>
                      <h3 className="text-2xl font-bold text-green-900 mb-3">TRANSITIONAL</h3>
                      <p className="text-gray-700 mb-3">Economía de regalo gradual</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ "Paga lo que recibiste"</li>
                        <li>✓ Sistema pay-it-forward</li>
                        <li>✓ Cadena de favores</li>
                        <li>✓ Transición suave</li>
                      </ul>
                    </div>

                    <div className="border-4 border-purple-200 rounded-lg p-6 bg-purple-50">
                      <div className="text-4xl mb-3">🎁</div>
                      <h3 className="text-2xl font-bold text-purple-900 mb-3">GIFT_PURE</h3>
                      <p className="text-gray-700 mb-3">Economía de regalo pura</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ Post-dinero, sin precios</li>
                        <li>✓ Compartir abundancia</li>
                        <li>✓ Expresar necesidades</li>
                        <li>✓ Cero tracking, cero deuda</li>
                      </ul>
                    </div>

                    <div className="border-4 border-pink-200 rounded-lg p-6 bg-pink-50">
                      <div className="text-4xl mb-3">🦎</div>
                      <h3 className="text-2xl font-bold text-pink-900 mb-3">CHAMELEON</h3>
                      <p className="text-gray-700 mb-3">Modo experimental</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ Prueba diferentes capas</li>
                        <li>✓ Bridge events temporales</li>
                        <li>✓ Sin compromiso</li>
                        <li>✓ Perfecto para explorar</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Funcionalidades Principales
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                      <h4 className="font-semibold text-lg mb-2">🔄 Migración Libre entre Capas</h4>
                      <p className="text-gray-700">Cambia de paradigma económico cuando quieras. Tu elección, tu libertad.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                      <h4 className="font-semibold text-lg mb-2">🌉 Bridge Events</h4>
                      <p className="text-gray-700">Experimenta temporalmente con otra capa. Por ejemplo: "Semana sin dinero".</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <h4 className="font-semibold text-lg mb-2">🎯 Umbral de Migración</h4>
                      <p className="text-gray-700">Si 70% de la comunidad está en GIFT_PURE, se propone migración colectiva.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                      <h4 className="font-semibold text-lg mb-2">🎉 Celebraciones de Abundancia</h4>
                      <p className="text-gray-700">Registra y celebra cuando la comunidad comparte recursos generosamente.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Gamification Section */}
            {activeTab === 'gamification' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    🎮 Gamificación y Engagement Viral
                  </h2>
                  <p className="text-xl opacity-90">
                    Sistema completo de gamificación que hace divertido y adictivo participar en la economía colaborativa.
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Funcionalidades de Gamificación
                  </h2>

                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-blue-900 mb-3">📚 Onboarding Gamificado</h3>
                      <p className="text-gray-700 mb-3">Tutorial interactivo de 5 pasos con recompensas</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Completa tu perfil → +10 créditos</li>
                        <li>• Crea tu primera oferta → +15 créditos</li>
                        <li>• Únete a una comunidad → +10 créditos</li>
                        <li>• Asiste a un evento → +10 créditos</li>
                        <li>• Completa tu primer intercambio → +15 créditos</li>
                        <li><strong>🎁 Bonus por completar todo: +50 créditos totales</strong></li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-red-900 mb-3">⚡ Flash Deals</h3>
                      <p className="text-gray-700 mb-3">Ofertas relámpago con descuentos por tiempo limitado</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Descuentos de 30-70%</li>
                        <li>• Duración: 2-4 horas</li>
                        <li>• Cantidad limitada (scarcity marketing)</li>
                        <li>• Rotación automática 3 veces/día</li>
                        <li>• Notificaciones push en tiempo real</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-purple-900 mb-3">📖 Stories 24h</h3>
                      <p className="text-gray-700 mb-3">Contenido efímero tipo Instagram</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Comparte fotos y textos por 24 horas</li>
                        <li>• Auto-destrucción automática</li>
                        <li>• Contador de vistas</li>
                        <li>• Perfecto para compartir momentos</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-pink-500 bg-pink-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-pink-900 mb-3">❤️ Swipe & Match</h3>
                      <p className="text-gray-700 mb-3">Descubre ofertas tipo Tinder</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Desliza para dar like o dislike</li>
                        <li>• Super like con 3 créditos</li>
                        <li>• Matches cuando ambos se interesan</li>
                        <li>• Algoritmo de recomendación personalizado</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-green-900 mb-3">🏆 Challenges (Retos)</h3>
                      <p className="text-gray-700 mb-3">Retos semanales con leaderboard</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Retos rotativos cada semana</li>
                        <li>• Clasificación en tiempo real</li>
                        <li>• Bonus especial para top 10</li>
                        <li>• Tipos: ayudar vecinos, crear ofertas, eventos</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-yellow-900 mb-3">🎁 Sistema de Referidos</h3>
                      <p className="text-gray-700 mb-3">Invita amigos y gana recompensas</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Código personalizado único</li>
                        <li>• Tú: +20 créditos por cada referido</li>
                        <li>• Tu amigo: +10 créditos al registrarse</li>
                        <li>• Milestones: 5, 10, 25, 50 referidos → Bonos extra</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-indigo-900 mb-3">📊 Niveles y XP</h3>
                      <p className="text-gray-700 mb-3">Sistema de progresión de 10 niveles</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Gana XP por cada acción</li>
                        <li>• 10 niveles con perks desbloqueables</li>
                        <li>• Nivel 5: Descuento 10% en todo</li>
                        <li>• Nivel 10: Acceso VIP a eventos</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-orange-900 mb-3">🔥 Streaks (Rachas)</h3>
                      <p className="text-gray-700 mb-3">Días consecutivos activos</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Mantén tu racha activa</li>
                        <li>• Multiplicador hasta ×2 en recompensas</li>
                        <li>• Milestones: 7, 14, 30, 60, 90 días</li>
                        <li>• Badges especiales por constancia</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-3">⏰ Happy Hour</h3>
                      <p className="text-gray-700 mb-3">Períodos con créditos dobles</p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Activa 2-3 veces por semana</li>
                        <li>• Duración: 1-2 horas</li>
                        <li>• Multiplicador ×2 en todas las recompensas</li>
                        <li>• Notificación al iniciar</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Governance Section */}
            {activeTab === 'governance' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    🏛️ Gobernanza Descentralizada - Proof of Help
                  </h2>
                  <p className="text-xl opacity-90">
                    Sistema de consenso inspirado en Bitcoin, donde "minar" significa ayudar a otros.
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    ¿Qué es Proof of Help (PoH)?
                  </h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    Un sistema de consenso revolucionario donde la "minería" no consume energía,
                    sino que genera valor social. Cada hora de ayuda a tu comunidad es un "hash de trabajo".
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">⛏️</div>
                      <h3 className="text-xl font-bold text-blue-900 mb-3">Minería = Ayudar</h3>
                      <p className="text-gray-700">
                        En lugar de quemar electricidad, generas "hash de trabajo" ayudando a otros.
                        Cero consumo energético, 100% valor social.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">⛓️</div>
                      <h3 className="text-xl font-bold text-purple-900 mb-3">Trust Chain</h3>
                      <p className="text-gray-700">
                        Cada ayuda queda registrada en una blockchain local inmutable.
                        Transparencia total y auditabilidad.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">🏆</div>
                      <h3 className="text-xl font-bold text-green-900 mb-3">Reputación Social</h3>
                      <p className="text-gray-700">
                        Tu reputación se calcula automáticamente basándose en tus contribuciones.
                        Más ayudas = más privilegios.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Sistema de Reputación
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Gana reputación ayudando a tu comunidad. Más reputación = más privilegios.
                  </p>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">⭐</div>
                        <h3 className="text-2xl font-bold text-yellow-900">Nivel 1: Activo (10+ ayudas)</h3>
                      </div>
                      <p className="text-gray-700 mb-2"><strong>Privilegios:</strong></p>
                      <ul className="space-y-1 text-gray-600">
                        <li>✓ Validar transacciones simples</li>
                        <li>✓ Votar en propuestas</li>
                        <li>✓ Participar en moderación</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">🌟</div>
                        <h3 className="text-2xl font-bold text-blue-900">Nivel 2: Contribuidor (50+ ayudas)</h3>
                      </div>
                      <p className="text-gray-700 mb-2"><strong>Privilegios:</strong></p>
                      <ul className="space-y-1 text-gray-600">
                        <li>✓ Todo lo anterior +</li>
                        <li>✓ Validar propuestas comunitarias</li>
                        <li>✓ Participar en jurados de moderación</li>
                        <li>✓ Crear propuestas (si tiene 20+ de reputación)</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">💎</div>
                        <h3 className="text-2xl font-bold text-purple-900">Nivel 3: Experto (100+ ayudas)</h3>
                      </div>
                      <p className="text-gray-700 mb-2"><strong>Privilegios:</strong></p>
                      <ul className="space-y-1 text-gray-600">
                        <li>✓ Todo lo anterior +</li>
                        <li>✓ Resolver disputas como mediador</li>
                        <li>✓ Proponer cambios en las reglas</li>
                        <li>✓ Acceso a analytics avanzados</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Propuestas Comunitarias (CIPs)
                  </h2>
                  <p className="text-gray-700 mb-6">
                    <strong>Community Improvement Proposals:</strong> Cualquier miembro con reputación 20+
                    puede proponer mejoras a la comunidad.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <h4 className="font-bold text-blue-900 mb-1">1. Creación</h4>
                      <p className="text-sm text-gray-600">Crea tu propuesta con título, descripción y plan</p>
                    </div>
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <h4 className="font-bold text-green-900 mb-1">2. Discusión (3 días)</h4>
                      <p className="text-sm text-gray-600">La comunidad comenta y debate</p>
                    </div>
                    <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
                      <div className="text-3xl mb-2">🗳️</div>
                      <h4 className="font-bold text-purple-900 mb-1">3. Votación (4 días)</h4>
                      <p className="text-sm text-gray-600">Votación cuadrática con créditos</p>
                    </div>
                    <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-lg text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h4 className="font-bold text-pink-900 mb-1">4. Aprobación</h4>
                      <p className="text-sm text-gray-600">Si alcanza threshold → Aprobada</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
                    <h4 className="font-semibold text-lg mb-3">📊 Votación Cuadrática</h4>
                    <p className="text-gray-700 mb-3">Sistema que evita que pocos dominen las decisiones:</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white rounded-lg">
                        <div className="font-bold text-indigo-900">1 punto</div>
                        <div className="text-sm text-gray-600">= 1² = <strong>1 crédito</strong></div>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <div className="font-bold text-indigo-900">5 puntos</div>
                        <div className="text-sm text-gray-600">= 5² = <strong>25 créditos</strong></div>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <div className="font-bold text-indigo-900">10 puntos</div>
                        <div className="text-sm text-gray-600">= 10² = <strong>100 créditos</strong></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🛡️ Moderación Descentralizada
                  </h2>
                  <p className="text-gray-700 mb-6">
                    La moderación no la hace un admin, sino la comunidad mediante mini-DAOs temporales.
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        1
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">Reportar Contenido</h4>
                        <p className="text-gray-700">Un usuario reporta contenido inapropiado (spam, ofensivo, etc.)</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        2
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">Selección de Jurado</h4>
                        <p className="text-gray-700">Sistema selecciona 5-7 personas: 3 con alta reputación + 2 aleatorios</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        3
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">Votación del Jurado</h4>
                        <p className="text-gray-700">Cada jurado vota: KEEP (mantener), REMOVE (eliminar), WARN (advertir)</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        4
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">Consenso (66%)</h4>
                        <p className="text-gray-700">Si 66% votan REMOVE → Contenido eliminado. Jurados correctos ganan +1 crédito</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    ✨ Beneficios vs Sistemas Centralizados
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">Sin punto único de fallo</h4>
                        <p className="text-sm opacity-90">La plataforma sigue funcionando aunque falle el servidor central</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">Resistente a censura</h4>
                        <p className="text-sm opacity-90">La comunidad decide qué contenido es apropiado</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">Incentivos alineados</h4>
                        <p className="text-sm opacity-90">Ayudar y validar genera recompensas tangibles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">Transparencia total</h4>
                        <p className="text-sm opacity-90">Todas las decisiones son públicas y auditables</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Guide Section */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🚀 Primeros Pasos
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Crea tu cuenta</h3>
                        <p className="text-gray-700">
                          Regístrate con tu email. Es gratis y recibirás créditos iniciales de bienvenida.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Completa tu perfil</h3>
                        <p className="text-gray-700">
                          Añade una foto, escribe una breve biografía y cuéntanos tus intereses.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Explora el mapa</h3>
                        <p className="text-gray-700">
                          Descubre qué ofertas y eventos hay cerca de ti en el mapa interactivo.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Publica tu primera oferta</h3>
                        <p className="text-gray-700">
                          ¿Tienes algo que compartir? Crea tu primera oferta de bien o servicio.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">Conecta con tu comunidad</h3>
                        <p className="text-gray-700">
                          Envía mensajes, asiste a eventos y construye relaciones de confianza.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📝 Cómo crear una oferta
                  </h2>
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">1.</span>
                      <span>Haz clic en "Crear Oferta" en el menú o en el botón de acción rápida</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">2.</span>
                      <span>Selecciona el tipo: Banco de Tiempo, Mercado Local o Préstamo</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">3.</span>
                      <span>Rellena el título, descripción detallada y categoría</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">4.</span>
                      <span>Establece el precio en créditos o euros (o ambos)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">5.</span>
                      <span>Sube fotos de calidad (opcional pero recomendado)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">6.</span>
                      <span>Añade tu ubicación para que otros te encuentren en el mapa</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">7.</span>
                      <span>Publica y espera a que los interesados te contacten</span>
                    </li>
                  </ol>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🎉 Cómo organizar un evento
                  </h2>
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">1.</span>
                      <span>Ve a la sección "Eventos" y haz clic en "Crear Evento"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">2.</span>
                      <span>Define el título, descripción y tipo de evento</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">3.</span>
                      <span>Establece fecha de inicio, fin y ubicación</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">4.</span>
                      <span>Define la capacidad máxima de asistentes (opcional)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">5.</span>
                      <span>Opcionalmente, ofrece créditos como recompensa por asistir</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">6.</span>
                      <span>Publica y promociona tu evento en la comunidad</span>
                    </li>
                  </ol>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    💡 Consejos para la Comunidad
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Sé claro y honesto</h4>
                      <p className="text-sm text-green-800">
                        Describe con precisión lo que ofreces para evitar malentendidos
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900 mb-2">✓ Responde rápido</h4>
                      <p className="text-sm text-blue-800">
                        Contesta los mensajes en menos de 24h para mantener la confianza
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-900 mb-2">✓ Cumple tus compromisos</h4>
                      <p className="text-sm text-purple-800">
                        Si quedas con alguien, respeta los acuerdos. Tu reputación lo refleja
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                      <h4 className="font-semibold text-pink-900 mb-2">✓ Valora a otros miembros</h4>
                      <p className="text-sm text-pink-800">
                        Deja valoraciones honestas después de cada intercambio
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-900 mb-2">✓ Participa activamente</h4>
                      <p className="text-sm text-yellow-800">
                        Asiste a eventos, comenta en el feed y haz crecer la comunidad
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-300 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    ⚠️ Normas de Seguridad
                  </h2>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>No compartas información personal sensible en mensajes públicos</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>Acuerda siempre los intercambios en lugares públicos si no conoces a la persona</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>Reporta comportamientos inapropiados o sospechosos inmediatamente</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>Verifica la reputación del miembro antes de acordar intercambios importantes</span>
                    </li>
                  </ul>
                </section>
              </div>
            )}

            {/* Tech Section */}
            {activeTab === 'tech' && (
              <div className="space-y-6">
                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    ⚙️ Arquitectura Técnica
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Comunidad Viva está construida con tecnologías modernas, robustas y escalables.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-3">Frontend</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span><strong>Next.js 13+</strong> - Framework React</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span><strong>TypeScript</strong> - Type safety</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span><strong>TailwindCSS</strong> - Estilos utility-first</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span><strong>React Query</strong> - Data fetching</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span><strong>Leaflet</strong> - Mapas interactivos</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-purple-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-purple-900 mb-3">Backend</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span><strong>NestJS</strong> - Framework Node.js</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span><strong>Prisma ORM</strong> - Database toolkit</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span><strong>PostgreSQL</strong> - Base de datos</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span><strong>Redis</strong> - Caché y sesiones</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span><strong>JWT</strong> - Autenticación</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🔒 Seguridad y Privacidad
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-3xl">🔐</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Cifrado de Comunicaciones</h3>
                        <p className="text-gray-700">
                          Todas las comunicaciones utilizan HTTPS con certificados SSL/TLS
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">🛡️</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Protección de Datos</h3>
                        <p className="text-gray-700">
                          Las contraseñas se almacenan con hash bcrypt y nunca en texto plano
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Rate Limiting</h3>
                        <p className="text-gray-700">
                          Protección contra ataques de fuerza bruta y DDoS
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">👁️</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Control de Acceso</h3>
                        <p className="text-gray-700">
                          Sistema de roles y permisos para proteger datos sensibles
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🐳 Infraestructura Docker
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Toda la aplicación está containerizada para facilitar el despliegue y escalabilidad.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-green-400"># Servicios disponibles:</div>
                    <div>• Backend API (NestJS) - Puerto 4000</div>
                    <div>• Frontend Web (Next.js) - Puerto 3000</div>
                    <div>• PostgreSQL - Puerto 5432</div>
                    <div>• Redis - Puerto 6379</div>
                    <div>• Nginx (Producción) - Puertos 80/443</div>
                    <div className="mt-4 text-green-400"># Monitoreo:</div>
                    <div>• Prometheus - Puerto 9090</div>
                    <div>• Grafana - Puerto 3001</div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📊 Monitoreo y Backups
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Monitoreo</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Prometheus para métricas del sistema</li>
                        <li>• Grafana para visualización de datos</li>
                        <li>• Alertas automáticas ante fallos</li>
                        <li>• Logs centralizados</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Backups</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Backups automáticos cada 24h</li>
                        <li>• Retención de 7 días</li>
                        <li>• Restauración con un comando</li>
                        <li>• Almacenamiento encriptado</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📱 Características Técnicas Avanzadas
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <h4 className="font-semibold mb-1">🚀 Server-Side Rendering (SSR)</h4>
                      <p className="text-sm text-gray-700">Renderizado del lado del servidor para mejor SEO y rendimiento</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-1">⚡ Optimización de Imágenes</h4>
                      <p className="text-sm text-gray-700">Compresión automática y formatos modernos (WebP)</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <h4 className="font-semibold mb-1">📍 Geolocalización</h4>
                      <p className="text-sm text-gray-700">Sistema de coordenadas para búsquedas por proximidad</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                      <h4 className="font-semibold mb-1">🔄 Real-time Updates</h4>
                      <p className="text-sm text-gray-700">Actualizaciones en tiempo real con React Query</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-1">📨 Sistema de Mensajería</h4>
                      <p className="text-sm text-gray-700">Mensajes directos seguros entre miembros</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🌐 API REST y Documentación
                  </h2>
                  <p className="text-gray-700 mb-4">
                    La API está completamente documentada con Swagger/OpenAPI.
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      Accede a la documentación API:
                    </h4>
                    <code className="block bg-white p-3 rounded border border-blue-300 text-sm">
                      http://localhost:4000/api/docs
                    </code>
                    <p className="text-sm text-blue-800 mt-3">
                      Explora todos los endpoints, parámetros y respuestas de forma interactiva
                    </p>
                  </div>
                </section>
              </div>
            )}

            {/* Deployment Section */}
            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    🚀 Deployment a Producción
                  </h2>
                  <p className="text-xl opacity-90">
                    Guía completa para desplegar Comunidad Viva en tu servidor con Docker
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📋 Prerequisitos
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Servidor con Docker y Docker Compose instalados</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Dominio configurado (opcional pero recomendado)</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Puerto 80 y 443 disponibles (para HTTPS)</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Al menos 2GB de RAM disponible</span>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    ⚡ Opción 1: Deployment Automático (Recomendado)
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Usa nuestro script automatizado que se encarga de todo:
                  </p>

                  <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm mb-4">
                    <div className="text-green-400 mb-2"># 1. Clonar el repositorio</div>
                    <div>git clone https://github.com/tu-usuario/comunidad-viva.git</div>
                    <div>cd comunidad-viva</div>
                    <div className="mt-3 text-green-400"># 2. Hacer ejecutable el script</div>
                    <div>chmod +x deploy.sh</div>
                    <div className="mt-3 text-green-400"># 3. Ejecutar deployment</div>
                    <div>./deploy.sh production</div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      El script automáticamente:
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>✓ Verifica que Docker y archivos .env estén listos</li>
                      <li>✓ Crea backup de la base de datos (si existe)</li>
                      <li>✓ Construye las imágenes Docker optimizadas</li>
                      <li>✓ Levanta todos los servicios (PostgreSQL, Backend, Frontend)</li>
                      <li>✓ Aplica las migraciones de base de datos</li>
                      <li>✓ Verifica que todos los servicios estén funcionando</li>
                      <li>✓ Limpia recursos no utilizados</li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🔧 Opción 2: Deployment Manual
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Paso 1: Configurar Variables de Entorno</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400"># Backend</div>
                        <div>cp packages/backend/.env.example packages/backend/.env</div>
                        <div>nano packages/backend/.env</div>
                        <div className="mt-3 text-green-400"># Frontend</div>
                        <div>cp packages/web/.env.production.example packages/web/.env.production</div>
                        <div>nano packages/web/.env.production</div>
                      </div>
                      <div className="mt-3 p-4 bg-yellow-50 border-l-4 border-yellow-500">
                        <p className="text-sm text-yellow-800">
                          <strong>Importante:</strong> Cambia las contraseñas, JWT_SECRET y URLs en los archivos .env
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Paso 2: Construir Imágenes</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>docker compose -f docker-compose.yml -f docker-compose.prod.yml build</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Paso 3: Levantar Servicios</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Paso 4: Aplicar Migraciones</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>docker compose exec backend npx prisma migrate deploy</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Paso 5: Verificar Estado</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400"># Verificar que los servicios estén corriendo</div>
                        <div>docker compose ps</div>
                        <div className="mt-3 text-green-400"># Probar el backend</div>
                        <div>curl http://localhost:4000/health</div>
                        <div className="mt-3 text-green-400"># Probar el frontend</div>
                        <div>curl http://localhost:3000</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🌐 Configurar Dominio con NGINX + SSL
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Para usar un dominio personalizado con HTTPS:
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1. Instalar NGINX y Certbot</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>sudo apt-get update</div>
                        <div>sudo apt-get install nginx certbot python3-certbot-nginx</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2. Configurar NGINX</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Crear archivo <code className="bg-gray-200 px-2 py-1 rounded">/etc/nginx/sites-available/comunidad-viva</code>:
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        <div className="text-green-400"># Frontend</div>
                        <div>server {'{'}</div>
                        <div>{'  '}listen 80;</div>
                        <div>{'  '}server_name tu-dominio.com;</div>
                        <div>{'  '}location / {'{'}</div>
                        <div>{'    '}proxy_pass http://localhost:3000;</div>
                        <div>{'    '}proxy_set_header Host $host;</div>
                        <div>{'  }}'}</div>
                        <div>{'}'}</div>
                        <div className="mt-3 text-green-400"># Backend API</div>
                        <div>server {'{'}</div>
                        <div>{'  '}listen 80;</div>
                        <div>{'  '}server_name api.tu-dominio.com;</div>
                        <div>{'  '}location / {'{'}</div>
                        <div>{'    '}proxy_pass http://localhost:4000;</div>
                        <div>{'  }}'}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3. Activar y Obtener SSL</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400"># Activar configuración</div>
                        <div>sudo ln -s /etc/nginx/sites-available/comunidad-viva /etc/nginx/sites-enabled/</div>
                        <div>sudo nginx -t</div>
                        <div>sudo systemctl restart nginx</div>
                        <div className="mt-3 text-green-400"># Obtener certificado SSL gratis</div>
                        <div>sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🔄 Actualizar la Aplicación
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Cuando haya nuevas versiones:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="text-green-400"># Pull últimos cambios</div>
                    <div>git pull origin main</div>
                    <div className="mt-3 text-green-400"># Rebuild y restart</div>
                    <div>docker compose -f docker-compose.yml -f docker-compose.prod.yml build</div>
                    <div>docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d</div>
                    <div className="mt-3 text-green-400"># Aplicar migraciones si hay nuevas</div>
                    <div>docker compose exec backend npx prisma migrate deploy</div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🔐 Backup de Base de Datos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Crear Backup</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>docker compose exec postgres \</div>
                        <div>{'  '}pg_dump -U comunidad \</div>
                        <div>{'  '}comunidad_viva {'>'} \</div>
                        <div>{'  '}backup_$(date +%Y%m%d).sql</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Restaurar Backup</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>cat backup_20250101.sql | \</div>
                        <div>{'  '}docker compose exec -T \</div>
                        <div>{'  '}postgres psql -U comunidad \</div>
                        <div>{'  '}-d comunidad_viva</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📊 Monitoreo y Logs
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Ver logs de todos los servicios</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        docker compose logs -f
                      </code>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Ver logs de un servicio específico</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        docker compose logs -f backend
                      </code>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Ver estado de servicios</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        docker compose ps
                      </code>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Ver uso de recursos</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        docker stats
                      </code>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-300 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🐛 Troubleshooting Común
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Puerto ya en uso</h4>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div>sudo lsof -i :4000  # Ver qué usa el puerto</div>
                        <div>sudo kill -9 PID    # Matar proceso si necesario</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Frontend no se conecta al backend</h4>
                      <p className="text-sm text-gray-700">
                        Verifica que <code className="bg-gray-200 px-2 py-1 rounded">NEXT_PUBLIC_API_URL</code>
                        {' '}en <code className="bg-gray-200 px-2 py-1 rounded">.env.production</code> apunte a la URL correcta del backend
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Error de migraciones</h4>
                      <p className="text-sm text-gray-700">
                        Asegúrate de que PostgreSQL esté corriendo y que DATABASE_URL sea correcta
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    📄 Documentación Completa
                  </h2>
                  <p className="text-lg mb-4">
                    Para más detalles, consulta el archivo <code className="bg-white/20 px-2 py-1 rounded">DEPLOYMENT.md</code> en la raíz del proyecto.
                  </p>
                  <p className="text-sm opacity-90">
                    También incluye opciones para deployment en Vercel, Railway, Render y DigitalOcean App Platform.
                  </p>
                </section>
              </div>
            )}

            {/* Downloads Section */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <span className="text-4xl">🎯</span>
                    Presentación Lista para Usar
                  </h2>
                  <p className="text-purple-100 mb-6 text-lg">
                    Descarga directamente el PowerPoint o visualiza la presentación en tu navegador
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <a
                      href="/docs/PRESENTATION.pptx"
                      download
                      className="group bg-white text-purple-700 px-8 py-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl block"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-5xl">📊</div>
                        <div className="text-sm bg-purple-100 px-3 py-1 rounded-full font-semibold">66 KB</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Descargar PowerPoint</h3>
                      <p className="text-purple-600 text-sm mb-3">PRESENTATION.pptx - Listo para editar</p>
                      <div className="flex items-center gap-2 text-purple-700 group-hover:gap-3 transition-all">
                        <span className="font-semibold">Descargar ahora</span>
                        <span>→</span>
                      </div>
                    </a>

                    <a
                      href="/docs/PRESENTATION.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white text-blue-700 px-8 py-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl block"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-5xl">🌐</div>
                        <div className="text-sm bg-blue-100 px-3 py-1 rounded-full font-semibold">21 KB</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Ver en Navegador</h3>
                      <p className="text-blue-600 text-sm mb-3">PRESENTATION.html - Visualización web</p>
                      <div className="flex items-center gap-2 text-blue-700 group-hover:gap-3 transition-all">
                        <span className="font-semibold">Abrir presentación</span>
                        <span>→</span>
                      </div>
                    </a>
                  </div>

                  <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm text-purple-100">
                      <strong>💡 Nota:</strong> El archivo PowerPoint (.pptx) fue generado automáticamente con pandoc y está listo para editar en Microsoft PowerPoint, Google Slides, LibreOffice Impress o cualquier software compatible.
                    </p>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📚 Documentos Disponibles para Descargar
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: '📊 Presentación (PRESENTATION.md)',
                        file: 'PRESENTATION.md',
                        size: '13 KB',
                        description: 'Presentación completa con 30+ diapositivas en formato Markdown.',
                      },
                      {
                        title: '📄 Whitepaper Completo',
                        file: 'WHITEPAPER.md',
                        size: '36 KB',
                        description: 'Documento técnico principal con todos los detalles del proyecto (~21,000 palabras).',
                      },
                      {
                        title: '⚡ Resumen Ejecutivo',
                        file: 'EXECUTIVE_SUMMARY.md',
                        size: '12 KB',
                        description: 'Versión condensada del whitepaper (2-3 páginas) ideal para presentaciones rápidas.',
                      },
                      {
                        title: '🔧 Módulos Técnicos',
                        file: 'TECHNICAL_MODULES.md',
                        size: '21 KB',
                        description: 'Documentación detallada de todos los módulos técnicos complementarios.',
                      },
                      {
                        title: '🎁 Economía de Regalo y Gobernanza',
                        file: 'GIFT_ECONOMY_GOVERNANCE.md',
                        size: '20 KB',
                        description: 'Sistema de economía de regalo y mecanismos de gobernanza avanzada.',
                      },
                      {
                        title: '📖 Instrucciones de Conversión',
                        file: 'PRESENTATION_INSTRUCTIONS.md',
                        size: '7.2 KB',
                        description: 'Guía completa para convertir la presentación a PowerPoint (.pptx) y PDF.',
                      },
                    ].map((doc, idx) => (
                      <a
                        key={idx}
                        href={`/docs/${doc.file}`}
                        download
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 flex-1">{doc.title}</h3>
                          <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{doc.size}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                        <div className="text-purple-600 font-medium text-sm flex items-center gap-2">
                          <span>Descargar</span>
                          <span>→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Contribute Section */}
            {activeTab === 'contribute' && (
              <div className="space-y-6">
                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🤝 ¿Cómo Contribuir?
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Comunidad Viva es un proyecto <strong>de código abierto</strong> que crece gracias a
                    la participación de personas como tú. ¡Todas las contribuciones son bienvenidas!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-blue-200 rounded-lg p-6">
                      <div className="text-4xl mb-3">💻</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Desarrollo</h3>
                      <p className="text-gray-700 mb-3">
                        Ayuda a mejorar el código, corregir bugs o añadir nuevas funcionalidades.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Frontend (React/Next.js)</li>
                        <li>• Backend (NestJS/Node.js)</li>
                        <li>• Database (PostgreSQL/Prisma)</li>
                        <li>• DevOps (Docker/CI-CD)</li>
                      </ul>
                    </div>

                    <div className="border-2 border-purple-200 rounded-lg p-6">
                      <div className="text-4xl mb-3">🎨</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Diseño</h3>
                      <p className="text-gray-700 mb-3">
                        Mejora la experiencia de usuario y el diseño visual.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• UI/UX Design</li>
                        <li>• Diseño gráfico</li>
                        <li>• Iconografía</li>
                        <li>• Accesibilidad (A11y)</li>
                      </ul>
                    </div>

                    <div className="border-2 border-green-200 rounded-lg p-6">
                      <div className="text-4xl mb-3">📝</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Documentación</h3>
                      <p className="text-gray-700 mb-3">
                        Escribe guías, tutoriales y documentación técnica.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Guías de usuario</li>
                        <li>• Documentación técnica</li>
                        <li>• Traducciones</li>
                        <li>• Video tutoriales</li>
                      </ul>
                    </div>

                    <div className="border-2 border-pink-200 rounded-lg p-6">
                      <div className="text-4xl mb-3">🧪</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Testing</h3>
                      <p className="text-gray-700 mb-3">
                        Prueba la aplicación y reporta bugs o problemas.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Testing manual</li>
                        <li>• Reporte de bugs</li>
                        <li>• Tests automatizados</li>
                        <li>• QA y validación</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🚀 Guía de Contribución al Código
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">1. Prepara tu entorno</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400"># Fork del repositorio</div>
                        <div>git clone https://github.com/tu-usuario/comunidad-viva.git</div>
                        <div>cd comunidad-viva</div>
                        <div className="mt-2 text-green-400"># Instala dependencias</div>
                        <div>make install</div>
                        <div className="mt-2 text-green-400"># Levanta el entorno de desarrollo</div>
                        <div>make dev</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">2. Crea una rama para tu feature</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>git checkout -b feature/nombre-de-tu-feature</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">3. Desarrolla tu funcionalidad</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Sigue las convenciones de código del proyecto</li>
                        <li>• Escribe código limpio y bien documentado</li>
                        <li>• Añade tests para tu funcionalidad</li>
                        <li>• Asegúrate de que todo compile sin errores</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">4. Haz commit de tus cambios</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>git add .</div>
                        <div>git commit -m "feat: descripción clara del cambio"</div>
                        <div className="mt-2 text-green-400"># Tipos de commit: feat, fix, docs, style, refactor, test</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">5. Push y crea Pull Request</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>git push origin feature/nombre-de-tu-feature</div>
                      </div>
                      <p className="text-gray-700 mt-3">
                        Luego ve a GitHub y crea un Pull Request con una descripción clara de tus cambios.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📋 Buenas Prácticas
                  </h2>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">Commits pequeños y frecuentes</h4>
                        <p className="text-sm text-gray-600">Es más fácil revisar cambios específicos que grandes bloques de código</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">Mensajes de commit descriptivos</h4>
                        <p className="text-sm text-gray-600">Usa el formato: tipo(ámbito): descripción clara</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">Tests para todo código nuevo</h4>
                        <p className="text-sm text-gray-600">Asegura la calidad y previene regresiones</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">Documenta funciones complejas</h4>
                        <p className="text-sm text-gray-600">Ayuda a otros desarrolladores a entender tu código</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">Respeta el estilo de código</h4>
                        <p className="text-sm text-gray-600">Usa Prettier y ESLint para mantener consistencia</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    🐛 Reportar Bugs
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Si encuentras un bug, por favor repórtalo creando un issue en GitHub con:
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Descripción clara</strong> del problema</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Pasos para reproducir</strong> el error</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Comportamiento esperado</strong> vs comportamiento actual</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Capturas de pantalla</strong> si aplica</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Información del entorno</strong> (navegador, OS, etc.)</span>
                    </li>
                  </ul>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    💬 Comunidad y Soporte
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">GitHub Discussions</h4>
                      <p className="text-sm text-blue-800">
                        Participa en discusiones sobre nuevas features y mejoras
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">GitHub Issues</h4>
                      <p className="text-sm text-purple-800">
                        Reporta bugs, solicita features o pregunta dudas técnicas
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Pull Requests</h4>
                      <p className="text-sm text-green-800">
                        Revisa el código de otros y aprende de la comunidad
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    🌟 Contribuidores
                  </h2>
                  <p className="text-lg mb-4">
                    Gracias a todas las personas que han contribuido a hacer de Comunidad Viva
                    una plataforma mejor cada día.
                  </p>
                  <p className="text-sm opacity-90">
                    Tu nombre puede aparecer aquí. ¡Haz tu primera contribución hoy!
                  </p>
                </section>

                <section className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    📄 Licencia
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Comunidad Viva está licenciado bajo <strong>MIT License</strong>.
                  </p>
                  <p className="text-gray-700">
                    Esto significa que puedes usar, modificar y distribuir el código libremente,
                    siempre que mantengas el aviso de copyright y la licencia.
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
