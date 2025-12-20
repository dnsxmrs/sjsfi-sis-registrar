import Image from 'next/image';
import RoleButton from '@/components/auth/RoleButton';
import LoginFooter from '@/app/sign-in/components/LoginFooter';


export default async function Home() {
  // delay to test the loading screen
  // await new Promise(resolve => setTimeout(resolve, 5000));

  return (
    <div className="flex h-screen w-screen bg-white min-width-[360px]">
      <div className="container">
        {/* Main Screen - BG IMAGE */}
        <div
          style={{ backgroundImage: "url('/assets/sis_bg.webp')" }}
          className=" h-screen w-screen bg-cover bg-center"
        >
          {/* LOGIN FORM BG */}
          <div className="absolute right-0 w-full md:w-1/3 min-h-screen min-w-[360px] pt-[10vh] overflow-hidden bg-white/70 backdrop-blur-[20px] backdrop-saturate-[168%] shadow-md m-0 rounded-none flex flex-col bg-clip-border border border-transparent break-words mb-4">

            {/* WRAPPER */}
            <div className="flex flex-col items-center h-full w-full">

              {/* HEADER */}
              <div className="flex flex-col items-center justify-center w-full mb-4">
                <Image
                  src="/assets/sjsfi_logo.svg"
                  alt="SJSFI Logo"
                  width={90}
                  height={90}
                  className="mb-2"
                />
                <h1 className="text-2xl md:text-3xl text-center text-[#800000] w-full font-medium">
                  Welcome to <span className='font-bold'>SJSFI-SIS Portal</span>
                </h1>
              </div>

              {/* BODY */}
              <div className="flex flex-col items-center justify-center w-full">
                <p className='text-center text-black text-sm md:text-base mb-6 font-medium'>
                  Please click or tap your role to sign in
                </p>

                <div className="w-full px-4" >
                  <div className="mb-4 w-full">
                    <RoleButton
                      label="Forms"
                      color="bg-[#800000]"
                      href="/sign-in/forms"
                    />
                  </div>
                  <div className="mb-4 w-full">
                    <RoleButton
                      label="Registrar"
                      color="bg-[#ffd700]"
                      hoverClass="hover:bg-[#DAA520]"
                      href="/sign-in/registrar"
                    />
                  </div>
                  <LoginFooter />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}