// @ts-nocheck
import React, { useState, useEffect } from 'react';

import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from 'next/link';

import Swal from 'sweetalert2';

import DataTable, { TableColumn } from 'react-data-table-component';

import * as Md from 'react-icons/md';

import CONFIG from '../config/config';

interface DataRow {
    WAYBILL_NO: string;
    SF_STATUS_SENT_FLAG: string;
    SF_STATUS: string;
    EVENT_NAME: string;
    REASON_CODE: string;
    REASON_NAME: string;
    STATUS_DATE: date;
    PROCESSED_DATE: date;
    CREATED_DATE: date;
    TYPE: string;
}

const Query: NextPage = () => {
    const router = useRouter();

    const [ds, setDS] = useState<DataRow[]>([]);
    const [collapse, setCollapse] = useState<boolean>(false);
    const [displayMenu, setMenu] = useState<boolean>(false);
    const [filterValues, setFilterValues] = useState<any>();

    const columns: TableColumn<DataRow>[] = [
        {
            name: 'HAWB',
            selector: (row: { WAYBILL_NO: string; }) => row.WAYBILL_NO, 
        },
        {
            name: 'SUBMISSION STATUS', 
            selector: (row: { SF_STATUS_SENT_FLAG: string; }) => row.SF_STATUS_SENT_FLAG, 
            
        },
        {
            name: 'EVENT CODE',
            selector: (row: { SF_STATUS: string; }) => row.SF_STATUS, 
        },
        {
            name: 'REASON CODE',
            selector: (row: { REASON_CODE: string; }) => row.REASON_CODE 
        },
        {
            name: 'REASON NAME',
            selector: (row: { REASON_NAME: string; }) => row.REASON_NAME, 
            wrap: true,
            // grow: 2,
        },
        {
            name: 'STATUS DATE',
            selector: (row: { STATUS_DATE: any; }) => {
                return row.STATUS_DATE
            }, 
            allowOverflow: true
        },
        {
            name: 'SF TRANSMISSION DATE',
            selector: (row: { PROCESSED_DATE: any; }) => {
                return row.PROCESSED_DATE
            }, 
            allowOverflow: true, 
            grow: "1.15"
        },
        {
            name: 'UPLOADED DATE',
            selector: (row: { CREATED_DATE: any; }) => {
                return row.CREATED_DATE
            }, 
            allowOverflow: true
        },
        {
            name: 'TYPE',
            selector: (row: { TYPE: string; }) => row.TYPE.toString(), 
        },
    ];

    const customStyles = {
        rows: {
            highlightOnHoverStyle: {
                color: "#fff", 
                backgroundColor: '#2563EB'
            },
        },
    };

    useEffect(() => {
        if (sessionStorage.getItem('auth') === undefined || sessionStorage.getItem('auth') === null) {
            Swal.fire({
                icon: 'warning', 
                text: 'Please login to access.'
            })
            .then(() => {
                router.push("/login")
            })
        } else {
            Swal.fire({
                title: 'Loading',
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
            Swal.showLoading();
    
            initialize().finally(() => Swal.close());
        }
    }, [])

    const initialize = async () => {
        await fetch(CONFIG.API_DOMAIN+'/'+CONFIG.API_URL+'/sf_status', CONFIG.OPT_HTTP_GET)
        // await fetch(CONFIG.API_DOMAIN+':'+ CONFIG.API_PORT+'/'+CONFIG.API_URL+'/sf_status', CONFIG.OPT_HTTP_GET)
        .then(res => res.json())
        .then(data => { 
            setDS(data.rows);
        })
        .catch(err => {
            Swal.fire({
                icon: 'error', 
                text: err
            })
        })
    };

    const onClickFilter = async () => {
        Swal.fire({
            title: 'Loading...',
            allowEscapeKey: false,
            allowOutsideClick: false
        })
        Swal.showLoading();

        fetch(CONFIG.API_DOMAIN+'/'+CONFIG.API_URL+'/sf_status/'+filterValues.HAWB, CONFIG.OPT_HTTP_GET)
        // fetch(CONFIG.API_DOMAIN+':'+ CONFIG.API_PORT+'/'+CONFIG.API_URL+'/sf_status/'+filterValues.HAWB, CONFIG.OPT_HTTP_GET)
        .then(res => res.json())
        .then(data => {
            setDS(data.rows);
        })
        .catch(err => {
            Swal.fire({
                icon: 'error', 
                text: err
            })
        })
    };

    const logout = async () => {
        sessionStorage.clear()
        router.push("/login")
    };

    return (
        <>
            <Head>
                <title>e-Konek Apps - SF Status Uploader</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans" />
            </Head>

            <section className="h-screen overflow-auto">
                <div className="min-h-screen">
                    <div className="relative overflow-hidden w-full bg-cover bg-no-repeat p-12 text-center mb-5"
                        style={
                            {
                                height: '200px', 
                                backgroundImage : 'url(\'https://images.pexels.com/photos/357514/pexels-photo-357514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1\')'
                            }
                        }
                    >
                        <div
                            className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed bg-red-600"
                            style={{backgroundColor : 'rgba(0, 0, 0, 0.6)'}}>
                            <div className="flex flex-col h-full items-start justify-start px-20 pt-10">
                                <div className="text-white">
                                    <h2 className="mb-4 text-4xl font-semibold">
                                        Query
                                        <button onClick={() => setMenu(!displayMenu)}>
                                            <Md.MdOutlineExpandCircleDown className={`text-4xl inline-block mx-10 ${displayMenu && 'rotate-180'} transition ease-in-out duration-200`} />
                                        </button>
                                        {displayMenu && 
                                            <div className="flex flex-col gap-4 absolute left-72 top-10 overflow-auto z-50 w-72 bg-white text-black border-black p-4 rounded-lg">
                                                <ul>
                                                    <li className="text-sm font-medium py-1">
                                                        <a className="flex flex-row items-center justify-center h-8 transition-transform ease-in duration-200 hover:text-blue-800 hover:text-base">
                                                            <Link href="/">STATUS UPLOADER</Link>
                                                        </a>
                                                    </li>
                                                    <li className="text-sm font-medium py-1">
                                                        <a className="flex flex-row items-center justify-center h-8 transition-transform ease-in duration-200 hover:text-blue-800 hover:text-base">
                                                            <Link href="/query">QUERY</Link>
                                                        </a>
                                                    </li>
                                                    <li className="text-sm font-medium py-1" onClick={() => logout()}>
                                                        <a className="flex flex-row items-center justify-center h-8 transition-transform ease-in duration-200 hover:text-blue-800 hover:text-base cursor-pointer">
                                                            LOG OUT
                                                        </a>
                                                    </li>
                                                </ul>    
                                            </div>
                                        }
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                            
                    <div className="flex xl:justify-center lg:justify-between justify-center items-start g-6">
                        <div className='grow-0 shrink-1 md:shrink-0 basis-auto h-full xl:w-full lg:w-full md:w-12/12 mb-12 md:mb-0'>
                            <div className="xl:w-12/12 lg:w-12/12 md:w-12/12 px-10 py-3 bg-white rounded-xl">
                                <div className="p-4 text-2xl tracking-widest">
                                    <span>
                                        Filter
                                        <button onClick={() => setCollapse(!collapse)}>
                                            <Md.MdOutlineExpandCircleDown className={`inline-block mx-10 ${collapse && 'rotate-180'} transition ease-in-out duration-200`} />
                                        </button>
                                    </span>
                                </div>
                                
                                <div className={`grid grid-cols-12 w-full ${collapse && 'max-h-64'} max-h-0 overflow-hidden transition-all ease-in-out duration-500 ml-6`}>
                                    <div className="col-span-4 grid grid-cols-12 gap-4 self-center w-full">
                                        <div className="col-span-12 grid grid-cols-6 grid-rows-2 items-center gap-2">
                                            <label className={`col-span-12 row-span-1 text-sm whitespace-nowrap`}>
                                                HAWB
                                            </label>
                                            <input
                                                name="HAWB" 
                                                className={`col-span-12 h-[1.65rem] border-2 border-blue-900 rounded w-auto text-sm px-2`} 
                                                type="text" 
                                                placeholder={"HAWB"} 
                                                onChange={(e) => setFilterValues({...filterValues, [e.target.name]: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-4 self-center text-center mt-4">
                                        <button className="inline-block mx-2 px-7 py-2 bg-blue-600 text-white font-medium leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" onClick={() => onClickFilter().finally(() => Swal.close())}>
                                            Filter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:w-12/12 lg:w-12/12 md:w-12/12 mb-12 md:mb-10 px-10 bg-white rounded-xl">
                                <div className="p-4 text-2xl tracking-widest">
                                    <span>
                                        SF STATUS TABLE
                                    </span>
                                </div>
                                <DataTable 
                                    className='bg-white overflow-y-scroll' 
                                    columns={columns} 
                                    data={ds} 
                                    pagination 
                                    striped 
                                    highlightOnHover 
                                    fixedHeader 
                                    customStyles={customStyles} 
                                    responsive={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
};

export default Query;