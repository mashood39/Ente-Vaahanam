import Shell from "@/components/Shell";

export default function Page() {
  return (
    <Shell back="/login" title="Privacy Policy">
      <div className="card space-y-3 text-sm text-slate-700">
        <p><strong>Placeholder, replace before public launch.</strong></p>
        <p>Ente Vaahanam stores your Google account email, the vehicles and service records you enter, and your push notification subscriptions, so the app can work and remind you about due services.</p>
        <p>Your data is visible only to you. We don’t sell it or share it with third parties. You can delete any vehicle or record in the app at any time.</p>
      </div>
    </Shell>
  );
}
