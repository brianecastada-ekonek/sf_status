import React, { useState, useRef } from 'react';

import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import Swal from 'sweetalert2';

import * as Fa from 'react-icons/fa';

import LoginBG from '../public/login.png';
import EKPLogo from '../public/ekplogo.jpg';

import CONFIG from '../config/config';

const Login: NextPage = () => {
    const router = useRouter();

    const [user, setUser] = useState({
        LOGIN_USERNAME: "",
        LOGIN_PASSWORD: ""
    });

    const login = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        Swal.fire({
            title: 'Loading...',
            allowEscapeKey: false,
            allowOutsideClick: false
        })
        Swal.showLoading();

        CONFIG.OPT_HTTP_POST.body= JSON.stringify(user);

        //fetch(CONFIG.API_DOMAIN+'/'+CONFIG.API_URL+'/login', CONFIG.OPT_HTTP_POST)
         fetch(CONFIG.API_DOMAIN+':'+ CONFIG.API_PORT+'/'+CONFIG.API_URL+'/login', CONFIG.OPT_HTTP_POST)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    text: data.message,
                });

                sessionStorage.setItem('auth', 'y');
                sessionStorage.setItem('username', user.LOGIN_USERNAME);

                router.push("/");
            } else {
                Swal.fire({ 
                    icon: 'error',
                    text: data.message,
                });
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error', 
                text: err
            })
        })
    };

    return (
        <>
            <Head>
                <title>e-Konek Apps - SF Status Uploader LOCAL</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans" />
            </Head>

            <section className="h-full">
                <div className="px-6 py-4 h-full text-gray-800">
                    <div className="shadow-xl -mx-4">
                        <div className="flex flex-row justify-center bg-transparent m-0 rounded-xl h-36 pr-12">
                            <div className="mx-1 p-1 rounded-xl self-center">
                                <div className="align-middle">
                                    <Image 
                                        src={EKPLogo} 
                                        alt="EKPLogo" 
                                        width={290} 
                                        height={105} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex xl:justify-center lg:justify-between justify-center items-center flex-wrap h-[90%] g-6">
                        <div className="grow-0 shrink-1 md:shrink-0 basis-auto xl:w-6/12 lg:w-6/12 md:w-9/12 mb-12 md:mb-0">
                            <Image 
                                className="w-full" 
                                src={LoginBG} 
                                alt="LoginBG"
                            />
                        </div>
                        <div className="xl:ml-20 xl:w-4/12 lg:w-5/12 md:w-8/12 mb-12 md:mb-0 p-10 bg-slate-600 bg-opacity-5 rounded-xl">
                            <form onSubmit={(e) => login(e)}>
                                <div className="flex flex-row items-center justify-center">
                                    <h1 className="text-center text-3xl mb-5 mr-4 uppercase">Account Login</h1>
                                </div>

                                <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                                    <Fa.FaUserCircle className="h-16 w-16" fill="#2563EB" />
                                </div>

                                <div className="mb-6">
                                    <input
                                        type="text"
                                        className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        id="LOGIN_USERNAME"
                                        placeholder="Username"
                                        onChange={(e) => setUser({...user, LOGIN_USERNAME: e.target.value})}
                                    />
                                </div>

                                <div className="mb-6">
                                    <input
                                        type="password"
                                        className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        id="LOGIN_PASSWORD"
                                        placeholder="Password"
                                        onChange={(e) => setUser({...user, LOGIN_PASSWORD: e.target.value})}
                                    />
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="border-2 border-blue-600 mx-10 px-6 py-2 w-40 h-12 rounded text-xl text-center justify-center shadow-md hover:border-blue-700 active:border-blue-800 text-blue-600 hover:text-white hover:bg-blue-600 active:text-white active:bg-blue-600 transition ease-in-out duration-150"
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
};

export default Login;