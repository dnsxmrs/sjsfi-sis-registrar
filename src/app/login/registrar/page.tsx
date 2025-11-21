// app/(guest)/faculty/page.tsx
import Image from 'next/image';
import RegistrarLoginForm from './RegistrarLoginForm';

export default function Registrar() {
    return (
        <div className="flex h-screen w-screen bg-white min-w-[360px]">
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
                                <h1 className="text-3xl text-center text-black w-full mx-1">
                                    <span className='font-bold text-[#800000]'>SJSFI-SIS</span> Registrar Module
                                </h1>
                            </div>

                            {/* BODY */}
                            <div className="flex flex-col items-center justify-center w-full">
                                <p className='text-center text-black text-sm mb-4'>
                                    Sign in to start your session
                                </p>

                                {/* FORM */}
                                <RegistrarLoginForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}