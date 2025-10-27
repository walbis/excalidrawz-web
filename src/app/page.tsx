import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold">
          Excalidraw<span className="text-blue-600">Z</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Team-based collaborative whiteboard platform.
          Create, share, and collaborate on visual diagrams with your team.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="border-2 border-gray-300 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-4xl">
          <FeatureCard
            icon="👥"
            title="Team Workspaces"
            description="Organize your drawings in shared team workspaces"
          />
          <FeatureCard
            icon="📁"
            title="Smart Organization"
            description="Group and categorize files for easy access"
          />
          <FeatureCard
            icon="⏱️"
            title="Version History"
            description="Never lose work with automatic checkpoints"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
