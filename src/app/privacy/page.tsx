import Shell from "@/components/Shell";

export default function Page() {
  return (
    <Shell back="/login" title="Privacy Policy">
      <div className="card space-y-3.5 text-xs text-zinc-300 leading-relaxed">
        <p className="font-semibold text-teal-400">Ente Vaahanam Privacy Promise</p>
        <p>
          Ente Vaahanam stores your Google account email, your vehicle specifications, service logs, and your web push notification subscriptions solely to maintain your garage history and deliver timely maintenance reminders.
        </p>
        <p>
          Your data is strictly protected by database row-level security and is visible only to your authenticated account. We do not sell, rent, or share personal information with third parties.
        </p>
        <p>
          You have full ownership of your data and can delete your vehicles or service entries at any time directly from the interface.
        </p>
      </div>
    </Shell>
  );
}
