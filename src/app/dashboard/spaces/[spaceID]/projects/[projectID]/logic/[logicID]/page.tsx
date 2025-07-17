'use client'

import { Canvas } from "@/app/dashboard/spaces/[spaceID]/projects/[projectID]/logic/[logicID]/canvas";
import { Sidebar } from "@/app/dashboard/spaces/[spaceID]/projects/[projectID]/logic/[logicID]/sidebar";
import { useParams } from "next/navigation";

const Dashboard = () => {
    const { logicID, projectID, spaceID } = useParams();
    const flowID = logicID;
    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="flex h-full">
                <Sidebar projectID={projectID as string} spaceID={spaceID as string} flowID={flowID as string}/>
                <Canvas flowID={flowID as string} projectID={projectID as string} spaceID={spaceID as string}/>
            </div>
        </div>
    )
}

export default Dashboard;