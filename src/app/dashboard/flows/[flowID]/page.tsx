'use client'

import { Canvas } from "@/app/dashboard/canvas";
import { Sidebar } from "@/app/dashboard/sidebar";
import { useParams } from "next/navigation";
import { useState } from "react";

const Dashboard = () => {
    const { flowID } = useParams();

    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="flex h-full">
                <Sidebar />
                <Canvas flowID={flowID as string}/>
            </div>
        </div>
    )
}

export default Dashboard;