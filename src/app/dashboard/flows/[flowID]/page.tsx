'use client'

import { Canvas } from "@/app/dashboard/canvas";
import { Sidebar } from "@/app/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import nodeService from "@/services/node";
import { PlayIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const { flowID } = useParams();
    const [runData, setRunData] = useState<Array<{
        type: string,
        data: Record<string, any>
    }>>();

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