'use client'
import { useState } from 'react'
import styles from '@/components/ui/auth/login.module.css'
import ErrorOverlay from '@/components/ui/shared/MessageOverlay';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser } from '@/app/services/auth/authService';
import Cookies from 'js-cookie';

export default function LoginForm() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const camposCompletos = usuario.trim() !== '' && contrasena.trim() !== ''

  const [showError, setShowError] = useState(false);


  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!camposCompletos) {
      setError('Todos los campos son obligatorios.');
      return;
    }



    setLoading(true);

    try {
      const res = await loginUser({
        email: usuario,
        password: contrasena
      });

      if (!res) {
        setError('Error al iniciar sesión. Por favor, intenta nuevamente.');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }

      if (res.access_token) {
        Cookies.set('access_token', res.access_token, {
          path: '/', // Asegúrate de que la cookie esté disponible en todo el sitio
          secure: false,
          sameSite: 'Lax', // Cambia a 'Strict' si es necesario 
          expires: 7
        }); // Guarda el token en una cookie con expiración de 7 días

        localStorage.setItem('guid', JSON.stringify(res.guid)); // Guarda el usuario en localStorage
        localStorage.setItem('role', JSON.stringify(res.role));

        // navega a la página de inicio
        router.push('/containers');
        return;

      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }



    } catch (err) {
      console.log(err)
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <ErrorOverlay
        message={error}
        show={showError}
        onClose={() => setShowError(false)}
      />

      <div
        className={styles.container_principale}

      >
        <div className={styles.container_secondary}>
          <div className={styles.container_form}>
            <form
              onSubmit={handleSubmit}
              className="bg-white bg-opacity-90 pt-10 pb-6 pr-6 pl-6 rounded-2xl w-[500px] space-y-6 shadow-xl flex flex-col items-center justify-center"
            >
              <Image
                src="/image_2.png" // NO pongas /public
                alt="Descripción de la imagen"
                width={130}        // Ajusta el tamaño según lo necesites
                height={130}
              />

              <div className='w-full flex  flex-col items-center '>

                <div className="w-[90%] flex items-start  mb-1">
                  <label className="block text-black text-sm mb-1">Usuario</label>
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-[90%] px-4 py-2 rounded-[20px] border border-none bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition duration-300"
                  style={{ backgroundColor: '#D9D9D9' }}
                  placeholder='Ingresa tu usuario'
                />
              </div>

              <div className='w-full flex  flex-col items-center '>
                <div className="w-[90%] flex items-start  mb-1">

                  <label className="block text-black text-sm mb-1">Contraseña</label>
                </div>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder='Ingresa tu contrasena'
                  className="w-[90%] px-4 py-2 rounded-[20px] border border-none bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition duration-300"
                  style={{ backgroundColor: '#D9D9D9' }}
                />

              </div>

              <div className="w-full flex justify-center mt-5 mb-20">
                <button
                  type="submit"
                  disabled={!camposCompletos || loading}
                  style={{ backgroundColor: '#6AB04C' }}
                  className={`w-[90%] font-medium text-white py-2 rounded-[20px] transition duration-500	  ${camposCompletos && !loading
                      ? 'bg-white text-indigo-600 hover:bg-indigo-500 hover:text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {loading ? 'Verificando' : 'Ingresar'}
                </button>
              </div>
              <div className="w-full flex justify-center mt-5 mb-20">
                <button
                  type="button"
                  onClick={() => router.push('/auth/register')}
                  style={{ backgroundColor: '#bd643dff' }}
                  className={`w-[90%] font-medium text-white py-2 rounded-[20px] transition duration-500`}
                >
                  Registrarse
                </button>
              </div>
            </form>
          </div>


        </div>
      </div>

    </>
  )
}




