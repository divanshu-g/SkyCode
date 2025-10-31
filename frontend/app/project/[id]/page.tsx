"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import LogTerminal from "@/app/components/LogTerminal";
import ProjectComplete from "@/app/components/ProjectComplete";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  const [logs, setLogs] = useState<string[]>([]);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const channel = `logs:${id}`;
    socket.emit("subscribe", channel);

    socket.on("message", (msg: string) => {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.log) {
          setLogs((prev) => [...prev, parsed.log]);
        }

        if (
          parsed.log.toLowerCase().includes("done") ||
          parsed.log.toLowerCase().includes("build complete")
        ) {
          setIsDeployed(true);
          setDeployUrl(`http://${id}.${process.env.NEXT_PUBLIC_DEPLOY_BASE_URL}`);
        }
      } catch {
        setLogs((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-indigo-400">
          Deploying: <span className="text-white">{id}</span>
        </h1>
        {!isDeployed && (
          <p className="text-gray-400 text-sm animate-pulse">
            Building and deploying your app...
          </p>
        )}
      </div>

      <LogTerminal logs={logs} />

      {isDeployed && <ProjectComplete url={deployUrl} />}
    </div>
  );
}
