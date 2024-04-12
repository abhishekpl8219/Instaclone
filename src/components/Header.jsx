'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import Modal from 'react-modal';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { signIn, useSession, signOut } from 'next-auth/react';
import { HiCamera } from 'react-icons/hi';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';

import { AiOutlineClose } from 'react-icons/ai';
import { app1 } from '@/firebase';
import {
    addDoc,
    collection,
    getFirestore,
    serverTimestamp,
  } from 'firebase/firestore';
export default function Header() {
    const { data: session } = useSession();
    console.log(session)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const[postUploading,setPostUploading]=useState(false);
    const[caption,setCaption]=useState('');
    const filePickerRef = useRef(null);
    const db = getFirestore(app1);
    function addImageToPost(e) {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImageFileUrl(URL.createObjectURL(file));

        }
    }

    useEffect(() => {
        if (selectedFile) {
            uploadImageToStorage();
        }

    }, [selectedFile])
    async function uploadImageToStorage() {
        setImageFileUploading(true);
        const storage = getStorage(app1);
        const fileName = new Date().getTime() + '-' + selectedFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error(error);
                setImageFileUploading(false);
                setImageFileUrl(null);
                setSelectedFile(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL);
                    setImageFileUploading(false);
                });
            }
        );
    }

    async function handleSubmit(){
         setPostUploading(true);
         const docRef = await addDoc(collection(db, 'posts'), {
            username: session.user.username,
            caption,
            profileImg: session.user.image,
            image: imageFileUrl,
            timestamp: serverTimestamp(),
          });
          setPostUploading(false);
          setIsOpen(false);
    }

    return (
        <div className='shadow-sm border-b sticky top-0 bg-white z-30 p-3'>
            <div className='flex justify-between items-center max-w-6xl mx-auto'>
                <Link href="/" ></Link>
                <Image src="/Instagram_logo_black.webp" width={96} height={96} alt='instagram logo' className='hidden lg:inline-flex'></Image>

                <Link href="/" ></Link>
                <Image src="/800px-Instagram_logo_2016.webp" width={40} height={40} alt='instagram logo' className=' lg:hidden'></Image>
                <input type='text' placeholder='search' className='bg-gray-50 border border-gray-200 rounded-md w-full text-sm py-2 px-4 max-w-[210px]' />
                {session ? (
                    <div className='flex items-center gap-2'>
                        <IoMdAddCircleOutline className='text-2xl cursor-pointer transform hover:scale-125 hover:text-red-500  transition duration-300' onClick={() => setIsOpen(true)} />
                        <img src={session.user.image} alt={session.user.name} onClick={signOut} className='h-10 w-10 rounded-full cursor-pointer' /> </div>) : (<button className='text-sm  font-semibold text-blue-500' onClick={signIn} >Log In</button>)}

            </div>
            {isOpen && (
                <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} ariaHideApp={false}
                    className='max-w-lg w-[90%] p-6 absolute top-56 left-[50%] border-2 rounded-md shadow-md bg-white translate-x-[-50%]'>
                    <div className='flex flex-col justify-center items-center h-[100%]'>

                        {selectedFile ? (
                            <img onClick={() => setSelectedFile(null)} src={imageFileUrl} alt="selected file" className={`w-full max-h-[250px] object-over cursor-pointer ${imageFileUploading ? 'animate-pulse' : ''
                                }`} ></img>
                        ) : (<HiCamera className='text-5xl text-slate-400 cursor-pointer ' onClick={() => filePickerRef.current.click()} />
                        )}
                        <input type='file' hidden accept='image/*' ref={filePickerRef} onChange={addImageToPost} />
                    </div>
                    <input type='text' placeholder='Please enter your caption' onChange={(e)=> setCaption(e.target.value)} maxLength='150' className='border-none m-4 text-center  w-full focus:ring-0 outline-none' />
                    <button disabled={
              !selectedFile ||
              caption.trim() === '' ||
              postUploading ||
              imageFileUploading
            }  onClick={handleSubmit}className='w-full bg-red-600 text-white p-2 shadow-lg rounded-lg hover:brightness-100 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:brightness-100'>
                        Upload Post
                    </button>

                    <AiOutlineClose className='top-2 absolute right-2 cursor-pointer hover:text-red-600 transition duration-300' onClick={() => setIsOpen(false)} />

                </Modal>

            )}
        </div>
    )
}
