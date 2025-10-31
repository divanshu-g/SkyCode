"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function HomePage() {
  const [gitURL, setGitURL] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gitURL, slug: slug || undefined }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      router.push(`/project/${data.data.projectSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Deploy with <span className="text-indigo-400">SkyCode</span>
        </h1>
        <p className="text-gray-400 mt-3 text-sm">
          Connect your GitHub repository and watch your deployment live.
        </p>
      </div>

      <form
        onSubmit={handleDeploy}
        className="bg-gray-900/80 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
      >
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            GitHub Repository URL
          </label>
          <input
            type="text"
            placeholder="https://github.com/username/repo"
            value={gitURL}
            onChange={(e) => setGitURL(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Custom Slug (optional)
          </label>
          <input
            type="text"
            placeholder="my-awesome-app"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
            loading
              ? "bg-indigo-700 cursor-wait animate-pulse"
              : "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:scale-105"
          }`}
        >
          {loading ? "Deploying..." : "Deploy Project"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center animate-pulse">
            {error}
          </p>
        )}
      </form>

      <footer className="mt-10 text-gray-600 text-xs">
        Built by{" "}
        <span className="text-indigo-400 font-semibold">Divanshu Garg</span>
      </footer>
    </main>
  );
}
