// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';

import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from 'next/link';

import Swal from 'sweetalert2';

import DataTable, { TableColumn } from 'react-data-table-component';

import * as Si from 'react-icons/si';
import * as Md from 'react-icons/md';

import * as XLSX from 'xlsx';

import CONFIG from '../config/config';

interface DataRow {
    HAWB: string;
    EVENT_CODE: string;
    EVENT_NAME: string;
    REASON_CODE: string;
    REASON_NAME: string;
    DATE: date;
    USERNAME: string;
}

interface Reference {
    EVENT_CODE: string;
    EVENT_NAME: string;
    REASON_CODE: string;
    REASON_NAME: string;
}

const Uploader: NextPage = () => {
    const router = useRouter();

    const [ds, setDS] = useState<DataRow[]>([]);
    const [references, setReference] = useState<Reference[]>([]);
    const [showMenu, setMenu] = useState<boolean>(false);
    const [user, setUser] = useState<string>(null);
    
    const fileDialogNew = useRef(null);

    const columns: TableColumn<DataRow>[] = [
        {
            name: 'HAWB',
            selector: (row: { HAWB: string; }) => row.HAWB, 
        },
        {
            name: 'EVENT CODE',
            selector: (row: { EVENT_CODE: string; }) => row.EVENT_CODE.toString(), 
        },
        {
            name: 'REASON CODE',
            selector: (row: { REASON_CODE: string; }) => row.REASON_CODE.toString() 
        },
        {
            name: 'DATE',
            selector: (row: { DATE: any; }) => {
                return new Date(row.DATE).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + " " + new Date(row.DATE).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
            }, 
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

            setUser(sessionStorage.getItem("username"));
    
            initialize().finally(() => Swal.close());
        }
    }, [])

    const initialize = async () => {
        //  await fetch(CONFIG.API_DOMAIN+'/'+CONFIG.API_URL+'/reference', CONFIG.OPT_HTTP_GET)
        await fetch(CONFIG.API_DOMAIN+':'+ CONFIG.API_PORT+'/'+CONFIG.API_URL+'/reference', CONFIG.OPT_HTTP_GET)
        .then(res => res.json())
        .then(data => {
            setReference(data.rows);
        })
        .catch(err => {
            Swal.fire({
                icon: 'error', 
                text: err
            })
        })
    };

    const upload = async (e) => {
        Swal.fire({
            title: "Uploading",
            text: "...",
            allowOutsideClick: false,
            allowEscapeKey: false,
        })
        Swal.showLoading();

        const { files } = e.target;

        if (files && files.length) {
            let fileName = files[0].name;

            if (!fileName.includes('.xlsx') || !fileName.includes('.xls')) {
                Swal.fire({
                    icon: "error",
                    text: "Please use an xls/xlsx file."
                })

                return;
            }
        }

        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(files[0]);
            reader.onloadend = async evt => {
                const readerData = new Uint8Array(evt.target.result);
                const wb = XLSX.read(readerData, {type: 'array'});
                const sheetName = wb.SheetNames[0];
                const json : DataRow[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {defval: ""});

                if (json.length === 0) {
                    Swal.fire({
                        icon: "warning",
                        text: "No data to upload."
                    })
    
                    return;
                }

                if (!json[0].hasOwnProperty("HAWB") || !json[0].hasOwnProperty("EVENT_CODE") || !json[0].hasOwnProperty("REASON_CODE") || !json[0].hasOwnProperty("DATE")) {
                    Swal.fire({
                        icon: "error",
                        text: "Invalid format."
                    })
    
                    return;
                }

                for (let i = 0; i < json.length; i++) {
                    let statDT = new Date(json[i].DATE).toLocaleString('en-US', { 
                        month: '2-digit', 
                        day: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        hourCycle: 'h23'
                    });

                    if (statDT === "Invalid Date") {
                        Swal.fire({
                            icon: "error",
                            html: `Invalid Date format for <b>ROW ${(i+1)}</b>`
                        })
        
                        return;
                    }

                    json[i].DATE = statDT;
                    json[i].USERNAME = user;
                }

                setDS(json);
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Please contact your System Administrator.", 
                text: error
            })
        } finally {
            // Clear selected file
            fileDialogNew.current.value = '';

            Swal.close()
        }
    };

    const save = async () => {
        if (ds.length < 1) {
            Swal.fire({
                icon: 'warning', 
                text: 'No data to save.'
            })

            return;
        }

        validate().then((valid: boolean) => {
            if (valid) {
                Swal.fire({
                    text: 'Are you sure you want to save?',
                    icon: 'question',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#2563EB',
                    cancelButtonColor: "#DC2626"
                })
                .then(async result => {
                    if (!result.isConfirmed) {
                        return
                    }
        
                    Swal.fire({
                        title: 'Loading...',
                        allowEscapeKey: false,
                        allowOutsideClick: false
                    })
                    Swal.showLoading();
        
                    CONFIG.OPT_HTTP_POST.body= JSON.stringify({ data: ds });
        
                    // fetch(CONFIG.API_DOMAIN+'/'+CONFIG.API_URL+'/save', CONFIG.OPT_HTTP_POST)
                    fetch(CONFIG.API_DOMAIN+':'+ CONFIG.API_PORT+'/'+CONFIG.API_URL+'/save', CONFIG.OPT_HTTP_POST)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success', 
                                text: 'Saved successfully.'
                            })
                            .finally(() => {
                                fileDialogNew.current.value = '';
                        
                                setDS([]);
                            })
                        } else {
                            Swal.fire({
                                icon: 'error', 
                                title: data.message, 
                                text: data.details
                            })
                        }
                    })
                    .catch(err => {
                        Swal.fire({
                            icon: 'error', 
                            text: err
                        })
                    })
                })
            }
        })
    };

    const validate = async () => {
        let isValid = true;
        let errors = [];

        for (let i = 0; i < ds.length; i++) {
            let row = ds[i];

            let ref = references.find((data) => data.EVENT_CODE == row.EVENT_CODE && (data.REASON_CODE || "") == row.REASON_CODE);

            if (ref) {
                ds[i].EVENT_NAME = ref.EVENT_NAME;
                ds[i].REASON_NAME = ref.REASON_NAME;
            } else {
                errors.push({
                    row: (i+1), 
                    data: row
                })
            }
        }

        if (errors.length > 0) {
            isValid = false;

            let msg = ``;

            for (let i = 0; i < errors.length; i++) {
                msg += `
                    <li>
                        <b>ROW ${errors[i].row}:</b> EVENT_CODE and REASON_CODE does not match.
                    </li>
                `
            }

            Swal.fire({
                icon: 'error', 
                width: 700,
                showConfirmButton: true,
                allowOutsideClick: false,
                title: 'Please check the following items.', 
                html: `
                    <ul>
                        ${msg}
                    </ul>
                `
            })
        } else {
            setDS(ds);
        }

        return isValid;
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
                                backgroundImage : 'url(\'https://images.pexels.com/photos/1370294/pexels-photo-1370294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1\')'
                            }
                        }
                    >
                        <div
                            className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed bg-red-600"
                            style={{backgroundColor : 'rgba(0, 0, 0, 0.6)'}}>
                            <div className="flex flex-col h-full items-start justify-start px-20 pt-10">
                                <div className="text-white">
                                    <h2 className="mb-4 text-4xl font-semibold">
                                        Status Uploader
                                        <button onClick={() => setMenu(!showMenu)}>
                                            <Md.MdOutlineExpandCircleDown className={`text-4xl inline-block mx-10 ${showMenu && 'rotate-180'} transition ease-in-out duration-200`} />
                                        </button>
                                        {showMenu && 
                                            <div className="flex flex-col gap-4 absolute left-[30rem] top-10 overflow-auto z-50 w-72 bg-white text-black border-black p-4 rounded-lg">
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
                                                            LOGOUT
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
                            <div className="xl:w-12/12 lg:w-12/12 md:w-12/12 mb-12 md:mb-10 px-10 bg-white rounded-xl">
                                <div className="p-4 text-2xl tracking-widest">
                                    <span>
                                        Table
                                        <button onClick={(e) => fileDialogNew.current.click()} className="border-2 border-blue-600 mx-10 px-6 py-2 w-40 h-10 rounded text-sm text-center justify-center shadow-md hover:border-blue-700 active:border-blue-800 text-blue-600 hover:text-white hover:bg-blue-600 active:text-white active:bg-blue-600 transition ease-in-out duration-150">
                                            <Si.SiMicrosoftexcel className={`inline-block h-4 mr-2`} />Upload XLS
                                        </button>
                                        <input 
                                            id="uploadxls"
                                            className="hidden"
                                            accept=".xls, .xlsx"
                                            ref={fileDialogNew}
                                            type="file"
                                            onChange={(e) => upload(e)}
                                        />
                                    </span>
                                </div>
                                <DataTable 
                                    // title="Registered Users" 
                                    className='bg-white' 
                                    columns={columns} 
                                    data={ds} 
                                    pagination 
                                    striped 
                                    highlightOnHover 
                                    // selectableRows 
                                    fixedHeader 
                                    // expandableRows 
                                    // expandableRowsComponent={ExpandedComponent} 
                                    customStyles={customStyles} 
                                    // onSelectedRowsChange={handleChange} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex xl:justify-center lg:justify-between justify-center items-start g-6 mb-10">
                        <button onClick={() => save()} type="submit" className="border-2 border-blue-600 mx-10 px-6 py-2 w-40 h-10 rounded text-sm text-center justify-center shadow-md hover:border-blue-700 active:border-blue-800 text-blue-600 hover:text-white hover:bg-blue-600 active:text-white active:bg-blue-600 transition ease-in-out duration-150">
                            Save
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
};

export default Uploader;