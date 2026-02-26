import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h2 style={{ margin: 0 }}>404</h2>
      <p style={{ opacity: 0.7 }}>Page not found.</p>
      <Link to="/courses">Go to Courses</Link>
    </div>
  );
}