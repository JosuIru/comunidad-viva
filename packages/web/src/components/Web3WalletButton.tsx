import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

interface Web3WalletButtonProps {
  mode: 'login' | 'link'; // login = auth flow, link = link to existing account
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function Web3WalletButton({ mode, onSuccess, onError }: Web3WalletButtonProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasPhantom, setHasPhantom] = useState(false);

  useEffect(() => {
    // Check for available wallets
    setHasMetaMask(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
    setHasPhantom(typeof window !== 'undefined' && typeof window.solana !== 'undefined' && window.solana.isPhantom);
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      const error = 'MetaMask no está instalado. Por favor instala MetaMask desde https://metamask.io';
      onError?.(error);
      alert(error);
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddress = accounts[0];

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress,
        walletType: 'METAMASK',
      });

      const { message } = nonceResponse.data;

      // Sign message with MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      if (mode === 'login') {
        // Verify signature and login/register
        const authResponse = await api.post('/auth/web3/verify-signature', {
          walletAddress,
          signature,
          walletType: 'METAMASK',
        });

        const { access_token, user, isNewUser } = authResponse.data;

        // Store token
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        onSuccess?.(authResponse.data);

        // Redirect to dashboard
        if (isNewUser) {
          alert('¡Bienvenido! Tu cuenta ha sido creada con MetaMask.');
          router.push('/profile/edit');
        } else {
          alert('¡Autenticado exitosamente con MetaMask!');
          router.push('/');
        }
      } else {
        // Link wallet to existing account
        const linkResponse = await api.post('/auth/web3/link-wallet', {
          walletAddress,
          signature,
          walletType: 'METAMASK',
        });

        onSuccess?.(linkResponse.data);
        alert('¡Wallet vinculada exitosamente!');
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al conectar con MetaMask';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPhantom = async () => {
    if (!window.solana?.isPhantom) {
      const error = 'Phantom no está instalado. Por favor instala Phantom desde https://phantom.app';
      onError?.(error);
      alert(error);
      return;
    }

    setIsConnecting(true);

    try {
      // Connect to Phantom
      const resp = await window.solana.connect();
      const walletAddress = resp.publicKey.toString();

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress,
        walletType: 'PHANTOM',
      });

      const { message } = nonceResponse.data;

      // Sign message with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = Buffer.from(signedMessage.signature).toString('base64');

      if (mode === 'login') {
        // Verify signature and login/register
        const authResponse = await api.post('/auth/web3/verify-signature', {
          walletAddress,
          signature,
          walletType: 'PHANTOM',
        });

        const { access_token, user, isNewUser } = authResponse.data;

        // Store token
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        onSuccess?.(authResponse.data);

        // Redirect to dashboard
        if (isNewUser) {
          alert('¡Bienvenido! Tu cuenta ha sido creada con Phantom.');
          router.push('/profile/edit');
        } else {
          alert('¡Autenticado exitosamente con Phantom!');
          router.push('/');
        }
      } else {
        // Link wallet to existing account
        const linkResponse = await api.post('/auth/web3/link-wallet', {
          walletAddress,
          signature,
          walletType: 'PHANTOM',
        });

        onSuccess?.(linkResponse.data);
        alert('¡Wallet vinculada exitosamente!');
      }
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al conectar con Phantom';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!hasMetaMask && !hasPhantom) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          No se detectaron billeteras Web3. Instala una para continuar:
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
          >
            Instalar MetaMask
          </a>
          <a
            href="https://phantom.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
          >
            Instalar Phantom
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {mode === 'login'
          ? 'Conecta tu billetera Web3 para iniciar sesión o registrarte'
          : 'Vincula tu billetera Web3 a tu cuenta'
        }
      </p>

      <div className="grid grid-cols-1 gap-3">
        {hasMetaMask && (
          <button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32.958 5.625L21.458 14.375L23.5 9.375L32.958 5.625Z" fill="#E17726" stroke="#E17726" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.04102 5.625L18.416 14.458L16.5 9.375L7.04102 5.625ZM28.125 25.625L25.416 29.958L32.333 31.875L34.333 25.75L28.125 25.625ZM5.66602 25.75L7.66602 31.875L14.583 29.958L11.875 25.625L5.66602 25.75Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold">
              {isConnecting ? 'Conectando...' : 'Conectar con MetaMask'}
            </span>
          </button>
        )}

