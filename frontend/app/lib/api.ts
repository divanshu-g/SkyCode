export async function deployProject(gitURL: string, slug?: string) {
  const res = await fetch("http://localhost:9000/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gitURL, slug }),
  });

  if (!res.ok) {
    throw new Error(`Failed to deploy: ${await res.text()}`);
  }

  return res.json();
}
