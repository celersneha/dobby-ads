import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/selectors/authSelectors";

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">
        You are authenticated as{" "}
        <span className="font-medium text-primary">{user?.email}</span>.
      </p>
      <div className="panel-surface p-6">
        <h2 className="mb-2 text-lg font-medium text-foreground">Next steps</h2>
        <p className="text-muted-foreground">
          Connect folder and image APIs here using the same service + Redux
          slice pattern used for authentication.
        </p>
      </div>
    </section>
  );
}
