import { Button } from "@/components/ui/button";

export default function ButtonLoading({ children, loading, disabled, ...props }) {
  return (
    <Button {...props} disabled={loading || disabled}>
      {loading ? "Please wait..." : children}
    </Button>
  );
}
