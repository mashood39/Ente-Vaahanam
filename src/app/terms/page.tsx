import Shell from "@/components/Shell";

export default function Page() {
  return (
    <Shell back="/login" title="Terms of Service">
      <div className="card space-y-3.5 text-xs text-zinc-300 leading-relaxed">
        <p className="font-semibold text-teal-400">Terms of Use</p>
        <p>
          Ente Vaahanam provides vehicle maintenance tracking and reminder notifications for convenience. While the system strives to keep you updated on upcoming service and insurance renewal dates, the vehicle owner remains fully responsible for timely maintenance, regulatory inspections, and compliance.
        </p>
        <p>
          The service is provided &ldquo;as is&rdquo; without warranties of any kind.
        </p>
      </div>
    </Shell>
  );
}
