interface ProjectCompleteProps {
  url: string;
}

export default function ProjectComplete({ url }: ProjectCompleteProps) {
  return (
    <div className="mt-6 text-center animate-fade-in">
      <p className="text-xl font-semibold text-green-400 mb-2">
        ✅ Deployment Complete!
      </p>
      <a
        href={url}
        target="_blank"
        className="text-indigo-400 underline hover:text-indigo-300 transition-all"
      >
        Visit your deployed site →
      </a>
    </div>
  );
}