        {hasPhantom && (
          <button
            onClick={connectPhantom}
            disabled={isConnecting}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M106.143 41.0776C95.0467 18.5174 76.8831 8 54.1057 8C23.8065 8 4.36517 29.395 0.130859 59.6521C-2.03258 75.7851 2.29172 91.0024 11.562 103.085C19.8652 113.912 31.4399 120 43.9289 120C54.5627 120 64.7394 116.089 72.5855 108.938C73.9997 107.651 75.3282 106.254 76.5712 104.747C77.1355 104.079 77.3177 103.219 77.0499 102.445C76.8821 101.879 76.4001 101.378 75.7642 101.166C75.6821 101.137 75.5856 101.122 75.4892 101.108C74.3177 101.062 73.0318 101.746 72.1856 102.567C71.9463 102.791 71.7071 103.014 71.4535 103.238C64.8966 109.319 56.4078 112.665 47.6333 112.193C37.6994 111.647 28.653 107.013 22.4961 99.1898C15.5107 90.3164 12.3256 78.8194 13.3971 67.0511C14.2576 56.8926 17.8855 47.3158 23.9496 39.2926C30.5922 30.5056 39.8813 25.075 50.3011 24.0552C63.6393 22.7539 76.4715 27.7765 85.7893 37.7839C88.0392 40.2154 89.9534 42.9483 91.5035 45.9116C91.7428 46.352 91.9535 46.8069 92.1356 47.2763C92.8144 48.9785 91.7856 50.8375 89.9391 51.0318L70.6607 51.0463C68.4964 51.0754 66.5965 50.3627 65.0036 49.0037C63.4535 47.6881 62.4535 45.9407 61.9572 43.761C61.8608 43.3352 61.2821 43.0832 60.8858 43.3352C59.9111 43.9755 58.7967 44.8069 57.5967 45.7951C55.9037 47.1831 54.1628 48.5421 52.7628 49.5737C50.9734 50.9181 49.0305 52.2335 47.0732 53.1781C44.6661 54.3269 42.1947 55.0396 39.8161 55.0396C32.7163 55.0396 26.9449 49.1182 26.9449 41.8204C26.9449 34.5225 32.7163 28.6012 39.8161 28.6012C42.2375 28.6012 44.5732 29.3284 46.6947 30.6583C48.4412 31.7635 50.0055 33.225 51.3484 34.9578C51.5734 35.2535 51.8126 35.5637 52.0519 35.859C52.5769 36.5135 53.3126 36.9829 54.1342 37.1481C54.3306 37.1917 54.5413 37.2063 54.7663 37.2063L89.6248 37.2208C91.857 37.2208 93.6892 38.8649 93.8713 41.1109C93.957 42.2886 93.5892 43.3643 92.8144 44.1788C92.0253 45.0079 90.9253 45.4773 89.7253 45.4773L85.0893 45.4773C84.2749 45.4773 83.6248 46.1319 83.6248 46.9319C83.6248 47.2763 83.7784 47.6207 84.0248 47.8727C84.1926 48.0524 84.4033 48.1886 84.629 48.2757C84.8183 48.3483 85.0147 48.3773 85.2111 48.3773H94.0927C96.5855 48.3773 98.5997 50.4481 98.5997 53.0054C98.5997 53.4893 98.5247 53.9732 98.3569 54.4135C98.1676 54.9119 97.8569 55.3668 97.454 55.7547C96.6754 56.5256 95.5755 56.9805 94.3755 56.9805H91.5749C90.7606 56.9805 90.1106 57.635 90.1106 58.435C90.1106 58.7649 90.2641 59.1238 90.5106 59.3758C90.8641 59.7492 91.3641 59.9726 91.9427 59.9726H93.0141C95.3784 59.9726 97.2748 61.9015 97.2748 64.3185C97.2748 66.7354 95.3784 68.6643 93.0141 68.6643H91.4356C90.6498 68.6643 89.9998 69.3043 89.9998 70.1043C89.9998 70.9043 90.6641 71.5443 91.4356 71.5443H92.1784C94.4176 71.5443 96.2426 73.3732 96.2426 75.6337C96.2426 77.8941 94.4319 79.723 92.1784 79.723H90.1391C89.3534 79.723 88.7034 80.3631 88.7034 81.1631C88.7034 81.5075 88.8569 81.8518 89.1034 82.1039C89.4712 82.4773 89.9855 82.7148 90.557 82.7148C92.5927 82.7148 95.5355 82.7148 97.5712 82.7148C101.15 82.7148 104.086 85.6635 104.086 89.2767C104.086 91.1638 103.293 92.8515 102.043 94.0438C101.843 94.2381 101.629 94.4179 101.4 94.5831C100.471 95.2812 99.3211 95.6982 98.0567 95.6982C96.3996 95.6982 94.9068 94.9419 93.8927 93.7641C93.7891 93.6424 93.6999 93.5207 93.6105 93.3991C92.957 92.5119 92.0749 91.962 91.1214 91.8404C90.9821 91.8258 90.8535 91.8113 90.7143 91.8113C89.95 91.8113 89.2214 92.1411 88.7035 92.7089C88.3392 93.1056 88.1106 93.5896 88.0357 94.103C87.9714 94.6305 88.0714 95.1435 88.3321 95.5837C88.5499 95.9426 88.8463 96.2434 89.1891 96.4813C91.4035 98.1254 94.1606 98.9544 97.0177 98.7892C100.111 98.6095 102.911 97.2506 105.039 95.0339C107.339 92.6315 108.661 89.5263 108.661 86.1782C108.639 60.3089 110.111 50.2143 106.143 41.0776Z" fill="url(#paint0_linear)"/>
              <defs>
                <linearGradient id="paint0_linear" x1="54.0625" y1="8" x2="54.0625" y2="120" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#534BB1"/>
                  <stop offset="1" stopColor="#551BF9"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold">
              {isConnecting ? 'Conectando...' : 'Conectar con Phantom'}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Al conectar tu billetera, aceptas los términos de servicio
      </p>
    </div>
  );
}
