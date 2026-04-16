import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-4xl font-semibold text-foreground">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="subtle-link">
        Go back home
      </Link>
    </section>
  );
}
