'use client'
import React from 'react'
import Link from "next/link";
import Image from "next/image"
import { signIn, useSession, signOut } from 'next-auth/react';
export default function Header() {
     const {data:session}=useSession();
     console.log(session)
   
    return (
        <div className='shadow-sm border-b sticky top-0 bg-white z-30 p-3'>
            <div className='flex justify-between items-center max-w-6xl mx-auto'>
                <Link href="/" ></Link>
                <Image src="/Instagram_logo_black.webp" width={96} height={96} alt='instagram logo' className='hidden lg:inline-flex'></Image>

                <Link href="/" ></Link>
                <Image src="/800px-Instagram_logo_2016.webp" width={40} height={40} alt='instagram logo' className=' lg:hidden'></Image>
                <input type='text' placeholder='search' className='bg-gray-50 border border-gray-200 rounded-md w-full text-sm py-2 px-4 max-w-[210px]' />
                {session?( <img src = {session.user.image} alt={session.user.name} onClick={signOut} className='h-10 w-10 rounded-full cursor-pointer' />):(<button className='text-sm  font-semibold text-blue-500' onClick={signIn} >Log In</button>)}
                
            </div>
        </div>
    )
}
