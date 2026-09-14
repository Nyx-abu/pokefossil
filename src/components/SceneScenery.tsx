import React from 'react';

interface SceneSceneryProps {
    beat: number;
    region?: string;
}

export const SceneScenery: React.FC<SceneSceneryProps> = ({ beat, region = 'Kanto' }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
            {/* BEAT 1: Oak's Lab */}
            {beat === 1 && (
                <div className="absolute inset-0 w-full h-full">
                    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl flex justify-around px-8">
                        <div className="w-48 h-3 bg-[#485058] rounded-b border border-[#202830] shadow-md flex justify-center items-end">
                            <div className="w-40 h-1.5 bg-[#fffff0] shadow-[0_4px_16px_rgba(255,255,240,0.8)] rounded-full" />
                        </div>
                        <div className="w-48 h-3 bg-[#485058] rounded-b border border-[#202830] shadow-md flex justify-center items-end">
                            <div className="w-40 h-1.5 bg-[#fffff0] shadow-[0_4px_16px_rgba(255,255,240,0.8)] rounded-full" />
                        </div>
                    </div>

                    <div className="hidden md:block absolute top-[10%] left-6 lg:left-14 w-28 lg:w-36 h-[38%] bg-[#8c5a2b] border-4 border-[#3d2410] rounded-t-sm shadow-xl">
                        <div className="w-full h-full p-2 flex flex-col justify-between">
                            <div className="w-full border-b-4 border-[#543414] pb-1 flex gap-1 items-end h-8 overflow-hidden">
                                <div className="w-3 h-7 bg-[#d78430] rounded-xs" />
                                <div className="w-4 h-6 bg-[#3070b8] rounded-xs" />
                                <div className="w-3 h-7 bg-[#48a050] rounded-xs" />
                                <div className="w-4 h-5 bg-[#e0a020] rounded-xs" />
                                <div className="w-3 h-6 bg-[#8050a0] rounded-xs" />
                            </div>
                            <div className="w-full border-b-4 border-[#543414] pb-1 flex gap-1 items-end h-8 overflow-hidden">
                                <div className="w-4 h-6 bg-[#3070b8] rounded-xs" />
                                <div className="w-3 h-7 bg-[#e0a020] rounded-xs" />
                                <div className="w-4 h-5 bg-[#48a050] rounded-xs" />
                                <div className="w-3 h-7 bg-[#d78430] rounded-xs" />
                            </div>
                            <div className="w-full flex gap-1 items-end h-8 overflow-hidden">
                                <div className="w-3 h-7 bg-[#48a050] rounded-xs" />
                                <div className="w-4 h-7 bg-[#8050a0] rounded-xs" />
                                <div className="w-3 h-5 bg-[#3070b8] rounded-xs" />
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block absolute top-[10%] right-6 lg:right-14 w-32 lg:w-40 h-[38%] bg-[#2b4c38] border-4 border-[#3d2410] rounded-sm shadow-xl p-2.5">
                        <div className="w-full h-full border border-[#487858] p-1.5 flex flex-col justify-between">
                            <div className="font-pixel text-[8px] text-[#b8f0c8] leading-tight">
                                POKéMON RESEARCH
                            </div>
                            <div className="flex items-center justify-center my-1">
                                <div className="w-10 h-10 rounded-full border-2 border-[#fff] bg-[#d78430] relative overflow-hidden flex items-center justify-center shadow-md">
                                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-white border-t-2 border-[#fff]" />
                                    <div className="w-3 h-3 rounded-full bg-white border-2 border-[#202830] z-10" />
                                </div>
                            </div>
                            <div className="font-raw-data text-[7px] text-[#80d098] truncate">
                                {region.toUpperCase()} SPECIES: 151
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-[52%] opacity-15 pointer-events-none">
                        <div className="w-full h-full flex justify-around">
                            <div className="w-0.5 h-full bg-[#3d2410] transform -skew-x-25" />
                            <div className="w-0.5 h-full bg-[#3d2410] transform -skew-x-15" />
                            <div className="w-0.5 h-full bg-[#3d2410] transform -skew-x-5" />
                            <div className="w-0.5 h-full bg-[#3d2410] transform skew-x-5" />
                            <div className="w-0.5 h-full bg-[#3d2410] transform skew-x-15" />
                            <div className="w-0.5 h-full bg-[#3d2410] transform skew-x-25" />
                        </div>
                    </div>
                </div>
            )}

            {/* BEAT 2: Hall of Fame */}
            {beat === 2 && (
                <div className="absolute inset-0 w-full h-full">
                    <div className="hidden lg:block absolute top-[6%] left-8 w-14 h-[44%] bg-gradient-to-r from-[#1c2838] via-[#334458] to-[#1c2838] border-2 border-[#486078] rounded-t-lg shadow-2xl">
                        <div className="w-full h-5 bg-[#c8a038] border-b-2 border-[#604818] rounded-t-md flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#ffea78]" />
                        </div>
                        <div className="w-full h-full flex flex-col justify-around py-4 items-center opacity-40">
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                        </div>
                    </div>

                    <div className="hidden lg:block absolute top-[6%] right-8 w-14 h-[44%] bg-gradient-to-r from-[#1c2838] via-[#334458] to-[#1c2838] border-2 border-[#486078] rounded-t-lg shadow-2xl">
                        <div className="w-full h-5 bg-[#c8a038] border-b-2 border-[#604818] rounded-t-md flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#ffea78]" />
                        </div>
                        <div className="w-full h-full flex flex-col justify-around py-4 items-center opacity-40">
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                            <div className="w-8 h-1 bg-[#88a8c8]" />
                        </div>
                    </div>

                    <div className="absolute top-0 left-1/4 w-32 h-[80%] bg-gradient-to-b from-white/20 via-white/5 to-transparent transform -rotate-12 blur-sm pointer-events-none" />
                    <div className="absolute top-0 right-1/4 w-32 h-[80%] bg-gradient-to-b from-white/20 via-white/5 to-transparent transform rotate-12 blur-sm pointer-events-none" />

                    <div className="absolute top-[8%] left-1/2 -translate-x-1/2 opacity-15 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-[#94a3b8] flex items-center justify-center">
                            <span className="font-pixel text-4xl text-[#94a3b8]">★</span>
                        </div>
                        <div className="font-pixel text-xs text-[#94a3b8] mt-2 tracking-widest">
                            HALL OF FAME
                        </div>
                    </div>
                </div>
            )}

            {/* BEAT 3: Kanto Route Trail */}
            {beat === 3 && (
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute top-8 left-[10%] opacity-70 flex items-center">
                        <div className="w-16 h-6 bg-white rounded-full shadow-xs" />
                        <div className="w-24 h-10 bg-white rounded-full -ml-8 -mt-3 shadow-xs" />
                        <div className="w-16 h-6 bg-white rounded-full -ml-8 shadow-xs" />
                    </div>
                    <div className="hidden sm:flex absolute top-14 right-[15%] opacity-60 items-center">
                        <div className="w-20 h-7 bg-white rounded-full shadow-xs" />
                        <div className="w-28 h-12 bg-white rounded-full -ml-10 -mt-3 shadow-xs" />
                        <div className="w-20 h-7 bg-white rounded-full -ml-10 shadow-xs" />
                    </div>

                    <div className="hidden sm:block absolute top-[38%] left-8 lg:left-16 z-0">
                        <div className="bg-[#8b5a2b] border-2 border-[#3d2410] px-3 py-1.5 rounded-sm shadow-md text-center">
                            <span className="font-pixel text-[8px] text-[#f8f0d8] font-bold tracking-tight block">
                                ROUTE 1
                            </span>
                            <span className="font-raw-data text-[7px] text-[#e0c898] block">
                                PALLET TOWN ➔
                            </span>
                        </div>
                        <div className="w-2.5 h-10 bg-[#543414] border-x border-[#3d2410] mx-auto" />
                    </div>
                </div>
            )}

            {/* BEAT 4: Lavender Tower */}
            {beat === 4 && (
                <div className="absolute inset-0 w-full h-full">
                    <div className="hidden md:block absolute top-[6%] left-10 lg:left-20 w-24 h-48 border-4 border-[#382850] rounded-t-full bg-gradient-to-b from-[#403060]/50 to-transparent shadow-inner">
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                            <div className="w-0.5 h-full bg-[#685088]" />
                            <div className="absolute w-full h-0.5 bg-[#685088]" />
                        </div>
                    </div>

                    <div className="hidden md:block absolute top-[6%] right-10 lg:right-20 w-24 h-48 border-4 border-[#382850] rounded-t-full bg-gradient-to-b from-[#403060]/50 to-transparent shadow-inner">
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                            <div className="w-0.5 h-full bg-[#685088]" />
                            <div className="absolute w-full h-0.5 bg-[#685088]" />
                        </div>
                    </div>

                    <div className="absolute top-[30%] left-6 lg:left-14 flex flex-col items-center">
                        <div className="w-2.5 h-4 bg-[#ffea78] rounded-full shadow-[0_0_12px_#ffea78] animate-pulse" />
                        <div className="w-3 h-8 bg-[#e8e0d0] border border-[#382850] rounded-t-xs" />
                        <div className="w-6 h-2 bg-[#281838] rounded-xs" />
                    </div>

                    <div className="absolute top-[30%] right-6 lg:right-14 flex flex-col items-center">
                        <div className="w-2.5 h-4 bg-[#ffea78] rounded-full shadow-[0_0_12px_#ffea78] animate-pulse" />
                        <div className="w-3 h-8 bg-[#e8e0d0] border border-[#382850] rounded-t-xs" />
                        <div className="w-6 h-2 bg-[#281838] rounded-xs" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#381858]/40 to-transparent pointer-events-none" />
                </div>
            )}
        </div>
    );
};
