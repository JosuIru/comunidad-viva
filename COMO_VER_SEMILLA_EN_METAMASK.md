# 💼 Cómo Ver tus SEMILLA en MetaMask

**Tu balance on-chain:** ✅ 50 SEMILLA confirmado
**Problema:** MetaMask no muestra el token automáticamente

---

## 🔧 Solución: Añadir Token Custom a MetaMask

### Paso 1: Añadir Red Polygon Amoy (si no la tienes)

1. **Abrir MetaMask**
2. **Click en el selector de red** (arriba izquierda)
3. **Click en "Add network" o "Añadir red"**
4. **Click en "Add network manually" o "Añadir red manualmente"**

**Copiar y pegar estos datos EXACTOS:**

```
Network name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency symbol: POL
Block explorer: https://amoy.polygonscan.com
```

5. **Click "Save" o "Guardar"**
6. **Cambiar a la red Polygon Amoy**

### Paso 2: Importar Token SEMILLA

Con MetaMask en red **Polygon Amoy**:

1. **En la pantalla principal de MetaMask**
2. **Scroll down hasta ver "Import tokens" o "Importar tokens"**
3. **Click en "Import tokens"**

4. **En la pestaña "Custom token" o "Token personalizado":**

**Copiar y pegar este address EXACTO:**
```
0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

5. **MetaMask auto-detectará:**
   - Token Symbol: `SEMILLA`
   - Token Decimals: `18`

6. **Click "Next" o "Siguiente"**
7. **Click "Import" o "Importar"**

### ✅ Resultado

**Verás en tu wallet:**
```
50 SEMILLA
```

---

## 🔍 Verificar Online (sin MetaMask)

Si quieres verificar tu balance sin MetaMask:

**Ver en Polygonscan:**
https://amoy.polygonscan.com/token/0x8a3b2D350890e23D5679a899070B462DfFEe0643?a=0x25Dd6346FE82E51001a9430CF07e8DeB84933627

**Verás:**
- Balance: 50 SEMILLA
- Transaction history
- Token info

---

## 🐛 Troubleshooting

### No veo "Import tokens" en MetaMask

**Solución:**
1. Asegúrate que estás en la red **Polygon Amoy** (no en otra red)
2. En la pestaña "Tokens" de MetaMask
3. Scroll down, debe aparecer el botón

### Aparece error "Invalid address"

**Causa:** Copiaste mal el address
**Solución:** Copiar de nuevo:
```
0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

### No aparece el token después de importar

**Posibles causas:**
1. **Estás en la red equivocada**
   - Verifica que estás en "Polygon Amoy Testnet"
   - Chain ID debe ser 80002

2. **Wallet address incorrecta**
   - Tu wallet es: `0x25Dd6346FE82E51001a9430CF07e8DeB84933627`
   - Verifica en MetaMask que esta sea tu address

3. **Refresh MetaMask**
   - Click en el icono de tu cuenta (arriba derecha)
   - Selecciona tu cuenta de nuevo
   - Debe refrescar y mostrar el token

### Veo el token pero balance es 0

**Causa:** Estás viendo una wallet diferente
**Solución:**
1. Click en el icono de cuenta (arriba derecha)
2. Verifica que la address es: `0x25Dd6346FE82E51001a9430CF07e8DeB84933627`
3. Si no, cambia a la cuenta correcta

---

## 📱 Alternativa: Usar Block Explorer

Si MetaMask no funciona, puedes verificar todo en Polygonscan:

**Tu wallet:**
https://amoy.polygonscan.com/address/0x25Dd6346FE82E51001a9430CF07e8DeB84933627

**El contrato:**
https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643

**Tu transaction de mint:**
https://amoy.polygonscan.com/tx/0xadccf05ce3168ce21ea7a11a4a440760cb22c2e35db733f5e6a806dad0bd2549

En Polygonscan verás:
- ✅ Balance: 50 SEMILLA
- ✅ Transaction confirmada
- ✅ Event TokensMinted

---

## 📋 Checklist

- [ ] MetaMask instalado
- [ ] Red Polygon Amoy añadida
- [ ] Chain ID correcto: 80002
- [ ] Cambiar a red Polygon Amoy
- [ ] Import token custom
- [ ] Token address: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
- [ ] Ver 50 SEMILLA en wallet

---

## 🎯 Resumen Rápido

**Si estás en la red correcta:**

1. Click "Import tokens"
2. Pegar: `0x8a3b2D350890e23D5679a899070B462DfFEe0643`
3. Click "Import"
4. ✅ Ver 50 SEMILLA

**Datos de la red:**
- **Name:** Polygon Amoy Testnet
- **RPC:** https://rpc-amoy.polygon.technology
- **Chain ID:** 80002

**Tu info:**
- **Wallet:** 0x25Dd6346FE82E51001a9430CF07e8DeB84933627
- **Balance:** 50 SEMILLA (confirmado on-chain ✅)
- **Token:** 0x8a3b2D350890e23D5679a899070B462DfFEe0643

---

## ❓ Preguntas Frecuentes

### ¿Por qué no aparece automáticamente?

MetaMask solo muestra tokens automáticamente si:
1. El token está en su lista de tokens populares
2. Has recibido una transacción en mainnet

SEMILLA es un token custom en testnet, por eso debes importarlo manualmente.

### ¿Es seguro importar el token?

Sí, 100% seguro. Solo estás añadiendo el address a tu lista de tokens para visualización. No das ningún permiso ni firmas nada.

### ¿Puedo transferir estos SEMILLA?

Sí, una vez que veas el token en MetaMask:
1. Click en SEMILLA
2. Click "Send" o "Enviar"
3. Pegar address destino
4. Ingresar cantidad
5. Confirmar

**Nota:** Solo puedes transferir a wallets en la misma red (Polygon Amoy).

### ¿Tienen valor real estos SEMILLA?

No, estos son tokens de testnet. No tienen valor monetario. Son para probar el sistema antes de ir a mainnet.

---

**Si sigues teniendo problemas, envíame screenshot de tu MetaMask mostrando:**
1. La red activa (arriba izquierda)
2. Tu wallet address (click en la address arriba para copiar)
3. La pantalla de "Import tokens"

---

**¡Tus 50 SEMILLA están ahí, solo necesitas importar el token! 🚀**
